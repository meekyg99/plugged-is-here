/*
  # Database Seed Function
  
  Creates a function to populate the database with sample data.
  This function bypasses RLS and can be called by authenticated admins.
  
  1. Function
    - `seed_sample_data()` - Populates categories, products, variants, and images
  
  2. Security
    - Function runs with SECURITY DEFINER to bypass RLS
    - Should only be called once for initial setup
*/

CREATE OR REPLACE FUNCTION seed_sample_data()
RETURNS jsonb
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_category_ids uuid[];
  v_product_ids uuid[];
  v_result jsonb;
BEGIN
  -- Insert categories
  INSERT INTO categories (name, slug, gender, description)
  VALUES 
    ('Agbada', 'agbada', 'men', 'Traditional Nigerian flowing robe'),
    ('Ankara Dresses', 'ankara-dresses', 'women', 'Vibrant African print dresses'),
    ('Kaftan', 'kaftan', 'unisex', 'Elegant flowing garments'),
    ('Accessories', 'accessories', 'unisex', 'Jewelry, bags, and more'),
    ('Aso Oke', 'aso-oke', 'unisex', 'Hand-woven traditional fabric')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_category_ids;

  -- Insert products
  WITH inserted_products AS (
    INSERT INTO products (name, slug, description, category_id, gender, is_featured, meta_title, meta_description)
    VALUES 
      ('Royal Blue Agbada Set', 'royal-blue-agbada-set', 
       'Luxurious hand-embroidered agbada with intricate gold patterns. Perfect for weddings and special occasions.',
       v_category_ids[1], 'men', true, 'Royal Blue Agbada Set - Premium Nigerian Fashion',
       'Hand-embroidered agbada with gold patterns, perfect for special occasions'),
      
      ('Ankara Mermaid Dress', 'ankara-mermaid-dress',
       'Stunning mermaid-cut dress in vibrant Ankara print. Tailored for a perfect fit.',
       v_category_ids[2], 'women', true, 'Ankara Mermaid Dress - Nigerian Fashion',
       'Vibrant Ankara print mermaid dress with tailored fit'),
      
      ('Embroidered White Kaftan', 'embroidered-white-kaftan',
       'Pure white kaftan with delicate gold embroidery. Suitable for both men and women.',
       v_category_ids[3], 'unisex', true, 'Embroidered White Kaftan - Premium Quality',
       'Pure white kaftan with gold embroidery, unisex design'),
      
      ('Beaded Coral Necklace', 'beaded-coral-necklace',
       'Traditional Nigerian coral beads necklace. Authentic and elegant.',
       v_category_ids[4], 'unisex', false, 'Beaded Coral Necklace - Traditional Nigerian Jewelry',
       'Authentic traditional Nigerian coral beads necklace'),
      
      ('Premium Aso Oke Fabric', 'premium-aso-oke-fabric',
       'Hand-woven Aso Oke fabric in royal colors. Perfect for creating custom traditional attire.',
       v_category_ids[5], 'unisex', false, 'Premium Aso Oke Fabric - Hand-Woven',
       'Hand-woven Aso Oke fabric in royal colors'),
      
      ('Emerald Green Ankara Jumpsuit', 'emerald-green-ankara-jumpsuit',
       'Modern jumpsuit in stunning emerald green Ankara print with wide-leg silhouette.',
       v_category_ids[2], 'women', true, 'Emerald Green Ankara Jumpsuit - Contemporary Nigerian Fashion',
       'Modern Ankara print jumpsuit with wide-leg design')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  )
  SELECT array_agg(id) INTO v_product_ids FROM inserted_products;

  -- Insert variants
  INSERT INTO product_variants (product_id, sku, size, color, color_hex, price, stock_quantity)
  VALUES 
    (v_product_ids[1], 'AGB-RB-M', 'M', 'Royal Blue', '#002366', 85000, 5),
    (v_product_ids[1], 'AGB-RB-L', 'L', 'Royal Blue', '#002366', 85000, 8),
    (v_product_ids[1], 'AGB-RB-XL', 'XL', 'Royal Blue', '#002366', 90000, 3),
    
    (v_product_ids[2], 'ANK-MD-S', 'S', 'Multi-Color', '#FF6B35', 35000, 10),
    (v_product_ids[2], 'ANK-MD-M', 'M', 'Multi-Color', '#FF6B35', 35000, 12),
    (v_product_ids[2], 'ANK-MD-L', 'L', 'Multi-Color', '#FF6B35', 37000, 8),
    
    (v_product_ids[3], 'KFT-WH-M', 'M', 'White', '#FFFFFF', 45000, 15),
    (v_product_ids[3], 'KFT-WH-L', 'L', 'White', '#FFFFFF', 45000, 20),
    
    (v_product_ids[4], 'CRL-NKL-OS', 'One Size', 'Coral Red', '#FF6F61', 25000, 30),
    
    (v_product_ids[5], 'ASO-PRM-5Y', '5 Yards', 'Royal Purple', '#7851A9', 55000, 12),
    (v_product_ids[5], 'ASO-PRM-10Y', '10 Yards', 'Royal Purple', '#7851A9', 105000, 6),
    
    (v_product_ids[6], 'ANK-JP-S', 'S', 'Emerald Green', '#50C878', 42000, 7),
    (v_product_ids[6], 'ANK-JP-M', 'M', 'Emerald Green', '#50C878', 42000, 10),
    (v_product_ids[6], 'ANK-JP-L', 'L', 'Emerald Green', '#50C878', 44000, 5)
  ON CONFLICT (sku) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;

  -- Insert images
  INSERT INTO product_images (product_id, image_url, alt_text, display_order)
  VALUES 
    (v_product_ids[1], 'https://images.pexels.com/photos/5999821/pexels-photo-5999821.jpeg', 'Royal Blue Agbada Set Front View', 0),
    (v_product_ids[1], 'https://images.pexels.com/photos/5999822/pexels-photo-5999822.jpeg', 'Royal Blue Agbada Set Detail', 1),
    
    (v_product_ids[2], 'https://images.pexels.com/photos/5240696/pexels-photo-5240696.jpeg', 'Ankara Mermaid Dress Full View', 0),
    (v_product_ids[2], 'https://images.pexels.com/photos/5240697/pexels-photo-5240697.jpeg', 'Ankara Mermaid Dress Side View', 1),
    
    (v_product_ids[3], 'https://images.pexels.com/photos/5325582/pexels-photo-5325582.jpeg', 'White Kaftan Front View', 0),
    (v_product_ids[3], 'https://images.pexels.com/photos/5325583/pexels-photo-5325583.jpeg', 'White Kaftan Detail', 1),
    
    (v_product_ids[4], 'https://images.pexels.com/photos/3735657/pexels-photo-3735657.jpeg', 'Beaded Coral Necklace', 0),
    
    (v_product_ids[5], 'https://images.pexels.com/photos/6069099/pexels-photo-6069099.jpeg', 'Premium Aso Oke Fabric', 0),
    
    (v_product_ids[6], 'https://images.pexels.com/photos/5240692/pexels-photo-5240692.jpeg', 'Emerald Green Ankara Jumpsuit Front', 0),
    (v_product_ids[6], 'https://images.pexels.com/photos/5240693/pexels-photo-5240693.jpeg', 'Emerald Green Ankara Jumpsuit Back', 1)
  ON CONFLICT DO NOTHING;

  v_result := jsonb_build_object(
    'success', true,
    'categories_count', array_length(v_category_ids, 1),
    'products_count', array_length(v_product_ids, 1),
    'message', 'Database seeded successfully'
  );

  RETURN v_result;
END;
$$;