import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    const categories = [
      { name: 'Agbada', slug: 'agbada', gender: 'men', description: 'Traditional Nigerian flowing robe' },
      { name: 'Ankara Dresses', slug: 'ankara-dresses', gender: 'women', description: 'Vibrant African print dresses' },
      { name: 'Kaftan', slug: 'kaftan', gender: 'unisex', description: 'Elegant flowing garments' },
      { name: 'Accessories', slug: 'accessories', gender: 'unisex', description: 'Jewelry, bags, and more' },
      { name: 'Aso Oke', slug: 'aso-oke', gender: 'unisex', description: 'Hand-woven traditional fabric' },
    ];

    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .upsert(categories, { onConflict: 'slug' })
      .select();

    if (categoryError) throw categoryError;

    console.log(`✓ Seeded ${categoryData.length} categories`);

    const products = [
      {
        name: 'Royal Blue Agbada Set',
        slug: 'royal-blue-agbada-set',
        description: 'Luxurious hand-embroidered agbada with intricate gold patterns. Perfect for weddings and special occasions.',
        category_id: categoryData[0].id,
        gender: 'men',
        is_featured: true,
        meta_title: 'Royal Blue Agbada Set - Premium Nigerian Fashion',
        meta_description: 'Hand-embroidered agbada with gold patterns, perfect for special occasions',
      },
      {
        name: 'Ankara Mermaid Dress',
        slug: 'ankara-mermaid-dress',
        description: 'Stunning mermaid-cut dress in vibrant Ankara print. Tailored for a perfect fit.',
        category_id: categoryData[1].id,
        gender: 'women',
        is_featured: true,
        meta_title: 'Ankara Mermaid Dress - Nigerian Fashion',
        meta_description: 'Vibrant Ankara print mermaid dress with tailored fit',
      },
      {
        name: 'Embroidered White Kaftan',
        slug: 'embroidered-white-kaftan',
        description: 'Pure white kaftan with delicate gold embroidery. Suitable for both men and women.',
        category_id: categoryData[2].id,
        gender: 'unisex',
        is_featured: true,
        meta_title: 'Embroidered White Kaftan - Premium Quality',
        meta_description: 'Pure white kaftan with gold embroidery, unisex design',
      },
      {
        name: 'Beaded Coral Necklace',
        slug: 'beaded-coral-necklace',
        description: 'Traditional Nigerian coral beads necklace. Authentic and elegant.',
        category_id: categoryData[3].id,
        gender: 'unisex',
        is_featured: false,
        meta_title: 'Beaded Coral Necklace - Traditional Nigerian Jewelry',
        meta_description: 'Authentic traditional Nigerian coral beads necklace',
      },
      {
        name: 'Premium Aso Oke Fabric',
        slug: 'premium-aso-oke-fabric',
        description: 'Hand-woven Aso Oke fabric in royal colors. Perfect for creating custom traditional attire.',
        category_id: categoryData[4].id,
        gender: 'unisex',
        is_featured: false,
        meta_title: 'Premium Aso Oke Fabric - Hand-Woven',
        meta_description: 'Hand-woven Aso Oke fabric in royal colors',
      },
      {
        name: 'Emerald Green Ankara Jumpsuit',
        slug: 'emerald-green-ankara-jumpsuit',
        description: 'Modern jumpsuit in stunning emerald green Ankara print with wide-leg silhouette.',
        category_id: categoryData[1].id,
        gender: 'women',
        is_featured: true,
        meta_title: 'Emerald Green Ankara Jumpsuit - Contemporary Nigerian Fashion',
        meta_description: 'Modern Ankara print jumpsuit with wide-leg design',
      },
    ];

    const { data: productData, error: productError } = await supabase
      .from('products')
      .upsert(products, { onConflict: 'slug' })
      .select();

    if (productError) throw productError;

    console.log(`✓ Seeded ${productData.length} products`);

    const variants = [
      { product_id: productData[0].id, sku: 'AGB-RB-M', size: 'M', color: 'Royal Blue', color_hex: '#002366', price: 85000, stock_quantity: 5 },
      { product_id: productData[0].id, sku: 'AGB-RB-L', size: 'L', color: 'Royal Blue', color_hex: '#002366', price: 85000, stock_quantity: 8 },
      { product_id: productData[0].id, sku: 'AGB-RB-XL', size: 'XL', color: 'Royal Blue', color_hex: '#002366', price: 90000, stock_quantity: 3 },

      { product_id: productData[1].id, sku: 'ANK-MD-S', size: 'S', color: 'Multi-Color', color_hex: '#FF6B35', price: 35000, stock_quantity: 10 },
      { product_id: productData[1].id, sku: 'ANK-MD-M', size: 'M', color: 'Multi-Color', color_hex: '#FF6B35', price: 35000, stock_quantity: 12 },
      { product_id: productData[1].id, sku: 'ANK-MD-L', size: 'L', color: 'Multi-Color', color_hex: '#FF6B35', price: 37000, stock_quantity: 8 },

      { product_id: productData[2].id, sku: 'KFT-WH-M', size: 'M', color: 'White', color_hex: '#FFFFFF', price: 45000, stock_quantity: 15 },
      { product_id: productData[2].id, sku: 'KFT-WH-L', size: 'L', color: 'White', color_hex: '#FFFFFF', price: 45000, stock_quantity: 20 },

      { product_id: productData[3].id, sku: 'CRL-NKL-OS', size: 'One Size', color: 'Coral Red', color_hex: '#FF6F61', price: 25000, stock_quantity: 30 },

      { product_id: productData[4].id, sku: 'ASO-PRM-5Y', size: '5 Yards', color: 'Royal Purple', color_hex: '#7851A9', price: 55000, stock_quantity: 12 },
      { product_id: productData[4].id, sku: 'ASO-PRM-10Y', size: '10 Yards', color: 'Royal Purple', color_hex: '#7851A9', price: 105000, stock_quantity: 6 },

      { product_id: productData[5].id, sku: 'ANK-JP-S', size: 'S', color: 'Emerald Green', color_hex: '#50C878', price: 42000, stock_quantity: 7 },
      { product_id: productData[5].id, sku: 'ANK-JP-M', size: 'M', color: 'Emerald Green', color_hex: '#50C878', price: 42000, stock_quantity: 10 },
      { product_id: productData[5].id, sku: 'ANK-JP-L', size: 'L', color: 'Emerald Green', color_hex: '#50C878', price: 44000, stock_quantity: 5 },
    ];

    const { data: variantData, error: variantError } = await supabase
      .from('product_variants')
      .upsert(variants, { onConflict: 'sku' })
      .select();

    if (variantError) throw variantError;

    console.log(`✓ Seeded ${variantData.length} product variants`);

    const images = [
      { product_id: productData[0].id, image_url: 'https://images.pexels.com/photos/5999821/pexels-photo-5999821.jpeg', alt_text: 'Royal Blue Agbada Set Front View', display_order: 0 },
      { product_id: productData[0].id, image_url: 'https://images.pexels.com/photos/5999822/pexels-photo-5999822.jpeg', alt_text: 'Royal Blue Agbada Set Detail', display_order: 1 },

      { product_id: productData[1].id, image_url: 'https://images.pexels.com/photos/5240696/pexels-photo-5240696.jpeg', alt_text: 'Ankara Mermaid Dress Full View', display_order: 0 },
      { product_id: productData[1].id, image_url: 'https://images.pexels.com/photos/5240697/pexels-photo-5240697.jpeg', alt_text: 'Ankara Mermaid Dress Side View', display_order: 1 },

      { product_id: productData[2].id, image_url: 'https://images.pexels.com/photos/5325582/pexels-photo-5325582.jpeg', alt_text: 'White Kaftan Front View', display_order: 0 },
      { product_id: productData[2].id, image_url: 'https://images.pexels.com/photos/5325583/pexels-photo-5325583.jpeg', alt_text: 'White Kaftan Detail', display_order: 1 },

      { product_id: productData[3].id, image_url: 'https://images.pexels.com/photos/3735657/pexels-photo-3735657.jpeg', alt_text: 'Beaded Coral Necklace', display_order: 0 },

      { product_id: productData[4].id, image_url: 'https://images.pexels.com/photos/6069099/pexels-photo-6069099.jpeg', alt_text: 'Premium Aso Oke Fabric', display_order: 0 },

      { product_id: productData[5].id, image_url: 'https://images.pexels.com/photos/5240692/pexels-photo-5240692.jpeg', alt_text: 'Emerald Green Ankara Jumpsuit Front', display_order: 0 },
      { product_id: productData[5].id, image_url: 'https://images.pexels.com/photos/5240693/pexels-photo-5240693.jpeg', alt_text: 'Emerald Green Ankara Jumpsuit Back', display_order: 1 },
    ];

    const { error: imageError } = await supabase
      .from('product_images')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    const { data: imageData, error: imageInsertError } = await supabase
      .from('product_images')
      .insert(images)
      .select();

    if (imageInsertError) {
      console.log('⚠ Image seeding had issues:', imageInsertError.message);
    } else {
      console.log(`✓ Seeded ${imageData.length} product images`);
    }

    console.log('\n✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
