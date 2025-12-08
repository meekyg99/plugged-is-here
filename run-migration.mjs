import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Connecting to Supabase...');
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runMigration() {
  console.log('\n📦 Step 1: Adding categories...\n');

  const categories = [
    { name: 'Agbada', slug: 'agbada', gender: 'men', description: 'Traditional Nigerian flowing robe' },
    { name: 'Ankara Dresses', slug: 'ankara-dresses', gender: 'women', description: 'Vibrant African print dresses' },
    { name: 'Kaftan', slug: 'kaftan', gender: 'unisex', description: 'Elegant flowing garments' },
    { name: 'Accessories', slug: 'accessories', gender: 'unisex', description: 'Jewelry, bags, and more' },
    { name: 'Aso Oke', slug: 'aso-oke', gender: 'unisex', description: 'Hand-woven traditional fabric' }
  ];

  try {
    // Try to insert categories
    const { data, error } = await supabase
      .from('categories')
      .upsert(categories, { onConflict: 'slug', ignoreDuplicates: false })
      .select();

    if (error) {
      if (error.code === '42501') {
        console.log('⚠️  Permission denied - need to fix RLS policies first');
        console.log('📝 You need to run the SQL directly in Supabase Dashboard\n');
        console.log('Go to: https://supabase.com/dashboard/project/babugzeozpudnrbirwtg/sql/new');
        console.log('\nCopy and paste this SQL:\n');
        console.log('-- Temporarily disable RLS to add categories');
        console.log('ALTER TABLE categories DISABLE ROW LEVEL SECURITY;');
        console.log('');
        console.log('-- Add categories');
        console.log("INSERT INTO categories (name, slug, gender, description, created_at)");
        console.log("VALUES");
        console.log("  ('Agbada', 'agbada', 'men', 'Traditional Nigerian flowing robe', now()),");
        console.log("  ('Ankara Dresses', 'ankara-dresses', 'women', 'Vibrant African print dresses', now()),");
        console.log("  ('Kaftan', 'kaftan', 'unisex', 'Elegant flowing garments', now()),");
        console.log("  ('Accessories', 'accessories', 'unisex', 'Jewelry, bags, and more', now()),");
        console.log("  ('Aso Oke', 'aso-oke', 'unisex', 'Hand-woven traditional fabric', now())");
        console.log("ON CONFLICT (slug) DO NOTHING;");
        console.log('');
        console.log('-- Re-enable RLS with proper policies');
        console.log('DROP POLICY IF EXISTS "Anyone can view categories" ON categories;');
        console.log('CREATE POLICY "Anyone can view categories"');
        console.log('ON categories FOR SELECT TO public USING (true);');
        console.log('');
        console.log('ALTER TABLE categories ENABLE ROW LEVEL SECURITY;');
        console.log('');
        console.log('-- Verify');
        console.log('SELECT * FROM categories ORDER BY name;');
        return;
      }
      throw error;
    }

    console.log(`✅ Successfully added ${data.length} categories!\n`);
    data.forEach(cat => {
      console.log(`   ✓ ${cat.name} (${cat.slug}) - ${cat.gender}`);
    });

    // Check if they're readable
    console.log('\n📋 Step 2: Verifying categories are readable...\n');
    const { data: readData, error: readError } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (readError) {
      console.log('❌ Error reading categories:', readError.message);
      console.log('⚠️  RLS policies may be blocking read access');
      console.log('\nRun this in Supabase SQL Editor:');
      console.log('DROP POLICY IF EXISTS "Anyone can view categories" ON categories;');
      console.log('CREATE POLICY "Anyone can view categories"');
      console.log('ON categories FOR SELECT TO public USING (true);');
    } else {
      console.log(`✅ Found ${readData.length} readable categories!\n`);
      readData.forEach(cat => {
        console.log(`   ✓ ${cat.name}`);
      });
      console.log('\n🎉 Success! Your category dropdown should now work!');
      console.log('👉 Refresh your product page and try again.\n');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

runMigration();
