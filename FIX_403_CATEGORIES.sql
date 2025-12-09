-- ============================================================================
-- FIX 403 ERROR - Categories Read Access
-- ============================================================================
-- The 403 error means RLS is blocking read access to categories
-- This fixes it by creating a proper public read policy
-- ============================================================================

-- Step 1: Check current policies
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'categories';

-- Step 2: Drop ALL existing policies (clean slate)
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON categories;
DROP POLICY IF EXISTS "Public categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON categories;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON categories;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON categories;

-- Step 3: Create PUBLIC read policy (this is the critical one)
-- This allows ANYONE (authenticated OR anonymous) to read categories
CREATE POLICY "categories_public_read_policy"
ON categories
FOR SELECT
USING (true);

-- Step 4: Create admin management policy
CREATE POLICY "categories_admin_write_policy"
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

-- Step 5: MAKE SURE RLS is enabled
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Step 6: Verify the policies were created
SELECT 
    '✅ Policy created' as status,
    policyname, 
    cmd as command,
    roles
FROM pg_policies 
WHERE tablename = 'categories';

-- Step 7: Test read access (this should now work)
SELECT 
    '✅ Categories in database:' as status,
    COUNT(*) as total
FROM categories;

SELECT 
    id,
    name,
    slug,
    gender
FROM categories 
ORDER BY name;

-- Step 8: If you still get 403, run this emergency fix:
-- (Uncomment the line below ONLY if the above doesn't work)
-- ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
