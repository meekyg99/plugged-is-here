-- ============================================================================
-- EMERGENCY FIX: Disable RLS Temporarily to Diagnose Issue
-- ============================================================================
-- This will help us identify what's causing the 500 error

-- Step 1: Check what's actually causing the 500 error
-- Look at the profiles table structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Step 2: Check if there's a problematic RLS policy
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- Step 3: TEMPORARILY disable RLS to allow access
-- (This will let us test if RLS is the problem)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Step 4: Test if we can now read the profile
SELECT * FROM profiles WHERE id = '3bbec2be-615c-4fff-88fd-64f86754d9c5';

-- Step 5: If the above works, the issue is RLS policies
-- Let's create very permissive policies for testing

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can read profiles" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;

-- Create simple, permissive policies
-- Allow authenticated users to read ALL profiles
CREATE POLICY "Allow authenticated read all"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- Allow users to read their own profile
CREATE POLICY "Allow users read own"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Allow users update own"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow authenticated users to insert their own profile
CREATE POLICY "Allow users insert own"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Step 6: Verify your profile exists and is correct
SELECT 
  id,
  role,
  full_name,
  email,
  created_at,
  updated_at
FROM profiles 
WHERE id = '3bbec2be-615c-4fff-88fd-64f86754d9c5';

-- Step 7: If profile doesn't exist or role is wrong, fix it
INSERT INTO profiles (id, role, full_name, email, created_at, updated_at)
VALUES (
  '3bbec2be-615c-4fff-88fd-64f86754d9c5',
  'admin',
  'Admin User',
  'kabbalallana38@gmail.com',
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
SET 
  role = 'admin',
  full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
  email = COALESCE(EXCLUDED.email, profiles.email),
  updated_at = now();

-- Step 8: Final verification
SELECT 
  'Profile Check' as test,
  id,
  role,
  full_name,
  email,
  CASE 
    WHEN role IN ('admin', 'manager', 'support') THEN '✅ IS ADMIN'
    ELSE '❌ NOT ADMIN'
  END as admin_status
FROM profiles 
WHERE id = '3bbec2be-615c-4fff-88fd-64f86754d9c5';

-- Step 9: Check if profiles table has email column
-- If not, we need to add it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email text;
    RAISE NOTICE 'Added email column to profiles table';
  END IF;
END $$;
