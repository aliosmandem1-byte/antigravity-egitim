import './style.css';
import { Capacitor } from '@capacitor/core';
import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Purchases } from '@revenuecat/purchases-capacitor';
import { categories as categories_tr } from './categories.js';
import { categories as categories_en } from './categories_en.js';
import { categories as categories_de } from './categories_de.js';
import { categories as categories_es } from './categories_es.js';

const categoryData = {
  tr: categories_tr,
  en: categories_en,
  de: categories_de,
  es: categories_es
};

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
    generateBtn: "Mutfakta Sihir Yarat! 🔮",
    savedRecipesTitle: "🔖 Kaydettiğin Tarifler",
    quickRecipesTitle: "Asla Hata Yapmayacağın 3 Tarif",
    chefStandart: "👨‍🍳 Standart Şef",
    chefAngry: "🔒 🤬 Sinirli Şef (Ramsay)",
    chefMom: "🔒 👵 Sevecen Anne",
    chefStudent: "🎓 Üşengeç Öğrenci",
    saveBtnText: "Tarifi Kaydet",
    savedBtnText: "Kaydedildi",
    generatingText: "Düşünüyor... 🤔",
    errorText: "Tarif oluşturulamadı. Lütfen tekrar dene.",
    emptyInputAlert: "Lütfen dolabındaki malzemeleri yaz! (Örn: Domates, yumurta)",
    inputHint: "💡 İpucu: İster elindeki malzemeleri yaz, istersen doğrudan 'Sezar Salata' gibi istediğin bir tarifin adını yaz!",
    guideBtn: "📖 Nasıl Kullanılır?",
    guideTitle: "📖 KitchAI Nasıl Kullanılır?",
    guideStep1Title: "1. Malzemelerini Yaz veya Söyle",
    guideStep1Desc: "İster yaz, ister mikrofon (🎤) tuşuna basıp sesli söyle.",
    guideStep2Title: "2. Şefini Seç",
    guideStep2Desc: "Farklı karakterlerde şefler seç.",
    guideStep3Title: "3. Dinle ve Pişir",
    guideStep3Desc: "AI tarifi anlatsın, sen pişir!",
    guideFakeInput: "Tavuk, Krema, Mantar",
    guideFakeSelect: "🤬 Sinirli Şef (Ramsay)"
  },
  en: {
    headerSubtitle: "Extremely simple guide for those who don't know how to cook",
    heroTitle: "What should we cook today?",
    heroSubtitle: "Write your ingredients in the fridge or choose from our guaranteed recipes.",
    generateBtn: "Conjure Kitchen Magic! 🔮",
    savedRecipesTitle: "🔖 Saved Recipes",
    quickRecipesTitle: "3 Foolproof Recipes",
    chefStandart: "👨‍🍳 Standard Chef",
    chefAngry: "🔒 🤬 Angry Chef (Ramsay)",
    chefMom: "🔒 👵 Loving Mom",
    chefStudent: "🎓 Lazy Student",
    saveBtnText: "Save Recipe",
    savedBtnText: "Saved",
    generatingText: "Thinking... 🤔",
    errorText: "Failed to generate recipe. Please try again.",
    emptyInputAlert: "Please write your ingredients! (Ex: Tomato, eggs)",
    inputHint: "💡 Hint: You can write your available ingredients, or directly ask for a specific recipe like 'Caesar Salad'!",
    guideBtn: "📖 How to Use?",
    guideTitle: "📖 How to Use KitchAI?",
    guideStep1Title: "1. Type or Say Ingredients",
    guideStep1Desc: "Type them or use the mic (🎤) to speak.",
    guideStep2Title: "2. Choose a Chef",
    guideStep2Desc: "Select different chef personas.",
    guideStep3Title: "3. Listen & Cook",
    guideStep3Desc: "Let AI narrate, you cook!",
    guideFakeInput: "Chicken, Cream, Mushroom",
    guideFakeSelect: "🤬 Angry Chef (Ramsay)"
  },
  de: {
    headerSubtitle: "Extrem einfache Anleitung für diejenigen, die nicht kochen können",
    heroTitle: "Was kochen wir heute?",
    heroSubtitle: "Schreiben Sie Ihre Zutaten auf oder wählen Sie ein garantiertes Rezept.",
    generateBtn: "Küchenmagie Beschwören! 🔮",
    savedRecipesTitle: "🔖 Gespeicherte Rezepte",
    quickRecipesTitle: "3 Todsichere Rezepte",
    chefStandart: "👨‍🍳 Standardkoch",
    chefAngry: "🔒 🤬 Wütender Koch",
    chefMom: "🔒 👵 Liebevolle Mutter",
    chefStudent: "🎓 Fauler Student",
    saveBtnText: "Rezept Speichern",
    savedBtnText: "Gespeichert",
    generatingText: "Denkt nach... 🤔",
    errorText: "Rezept konnte nicht erstellt werden. Bitte versuche es erneut.",
    emptyInputAlert: "Bitte schreibe deine Zutaten! (Bsp: Tomate, Eier)",
    inputHint: "💡 Tipp: Gib deine Zutaten ein oder frage direkt nach einem Rezept wie 'Caesar Salat'!",
    guideBtn: "📖 Wie benutzt man es?",
    guideTitle: "📖 Wie man KitchAI benutzt?",
    guideStep1Title: "1. Zutaten schreiben oder sagen",
    guideStep1Desc: "Schreibe sie oder sprich ins Mikrofon (🎤).",
    guideStep2Title: "2. Koch auswählen",
    guideStep2Desc: "Wähle verschiedene Köche.",
    guideStep3Title: "3. Hören & Kochen",
    guideStep3Desc: "Lass die KI erzählen, du kochst!",
    guideFakeInput: "Hähnchen, Sahne, Pilze",
    guideFakeSelect: "🤬 Wütender Koch"
  },
  es: {
    headerSubtitle: "Guía extremadamente simple para aquellos que no saben cocinar",
    heroTitle: "¿Qué cocinamos hoy?",
    heroSubtitle: "Escribe tus ingredientes o elige una receta garantizada.",
    generateBtn: "¡Magia Culinaria! 🔮",
    savedRecipesTitle: "🔖 Recetas guardadas",
    quickRecipesTitle: "3 Recetas Infalibles",
    chefStandart: "👨‍🍳 Chef Estándar",
    chefAngry: "🔒 🤬 Chef Enojado",
    chefMom: "🔒 👵 Mamá Amorosa",
    chefStudent: "🎓 Estudiante Perezoso",
    saveBtnText: "Guardar Receta",
    savedBtnText: "Guardado",
    generatingText: "Pensando... 🤔",
    errorText: "No se pudo generar la receta. Inténtalo de nuevo.",
    emptyInputAlert: "¡Por favor escribe tus ingredientes! (Ej: Tomate, huevos)",
    inputHint: "💡 Consejo: ¡Escribe tus ingredientes disponibles o pide directamente una receta como 'Ensalada César'!",
    guideBtn: "📖 ¿Cómo usar?",
    guideTitle: "📖 ¿Cómo usar KitchAI?",
    guideStep1Title: "1. Escribe o di ingredientes",
    guideStep1Desc: "Escríbelos o usa el micrófono (🎤) para hablar.",
    guideStep2Title: "2. Elige un chef",
    guideStep2Desc: "Selecciona diferentes chefs.",
    guideStep3Title: "3. Escucha y cocina",
    guideStep3Desc: "¡Deja que la IA narre y cocina!",
    guideFakeInput: "Pollo, Crema, Champiñones",
    guideFakeSelect: "🤬 Chef Enojado"
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
const categoriesCarousel = document.getElementById('categories-carousel');
const categoryDetailView = document.getElementById('category-detail-view');
const discoverBtn = document.getElementById('discover-btn');
const discoverView = document.getElementById('discover-view');
const discoverCards = document.getElementById('discover-cards');
const discoverBackBtn = document.getElementById('discover-back-btn');

// --- State ---
let currentRecipe = null;
let currentStepIndex = 0;
let recognition = null;
let isReadAloudActive = false;
let currentLang = 'tr';
let currentPersona = 'standart';
let currentPackage = null;

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
  
  // Re-render categories with the new language
  renderCategories();
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

// --- Custom Dropdown Implementation ---
function initCustomDropdowns() {
  const selects = ['persona-select', 'language-select'];
  selects.forEach(id => {
    const select = document.getElementById(id);
    if (!select || select.dataset.customized) return;
    select.dataset.customized = "true";
    
    select.style.display = 'none';
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-dropdown';
    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(select);
    
    const display = document.createElement('div');
    display.className = 'custom-dropdown-display';
    const selectedOption = select.options[select.selectedIndex];
    display.innerHTML = `<span class="c-val">${selectedOption.textContent}</span> <span class="arrow">▼</span>`;
    wrapper.appendChild(display);
    
    const list = document.createElement('div');
    list.className = 'custom-dropdown-list';
    
    Array.from(select.options).forEach((opt, index) => {
      const item = document.createElement('div');
      item.className = 'custom-dropdown-item' + (index === select.selectedIndex ? ' active' : '');
      item.innerHTML = opt.textContent;
      
      const i18nKey = opt.getAttribute('data-i18n');
      if (i18nKey) item.setAttribute('data-i18n', i18nKey);
      
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        select.value = opt.value;
        select.dispatchEvent(new Event('change'));
        
        display.querySelector('.c-val').textContent = item.textContent;
        list.querySelectorAll('.custom-dropdown-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
        list.classList.remove('show');
      });
      list.appendChild(item);
    });
    
    wrapper.appendChild(list);
    
    display.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.custom-dropdown-list').forEach(l => {
        if(l !== list) l.classList.remove('show');
      });
      list.classList.toggle('show');
    });
    
    wrapper.sync = function() {
      const currentOpt = select.options[select.selectedIndex];
      if(currentOpt) display.querySelector('.c-val').textContent = currentOpt.textContent;
    };
  });
  
  document.addEventListener('click', () => {
    document.querySelectorAll('.custom-dropdown-list').forEach(l => l.classList.remove('show'));
  });
}

// --- Başlangıç Ayarları ---
document.addEventListener('DOMContentLoaded', () => {
  // --- TEST MODU HİLESİ (DEV MODE) ---
  // Uygulama her açıldığında geliştiriciyi otomatik Premium yapar.
  // Canlıya (Play Store'a) çıkarken bu satırı silebilirsiniz.
  localStorage.setItem('aiSef_isPremium', 'true');
  console.log("🛠️ Geliştirici Modu: Premium yetkileri aktif edildi.");
  
  initSpeechRecognition();
  initCustomDropdowns();
  updateLanguage();
  initRevenueCat();
  initAdMob();
  renderSavedRecipes();
  setupEventListeners();
});

async function initRevenueCat() {
  if (Capacitor.getPlatform() !== 'web') {
    try {
      await Purchases.setLogLevel({ level: "DEBUG" });
      await Purchases.configure({ apiKey: "goog_dwyCthmqBrPJhOfjYvCRdhswapg" });
      
      const customerInfo = await Purchases.getCustomerInfo();
      // If the user has an active premium entitlement
      if (typeof customerInfo.customerInfo.entitlements.active['premium'] !== "undefined") {
        localStorage.setItem('aiSef_isPremium', 'true');
      } else {
        // TEST MODU AÇIK OLDUĞU İÇİN AŞAĞIDAKİ SATIR İPTAL EDİLDİ
        // localStorage.setItem('aiSef_isPremium', 'false');
      }
    } catch(err) {
      console.log("RevenueCat init error", err);
    }
  }
}

async function initAdMob() {
  if (Capacitor.getPlatform() !== 'web') {
    let isPremium = localStorage.getItem('aiSef_isPremium') === 'true';
    if (!isPremium) {
      try {
        await AdMob.initialize({
          requestTrackingAuthorization: true,
          initializeForTesting: false,
        });
        
        await AdMob.showBanner({
          adId: 'ca-app-pub-3851914478319541/2960966529', // Real Banner
          adSize: BannerAdSize.BANNER,
          position: BannerAdPosition.BOTTOM_CENTER,
          margin: 0,
          isTesting: false
        });
      } catch (err) {
        console.log('AdMob initialization error:', err);
      }
    }
  } else {
    console.log('AdMob is skipped on web platform.');
  }
}

// --- Freemium Mantığı ---
const MAX_FREE_RECIPES = 3;

async function showPremiumModal() {
  const modal = document.getElementById('premium-modal');
  const priceText = document.getElementById('premium-price-text');
  if(modal) modal.classList.remove('hidden');
  
  if (Capacitor.getPlatform() !== 'web') {
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
        currentPackage = offerings.current.availablePackages[0];
        if(priceText) {
          priceText.innerText = `Premium Ol (${currentPackage.product.priceString})`;
        }
      }
    } catch(err) {
      console.log("Error fetching offerings", err);
    }
  }
}

function checkQuota() {
  let isPremium = localStorage.getItem('aiSef_isPremium') === 'true';
  if (isPremium) return true;

  const today = new Date().toISOString().split('T')[0];
  let usage = JSON.parse(localStorage.getItem('aiSef_usage') || '{}');
  
  if (usage.date !== today) {
    usage = { date: today, count: 0 };
  }

  if (usage.count >= MAX_FREE_RECIPES) {
    showPremiumModal();
    return false;
  }
  return true;
}

function incrementQuota() {
  let isPremium = localStorage.getItem('aiSef_isPremium') === 'true';
  if (isPremium) return;

  const today = new Date().toISOString().split('T')[0];
  let usage = JSON.parse(localStorage.getItem('aiSef_usage') || '{}');
  if (usage.date !== today) {
    usage = { date: today, count: 0 };
  }
  usage.count++;
  localStorage.setItem('aiSef_usage', JSON.stringify(usage));
}

function checkPersonaPremium() {
  let isPremium = localStorage.getItem('aiSef_isPremium') === 'true';
  if (isPremium) return true;

  if (currentPersona === 'angry' || currentPersona === 'mom') {
    showPremiumModal();
    // Geri al
    currentPersona = 'standart';
    const personaSelect = document.getElementById('persona-select');
    if (personaSelect) personaSelect.value = 'standart';
    updateLanguage();
    return false;
  }
  return true;
}

async function showInterstitialAd() {
  if (Capacitor.getPlatform() !== 'web') {
    let isPremium = localStorage.getItem('aiSef_isPremium') === 'true';
    if (isPremium) return;
    try {
      await AdMob.prepareInterstitial({
        adId: 'ca-app-pub-3851914478319541/5395558170', // Real Interstitial
        isTesting: false
      });
      await AdMob.showInterstitial();
    } catch (err) {
      console.log('AdMob Interstitial error:', err);
    }
  }
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

function renderCategories() {
  const currentCategories = categoryData[currentLang] || categoryData['tr'];
  if (!categoriesCarousel) return;
  categoriesCarousel.innerHTML = '';
  currentCategories.forEach(category => {
    const card = document.createElement('div');
    card.className = 'category-card';
    card.innerHTML = `
      <img src="${category.image}" alt="${category.title}">
      <div class="category-overlay">
        <h4>${category.title}</h4>
        <p>${category.desc}</p>
      </div>
    `;
    card.addEventListener('click', () => openCategoryDetail(category));
    categoriesCarousel.appendChild(card);
  });
}

function openCategoryDetail(category) {
  homeView.classList.add('hidden');
  categoryDetailView.classList.remove('hidden');
  
  let recipesHtml = '';
  category.recipes.forEach((recipe, index) => {
    let miniBadges = '';
    if (recipe.calories || recipe.time) {
      miniBadges = `
        <div class="card-mini-badges">
          ${recipe.calories ? `<span>${recipe.calories.split(' ')[0]} ${recipe.calories.split(' ')[1]}</span>` : ''}
          ${recipe.time ? `<span>${recipe.time}</span>` : ''}
        </div>
      `;
    }
    
    recipesHtml += `
      <div class="recipe-card no-image" data-id="${recipe.id}">
        <div class="info">
          <h4>${recipe.title}</h4>
          <p>${recipe.desc}</p>
          ${miniBadges}
        </div>
        <div class="card-action"><span class="action-icon">→</span></div>
      </div>
    `;
  });

  categoryDetailView.innerHTML = `
    <div class="category-detail-header">
      <button class="back-btn" id="category-back-btn">←</button>
      <h2>${category.title} Tarifleri</h2>
    </div>
    <div class="category-detail-grid">
      ${recipesHtml}
    </div>
  `;
  
  document.getElementById('category-back-btn').addEventListener('click', () => {
    categoryDetailView.classList.add('hidden');
    homeView.classList.remove('hidden');
  });
  
  const recipeCards = categoryDetailView.querySelectorAll('.recipe-card');
  recipeCards.forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      const recipe = category.recipes.find(r => r.id === id);
      if(recipe) openRecipe(recipe);
    });
  });
}

function setupEventListeners() {
  renderCategories();
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
      if(checkPersonaPremium()){
        updateLanguage();
      }
    });
  }
  
  // Discover (Keşfet) Modal Listeners
  if (discoverBtn && discoverView) {
    discoverBtn.addEventListener('click', () => {
      homeView.classList.add('hidden');
      discoverView.classList.remove('hidden');
      fetchDiscoverRecipes();
    });
  }
  
  if (discoverBackBtn && discoverView) {
    discoverBackBtn.addEventListener('click', () => {
      discoverView.classList.add('hidden');
      homeView.classList.remove('hidden');
    });
  }

  // Guide Modal Listeners
  const guideBtn = document.getElementById('guide-btn');
  const guideModal = document.getElementById('guide-modal');
  const closeGuide = document.getElementById('close-guide');
  let onboardInterval;
  
  if (guideBtn && guideModal) {
    guideBtn.addEventListener('click', () => {
      guideModal.classList.remove('hidden');
      // Start Animation
      const steps = document.querySelectorAll('.onboard-step');
      if (steps.length > 0) {
        let currentStep = 0;
        steps.forEach(s => s.classList.remove('active'));
        steps[0].classList.add('active');
        
        clearInterval(onboardInterval);
        onboardInterval = setInterval(() => {
          steps[currentStep].classList.remove('active');
          currentStep = (currentStep + 1) % steps.length;
          // Trigger reflow to restart CSS animations
          void steps[currentStep].offsetWidth; 
          steps[currentStep].classList.add('active');
        }, 3000); // 3 saniye her adım
      }
    });
  }
  
  if (closeGuide && guideModal) {
    closeGuide.addEventListener('click', () => {
      guideModal.classList.add('hidden');
      clearInterval(onboardInterval);
    });
  }
  
  window.addEventListener('click', (e) => {
    if (e.target === guideModal) {
      guideModal.classList.add('hidden');
      clearInterval(onboardInterval);
    }
    const premiumModal = document.getElementById('premium-modal');
    if (e.target === premiumModal) {
      premiumModal.classList.add('hidden');
    }
  });


  // Premium Modal Listeners
  const closePremium = document.getElementById('close-premium');
  const buyPremiumBtn = document.getElementById('buy-premium-btn');
  const premiumModal = document.getElementById('premium-modal');

  if (closePremium && premiumModal) {
    closePremium.addEventListener('click', () => {
      premiumModal.classList.add('hidden');
    });
  }

  if (buyPremiumBtn && premiumModal) {
    buyPremiumBtn.addEventListener('click', async () => {
      if (Capacitor.getPlatform() !== 'web') {
        try {
          if(!currentPackage) {
            alert("Ürün yüklenemedi. Lütfen tekrar deneyin.");
            return;
          }
          const { customerInfo } = await Purchases.purchasePackage({ aPackage: currentPackage });
          if (typeof customerInfo.entitlements.active['premium'] !== "undefined") {
            localStorage.setItem('aiSef_isPremium', 'true');
            alert('Tebrikler! Premium oldunuz. Limitler ve reklamlar kalktı!');
            premiumModal.classList.add('hidden');
            AdMob.hideBanner().catch(e => console.log(e));
          }
        } catch (e) {
          if(!e.userCancelled) {
             alert('Satın alma işleminde hata oluştu: ' + e.message);
          }
        }
      } else {
         // Web Fallback (Testing)
         localStorage.setItem('aiSef_isPremium', 'true');
         alert('Tebrikler! Test modunda Premium oldunuz. Limitler ve reklamlar kalktı!');
         premiumModal.classList.add('hidden');
      }
    });
  }
}

// --- Gerçek AI API Çağrısı (Kendi Backend'imize) ---
async function generateRecipeFromGemini(ingredients) {
  try {
    const promptIngredients = ingredients + " (ÖNEMLİ NOT: Lütfen tarifin malzeme ölçülerini tam olarak 1-2 kişilik olacak şekilde ayarla.)";
    const response = await fetch(`https://kitchai.up.railway.app/api/generateRecipe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ingredients: promptIngredients, language: currentLang, persona: currentPersona })
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
  
  if (!checkQuota()) {
    return; // Kota dolmuşsa işlem yapma
  }
  
  aiGenerateBtn.disabled = true;
  aiGenerateBtn.innerHTML = `<span class="magic-icon">⏳</span> <span>${translations[currentLang].generatingText}</span>`;

  // Reklamı yükle (Mobildeyse)
  showInterstitialAd().catch(e => console.log(e));

  try {
    const aiRecipe = await generateRecipeFromGemini(ingredients);
    
    // Rastgele bir ID atayalım
    aiRecipe.id = Date.now();
    
    // Ekranı değiştir
    openRecipe(aiRecipe);
    ingredientInput.value = '';
    incrementQuota();

  } catch (error) {
    console.error("AI Tarif Hatası:", error);
    alert(translations[currentLang].errorText + "\n" + error.message);
  } finally {
    aiGenerateBtn.disabled = false;
    aiGenerateBtn.innerHTML = `<span class="magic-icon">✨</span> <span data-i18n="generateBtn">${translations[currentLang].generateBtn}</span>`;
  }
}

// --- Sesli Komut (Speech Recognition) ---
let dictationRecognition = null;
let isDictating = false;

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

    // Dictation (Voice Input for ingredients)
    dictationRecognition = new SpeechRecognition();
    dictationRecognition.lang = 'tr-TR';
    dictationRecognition.continuous = false;
    dictationRecognition.interimResults = false;

    const micBtn = document.getElementById('mic-btn');
    if (micBtn) {
      micBtn.addEventListener('click', () => {
        if (isDictating) {
          dictationRecognition.stop();
          return;
        }
        dictationRecognition.start();
      });
    }

    dictationRecognition.onstart = function() {
      isDictating = true;
      const micBtn = document.getElementById('mic-btn');
      if(micBtn) micBtn.classList.add('recording');
      ingredientInput.placeholder = "Sizi dinliyorum...";
    };

    dictationRecognition.onresult = function(event) {
      const transcript = event.results[0][0].transcript;
      ingredientInput.value = transcript;
      // Auto-submit after dictation ends
      setTimeout(handleAIGeneration, 500);
    };

    dictationRecognition.onend = function() {
      isDictating = false;
      const micBtn = document.getElementById('mic-btn');
      if(micBtn) micBtn.classList.remove('recording');
      if (currentLang === 'en') ingredientInput.placeholder = "Ex: Chicken, tomato, pasta...";
      else if (currentLang === 'de') ingredientInput.placeholder = "Bsp: Hähnchen, Tomate, Nudeln...";
      else if (currentLang === 'es') ingredientInput.placeholder = "Ej: Pollo, tomate, pasta...";
      else ingredientInput.placeholder = "Örn: Tavuk, domates, makarna...";
    };



    dictationRecognition.onerror = function(event) {
      console.error("Dictation Hata:", event.error);
      isDictating = false;
      const micBtn = document.getElementById('mic-btn');
      if(micBtn) micBtn.classList.remove('recording');
    };

  } else {
    console.warn("Tarayıcınız SpeechRecognition API'sini desteklemiyor.");
    const micBtn = document.getElementById('mic-btn');
    if(micBtn) micBtn.style.display = 'none';
  }
}

// --- Sesli Asistan (Text-to-Speech) ---

// --- Topluluk Keşfet (Discover) ---
async function fetchDiscoverRecipes() {
  if (!discoverCards) return;
  discoverCards.innerHTML = '<div style="text-align:center; padding: 40px; color: var(--text-muted);">Topluluk tarifleri yükleniyor... ⏳</div>';
  
  try {
    const response = await fetch('https://kitchai.up.railway.app/api/discover');
    if (!response.ok) throw new Error('Veri çekilemedi');
    const data = await response.json();
    
    if (data && data.length > 0) {
      discoverCards.innerHTML = '';
      data.forEach(item => {
        const recipe = item.response;
        if (!recipe.id) recipe.id = item.id;
        
        const card = document.createElement('div');
        card.className = 'recipe-card';
        
        let miniBadges = '';
        if (recipe.calories || recipe.time) {
          miniBadges = `
            <div class="card-mini-badges">
              ${recipe.calories ? `<span>${recipe.calories.split(' ')[0]} ${recipe.calories.split(' ')[1]}</span>` : ''}
              ${recipe.time ? `<span>${recipe.time}</span>` : ''}
              <span>${item.persona === 'angry' ? '🤬' : item.persona === 'mom' ? '👵' : item.persona === 'student' ? '🎓' : '👨‍🍳'}</span>
            </div>
          `;
        }

        let likedRecipes = JSON.parse(localStorage.getItem('aiSef_likedRecipes') || '[]');
        const isLiked = likedRecipes.includes(recipe.id);

        card.innerHTML = `
          <div class="info">
            <h4>${recipe.title}</h4>
            <p>${recipe.desc || 'Yapay Zeka Tarifi'}</p>
            ${miniBadges}
          </div>
          <div class="card-action like-btn-container" style="right: 60px; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">
            <span class="like-count" style="font-weight: 600; font-size: 0.95rem; color: var(--text-muted);">${item.likes || 0}</span>
            <button class="like-btn ${isLiked ? 'liked' : ''}" data-id="${recipe.id}" style="background:none; border:none; font-size:1.5rem; transition: transform 0.2s;">
              ${isLiked ? '❤️' : '🤍'}
            </button>
          </div>
          <div class="card-action">
            <span class="action-icon">→</span>
          </div>
        `;

        const likeBtn = card.querySelector('.like-btn');
        const countSpan = card.querySelector('.like-count');
        likeBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          let likes = JSON.parse(localStorage.getItem('aiSef_likedRecipes') || '[]');
          
          let isAdding = true;
          if (likeBtn.classList.contains('liked')) {
            likeBtn.classList.remove('liked');
            likeBtn.innerHTML = '🤍';
            likes = likes.filter(id => id !== recipe.id);
            isAdding = false;
            countSpan.innerText = Math.max(0, parseInt(countSpan.innerText) - 1);
          } else {
            likeBtn.classList.add('liked');
            likeBtn.innerHTML = '❤️';
            likeBtn.style.transform = 'scale(1.3)';
            setTimeout(() => likeBtn.style.transform = 'scale(1)', 200);
            if (!likes.includes(recipe.id)) likes.push(recipe.id);
            countSpan.innerText = parseInt(countSpan.innerText) + 1;
          }
          localStorage.setItem('aiSef_likedRecipes', JSON.stringify(likes));

          try {
            await fetch(`https://kitchai.up.railway.app/api/recipe/${recipe.id}/like`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ isLiked: isAdding })
            });
          } catch(err) {
            console.error("Like backend hatası", err);
          }
        });

        card.addEventListener('click', () => {
          discoverView.classList.add('hidden');
          openRecipe(recipe);
        });

        discoverCards.appendChild(card);
      });
    } else {
      discoverCards.innerHTML = '<div style="text-align:center; padding: 40px; color: var(--text-muted);">Henüz hiç tarif üretilmemiş! İlk tarifi sen üret. 🍳</div>';
    }
  } catch (error) {
    console.error("Keşfet hatası:", error);
    discoverCards.innerHTML = '<div style="text-align:center; padding: 40px; color: red;">Tarifler yüklenirken bir hata oluştu. Lütfen tekrar dene.</div>';
  }
}
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
    TextToSpeech.stop().catch(e => console.log(e));
  }
}

async function readCurrentStep() {
  if (!isReadAloudActive || !currentRecipe) return;
  
  // Önceki konuşmayı durdur
  await TextToSpeech.stop().catch(e => console.log(e));

  const textToRead = currentRecipe.steps[currentStepIndex];
  
  // Sadece dil ayarı verip sesi cihaza bırakıyoruz (Android uyumluluğu için)
  let targetLang = 'tr-TR';
  if (currentLang === 'en') targetLang = 'en-US';
  else if (currentLang === 'de') targetLang = 'de-DE';
  else if (currentLang === 'es') targetLang = 'es-ES';
  
  let rate = 1.0;
  let pitch = 1.0;
  
  // Hız ve ton ayarları
  if (currentPersona === 'angry') {
    rate = 1.15; 
    pitch = 0.7; 
  } else if (currentPersona === 'mom') {
    rate = 0.9;  
    pitch = 1.5; 
  } else if (currentPersona === 'student') {
    rate = 1.15; 
    pitch = 1.1; 
  }
  
  try {
    await TextToSpeech.speak({
      text: textToRead,
      lang: targetLang,
      rate: rate,
      pitch: pitch,
    });
  } catch(err) {
    console.log("TTS Error:", err);
  }
}

// --- Tarif Ekranı Mantığı ---
function openRecipe(recipe) {
  currentRecipe = recipe;
  currentStepIndex = 0;
  isReadAloudActive = false; // Her yeni tarifte kapalı gelsin
  
  homeView.classList.add('hidden');
  if (categoryDetailView) categoryDetailView.classList.add('hidden');
  recipeView.classList.remove('hidden');
  
  const headerControls = document.querySelector('.header-controls');
  if (headerControls) headerControls.style.display = 'none';
  
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
  if (categoryDetailView) categoryDetailView.classList.add('hidden');
  currentRecipe = null;
  
  const headerControls = document.querySelector('.header-controls');
  if (headerControls) headerControls.style.display = 'flex';
  
  renderSavedRecipes();

  if (recognition) {
    recognition.stop();
  }
  
  // Sesli asistanı da sustur
  TextToSpeech.stop().catch(e => console.log(e));
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
      <span class="badge badge-portion">👥 1-2 Kişilik</span>
      ${currentRecipe.calories ? `<span class="badge badge-calories">${currentRecipe.calories}</span>` : ''}
      ${currentRecipe.time ? `<span class="badge badge-time">${currentRecipe.time}</span>` : ''}
    </div>
  `;

  const imageHtml = '';

  recipeView.innerHTML = `
    <div class="recipe-header">
      <button class="back-btn" id="back-btn">←</button>
      <h2>${currentRecipe.title}</h2>
      <div style="display:flex; gap:8px;">
        <button class="save-btn" id="publish-btn" style="background:#4F46E5; color:white; border:none; border-radius:20px; font-weight:bold;" title="Keşfet'te Paylaş">
          <span>🌍</span> <span id="publish-btn-text" style="color:white;">Paylaş</span>
        </button>
        <button class="save-btn ${isSaved ? 'active' : ''}" id="save-btn" title="${isSaved ? translations[currentLang].savedBtnText : translations[currentLang].saveBtnText}">
          <span>${isSaved ? '🔖' : '📑'}</span> <span id="save-btn-text">${isSaved ? translations[currentLang].savedBtnText : translations[currentLang].saveBtnText}</span>
        </button>
      </div>
    </div>

    ${currentRecipe.calories || currentRecipe.time ? badgesHTML : ''}
    
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
  document.getElementById('publish-btn').addEventListener('click', publishCurrentRecipe);
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

async function publishCurrentRecipe() {
  if (!currentRecipe) return;
  const pubBtn = document.getElementById('publish-btn');
  const pubText = document.getElementById('publish-btn-text');
  if(pubBtn.disabled) return;

  pubBtn.disabled = true;
  pubText.innerText = "⏳";
  
  try {
    const response = await fetch('https://kitchai.up.railway.app/api/recipe/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        ingredients: currentRecipe.desc || currentRecipe.title || 'Topluluk Tarifi', 
        language: currentLang, 
        persona: currentPersona, 
        recipe: currentRecipe 
      })
    });
    
    if (!response.ok) throw new Error('Paylaşılamadı');
    
    pubText.innerText = "Paylaşıldı ✅";
    pubBtn.style.background = "#4CAF50";
  } catch(err) {
    console.error(err);
    pubText.innerText = "Hata ❌";
    setTimeout(() => {
      pubBtn.disabled = false;
      pubText.innerText = "Paylaş";
    }, 2000);
  }
}
