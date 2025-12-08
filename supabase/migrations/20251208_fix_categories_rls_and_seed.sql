-- ============================================================================
-- Fix Categories RLS and Add Default Categories
-- ============================================================================
-- This migration:
-- 1. Adds default categories if they don't exist
-- 2. Sets up proper RLS policies so categories can be read by everyone
-- 3. Allows admins to manage categories
--
-- Run date: 2024-12-08
-- ============================================================================

-- Add default categories (will skip if they already exist)
INSERT INTO categories (name, slug, gender, description, created_at)
VALUES
  ('Agbada', 'agbada', 'men', 'Traditional Nigerian flowing robe', now()),
  ('Ankara Dresses', 'ankara-dresses', 'women', 'Vibrant African print dresses', now()),
  ('Kaftan', 'kaftan', 'unisex', 'Elegant flowing garments', now()),
  ('Accessories', 'accessories', 'unisex', 'Jewelry, bags, and more', now()),
  ('Aso Oke', 'aso-oke', 'unisex', 'Hand-woven traditional fabric', now())
ON CONFLICT (slug) DO NOTHING;

-- Drop any existing restrictive policies
DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON categories;
DROP POLICY IF EXISTS "Public categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON categories;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON categories;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON categories;

-- Create simple, clear policies for categories
-- Policy 1: Anyone (including anonymous users) can view categories
-- This is safe because categories are public information needed for the store
CREATE POLICY "Anyone can view categories"
ON categories
FOR SELECT
TO public
USING (true);

-- Policy 2: Only admins can insert, update, or delete categories
CREATE POLICY "Admins can manage categories"
ON categories
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager', 'support')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager', 'support')
  )
);

-- Ensure RLS is enabled on categories table
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Verify the setup (for logging/debugging)
DO $$
DECLARE
  category_count INTEGER;
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO category_count FROM categories;
  SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'categories';
  
  RAISE NOTICE 'Categories in database: %', category_count;
  RAISE NOTICE 'RLS policies on categories table: %', policy_count;
  
  IF category_count = 0 THEN
    RAISE WARNING 'No categories found! The INSERT may have failed.';
  END IF;
  
  IF policy_count < 2 THEN
    RAISE WARNING 'Expected at least 2 policies, found %', policy_count;
  END IF;
END $$;
