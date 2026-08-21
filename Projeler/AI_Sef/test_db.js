import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function test() {
  const { error } = await supabase
    .from('recipes')
    .insert([{
      ingredients: 'test ingredients',
      language: 'tr',
      persona: 'standart',
      response: { title: 'Test Recipe', desc: 'test desc', steps: [] }
    }]);
  
  if (error) {
    console.error("SUPABASE ERROR DETAYI:", error);
  } else {
    console.log("Başarılı!");
  }
}
test();
