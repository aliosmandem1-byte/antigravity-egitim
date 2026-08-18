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
  const { ingredients } = req.body;
  if (!ingredients) {
    return res.status(400).json({ error: 'Malzemeler eksik' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Sunucu yapılandırma hatası (API Anahtarı eksik)' });
  }

  try {
    const targetModel = "models/gemini-1.5-flash";
    const prompt = `Sen sadece en temel yemekleri bilen, profesyonellikten uzak, yemek yapmayı HİÇ bilmeyenlere öğreten 'AI Şef'sin. Kullanıcının elindeki malzemeler: "${ingredients}". Bu malzemelere göre (veya ek birkaç temel malzeme ekleyerek) AŞIRI BASİT bir yemek tarifi oluştur. Gram/mililitre kullanma; 'su bardağı', 'tatlı kaşığı', 'göz kararı' gibi şeyler kullan.
Ayrıca, Türkiye'deki güncel market fiyatlarını baz alarak yemeğin kalorisini, hazırlanma süresini ve tahmini maliyetini de hesapla. Maliyet için genel kitleye hitap eden kelimeler kullan ("Çok Ekonomik", "Ortalama Maliyet", "Biraz Maliyetli" gibi) ve yanına tahmini bir TL (₺) aralığı yaz (Örn: "Çok Ekonomik (30-50 ₺)").
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
app.use(express.static(path.join(__dirname, 'dist')));

// Diğer tüm rotaları index.html'e yönlendir (SPA)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});
