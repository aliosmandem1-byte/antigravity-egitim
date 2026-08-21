import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Supabase İstemcisi
const supabaseUrl = process.env.SUPABASE_URL || 'https://cakkrzjgpyvwtogurgfe.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNha2tyempncHl2d3RvZ3VyZ2ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxMjgzNDYsImV4cCI6MjEwMjcwNDM0Nn0.MfiPHIs1IABGmwmciYLckF-iYYuUbGEKhw_wcyhDRQg';
const supabase = createClient(supabaseUrl, supabaseKey);

// Rate Limiter (Spam Koruması)
const recipeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 dakika
  max: 4, // 1 dakikada en fazla 4 istek
  message: { error: { message: "Çok hızlı tarif istiyorsun! Şefimiz biraz yoruldu, lütfen 1 dakika dinlenmesine izin ver. ⏳" } }
});

// API Rotaları
app.get('/api/models', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "No API KEY" });
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    res.status(200).json(data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});
app.get('/api/test-direct', async (req, res) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent("hello");
    res.status(200).json({ success: true, text: result.response.text() });
  } catch(e) {
    res.status(500).json({ error: e.message, name: e.name, stack: e.stack });
  }
});

// Topluluk Tarifleri (Keşfet) Getirme
app.get('/api/discover', async (req, res) => {
  try {
    let { data, error } = await supabase
      .from('recipes')
      .select('id, ingredients, language, persona, response, created_at, likes')
      .order('created_at', { ascending: false })
      .limit(15);
      
    // Eğer likes sütunu henüz açılmamışsa Supabase hata verir. Bu durumda fallback (eski) yönteme geçelim.
    if (error && error.message && error.message.toLowerCase().includes("does not exist")) {
      const fallback = await supabase
        .from('recipes')
        .select('id, ingredients, language, persona, response, created_at')
        .order('created_at', { ascending: false })
        .limit(15);
      data = fallback.data;
      error = fallback.error;
    }

    if (error) throw error;
    
    res.status(200).json(data);
  } catch (err) {
    console.error("Discover API error:", err.message);
    res.status(500).json({ error: 'Topluluk tarifleri getirilirken hata oluştu.' });
  }
});

// Beğeni (Like) İşlemi
app.post('/api/recipe/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const { isLiked } = req.body;

    const { data: recipe, error: fetchError } = await supabase
      .from('recipes')
      .select('likes')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.message.toLowerCase().includes("does not exist")) {
        return res.status(200).json({ success: true, fake: true, message: "Likes sütunu yok, sahte başarı" });
      }
      throw fetchError;
    }

    let currentLikes = recipe.likes || 0;
    let newLikes = isLiked ? currentLikes + 1 : currentLikes - 1;
    if (newLikes < 0) newLikes = 0;

    const { error: updateError } = await supabase
      .from('recipes')
      .update({ likes: newLikes })
      .eq('id', id);
      
    if (updateError) throw updateError;

    res.status(200).json({ success: true, likes: newLikes });
  } catch (err) {
    console.error("Like API error:", err.message);
    res.status(200).json({ success: true, fake: true, error: err.message });
  }
});

// Tarifi Toplulukta Paylaş (Manuel Publish)
app.post('/api/recipe/publish', async (req, res) => {
  try {
    const { ingredients, language, persona, recipe } = req.body;
    
    if (!recipe || !ingredients) {
      return res.status(400).json({ error: 'Eksik bilgi' });
    }
    
    const { error } = await supabase
      .from('recipes')
      .insert([{
        ingredients: ingredients.toLowerCase().trim(),
        language: language || 'tr',
        persona: persona || 'standart',
        response: recipe
      }]);
      
    if (error) throw error;
    
    res.status(200).json({ success: true });
  } catch(err) {
    console.error("Publish API error:", err.message);
    res.status(500).json({ error: 'Tarif paylaşılamadı' });
  }
});

app.post('/api/generateRecipe', recipeLimiter, async (req, res) => {
  const { ingredients, language = 'tr', persona = 'standart' } = req.body;
  if (!ingredients) {
    return res.status(400).json({ error: 'Malzemeler eksik' });
  }

  const cleanIngredients = ingredients.toLowerCase().trim();

  // 1. Supabase Önbelleğinde (Cache) Ara
  try {
    const { data: cachedData, error: cacheError } = await supabase
      .from('recipes')
      .select('response')
      .eq('ingredients', cleanIngredients)
      .eq('language', language)
      .eq('persona', persona)
      .single();

    if (cachedData && cachedData.response) {
      console.log("⚡ CACHE HIT! Veritabanından getirildi:", cleanIngredients);
      return res.status(200).json({
        candidates: [{
          content: {
            parts: [{ text: JSON.stringify(cachedData.response) }]
          }
        }]
      });
    }
  } catch (err) {
    console.log("Supabase okuma hatası (Tablo henüz kurulmamış olabilir):", err.message);
  }
  
  console.log("🤖 CACHE MISS! Yapay zekaya soruluyor:", cleanIngredients);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Sunucu yapılandırma hatası (API Anahtarı eksik)' });
  }

  try {
    // Resmi Google SDK'sını başlat
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Şef moduna göre karakter ayarı
    let personaPrompt = "Sen sadece en temel yemekleri bilen, profesyonellikten uzak, yemek yapmayı HİÇ bilmeyenlere öğreten 'Standart' bir AI Şef'sin.";
    if (persona === 'angry') {
      personaPrompt = "Sen 'Gordon Ramsay' tarzı, sürekli şikayet eden, mükemmeliyetçi ama bir o kadar da acımasız ve komik bir şefsin. Tarif verirken kullanıcıyı hafifçe (esprili bir şekilde) azarla.";
    } else if (persona === 'mom') {
      personaPrompt = "Sen dünyalar tatlısı, şefkatli ve sürekli 'yavrum, evladım' diye hitap eden geleneksel bir Anadolu annesisin. Tarif verirken bol bol sevgi sözcükleri kullan ve öğütler ver.";
    } else if (persona === 'student') {
      personaPrompt = "Sen parasız, üşengeç ve sürekli pratik taktikler arayan bir üniversite öğrencisisin. Tariflerin aşırı pratik, bulaşık çıkarmayan ve ucuza kaçan türden olsun.";
    }

    // Dile göre dil ayarı
    let langInstruction = "Tüm cevabını KESİNLİKLE Türkçe (TR) olarak ver.";
    if (language === 'en') {
      langInstruction = "Give your ENTIRE response STRICTLY in English (EN).";
    } else if (language === 'de') {
      langInstruction = "Gib deine GESAMTE Antwort AUSSCHLIESSLICH auf Deutsch (DE) ab.";
    } else if (language === 'es') {
      langInstruction = "Da TODA tu respuesta ESTRICTAMENTE en Español (ES).";
    }

    const prompt = `${personaPrompt}
Kullanıcının elindeki malzemeler veya istediği tarif: "${ingredients}". 
Kullanıcı bir malzeme listesi verdiyse ona göre, doğrudan bir tarif adı verdiyse o tarife göre AŞIRI BASİT bir yemek tarifi oluştur. Eğer kullanıcı birbiriyle uyumsuz veya saçma malzemeler verdiyse bile bunu yenebilir ve mantıklı bir hale getirerek tarifleştir. Gram/mililitre kullanma; 'su bardağı', 'tatlı kaşığı', 'göz kararı' gibi şeyler kullan.
Ayrıca, yemeğin kalorisini ve hazırlanma süresini de hesapla.

${langInstruction}

DİKKAT: Çıktı sadece ve sadece aşağıdaki formatta saf JSON olmalı, başında veya sonunda markdown (örneğin \`\`\`json) olmamalı!
{
  "title": "Tarif Adı",
  "icon": "🍔",
  "desc": "Ana Malzemeler: Tavuk, Tuz, Domates...",
  "calories": "🔥 350 kcal",
  "time": "⏳ 15 Dk",
  "steps": ["Adım 1: ...", "Adım 2: ...", "Adım 3: ..."]
}`;

    // Olası modeller (Google yeni kullanıcılara eski modelleri kapattığı için 3.6 eklendi)
    const modelsToTry = [
      "gemini-3.6-flash",
      "gemini-3.5-flash",
      "gemini-2.5-flash",
      "gemini-2.0-flash", 
      "gemini-1.5-flash", 
      "gemini-1.0-pro"
    ];
    let responseText = null;
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        responseText = result.response.text();
        break; // Başarılı olursa döngüden çık
      } catch (err) {
        lastError = err;
        console.warn(`Model ${modelName} başarısız oldu:`, err.message);
        // Eğer hata 404 ise bir sonraki modele geç, değilse döngüyü kır
        if (!err.message.includes("404")) {
           break;
        }
      }
    }

    if (!responseText) {
      throw lastError || new Error("Hiçbir model çalışmadı.");
    }
    
    // Gelen JSON'ı çözümle ve sadece JSON kısmını ayıkla (eğer markdown geldiyse)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Yapay zeka geçerli bir format döndüremedi.");
    }
    
    const recipeData = JSON.parse(jsonMatch[0]);

    // 2. Üretilen yeni tarifi gelecekteki kullanımlar için Supabase'e kaydet (İPTAL EDİLDİ)
    // Artık sadece kullanıcı manuel paylaştığında (/api/recipe/publish) kaydedilecek.
    /*
    try {
      const { error: insertError } = await supabase
        .from('recipes')
        .insert([{
          ingredients: cleanIngredients,
          language: language,
          persona: persona,
          response: recipeData
        }]);
      
      if (insertError) {
        console.log("Supabase yazma hatası:", insertError.message);
      } else {
        console.log("💾 Veritabanına yeni tarif kaydedildi:", cleanIngredients);
      }
    } catch (err) {
      console.log("Supabase trycatch hatası:", err.message);
    }
    */

    // Frontend'in beklediği eski formata uyum sağlamak için SDK verisini simüle et
    res.status(200).json({
      candidates: [{
        content: {
          parts: [{ text: JSON.stringify(recipeData) }]
        }
      }]
    });

  } catch (error) {
    console.error("Backend API Hatası:", error);
    
    if (error.status === 429) {
      return res.status(429).json({ error: { message: "Sistem şu an çok yoğun (Google API limiti). Lütfen biraz bekleyip tekrar deneyin! ⏳" } });
    }
    
    res.status(500).json({ error: { message: 'Tarif üretilirken sunucuda bir hata oluştu: ' + error.message } });
  }
});

// Production modunda Vite build klasörünü sun (Railway Deploy)
app.use(express.static(path.join(__dirname, 'dist'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// Diğer tüm rotaları index.html'e yönlendir (SPA)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});
