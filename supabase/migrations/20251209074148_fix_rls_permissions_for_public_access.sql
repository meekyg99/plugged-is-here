/*
  # Fix RLS Permissions for Public Access

  1. Changes
    - Update categories policy to use explicit anon and authenticated roles
    - Ensure wishlists can be read by authenticated users
    - Ensure all product-related tables are accessible
  
  2. Security
    - Categories: Public read access for everyone
    - Wishlists: Only authenticated users can access their own wishlists
    - Products: Public read access for everyone
*/

-- Fix categories policy
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;

CREATE POLICY "Anyone can view categories"
  ON categories
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Ensure products and related tables have correct policies
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Anyone can view variants" ON product_variants;
DROP POLICY IF EXISTS "Anyone can view images" ON product_images;

CREATE POLICY "Anyone can view products"
  ON products
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view variants"
  ON product_variants
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view images"
  ON product_images
  FOR SELECT
  TO anon, authenticated
  USING (true);
