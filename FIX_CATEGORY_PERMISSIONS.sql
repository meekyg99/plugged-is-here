-- ============================================================================
-- FIX CATEGORY PERMISSIONS - Allow reading categories
-- ============================================================================

-- First, check if categories exist
SELECT COUNT(*) as category_count FROM categories;

-- Check current RLS policies on categories table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'categories';

-- Drop existing restrictive policies if any
DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON categories;
DROP POLICY IF EXISTS "Public categories are viewable by everyone" ON categories;

-- Create a simple policy that allows EVERYONE (including anon) to read categories
-- This is safe because categories are public data that everyone needs to see
CREATE POLICY "Anyone can view categories"
ON categories
FOR SELECT
TO public
USING (true);

-- Allow admins to insert/update/delete categories
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
);

-- Make sure RLS is enabled
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'categories';

-- Test: Select all categories (this should work now)
SELECT id, name, slug, gender, description FROM categories ORDER BY name;
