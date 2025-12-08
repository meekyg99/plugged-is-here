import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Connecting to Supabase...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addCategories() {
  console.log('\n📦 Adding default categories...\n');

  const defaultCategories = [
    { name: 'Agbada', slug: 'agbada', gender: 'men', description: 'Traditional Nigerian flowing robe' },
    { name: 'Ankara Dresses', slug: 'ankara-dresses', gender: 'women', description: 'Vibrant African print dresses' },
    { name: 'Kaftan', slug: 'kaftan', gender: 'unisex', description: 'Elegant flowing garments' },
    { name: 'Accessories', slug: 'accessories', gender: 'unisex', description: 'Jewelry, bags, and more' },
    { name: 'Aso Oke', slug: 'aso-oke', gender: 'unisex', description: 'Hand-woven traditional fabric' }
  ];

  try {
    // First, check existing categories
    const { data: existing, error: checkError } = await supabase
      .from('categories')
      .select('*');

    if (checkError) {
      console.error('❌ Error checking categories:', checkError.message);
      return;
    }

    console.log(`Found ${existing?.length || 0} existing categories`);

    if (existing && existing.length > 0) {
      console.log('\n✅ Categories already exist:');
      existing.forEach(cat => {
        console.log(`   - ${cat.name} (${cat.slug})`);
      });
      console.log('\n✨ Your dropdown should work now! Refresh the product page.');
      return;
    }

    // Add categories
    const { data, error } = await supabase
      .from('categories')
      .insert(defaultCategories)
      .select();

    if (error) {
      if (error.code === '23505') {
        console.log('ℹ️  Some categories already exist (duplicate), checking again...');
        const { data: allCats } = await supabase.from('categories').select('*');
        console.log(`\n✅ Found ${allCats?.length || 0} categories in database`);
        allCats?.forEach(cat => {
          console.log(`   - ${cat.name} (${cat.slug})`);
        });
      } else {
        throw error;
      }
    } else {
      console.log(`✅ Successfully added ${data.length} categories:\n`);
      data.forEach(cat => {
        console.log(`   ✓ ${cat.name} (${cat.slug}) - ${cat.gender}`);
      });
      console.log('\n🎉 Done! Your category dropdown should now work!');
      console.log('👉 Go to admin panel → Products → New Product');
      console.log('👉 The "Select Category" dropdown will now have options!\n');
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

addCategories();
