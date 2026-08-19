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

// API Rotaları
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
    const targetModel = "models/gemini-pro";
    
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
Kullanıcının elindeki malzemeler: "${ingredients}". 
Bu malzemelere göre (veya ek birkaç temel malzeme ekleyerek) AŞIRI BASİT bir yemek tarifi oluştur. Gram/mililitre kullanma; 'su bardağı', 'tatlı kaşığı', 'göz kararı' gibi şeyler kullan.
Ayrıca, yemeğin kalorisini, hazırlanma süresini ve tahmini maliyetini de hesapla. Maliyet için genel kitleye hitap eden kelimeler kullan (Örn: Türkçe için "Çok Ekonomik", İngilizce için "Very Cheap") ve yanına tahmini fiyat aralığını yaz.

${langInstruction}

DİKKAT: Çıktı sadece ve sadece aşağıdaki formatta saf JSON olmalı, başında veya sonunda markdown (örneğin \`\`\`json) olmamalı!
{
  "title": "Tarif Adı",
  "icon": "🍔",
  "desc": "Ana Malzemeler: Tavuk, Tuz, Domates...",
  "calories": "🔥 350 kcal",
  "time": "⏳ 15 Dk",
  "cost": "🤑 Çok Ekonomik (30-50 ₺)",
  "steps": ["Adım 1: ...", "Adım 2: ...", "Adım 3: ..."]
}`;

    // Node.js fetch (Node 18+ ile gömülü)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${targetModel}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      // Eğer limit (429 - Quota Exceeded) hatası alındıysa
      if (response.status === 429) {
        return res.status(429).json({ error: "Sistem şu an çok yoğun (Google API limiti). Lütfen 1 dakika bekleyip tekrar deneyin! ⏳" });
      }
      
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Backend API Hatası:", error);
    res.status(500).json({ error: 'Tarif üretilirken sunucuda bir hata oluştu.' });
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
