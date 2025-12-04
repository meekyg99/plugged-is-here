-- ============================================================================
-- TASK 1: FIX PROFILES TABLE RLS (Row Level Security)
-- ============================================================================
-- This fixes the 500 errors and enables proper admin authentication
-- Run this in Supabase SQL Editor

-- ============================================================================
-- PART 1: DIAGNOSTIC - Check Current State
-- ============================================================================

-- 1.1: Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as "RLS Enabled?"
FROM pg_tables
WHERE tablename = 'profiles';

-- 1.2: Check existing policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd as "Command Type"
FROM pg_policies
WHERE tablename = 'profiles';

-- 1.3: Check your profile exists
SELECT 
  id,
  role,
  full_name,
  created_at,
  updated_at
FROM profiles 
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email = 'kabbalallana38@gmail.com'
);

-- ============================================================================
-- PART 2: CLEANUP - Remove ALL Existing Policies
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

-- ============================================================================
-- PART 3: CREATE PROPER RLS POLICIES
-- ============================================================================

-- Policy 1: SELECT - Allow all authenticated users to read ALL profiles
-- This is needed for admin checks and user lookups
CREATE POLICY "profiles_public_read_policy"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- Policy 2: INSERT - Users can create their own profile
CREATE POLICY "profiles_self_insert_policy"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy 3: UPDATE - Users can update their own profile
CREATE POLICY "profiles_self_update_policy"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 4: DELETE - Only allow users to delete their own profile
CREATE POLICY "profiles_self_delete_policy"
ON profiles FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- ============================================================================
-- PART 4: ENSURE RLS IS ENABLED
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 5: ENSURE YOUR ADMIN PROFILE EXISTS
-- ============================================================================

-- Insert or update your profile with admin role
INSERT INTO profiles (id, role, full_name, created_at, updated_at)
SELECT 
  id, 
  'admin', 
  COALESCE(raw_user_meta_data->>'full_name', 'Admin User'),
  now(),
  now()
FROM auth.users
WHERE email = 'kabbalallana38@gmail.com'
ON CONFLICT (id) DO UPDATE
SET 
  role = 'admin',
  full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
  updated_at = now();

-- ============================================================================
-- PART 6: VERIFICATION - Check Everything Works
-- ============================================================================

-- 6.1: Verify RLS is enabled
SELECT 
  '✅ RLS Status' as check_type,
  CASE 
    WHEN rowsecurity = true THEN '✅ ENABLED'
    ELSE '❌ DISABLED'
  END as status
FROM pg_tables
WHERE tablename = 'profiles';

-- 6.2: Verify policies exist
SELECT 
  '✅ Policies Created' as check_type,
  COUNT(*)::text || ' policies' as status
FROM pg_policies
WHERE tablename = 'profiles';

-- 6.3: Verify your profile and admin role
SELECT 
  '✅ Admin Profile' as check_type,
  u.email,
  p.role,
  CASE 
    WHEN p.role = 'admin' THEN '✅ IS ADMIN'
    WHEN p.role IS NULL THEN '❌ NO PROFILE'
    ELSE '❌ NOT ADMIN (role: ' || p.role || ')'
  END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'kabbalallana38@gmail.com';

-- 6.4: Test the exact query your app uses
SELECT 
  '✅ Query Test' as check_type,
  CASE 
    WHEN role IS NOT NULL THEN '✅ PROFILE FOUND (role: ' || role || ')'
    ELSE '❌ NO PROFILE'
  END as status
FROM profiles 
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email = 'kabbalallana38@gmail.com'
);

-- ============================================================================
-- EXPECTED RESULTS
-- ============================================================================
-- You should see:
-- ✅ RLS Status: ENABLED
-- ✅ Policies Created: 4 policies
-- ✅ Admin Profile: IS ADMIN
-- ✅ Query Test: PROFILE FOUND (role: admin)
-- 
-- If all show ✅, the fix is successful!
-- ============================================================================
