-- ============================================================================
-- TASK 1C: FIX ALL RLS ISSUES (PROFILES + BANNERS + OTHER TABLES)
-- ============================================================================
-- Multiple tables are returning 500 errors due to RLS issues
-- Let's fix them all at once

-- ============================================================================
-- PART 1: FIX PROFILES TABLE
-- ============================================================================

-- Drop ALL policies on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can read profiles" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated read all" ON profiles;
DROP POLICY IF EXISTS "Allow users read own" ON profiles;
DROP POLICY IF EXISTS "Allow users update own" ON profiles;
DROP POLICY IF EXISTS "Allow users insert own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_public_read_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_self_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_self_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_self_delete_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_allow_select_all" ON profiles;
DROP POLICY IF EXISTS "profiles_allow_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_allow_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_allow_delete_own" ON profiles;

-- Disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Ensure admin profiles exist
INSERT INTO profiles (id, role, full_name, created_at, updated_at)
VALUES (
  'fbc84c5c-8860-4b59-b734-db0d096f9872',
  'admin',
  'Admin User',
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
SET role = 'admin', updated_at = now();

INSERT INTO profiles (id, role, full_name, created_at, updated_at)
SELECT 
  id, 
  'admin', 
  'Admin User',
  now(),
  now()
FROM auth.users
WHERE email = 'kabbalallana38@gmail.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin', updated_at = now();

-- Create simple policies (NO RECURSION)
CREATE POLICY "profiles_read_all"
ON profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "profiles_delete_own"
ON profiles FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 2: FIX BANNERS TABLE
-- ============================================================================

-- Drop ALL policies on banners
DROP POLICY IF EXISTS "Banners are viewable by everyone" ON banners;
DROP POLICY IF EXISTS "Enable read access for all users" ON banners;
DROP POLICY IF EXISTS "Banners read for all" ON banners;
DROP POLICY IF EXISTS "banners_select_policy" ON banners;
DROP POLICY IF EXISTS "banners_public_read" ON banners;

-- Disable RLS temporarily
ALTER TABLE banners DISABLE ROW LEVEL SECURITY;

-- Create simple policy - allow everyone to read banners (public data)
CREATE POLICY "banners_public_select"
ON banners FOR SELECT
TO authenticated, anon
USING (true);

-- Re-enable RLS
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 3: CHECK OTHER TABLES THAT MIGHT HAVE RLS ISSUES
-- ============================================================================

-- List all tables with RLS enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public' 
  AND rowsecurity = true
ORDER BY tablename;

-- ============================================================================
-- PART 4: FIX OTHER COMMON TABLES
-- ============================================================================

-- Fix products table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'products') THEN
    DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
    DROP POLICY IF EXISTS "Enable read access for all users" ON products;
    
    ALTER TABLE products DISABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "products_public_select"
    ON products FOR SELECT
    TO authenticated, anon
    USING (true);
    
    ALTER TABLE products ENABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE 'Fixed products table RLS';
  END IF;
END $$;

-- Fix categories table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'categories') THEN
    DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
    DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
    
    ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "categories_public_select"
    ON categories FOR SELECT
    TO authenticated, anon
    USING (true);
    
    ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE 'Fixed categories table RLS';
  END IF;
END $$;

-- ============================================================================
-- PART 5: VERIFICATION
-- ============================================================================

-- Check profiles
SELECT 
  '✅ Profiles RLS' as check_type,
  CASE 
    WHEN rowsecurity = true THEN 'ENABLED ✅'
    ELSE 'DISABLED ❌'
  END as status,
  (SELECT COUNT(*)::text FROM pg_policies WHERE tablename = 'profiles') || ' policies' as policies
FROM pg_tables
WHERE tablename = 'profiles';

-- Check banners
SELECT 
  '✅ Banners RLS' as check_type,
  CASE 
    WHEN rowsecurity = true THEN 'ENABLED ✅'
    ELSE 'DISABLED ❌'
  END as status,
  (SELECT COUNT(*)::text FROM pg_policies WHERE tablename = 'banners') || ' policies' as policies
FROM pg_tables
WHERE tablename = 'banners';

-- Check admin profiles
SELECT 
  '✅ Admin Profiles' as check_type,
  COUNT(*)::text || ' admin(s) found' as status,
  string_agg(id::text, ', ') as admin_ids
FROM profiles
WHERE role = 'admin';

-- Test profile query (the one that was failing)
SELECT 
  '✅ Profile Query Test' as check_type,
  id,
  role,
  full_name,
  CASE 
    WHEN role = 'admin' THEN 'IS ADMIN ✅'
    ELSE 'NOT ADMIN ❌'
  END as status
FROM profiles
WHERE id = 'fbc84c5c-8860-4b59-b734-db0d096f9872';

-- ============================================================================
-- EXPECTED RESULTS
-- ============================================================================
-- ✅ Profiles RLS: ENABLED ✅ | 4 policies
-- ✅ Banners RLS: ENABLED ✅ | 1 policies
-- ✅ Admin Profiles: 2 admin(s) found
-- ✅ Profile Query Test: IS ADMIN ✅
-- ============================================================================
