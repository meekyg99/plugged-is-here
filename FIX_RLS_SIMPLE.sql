-- ============================================================================
-- SIMPLE FIX: Remove problematic RLS and create permissive policies
-- ============================================================================

-- Step 1: Check table structure (to see what columns exist)
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Step 2: Drop ALL existing RLS policies
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

-- Step 3: Create simple, working policies
CREATE POLICY "profiles_select_policy"
ON profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "profiles_insert_policy"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Step 4: Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: Check if your profile exists
SELECT 
  id,
  role,
  full_name,
  created_at,
  updated_at
FROM profiles 
WHERE id = '3bbec2be-615c-4fff-88fd-64f86754d9c5';

-- Step 6: Create or update your profile
INSERT INTO profiles (id, role, full_name, created_at, updated_at)
VALUES (
  '3bbec2be-615c-4fff-88fd-64f86754d9c5',
  'admin',
  'Admin User',
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
SET 
  role = 'admin',
  updated_at = now();

-- Step 7: Verify it worked
SELECT 
  id,
  role,
  full_name,
  CASE 
    WHEN role IN ('admin', 'manager', 'support') THEN '✅ IS ADMIN'
    ELSE '❌ NOT ADMIN'
  END as admin_status
FROM profiles 
WHERE id = '3bbec2be-615c-4fff-88fd-64f86754d9c5';
