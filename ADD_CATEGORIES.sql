-- ============================================================================
-- ADD DEFAULT CATEGORIES
-- ============================================================================
-- This will add the default categories needed for the product form dropdown

-- Insert categories (will skip if they already exist due to slug unique constraint)
INSERT INTO categories (name, slug, gender, description, created_at)
VALUES
  ('Agbada', 'agbada', 'men', 'Traditional Nigerian flowing robe', now()),
  ('Ankara Dresses', 'ankara-dresses', 'women', 'Vibrant African print dresses', now()),
  ('Kaftan', 'kaftan', 'unisex', 'Elegant flowing garments', now()),
  ('Accessories', 'accessories', 'unisex', 'Jewelry, bags, and more', now()),
  ('Aso Oke', 'aso-oke', 'unisex', 'Hand-woven traditional fabric', now())
ON CONFLICT (slug) DO NOTHING;

-- Verify categories were added
SELECT 
  id,
  name,
  slug,
  gender,
  description
FROM categories
ORDER BY name;
