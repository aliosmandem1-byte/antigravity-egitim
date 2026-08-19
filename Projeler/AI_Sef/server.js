import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

import { GoogleGenerativeAI } from '@google/generative-ai';

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
app.post('/api/generateRecipe', async (req, res) => {
  const { ingredients, language = 'tr', persona = 'standart' } = req.body;
  if (!ingredients) {
    return res.status(400).json({ error: 'Malzemeler eksik' });
  }

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

    // Dile göre para birimi ve dil ayarı
    let langInstruction = "Tüm cevabını KESİNLİKLE Türkçe (TR) olarak ver. Fiyat hesaplamasını Türkiye (TL - ₺) şartlarına göre yap.";
    if (language === 'en') {
      langInstruction = "Give your ENTIRE response STRICTLY in English (EN). Calculate the estimated cost using US Dollars ($) based on US market prices.";
    } else if (language === 'de') {
      langInstruction = "Gib deine GESAMTE Antwort AUSSCHLIESSLICH auf Deutsch (DE) ab. Berechne die geschätzten Kosten in Euro (€) basierend auf den Preisen auf dem deutschen Markt.";
    } else if (language === 'es') {
      langInstruction = "Da TODA tu respuesta ESTRICTAMENTE en Español (ES). Calcula el costo estimado usando Euros (€) o Dólares ($) según precios promedio.";
    }

    const prompt = `${personaPrompt}
Kullanıcının elindeki malzemeler veya istediği tarif: "${ingredients}". 
Kullanıcı bir malzeme listesi verdiyse ona göre, doğrudan bir tarif adı verdiyse o tarife göre AŞIRI BASİT bir yemek tarifi oluştur. Eğer kullanıcı birbiriyle uyumsuz veya saçma malzemeler verdiyse bile bunu yenebilir ve mantıklı bir hale getirerek tarifleştir. Gram/mililitre kullanma; 'su bardağı', 'tatlı kaşığı', 'göz kararı' gibi şeyler kullan.
Ayrıca, yemeğin kalorisini, hazırlanma süresini ve tahmini maliyetini de hesapla.
DİKKAT MALİYET HESABI: Maliyeti hesaplarken malzemelerin sadece tarifte kullanılan kadarının (gram/porsiyon) maliyetini DEĞİL, marketten SATIN ALINMA (bütün/paket/kilo) fiyatını baz al. Örneğin, tarifte 2 yaprak marul kullanılacak olsa bile kullanıcının marketten 1 tam marul alması gerektiğini düşünerek tam marul fiyatını hesaba kat. Fiyatlandırmayı güncel piyasa koşullarına göre mantıklı bir şekilde yap.
Maliyet sonucunu genel kitleye hitap eden kelimelerle (Örn: Türkçe için "Çok Ekonomik", İngilizce için "Very Cheap") ve yanına tahmini fiyat aralığını yazarak belirt.

${langInstruction}

DİKKAT: Çıktı sadece ve sadece aşağıdaki formatta saf JSON olmalı, başında veya sonunda markdown (örneğin \`\`\`json) olmamalı!
{
  "title": "Tarif Adı",
  "icon": "🍔",
  "desc": "Ana Malzemeler: Tavuk, Tuz, Domates...",
  "calories": "🔥 350 kcal",
  "time": "⏳ 15 Dk",
  "cost": "🤑 Çok Ekonomik (30-50 ₺)",
  "imagePrompt": "A highly detailed, hyper-realistic, 8k photorealistic food photography of [EXACT ENGLISH NAME OF THE DISH YOU CREATED], professional culinary lighting, authentic and accurate representation. If the ingredients are absurd, portray the dish in the most logical and visually stunning realistic form possible, appetizing.",
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
