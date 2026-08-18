(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=[{id:1,title:`Tavada Şipşak Pizza`,icon:`🍕`,desc:`Ana Malzemeler: Lavaş, Kaşar Peyniri, Sucuk, Salça.`,calories:`🔥 450 kcal`,time:`⏳ 10 Dk`,cost:`💰 Ortalama Maliyet (40-60 ₺)`,steps:[`Geniş bir tavaya 1 adet lavaş ekmeğini koy (altını henüz yakma).`,`1 yemek kaşığı salçayı biraz su ve kekik ile karıştırıp lavaşın üzerine sür.`,`Üzerine bolca rendelenmiş kaşar peyniri ve ince dilimlenmiş sucukları diz.`,`Tavanın altını en kısık ateşte aç ve kapağını kapat.`,`Peynirler tamamen eriyip lavaşın altı çıtırlaşana kadar (yaklaşık 5-7 dakika) bekle. Afiyet olsun!`]},{id:2,title:`5 Dakikada Fincan Kek`,icon:`🧁`,desc:`Ana Malzemeler: Un, Şeker, Kakao, Süt, Sıvı Yağ.`,calories:`🔥 320 kcal`,time:`⏳ 5 Dk`,cost:`🤑 Çok Ekonomik (15-20 ₺)`,steps:[`Büyük bir kupa fincanın içine 3 yemek kaşığı un, 2 yemek kaşığı şeker ve 1 yemek kaşığı kakao koyup karıştır.`,`Üzerine 3 yemek kaşığı süt ve 2 yemek kaşığı sıvı yağ ekle. Pürüzsüz olana kadar çatal ile iyice çırp.`,`İsteğe bağlı olarak içine bir parça çikolata atabilirsin.`,`Mikrodalga fırına koy ve en yüksek ayarda tam 1.5 - 2 dakika pişir.`,`Biraz soğumasını bekle ve kaşıklayarak ye. Afiyet olsun!`]}],t=document.getElementById(`home-view`),n=document.getElementById(`recipe-view`),r=document.getElementById(`quick-recipe-cards`),i=document.getElementById(`saved-recipes-section`),a=document.getElementById(`saved-recipe-cards`),o=document.getElementById(`ai-generate-btn`),s=document.getElementById(`ingredient-input`),c=null,l=0,u=null,d=!1;function f(){let e=localStorage.getItem(`aiSef_savedRecipes`);return e?JSON.parse(e):[]}function p(e){let t=f();t.some(t=>t.title===e.title)||(e.id||=Date.now(),t.push(e),localStorage.setItem(`aiSef_savedRecipes`,JSON.stringify(t)))}function m(e){let t=f();t=t.filter(t=>t.title!==e),localStorage.setItem(`aiSef_savedRecipes`,JSON.stringify(t))}function h(e){return f().some(t=>t.title===e)}function g(){v(),y(),b(),C()}function _(e){let t=document.createElement(`div`);t.className=`recipe-card`;let n=``;return(e.calories||e.time)&&(n=`
      <div class="card-mini-badges">
        ${e.calories?`<span>${e.calories.split(` `)[0]} ${e.calories.split(` `)[1]}</span>`:``}
        ${e.time?`<span>${e.time}</span>`:``}
      </div>
    `),t.innerHTML=`
    <div class="icon">${e.icon||`🍽️`}</div>
    <div class="info">
      <h4>${e.title}</h4>
      <p>${e.desc||`Yapay Zeka Tarifi`}</p>
      ${n}
    </div>
    <div class="card-action">
      <span class="action-icon">→</span>
    </div>
  `,t.addEventListener(`click`,()=>E(e)),t}function v(){r&&(r.innerHTML=``,e.forEach(e=>{r.appendChild(_(e))}))}function y(){if(!i||!a)return;let e=f();e.length>0?(i.classList.remove(`hidden`),a.innerHTML=``,[...e].reverse().forEach(e=>{a.appendChild(_(e))})):i.classList.add(`hidden`)}function b(){o&&o.addEventListener(`click`,S),s&&s.addEventListener(`keypress`,function(e){e.key===`Enter`&&S()})}async function x(e){try{let t=await fetch(`/api/generateRecipe`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({ingredients:e})});if(!t.ok){let e=await t.json(),n=e.error?e.error.message||e.error:`Bilinmeyen bir API hatası`;throw Error(`Sunucu Hatası (${t.status}): ${n}`)}let n=(await t.json()).candidates[0].content.parts[0].text.trim();console.log(`AI'dan gelen ham cevap:`,n);let r=n.match(/\{[\s\S]*\}/);if(!r)throw Error(`Yapay zeka geçerli bir format döndüremedi. Lütfen tekrar deneyin.`);return JSON.parse(r[0])}catch(e){throw console.error(`Hata Detayı:`,e),Error(e.message||`Tarif oluşturulurken bir hata oluştu.`)}}async function S(){let e=s.value.trim();if(!e){alert(`Lütfen dolabındaki malzemeleri yaz! (Örn: Domates, yumurta)`);return}let t=o.innerHTML;o.innerHTML=`Düşünüyor... 🤔`,o.disabled=!0;try{E(await x(e))}catch(e){alert(e.message)}finally{o.innerHTML=t,o.disabled=!1}}function C(){let e=window.SpeechRecognition||window.webkitSpeechRecognition;e?(u=new e,u.lang=`tr-TR`,u.continuous=!0,u.interimResults=!1,u.onresult=function(e){let t=e.results.length-1,n=e.results[t][0].transcript.toLowerCase().trim();if(console.log(`Sesli komut algılandı:`,n),n.includes(`sonraki`)||n.includes(`ileri`)||n.includes(`devam`)){let e=document.getElementById(`next-btn`);e&&!e.innerText.includes(`Afiyet`)?A(1):e&&e.innerText.includes(`Afiyet`)&&D()}else if(n.includes(`önceki`)||n.includes(`geri`)){let e=document.getElementById(`prev-btn`);e&&!e.disabled&&A(-1)}},u.onerror=function(e){console.error(`Speech Recognition Hata:`,e.error)}):console.warn(`Tarayıcınız SpeechRecognition API'sini desteklemiyor.`)}function w(){d=!d;let e=document.getElementById(`read-aloud-btn`);e&&(e.innerHTML=d?`🔇 Asistanı Sustur`:`🔊 Bana Oku`,e.classList.toggle(`active`,d)),d?T():window.speechSynthesis.cancel()}function T(){if(!d||!c)return;window.speechSynthesis.cancel();let e=c.steps[l],t=new SpeechSynthesisUtterance(e);t.lang=`tr-TR`,t.rate=1,t.pitch=1.1,window.speechSynthesis.speak(t)}function E(e){if(c=e,l=0,d=!1,t.classList.add(`hidden`),n.classList.remove(`hidden`),k(),u)try{u.start()}catch{console.log(`Recognition zaten çalışıyor veya başlatılamadı.`)}}function D(){t.classList.remove(`hidden`),n.classList.add(`hidden`),c=null,y(),u&&u.stop(),window.speechSynthesis.cancel(),d=!1}function O(){if(!c)return;h(c.title)?m(c.title):p(c);let e=document.getElementById(`save-btn`);if(e){let t=h(c.title);e.innerHTML=t?`🔖`:`📑`,e.title=t?`Kaydedilenlerden Çıkar`:`Tarifi Kaydet`,e.classList.toggle(`active`,t)}}function k(){let e=c.steps.length,t=l===e-1,r=l===0,i=h(c.title),a=u?`<div class="mic-badge listening" title="Sesli Komut Açık">🎙️ Dinliyor</div>`:``,o=`
    <div class="recipe-badges">
      ${c.calories?`<span class="badge badge-calories">${c.calories}</span>`:``}
      ${c.time?`<span class="badge badge-time">${c.time}</span>`:``}
      ${c.cost?`<span class="badge badge-cost">${c.cost}</span>`:``}
    </div>
  `;n.innerHTML=`
    <div class="recipe-header">
      <button class="back-btn" id="back-btn">←</button>
      <h2>${c.icon||`🍽️`} ${c.title}</h2>
      <button class="save-btn ${i?`active`:``}" id="save-btn" title="${i?`Kaydedilenlerden Çıkar`:`Tarifi Kaydet`}">
        ${i?`🔖`:`📑`}
      </button>
    </div>
    
    ${c.calories||c.time||c.cost?o:``}
    
    <div class="step-container">
      <div class="step-badge">Adım ${l+1} / ${e}</div>
      ${a}
      
      <button class="read-aloud-btn ${d?`active`:``}" id="read-aloud-btn">
        ${d?`🔇 Asistanı Sustur`:`🔊 Bana Oku`}
      </button>

      <div class="step-content" id="step-content">
        ${c.steps[l]}
      </div>
    </div>
    
    <div class="step-controls">
      <button class="control-btn prev-btn" id="prev-btn" ${r?`disabled`:``}>Önceki</button>
      <button class="control-btn next-btn" id="next-btn">${t?`Afiyet Olsun! 🎉`:`Sonraki Adım`}</button>
    </div>
  `,document.getElementById(`back-btn`).addEventListener(`click`,D),document.getElementById(`save-btn`).addEventListener(`click`,O),document.getElementById(`read-aloud-btn`).addEventListener(`click`,w),document.getElementById(`prev-btn`).addEventListener(`click`,()=>A(-1)),document.getElementById(`next-btn`).addEventListener(`click`,()=>{t?D():A(1)})}function A(e){l+=e;let t=document.getElementById(`step-content`);t&&(t.style.animation=`none`,t.offsetHeight,t.style.animation=null),k(),d&&T()}g();