-- ============================================================================
-- TASK 1B: FIX INFINITE RECURSION IN RLS POLICIES
-- ============================================================================
-- Error: "infinite recursion detected in policy for relation 'profiles'"
-- This happens when policies reference themselves

-- ============================================================================
-- STEP 1: DROP ALL POLICIES (Clean Slate)
-- ============================================================================

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

-- ============================================================================
-- STEP 2: TEMPORARILY DISABLE RLS TO TEST
-- ============================================================================

-- Disable RLS temporarily so we can verify the table structure is fine
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 3: VERIFY YOUR PROFILE EXISTS
-- ============================================================================

-- Check if profile exists for the user having issues
SELECT 
  id,
  role,
  full_name,
  created_at,
  'Profile exists' as status
FROM profiles 
WHERE id = 'fbc84c5c-8860-4b59-b734-db0d096f9872';

-- If doesn't exist, create it
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

-- Also ensure the original admin exists
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

-- ============================================================================
-- STEP 4: CREATE SIMPLE, NON-RECURSIVE POLICIES
-- ============================================================================

-- Policy 1: Allow ALL authenticated users to SELECT
-- Using 'true' prevents recursion - doesn't check other tables
CREATE POLICY "profiles_allow_select_all"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- Policy 2: Allow INSERT only for own record
-- Uses auth.uid() which doesn't cause recursion
CREATE POLICY "profiles_allow_insert_own"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy 3: Allow UPDATE only for own record
CREATE POLICY "profiles_allow_update_own"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 4: Allow DELETE only for own record
CREATE POLICY "profiles_allow_delete_own"
ON profiles FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- ============================================================================
-- STEP 5: RE-ENABLE RLS
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 6: VERIFICATION
-- ============================================================================

-- Check RLS is enabled
SELECT 
  '✅ RLS Status' as check_type,
  CASE 
    WHEN rowsecurity = true THEN '✅ ENABLED'
    ELSE '❌ DISABLED'
  END as status
FROM pg_tables
WHERE tablename = 'profiles';

-- Count policies
SELECT 
  '✅ Policies' as check_type,
  COUNT(*)::text || ' policies created' as status
FROM pg_policies
WHERE tablename = 'profiles';

-- List all policies
SELECT 
  '✅ Policy Details' as check_type,
  policyname,
  cmd as command
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd;

-- Verify both admin profiles
SELECT 
  '✅ Admin Profiles' as check_type,
  id,
  role,
  full_name,
  CASE 
    WHEN role = 'admin' THEN '✅ IS ADMIN'
    ELSE '❌ NOT ADMIN'
  END as status
FROM profiles
WHERE id IN (
  'fbc84c5c-8860-4b59-b734-db0d096f9872',
  (SELECT id FROM auth.users WHERE email = 'kabbalallana38@gmail.com' LIMIT 1)
);

-- ============================================================================
-- EXPECTED RESULTS
-- ============================================================================
-- ✅ RLS Status: ENABLED
-- ✅ Policies: 4 policies created
-- ✅ Policy Details: Lists all 4 policies (SELECT, INSERT, UPDATE, DELETE)
-- ✅ Admin Profiles: Both profiles show IS ADMIN
-- ============================================================================
