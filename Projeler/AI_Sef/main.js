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
const recipeCardsContainer = document.querySelector('.recipe-cards');
const aiGenerateBtn = document.getElementById('ai-generate-btn');
const ingredientInput = document.getElementById('ingredient-input');

// --- State ---
let currentRecipe = null;
let currentStepIndex = 0;
let recognition = null; // SpeechRecognition objesi

// --- Başlangıç Yüklemesi ---
function init() {
  renderRecipeList();
  setupEventListeners();
  initSpeechRecognition();
}

function renderRecipeList() {
  recipeCardsContainer.innerHTML = '';
  fallbackRecipes.forEach(recipe => {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.innerHTML = `
      <div class="icon">${recipe.icon}</div>
      <div class="info">
        <h4>${recipe.title}</h4>
        <p>${recipe.desc}</p>
      </div>
    `;
    card.addEventListener('click', () => openRecipe(recipe));
    recipeCardsContainer.appendChild(card);
  });
}

function setupEventListeners() {
  aiGenerateBtn.addEventListener('click', handleAIGeneration);
  ingredientInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      handleAIGeneration();
    }
  });
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
    
    // Regex ile { ... } arasını alarak sadece JSON'ı ayıkla
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
    // Gerçek AI
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

// --- Tarif Ekranı Mantığı ---
function openRecipe(recipe) {
  currentRecipe = recipe;
  currentStepIndex = 0;
  
  homeView.classList.add('hidden');
  recipeView.classList.remove('hidden');
  
  renderRecipeSteps();

  // Mikrofonu başlat
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

  // Mikrofonu kapat
  if (recognition) {
    recognition.stop();
  }
}

function renderRecipeSteps() {
  const totalSteps = currentRecipe.steps.length;
  const isLastStep = currentStepIndex === totalSteps - 1;
  const isFirstStep = currentStepIndex === 0;

  const micBadgeHTML = recognition ? '<div class="mic-badge listening" title="Sesli Komut Açık">🎙️ Dinliyor</div>' : '';

  recipeView.innerHTML = `
    <div class="recipe-header">
      <button class="back-btn" id="back-btn">←</button>
      <h2>${currentRecipe.icon} ${currentRecipe.title}</h2>
    </div>
    
    <div class="step-container">
      <div class="step-badge">Adım ${currentStepIndex + 1} / ${totalSteps}</div>
      ${micBadgeHTML}
      <div class="step-content" id="step-content">
        ${currentRecipe.steps[currentStepIndex]}
      </div>
    </div>
    
    <div class="step-controls">
      <button class="control-btn prev-btn" id="prev-btn" ${isFirstStep ? 'disabled' : ''}>Önceki</button>
      <button class="control-btn next-btn" id="next-btn">${isLastStep ? 'Afiyet Olsun! 🎉' : 'Sonraki Adım'}</button>
    </div>
  `;

  // Listenerları ekle
  document.getElementById('back-btn').addEventListener('click', closeRecipe);
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
}

// Uygulamayı Başlat
init();
