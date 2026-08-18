import './style.css';

// --- Sahte Veri (Mock Data) ---
const fallbackRecipes = [
  {
    id: 1,
    title: "10 Dakika Makarnası",
    icon: "🍝",
    desc: "Su kaynatmayı biliyorsan, bunu da yaparsın.",
    steps: [
      "Önce genişçe bir tencerenin yarısına kadar su doldur ve ocağın altını sonuna kadar aç.",
      "Su fokur fokur kaynamaya başlayınca içine 1 tatlı kaşığı tuz at ve makarnanın yarısını içine dök.",
      "Paketin üstünde yazan süre kadar (genelde 10 dakika) bekle. Arada bir karıştır ki yapışmasın.",
      "Makarnayı süzgece dök. Suyu süzülsün.",
      "Aynı tencereye 1 yemek kaşığı tereyağı veya biraz sıvı yağ koy. Üzerine makarnayı ekle, 1 dakika karıştır. Afiyet olsun!"
    ]
  },
  {
    id: 2,
    title: "Öğrenci Tavuğu",
    icon: "🍗",
    desc: "Tavuk nasıl kurutulmaz? Çok basit bir taktik.",
    steps: [
      "Marketten alınmış kuşbaşı tavukları derin bir kaba koy. Üzerine biraz sıvı yağ ve tuz ekle.",
      "Geniş bir tavayı ocağa koy, altını orta derece aç. Tava iyice ısınana kadar bekle.",
      "Tavukları cızırdayan tavaya at. İlk 2 dakika hiç karıştırma.",
      "Tavukların rengi dönüp tamamen beyaz olana kadar ara ara karıştırarak pişir.",
      "Tavukların içi beyaz ve yumuşaksa pişmiştir. Afiyet olsun!"
    ]
  }
];

// --- DOM Elementleri ---
const homeView = document.getElementById('home-view');
const recipeView = document.getElementById('recipe-view');
const recipeCardsContainer = document.getElementById('quick-recipe-cards');
const savedRecipesSection = document.getElementById('saved-recipes-section');
const savedRecipeCards = document.getElementById('saved-recipe-cards');
const aiGenerateBtn = document.getElementById('ai-generate-btn');
const ingredientInput = document.getElementById('ingredient-input');

// --- State ---
let currentRecipe = null;
let currentStepIndex = 0;
let recognition = null; // SpeechRecognition objesi
let isReadAloudActive = false; // Sesli asistan (Text-to-Speech) durumu

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
  renderRecipeList();
  renderSavedRecipes();
  setupEventListeners();
  initSpeechRecognition();
}

function createRecipeCard(recipe) {
  const card = document.createElement('div');
  card.className = 'recipe-card';
  card.innerHTML = `
    <div class="icon">${recipe.icon || '🍽️'}</div>
    <div class="info">
      <h4>${recipe.title}</h4>
      <p>${recipe.desc || 'Yapay Zeka Tarifi'}</p>
    </div>
  `;
  card.addEventListener('click', () => openRecipe(recipe));
  return card;
}

function renderRecipeList() {
  if (recipeCardsContainer) {
    recipeCardsContainer.innerHTML = '';
    fallbackRecipes.forEach(recipe => {
      recipeCardsContainer.appendChild(createRecipeCard(recipe));
    });
  }
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
}

// --- Gerçek AI API Çağrısı (Kendi Backend'imize) ---
async function generateRecipeFromGemini(ingredients) {
  try {
    const response = await fetch(`/api/generateRecipe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ingredients })
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
    alert("Lütfen dolabındaki malzemeleri yaz! (Örn: Domates, yumurta)");
    return;
  }
  
  const originalText = aiGenerateBtn.innerHTML;
  aiGenerateBtn.innerHTML = "Düşünüyor... 🤔";
  aiGenerateBtn.disabled = true;

  try {
    const recipe = await generateRecipeFromGemini(ingredients);
    openRecipe(recipe);
  } catch (err) {
    alert(err.message);
  } finally {
    aiGenerateBtn.innerHTML = originalText;
    aiGenerateBtn.disabled = false;
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

function readCurrentStep() {
  if (!isReadAloudActive || !currentRecipe) return;
  
  // Önceki konuşmayı durdur
  window.speechSynthesis.cancel();

  const textToRead = currentRecipe.steps[currentStepIndex];
  const utterance = new SpeechSynthesisUtterance(textToRead);
  utterance.lang = 'tr-TR';
  utterance.rate = 1.0; // Okuma hızı (normal)
  utterance.pitch = 1.1; // Ses tonu
  
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
  if (saveBtn) {
    const newlySaved = isRecipeSaved(currentRecipe.title);
    saveBtn.innerHTML = newlySaved ? '🔖' : '📑';
    saveBtn.title = newlySaved ? 'Kaydedilenlerden Çıkar' : 'Tarifi Kaydet';
    saveBtn.classList.toggle('active', newlySaved);
  }
}

function renderRecipeSteps() {
  const totalSteps = currentRecipe.steps.length;
  const isLastStep = currentStepIndex === totalSteps - 1;
  const isFirstStep = currentStepIndex === 0;
  const isSaved = isRecipeSaved(currentRecipe.title);

  const micBadgeHTML = recognition ? '<div class="mic-badge listening" title="Sesli Komut Açık">🎙️ Dinliyor</div>' : '';

  recipeView.innerHTML = `
    <div class="recipe-header">
      <button class="back-btn" id="back-btn">←</button>
      <h2>${currentRecipe.icon || '🍽️'} ${currentRecipe.title}</h2>
      <button class="save-btn ${isSaved ? 'active' : ''}" id="save-btn" title="${isSaved ? 'Kaydedilenlerden Çıkar' : 'Tarifi Kaydet'}">
        ${isSaved ? '🔖' : '📑'}
      </button>
    </div>
    
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
