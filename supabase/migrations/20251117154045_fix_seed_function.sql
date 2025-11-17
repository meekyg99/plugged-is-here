/*
  # Fix Seed Function
  
  Updates the seed function to properly handle multiple rows.
*/

CREATE OR REPLACE FUNCTION seed_sample_data()
RETURNS jsonb
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_agbada_id uuid;
  v_ankara_id uuid;
  v_kaftan_id uuid;
  v_accessories_id uuid;
  v_asooke_id uuid;
  v_product1_id uuid;
  v_product2_id uuid;
  v_product3_id uuid;
  v_product4_id uuid;
  v_product5_id uuid;
  v_product6_id uuid;
  v_result jsonb;
BEGIN
  -- Insert categories one by one
  INSERT INTO categories (name, slug, gender, description)
  VALUES ('Agbada', 'agbada', 'men', 'Traditional Nigerian flowing robe')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_agbada_id;

  INSERT INTO categories (name, slug, gender, description)
  VALUES ('Ankara Dresses', 'ankara-dresses', 'women', 'Vibrant African print dresses')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_ankara_id;

  INSERT INTO categories (name, slug, gender, description)
  VALUES ('Kaftan', 'kaftan', 'unisex', 'Elegant flowing garments')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_kaftan_id;

  INSERT INTO categories (name, slug, gender, description)
  VALUES ('Accessories', 'accessories', 'unisex', 'Jewelry, bags, and more')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_accessories_id;

  INSERT INTO categories (name, slug, gender, description)
  VALUES ('Aso Oke', 'aso-oke', 'unisex', 'Hand-woven traditional fabric')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_asooke_id;

  -- Insert products
  INSERT INTO products (name, slug, description, category_id, gender, is_featured, meta_title, meta_description)
  VALUES ('Royal Blue Agbada Set', 'royal-blue-agbada-set', 
    'Luxurious hand-embroidered agbada with intricate gold patterns. Perfect for weddings and special occasions.',
    v_agbada_id, 'men', true, 'Royal Blue Agbada Set - Premium Nigerian Fashion',
    'Hand-embroidered agbada with gold patterns, perfect for special occasions')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_product1_id;

  INSERT INTO products (name, slug, description, category_id, gender, is_featured, meta_title, meta_description)
  VALUES ('Ankara Mermaid Dress', 'ankara-mermaid-dress',
    'Stunning mermaid-cut dress in vibrant Ankara print. Tailored for a perfect fit.',
    v_ankara_id, 'women', true, 'Ankara Mermaid Dress - Nigerian Fashion',
    'Vibrant Ankara print mermaid dress with tailored fit')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_product2_id;

  INSERT INTO products (name, slug, description, category_id, gender, is_featured, meta_title, meta_description)
  VALUES ('Embroidered White Kaftan', 'embroidered-white-kaftan',
    'Pure white kaftan with delicate gold embroidery. Suitable for both men and women.',
    v_kaftan_id, 'unisex', true, 'Embroidered White Kaftan - Premium Quality',
    'Pure white kaftan with gold embroidery, unisex design')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_product3_id;

  INSERT INTO products (name, slug, description, category_id, gender, is_featured, meta_title, meta_description)
  VALUES ('Beaded Coral Necklace', 'beaded-coral-necklace',
    'Traditional Nigerian coral beads necklace. Authentic and elegant.',
    v_accessories_id, 'unisex', false, 'Beaded Coral Necklace - Traditional Nigerian Jewelry',
    'Authentic traditional Nigerian coral beads necklace')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_product4_id;

  INSERT INTO products (name, slug, description, category_id, gender, is_featured, meta_title, meta_description)
  VALUES ('Premium Aso Oke Fabric', 'premium-aso-oke-fabric',
    'Hand-woven Aso Oke fabric in royal colors. Perfect for creating custom traditional attire.',
    v_asooke_id, 'unisex', false, 'Premium Aso Oke Fabric - Hand-Woven',
    'Hand-woven Aso Oke fabric in royal colors')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_product5_id;

  INSERT INTO products (name, slug, description, category_id, gender, is_featured, meta_title, meta_description)
  VALUES ('Emerald Green Ankara Jumpsuit', 'emerald-green-ankara-jumpsuit',
    'Modern jumpsuit in stunning emerald green Ankara print with wide-leg silhouette.',
    v_ankara_id, 'women', true, 'Emerald Green Ankara Jumpsuit - Contemporary Nigerian Fashion',
    'Modern Ankara print jumpsuit with wide-leg design')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_product6_id;

  -- Insert variants
  INSERT INTO product_variants (product_id, sku, size, color, color_hex, price, stock_quantity)
  VALUES 
    (v_product1_id, 'AGB-RB-M', 'M', 'Royal Blue', '#002366', 85000, 5),
    (v_product1_id, 'AGB-RB-L', 'L', 'Royal Blue', '#002366', 85000, 8),
    (v_product1_id, 'AGB-RB-XL', 'XL', 'Royal Blue', '#002366', 90000, 3),
    (v_product2_id, 'ANK-MD-S', 'S', 'Multi-Color', '#FF6B35', 35000, 10),
    (v_product2_id, 'ANK-MD-M', 'M', 'Multi-Color', '#FF6B35', 35000, 12),
    (v_product2_id, 'ANK-MD-L', 'L', 'Multi-Color', '#FF6B35', 37000, 8),
    (v_product3_id, 'KFT-WH-M', 'M', 'White', '#FFFFFF', 45000, 15),
    (v_product3_id, 'KFT-WH-L', 'L', 'White', '#FFFFFF', 45000, 20),
    (v_product4_id, 'CRL-NKL-OS', 'One Size', 'Coral Red', '#FF6F61', 25000, 30),
    (v_product5_id, 'ASO-PRM-5Y', '5 Yards', 'Royal Purple', '#7851A9', 55000, 12),
    (v_product5_id, 'ASO-PRM-10Y', '10 Yards', 'Royal Purple', '#7851A9', 105000, 6),
    (v_product6_id, 'ANK-JP-S', 'S', 'Emerald Green', '#50C878', 42000, 7),
    (v_product6_id, 'ANK-JP-M', 'M', 'Emerald Green', '#50C878', 42000, 10),
    (v_product6_id, 'ANK-JP-L', 'L', 'Emerald Green', '#50C878', 44000, 5)
  ON CONFLICT (sku) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;

  -- Insert images
  INSERT INTO product_images (product_id, image_url, alt_text, display_order)
  VALUES 
    (v_product1_id, 'https://images.pexels.com/photos/5999821/pexels-photo-5999821.jpeg', 'Royal Blue Agbada Set Front View', 0),
    (v_product1_id, 'https://images.pexels.com/photos/5999822/pexels-photo-5999822.jpeg', 'Royal Blue Agbada Set Detail', 1),
    (v_product2_id, 'https://images.pexels.com/photos/5240696/pexels-photo-5240696.jpeg', 'Ankara Mermaid Dress Full View', 0),
    (v_product2_id, 'https://images.pexels.com/photos/5240697/pexels-photo-5240697.jpeg', 'Ankara Mermaid Dress Side View', 1),
    (v_product3_id, 'https://images.pexels.com/photos/5325582/pexels-photo-5325582.jpeg', 'White Kaftan Front View', 0),
    (v_product3_id, 'https://images.pexels.com/photos/5325583/pexels-photo-5325583.jpeg', 'White Kaftan Detail', 1),
    (v_product4_id, 'https://images.pexels.com/photos/3735657/pexels-photo-3735657.jpeg', 'Beaded Coral Necklace', 0),
    (v_product5_id, 'https://images.pexels.com/photos/6069099/pexels-photo-6069099.jpeg', 'Premium Aso Oke Fabric', 0),
    (v_product6_id, 'https://images.pexels.com/photos/5240692/pexels-photo-5240692.jpeg', 'Emerald Green Ankara Jumpsuit Front', 0),
    (v_product6_id, 'https://images.pexels.com/photos/5240693/pexels-photo-5240693.jpeg', 'Emerald Green Ankara Jumpsuit Back', 1)
  ON CONFLICT DO NOTHING;

  v_result := jsonb_build_object(
    'success', true,
    'categories_count', 5,
    'products_count', 6,
    'message', 'Database seeded successfully'
  );

  RETURN v_result;
END;
$$;