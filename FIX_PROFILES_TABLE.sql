-- ============================================================================
-- FIX: Profiles Table 500 Error
-- ============================================================================
-- This fixes the 500 error when fetching profiles

-- Step 1: Check if profiles table exists and its structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Step 2: Check current RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'profiles';

-- Step 3: Temporarily disable RLS to test (BE CAREFUL - only for debugging)
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Step 4: Check if your profile exists
SELECT * FROM profiles WHERE id = '3bbec2be-615c-4fff-88fd-64f86754d9c5';

-- Step 5: If profile doesn't exist, create it
INSERT INTO profiles (id, role, full_name, created_at, updated_at)
VALUES (
  '3bbec2be-615c-4fff-88fd-64f86754d9c5',
  'admin',
  'Admin User',
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
SET role = 'admin', updated_at = now();

-- Step 6: Fix RLS policies for profiles table
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;

-- Create simple, working policies
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Allow authenticated users to read profiles (needed for admin checks)
CREATE POLICY "Authenticated users can read profiles"
ON profiles FOR SELECT
USING (auth.role() = 'authenticated');

-- Step 7: Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 8: Verify the fix - check your profile
SELECT 
  id,
  role,
  full_name,
  created_at,
  CASE 
    WHEN role IN ('admin', 'manager', 'support') THEN '✅ IS ADMIN'
    ELSE '❌ NOT ADMIN'
  END as admin_status
FROM profiles 
WHERE id = '3bbec2be-615c-4fff-88fd-64f86754d9c5';

-- Step 9: Test the query that's failing
SELECT role FROM profiles WHERE id = '3bbec2be-615c-4fff-88fd-64f86754d9c5';
SELECT * FROM profiles WHERE id = '3bbec2be-615c-4fff-88fd-64f86754d9c5';
