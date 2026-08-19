import './style.css';

// --- Sahte Veri (Mock Data) ---
// Not: Railway tetiklemesi için boş commit
const fallbackRecipes = [
  {
    id: 1,
    title: "Tavada Şipşak Pizza",
    icon: "🍕",
    desc: "Ana Malzemeler: Lavaş, Kaşar Peyniri, Sucuk, Salça.",
    calories: "🔥 450 kcal",
    time: "⏳ 10 Dk",
    cost: "💰 Ortalama Maliyet (40-60 ₺)",
    steps: [
      "Geniş bir tavaya 1 adet lavaş ekmeğini koy (altını henüz yakma).",
      "1 yemek kaşığı salçayı biraz su ve kekik ile karıştırıp lavaşın üzerine sür.",
      "Üzerine bolca rendelenmiş kaşar peyniri ve ince dilimlenmiş sucukları diz.",
      "Tavanın altını en kısık ateşte aç ve kapağını kapat.",
      "Peynirler tamamen eriyip lavaşın altı çıtırlaşana kadar (yaklaşık 5-7 dakika) bekle. Afiyet olsun!"
    ]
  },
  {
    id: 2,
    title: "5 Dakikada Fincan Kek",
    icon: "🧁",
    desc: "Ana Malzemeler: Un, Şeker, Kakao, Süt, Sıvı Yağ.",
    calories: "🔥 320 kcal",
    time: "⏳ 5 Dk",
    cost: "🤑 Çok Ekonomik (15-20 ₺)",
    steps: [
      "Büyük bir kupa fincanın içine 3 yemek kaşığı un, 2 yemek kaşığı şeker ve 1 yemek kaşığı kakao koyup karıştır.",
      "Üzerine 3 yemek kaşığı süt ve 2 yemek kaşığı sıvı yağ ekle. Pürüzsüz olana kadar çatal ile iyice çırp.",
      "İsteğe bağlı olarak içine bir parça çikolata atabilirsin.",
      "Mikrodalga fırına koy ve en yüksek ayarda tam 1.5 - 2 dakika pişir.",
      "Biraz soğumasını bekle ve kaşıklayarak ye. Afiyet olsun!"
    ]
  }
];

// --- Sözlük (i18n) ---
const translations = {
  tr: {
    headerSubtitle: "Yemek yapmayı bilmeyenler için aşırı basit rehber",
    heroTitle: "Bugün ne pişirelim?",
    heroSubtitle: "Dolaptaki malzemelerini yaz veya önerdiğimiz garanti tariflerden birini seç.",
    generateBtn: "AI ile Tarif Bul",
    savedRecipesTitle: "🔖 Kaydettiğin Tarifler",
    quickRecipesTitle: "Asla Hata Yapmayacağın 3 Tarif",
    chefStandart: "👨‍🍳 Standart Şef",
    chefAngry: "🤬 Sinirli Şef (Ramsay)",
    chefMom: "👵 Sevecen Anne",
    chefStudent: "🎓 Üşengeç Öğrenci",
    saveBtnText: "Tarifi Kaydet",
    savedBtnText: "Kaydedildi",
    generatingText: "Düşünüyor... 🤔",
    errorText: "Tarif oluşturulamadı. Lütfen tekrar dene.",
    emptyInputAlert: "Lütfen dolabındaki malzemeleri yaz! (Örn: Domates, yumurta)"
  },
  en: {
    headerSubtitle: "Extremely simple guide for those who don't know how to cook",
    heroTitle: "What should we cook today?",
    heroSubtitle: "Write your ingredients in the fridge or choose from our guaranteed recipes.",
    generateBtn: "Find Recipe with AI",
    savedRecipesTitle: "🔖 Saved Recipes",
    quickRecipesTitle: "3 Foolproof Recipes",
    chefStandart: "👨‍🍳 Standard Chef",
    chefAngry: "🤬 Angry Chef (Ramsay)",
    chefMom: "👵 Loving Mom",
    chefStudent: "🎓 Lazy Student",
    saveBtnText: "Save Recipe",
    savedBtnText: "Saved",
    generatingText: "Thinking... 🤔",
    errorText: "Failed to generate recipe. Please try again.",
    emptyInputAlert: "Please write your ingredients! (Ex: Tomato, eggs)"
  },
  de: {
    headerSubtitle: "Extrem einfache Anleitung für diejenigen, die nicht kochen können",
    heroTitle: "Was kochen wir heute?",
    heroSubtitle: "Schreiben Sie Ihre Zutaten auf oder wählen Sie ein garantiertes Rezept.",
    generateBtn: "Rezept mit KI finden",
    savedRecipesTitle: "🔖 Gespeicherte Rezepte",
    quickRecipesTitle: "3 Todsichere Rezepte",
    chefStandart: "👨‍🍳 Standardkoch",
    chefAngry: "🤬 Wütender Koch",
    chefMom: "👵 Liebevolle Mutter",
    chefStudent: "🎓 Fauler Student",
    saveBtnText: "Rezept Speichern",
    savedBtnText: "Gespeichert",
    generatingText: "Denkt nach... 🤔",
    errorText: "Rezept konnte nicht erstellt werden. Bitte versuche es erneut.",
    emptyInputAlert: "Bitte schreibe deine Zutaten! (Bsp: Tomate, Eier)"
  },
  es: {
    headerSubtitle: "Guía extremadamente simple para aquellos que no saben cocinar",
    heroTitle: "¿Qué cocinamos hoy?",
    heroSubtitle: "Escribe tus ingredientes o elige una receta garantizada.",
    generateBtn: "Buscar receta con IA",
    savedRecipesTitle: "🔖 Recetas guardadas",
    quickRecipesTitle: "3 Recetas Infalibles",
    chefStandart: "👨‍🍳 Chef Estándar",
    chefAngry: "🤬 Chef Enojado",
    chefMom: "👵 Mamá Amorosa",
    chefStudent: "🎓 Estudiante Perezoso",
    saveBtnText: "Guardar Receta",
    savedBtnText: "Guardado",
    generatingText: "Pensando... 🤔",
    errorText: "No se pudo generar la receta. Inténtalo de nuevo.",
    emptyInputAlert: "¡Por favor escribe tus ingredientes! (Ej: Tomate, huevos)"
  }
};

// --- DOM Elementleri ---
const homeView = document.getElementById('home-view');
const recipeView = document.getElementById('recipe-view');
const recipeCardsContainer = document.getElementById('quick-recipe-cards');
const savedRecipesSection = document.getElementById('saved-recipes-section');
const savedRecipeCards = document.getElementById('saved-recipe-cards');
const aiGenerateBtn = document.getElementById('ai-generate-btn');
const ingredientInput = document.getElementById('ingredient-input');
const languageSelect = document.getElementById('language-select');
const personaSelect = document.getElementById('persona-select');

// --- State ---
let currentRecipe = null;
let currentStepIndex = 0;
let recognition = null;
let isReadAloudActive = false;
let currentLang = 'tr';
let currentPersona = 'standart';

// --- i18n Dil Fonksiyonu ---
function updateLanguage() {
  const dict = translations[currentLang] || translations['tr'];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  const inputEl = document.getElementById('ingredient-input');
  if (inputEl) {
    if (currentLang === 'en') inputEl.placeholder = "Ex: Chicken, tomato, pasta...";
    else if (currentLang === 'de') inputEl.placeholder = "Bsp: Hähnchen, Tomate, Nudeln...";
    else if (currentLang === 'es') inputEl.placeholder = "Ej: Pollo, tomate, pasta...";
    else inputEl.placeholder = "Örn: Tavuk, domates, makarna...";
  }

  // Şef ipuçlarının dile göre güncellenmesi
  const hintMap = {
    'tr': {
      'standart': 'Her türlü yemeği tam ölçüsüyle profesyonelce anlatır.',
      'angry': 'Disiplinli, lafını esirgemeyen ama mükemmel sonuç veren tarifler.',
      'mom': 'Göz kararı, bol sevgiyle ve ev yapımı sıcaklığında tarifler.',
      'student': 'En az bulaşıkla, en ucuz malzemeyle hızlı doyuran tarifler.'
    },
    'en': {
      'standart': 'Professional and precise with exact measurements.',
      'angry': 'Harsh, disciplined, but delivers perfect results.',
      'mom': 'Cooks by eye, with lots of love and homemade warmth.',
      'student': 'Fast, cheap, and requires minimum washing up.'
    },
    'de': {
      'standart': 'Professionell und präzise mit exakten Maßen.',
      'angry': 'Hart, diszipliniert, aber liefert perfekte Ergebnisse.',
      'mom': 'Kocht nach Gefühl, mit viel Liebe und häuslicher Wärme.',
      'student': 'Schnell, billig und erfordert minimalen Abwasch.'
    },
    'es': {
      'standart': 'Profesional y preciso con medidas exactas.',
      'angry': 'Duro, disciplinado, pero ofrece resultados perfectos.',
      'mom': 'Cocina a ojo, con mucho amor y calor casero.',
      'student': 'Rápido, barato y requiere poco lavado.'
    }
  };
  const hintEl = document.getElementById('persona-hint');
  if(hintEl) {
    hintEl.innerText = hintMap[currentLang][currentPersona] || hintMap['tr'][currentPersona];
  }
}

// --- LocalStorage Fonksiyonları ---
function getSavedRecipes() {
  const saved = localStorage.getItem('aiSef_savedRecipes');
  return saved ? JSON.parse(saved) : [];
}

function saveRecipe(recipe) {
  const savedRecipes = getSavedRecipes();
  const isSaved = savedRecipes.some(r => r.title === recipe.title);
  if (!isSaved) {
    if (!recipe.id) recipe.id = Date.now();
    savedRecipes.push(recipe);
    localStorage.setItem('aiSef_savedRecipes', JSON.stringify(savedRecipes));
  }
}

function removeSavedRecipe(title) {
  let savedRecipes = getSavedRecipes();
  savedRecipes = savedRecipes.filter(r => r.title !== title);
  localStorage.setItem('aiSef_savedRecipes', JSON.stringify(savedRecipes));
}

function isRecipeSaved(title) {
  const savedRecipes = getSavedRecipes();
  return savedRecipes.some(r => r.title === title);
}

// --- Başlangıç Yüklemesi ---
function init() {
  renderSavedRecipes();
  setupEventListeners();
  initSpeechRecognition();
  updateLanguage();
}

function createRecipeCard(recipe) {
  const card = document.createElement('div');
  card.className = 'recipe-card';
  
  let miniBadges = '';
  if (recipe.calories || recipe.time) {
    miniBadges = `
      <div class="card-mini-badges">
        ${recipe.calories ? `<span>${recipe.calories.split(' ')[0]} ${recipe.calories.split(' ')[1]}</span>` : ''}
        ${recipe.time ? `<span>${recipe.time}</span>` : ''}
      </div>
    `;
  }

  card.innerHTML = `
    <div class="icon">${recipe.icon || '🍽️'}</div>
    <div class="info">
      <h4>${recipe.title}</h4>
      <p>${recipe.desc || 'Yapay Zeka Tarifi'}</p>
      ${miniBadges}
    </div>
    <div class="card-action">
      <span class="action-icon">→</span>
    </div>
  `;
  card.addEventListener('click', () => openRecipe(recipe));
  return card;
}

function renderSavedRecipes() {
  if (!savedRecipesSection || !savedRecipeCards) return;
  const savedRecipes = getSavedRecipes();
  
  if (savedRecipes.length > 0) {
    savedRecipesSection.classList.remove('hidden');
    savedRecipeCards.innerHTML = '';
    [...savedRecipes].reverse().forEach(recipe => {
      savedRecipeCards.appendChild(createRecipeCard(recipe));
    });
  } else {
    savedRecipesSection.classList.add('hidden');
  }
}

function setupEventListeners() {
  if (aiGenerateBtn) aiGenerateBtn.addEventListener('click', handleAIGeneration);
  if (ingredientInput) {
    ingredientInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        handleAIGeneration();
      }
    });
  }
  if (languageSelect) {
    languageSelect.addEventListener('change', (e) => {
      currentLang = e.target.value;
      updateLanguage();
    });
  }
  if (personaSelect) {
    personaSelect.addEventListener('change', (e) => {
      currentPersona = e.target.value;
      updateLanguage();
    });
  }
}

// --- Gerçek AI API Çağrısı (Kendi Backend'imize) ---
async function generateRecipeFromGemini(ingredients) {
  try {
    const response = await fetch(`/api/generateRecipe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ingredients, language: currentLang, persona: currentPersona })
    });

    if (!response.ok) {
      const errorData = await response.json();
      const detailedMessage = errorData.error ? errorData.error.message || errorData.error : "Bilinmeyen bir API hatası";
      throw new Error(`Sunucu Hatası (${response.status}): ${detailedMessage}`);
    }

    const data = await response.json();
    let textContent = data.candidates[0].content.parts[0].text.trim();
    console.log("AI'dan gelen ham cevap:", textContent);
    
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Yapay zeka geçerli bir format döndüremedi. Lütfen tekrar deneyin.");
    }

    const recipe = JSON.parse(jsonMatch[0]);
    return recipe;
  } catch (error) {
    console.error("Hata Detayı:", error);
    throw new Error(error.message || "Tarif oluşturulurken bir hata oluştu.");
  }
}

async function handleAIGeneration() {
  const ingredients = ingredientInput.value.trim();
  if(!ingredients) {
    alert(translations[currentLang].emptyInputAlert);
    return;
  }
  
  aiGenerateBtn.disabled = true;
  aiGenerateBtn.innerHTML = `<span class="magic-icon">⏳</span> <span>${translations[currentLang].generatingText}</span>`;

  try {
    const aiRecipe = await generateRecipeFromGemini(ingredients);
    
    // Rastgele bir ID atayalım
    aiRecipe.id = Date.now();
    
    // Ekranı değiştir
    openRecipe(aiRecipe);
    ingredientInput.value = '';

  } catch (error) {
    console.error("AI Tarif Hatası:", error);
    alert(translations[currentLang].errorText + "\n" + error.message);
  } finally {
    aiGenerateBtn.disabled = false;
    aiGenerateBtn.innerHTML = `<span class="magic-icon">✨</span> <span data-i18n="generateBtn">${translations[currentLang].generateBtn}</span>`;
  }
}

// --- Sesli Komut (Speech Recognition) ---
function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'tr-TR';
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = function(event) {
      const lastResultIndex = event.results.length - 1;
      const transcript = event.results[lastResultIndex][0].transcript.toLowerCase().trim();
      console.log("Sesli komut algılandı:", transcript);

      if (transcript.includes('sonraki') || transcript.includes('ileri') || transcript.includes('devam')) {
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn && !nextBtn.innerText.includes('Afiyet')) {
          changeStep(1);
        } else if (nextBtn && nextBtn.innerText.includes('Afiyet')) {
          closeRecipe();
        }
      } else if (transcript.includes('önceki') || transcript.includes('geri')) {
        const prevBtn = document.getElementById('prev-btn');
        if (prevBtn && !prevBtn.disabled) {
          changeStep(-1);
        }
      }
    };

    recognition.onerror = function(event) {
      console.error("Speech Recognition Hata:", event.error);
    };
  } else {
    console.warn("Tarayıcınız SpeechRecognition API'sini desteklemiyor.");
  }
}

// --- Sesli Asistan (Text-to-Speech) ---
function toggleReadAloud() {
  isReadAloudActive = !isReadAloudActive;
  
  const readBtn = document.getElementById('read-aloud-btn');
  if (readBtn) {
    readBtn.innerHTML = isReadAloudActive ? '🔇 Asistanı Sustur' : '🔊 Bana Oku';
    readBtn.classList.toggle('active', isReadAloudActive);
  }

  if (isReadAloudActive) {
    readCurrentStep();
  } else {
    window.speechSynthesis.cancel();
  }
}

// --- Sistem Seslerini Hazırla ---
let globalVoices = [];
window.speechSynthesis.onvoiceschanged = () => {
  globalVoices = window.speechSynthesis.getVoices();
};

function readCurrentStep() {
  if (!isReadAloudActive || !currentRecipe) return;
  
  // Önceki konuşmayı durdur
  window.speechSynthesis.cancel();

  const textToRead = currentRecipe.steps[currentStepIndex];
  const utterance = new SpeechSynthesisUtterance(textToRead);
  
  let targetLang = 'tr-TR';
  if (currentLang === 'en') targetLang = 'en-US';
  else if (currentLang === 'de') targetLang = 'de-DE';
  else if (currentLang === 'es') targetLang = 'es-ES';
  utterance.lang = targetLang;
  
  // Sistemdeki sesleri al (boşsa çekmeye çalış)
  if (globalVoices.length === 0) {
    globalVoices = window.speechSynthesis.getVoices();
  }
  
  const langVoices = globalVoices.filter(v => v.lang.includes(targetLang.split('-')[0]));
  
  // Kadın/Erkek sesi bulmak için çok daha geniş isimler
  // Emel: Edge Online Kadın Sesi, Ayşe/Yelda: Windows/Mac, Gül: Android
  const femaleKeywords = ['ayşe', 'emel', 'yelda', 'gül', 'female', 'woman', 'zira', 'samantha', 'victoria', 'hazel', 'kadın'];
  const maleKeywords = ['tolga', 'ahmet', 'ozan', 'male', 'man', 'david', 'alex', 'george', 'erkek'];
  
  let selectedVoice = null;

  if (currentPersona === 'angry') {
    utterance.rate = 1.25; 
    utterance.pitch = 0.7; 
    selectedVoice = langVoices.find(v => maleKeywords.some(kw => v.name.toLowerCase().includes(kw)));
  } else if (currentPersona === 'mom') {
    utterance.rate = 0.9;  
    utterance.pitch = 1.7; // Eğer ses hala erkekse, 1.7 kalınlığı çok ince yaparak kadın sesine benzetir
    selectedVoice = langVoices.find(v => femaleKeywords.some(kw => v.name.toLowerCase().includes(kw)));
  } else if (currentPersona === 'student') {
    utterance.rate = 1.15; 
    utterance.pitch = 1.1; 
    selectedVoice = langVoices.find(v => maleKeywords.some(kw => v.name.toLowerCase().includes(kw)));
  } else {
    utterance.rate = 1.0; 
    utterance.pitch = 1.0; 
    selectedVoice = langVoices.find(v => maleKeywords.some(kw => v.name.toLowerCase().includes(kw)));
  }
  
  // Bulunan sesi ata
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  } else if (langVoices.length > 0) {
    // Eğer 'mom' ise, ve liste varsa tersinden arayalım (Genelde 2. ses kadındır)
    if (currentPersona === 'mom' && langVoices.length > 1) {
       utterance.voice = langVoices[langVoices.length - 1]; 
    } else {
       utterance.voice = langVoices[0];
    }
  }
  
  window.speechSynthesis.speak(utterance);
}

// --- Tarif Ekranı Mantığı ---
function openRecipe(recipe) {
  currentRecipe = recipe;
  currentStepIndex = 0;
  isReadAloudActive = false; // Her yeni tarifte kapalı gelsin
  
  homeView.classList.add('hidden');
  recipeView.classList.remove('hidden');
  
  renderRecipeSteps();

  if (recognition) {
    try {
      recognition.start();
    } catch(e) {
      console.log("Recognition zaten çalışıyor veya başlatılamadı.");
    }
  }
}

function closeRecipe() {
  homeView.classList.remove('hidden');
  recipeView.classList.add('hidden');
  currentRecipe = null;
  
  renderSavedRecipes();

  if (recognition) {
    recognition.stop();
  }
  
  // Sesli asistanı da sustur
  window.speechSynthesis.cancel();
  isReadAloudActive = false;
}

function toggleSaveCurrentRecipe() {
  if (!currentRecipe) return;
  const isSaved = isRecipeSaved(currentRecipe.title);
  
  if (isSaved) {
    removeSavedRecipe(currentRecipe.title);
  } else {
    saveRecipe(currentRecipe);
  }
  
  const saveBtn = document.getElementById('save-btn');
  const saveBtnText = document.getElementById('save-btn-text');
  if (saveBtn && saveBtnText) {
    const newlySaved = isRecipeSaved(currentRecipe.title);
    saveBtn.innerHTML = `<span>${newlySaved ? '🔖' : '📑'}</span> <span id="save-btn-text">${newlySaved ? translations[currentLang].savedBtnText : translations[currentLang].saveBtnText}</span>`;
    saveBtn.title = newlySaved ? translations[currentLang].savedBtnText : translations[currentLang].saveBtnText;
    saveBtn.classList.toggle('active', newlySaved);
  }
}

function renderRecipeSteps() {
  const totalSteps = currentRecipe.steps.length;
  const isLastStep = currentStepIndex === totalSteps - 1;
  const isFirstStep = currentStepIndex === 0;
  const isSaved = isRecipeSaved(currentRecipe.title);

  const micBadgeHTML = recognition ? '<div class="mic-badge listening" title="Sesli Komut Açık">🎙️ Dinliyor</div>' : '';

  const badgesHTML = `
    <div class="recipe-badges">
      ${currentRecipe.calories ? `<span class="badge badge-calories">${currentRecipe.calories}</span>` : ''}
      ${currentRecipe.time ? `<span class="badge badge-time">${currentRecipe.time}</span>` : ''}
      ${currentRecipe.cost ? `<span class="badge badge-cost">${currentRecipe.cost}</span>` : ''}
    </div>
  `;

  const imageHtml = currentRecipe.imagePrompt 
    ? `<div class="recipe-image-container">
         <img src="https://image.pollinations.ai/prompt/${encodeURIComponent(currentRecipe.imagePrompt)}?width=800&height=400&nologo=true" alt="${currentRecipe.title}" class="recipe-main-image" onerror="this.style.display='none'">
       </div>` 
    : '';

  recipeView.innerHTML = `
    <div class="recipe-header">
      <button class="back-btn" id="back-btn">←</button>
      <h2>${currentRecipe.icon || '🍽️'} ${currentRecipe.title}</h2>
      <button class="save-btn ${isSaved ? 'active' : ''}" id="save-btn" title="${isSaved ? translations[currentLang].savedBtnText : translations[currentLang].saveBtnText}">
        <span>${isSaved ? '🔖' : '📑'}</span> <span id="save-btn-text">${isSaved ? translations[currentLang].savedBtnText : translations[currentLang].saveBtnText}</span>
      </button>
    </div>
    
    ${imageHtml}

    ${currentRecipe.calories || currentRecipe.time || currentRecipe.cost ? badgesHTML : ''}
    
    <div class="step-container">
      <div class="step-badge">Adım ${currentStepIndex + 1} / ${totalSteps}</div>
      ${micBadgeHTML}
      
      <button class="read-aloud-btn ${isReadAloudActive ? 'active' : ''}" id="read-aloud-btn">
        ${isReadAloudActive ? '🔇 Asistanı Sustur' : '🔊 Bana Oku'}
      </button>

      <div class="step-content" id="step-content">
        ${currentRecipe.steps[currentStepIndex]}
      </div>
    </div>
    
    <div class="step-controls">
      <button class="control-btn prev-btn" id="prev-btn" ${isFirstStep ? 'disabled' : ''}>Önceki</button>
      <button class="control-btn next-btn" id="next-btn">${isLastStep ? 'Afiyet Olsun! 🎉' : 'Sonraki Adım'}</button>
    </div>
  `;

  document.getElementById('back-btn').addEventListener('click', closeRecipe);
  document.getElementById('save-btn').addEventListener('click', toggleSaveCurrentRecipe);
  document.getElementById('read-aloud-btn').addEventListener('click', toggleReadAloud);
  document.getElementById('prev-btn').addEventListener('click', () => changeStep(-1));
  document.getElementById('next-btn').addEventListener('click', () => {
    if (isLastStep) {
      closeRecipe();
    } else {
      changeStep(1);
    }
  });
}

function changeStep(direction) {
  currentStepIndex += direction;
  
  const stepContent = document.getElementById('step-content');
  if(stepContent) {
    stepContent.style.animation = 'none';
    stepContent.offsetHeight; 
    stepContent.style.animation = null; 
  }
  
  renderRecipeSteps();
  
  // Eğer asistan açıksa yeni adımı okusun
  if (isReadAloudActive) {
    readCurrentStep();
  }
}

init();
