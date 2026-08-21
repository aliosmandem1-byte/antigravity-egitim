import fs from 'fs';

const delay = ms => new Promise(res => setTimeout(res, ms));

async function translateBatch(texts, targetLang) {
  const separator = ' ⬢ ';
  let translatedFullArray = [];
  
  // Chunk into 15 strings per request to avoid Google API blocks
  for (let i = 0; i < texts.length; i += 15) {
    const chunk = texts.slice(i, i + 15);
    const joinedText = chunk.join(separator);
    
    let success = false;
    let attempts = 0;
    while (!success && attempts < 3) {
      try {
        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=tr&tl=${targetLang}&dt=t&q=${encodeURIComponent(joinedText)}`);
        const data = await res.json();
        const translatedStr = data[0].map(item => item[0]).join('');
        const splitStr = translatedStr.split(separator).map(s => s.trim());
        
        if (splitStr.length === chunk.length) {
          translatedFullArray.push(...splitStr);
          success = true;
        } else {
          console.error(`Chunk mismatch, retrying... (${splitStr.length} vs ${chunk.length})`);
          attempts++;
          await delay(3000);
        }
      } catch (e) {
        console.error('Translation error, retrying...', e.message);
        attempts++;
        await delay(3000);
      }
    }
    if (!success) {
      console.error('Failed to translate chunk, using original text.');
      translatedFullArray.push(...chunk);
    }
    await delay(1500); // Wait between chunks
  }
  
  return translatedFullArray;
}

async function run() {
  const { categories } = await import('./categories.js');
  const languages = ['en', 'de', 'es'];

  for (const lang of languages) {
    console.log(`Translating to ${lang}...`);
    let translatedCategories = JSON.parse(JSON.stringify(categories));

    for (let cat of translatedCategories) {
      // Gather all strings for this category
      const stringsToTranslate = [];
      stringsToTranslate.push(cat.title, cat.desc);
      
      for (let recipe of cat.recipes) {
        stringsToTranslate.push(recipe.title, recipe.desc);
        stringsToTranslate.push(recipe.time || '⏳ 15 Dk');
        stringsToTranslate.push(recipe.calories || '🔥 300 kcal');
        for (let step of recipe.steps) {
          stringsToTranslate.push(step);
        }
      }

      console.log(`Translating category ${cat.id} (${stringsToTranslate.length} strings)`);
      const translatedStrings = await translateBatch(stringsToTranslate, lang);
      await delay(1000); // Wait 1 sec to avoid rate limits

      if (translatedStrings.length === stringsToTranslate.length) {
        let ptr = 0;
        cat.title = translatedStrings[ptr++];
        cat.desc = translatedStrings[ptr++];
        
        for (let recipe of cat.recipes) {
          recipe.title = translatedStrings[ptr++];
          recipe.desc = translatedStrings[ptr++];
          recipe.time = translatedStrings[ptr++];
          recipe.calories = translatedStrings[ptr++];
          
          for (let i = 0; i < recipe.steps.length; i++) {
            recipe.steps[i] = translatedStrings[ptr++];
          }
        }
      } else {
        console.error(`Mismatch for ${cat.id}: Expected ${stringsToTranslate.length}, got ${translatedStrings.length}`);
      }
    }

    const fileContent = `export const categories = ${JSON.stringify(translatedCategories, null, 2)};\n`;
    fs.writeFileSync(`categories_${lang}.js`, fileContent);
    console.log(`Saved categories_${lang}.js`);
  }
}

run();
