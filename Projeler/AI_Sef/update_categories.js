import fs from 'fs';

const keywords = {
  p1: "tuna pasta dish", p2: "chicken noodles bowl", p3: "baked mushroom cheese", p4: "egg toast breakfast", p5: "chocolate mug cake", p6: "avocado egg toast", p7: "toast sandwich plate", p8: "sausage pastry baked", p9: "yogurt salad bowl", p10: "oatmeal bowl fruit",
  f1: "grilled chicken quinoa plate", f2: "baked salmon plate", f3: "peanut butter cookie", f4: "lentil balls dish", f5: "zucchini chips baked", f6: "green smoothie glass", f7: "celery salad bowl", f8: "falafel plate", f9: "grilled vegetables plate", f10: "pancake stack",
  a1: "stuffed grape leaves", a2: "celery root dish", a3: "cooked artichoke plate", a4: "eggplant dish cooked", a5: "shakshuka pan", a6: "cooked green beans plate", a7: "roasted red pepper dish", a8: "samphire salad", a9: "baked sea bass plate", a10: "hummus bowl",
  s1: "hamburger meal", s2: "chicken taco plate", s3: "sausage sandwich", s4: "fried chicken bucket", s5: "simit turkish bagel", s6: "hot dog meal", s7: "lahmacun turkish pizza", s8: "french fries bowl", s9: "burger meal", s10: "grilled sausage sandwich",
  t1: "chocolate souffle", t2: "slice of cheesecake", t3: "slice of chocolate cake", t4: "magnolia dessert glass", t5: "brownie slice", t6: "rice pudding bowl", t7: "tres leches cake", t8: "sweet pastry dessert", t9: "tiramisu slice", t10: "profiterole dessert",
  m1: "baked beans meat stew", m2: "chicken potato stew", m3: "stuffed eggplant dish", m4: "lentil soup bowl", m5: "meatball soup bowl", m6: "meat peas stew", m7: "vegetable stew bowl", m8: "rice pilaf bowl", m9: "spinach meat dish", m10: "yogurt soup bowl",
  w1: "fettuccine alfredo plate", w2: "sushi plate", w3: "mac and cheese bowl", w4: "chicken tikka masala bowl", w5: "falafel wrap", w6: "french onion soup bowl", w7: "beef stroganoff plate", w8: "paella pan", w9: "pad thai plate", w10: "sesame chicken bowl"
};

const delay = ms => new Promise(res => setTimeout(res, ms));

async function run() {
  const categoriesRaw = fs.readFileSync('categories.js', 'utf8');
  let newCategoriesRaw = categoriesRaw;

  const API_KEY = 'bLUou40iJZSzVGj3LKmglFX2OMo7X8iS6QJ9Wd5YxCwBitbtQyWHWwsA';

  for (const [id, keyword] of Object.entries(keywords)) {
    try {
      const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=1`, {
        headers: { Authorization: API_KEY }
      });
      const data = await res.json();
      
      if (data && data.photos && data.photos.length > 0) {
        let imageUrl = data.photos[0].src.landscape;
        
        // Find existing image: '...', and replace it
        const regexWithImage = new RegExp(`(id:\\s*'${id}',\\s*title:\\s*"[^"]*",\\s*desc:\\s*"[^"]*",)\\s*image:\\s*'[^']+',`);
        const regexWithoutImage = new RegExp(`(id:\\s*'${id}',\\s*title:\\s*"[^"]*",\\s*desc:\\s*"[^"]*",)(?!\\s*image:)`);
        
        if (regexWithImage.test(newCategoriesRaw)) {
          newCategoriesRaw = newCategoriesRaw.replace(regexWithImage, `$1 image: '${imageUrl}',`);
        } else {
          newCategoriesRaw = newCategoriesRaw.replace(regexWithoutImage, `$1 image: '${imageUrl}', `);
        }
        console.log(`Updated ${id} with Pexels ${keyword}`);
      } else {
        // Strip image tag entirely if no photo is found
        const regexWithImage = new RegExp(`(id:\\s*'${id}',\\s*title:\\s*"[^"]*",\\s*desc:\\s*"[^"]*",)\\s*image:\\s*'[^']+',`);
        if (regexWithImage.test(newCategoriesRaw)) {
          newCategoriesRaw = newCategoriesRaw.replace(regexWithImage, `$1`);
        }
        console.log(`No Pexels photo found for ${id}: ${keyword} - Stripped image tag.`);
      }
    } catch (e) {
      console.log(`Failed for ${id}: ${keyword} - ${e.message}`);
    }
    await delay(300);
  }

  fs.writeFileSync('categories.js', newCategoriesRaw);
  console.log('Finished updating categories.js');
}

run();
