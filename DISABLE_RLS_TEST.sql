-- ============================================================================
-- NUCLEAR OPTION: Disable RLS Completely for Testing
-- ============================================================================
-- This will help us determine if RLS is the problem

-- Step 1: Completely disable RLS on profiles table
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Check if your profile exists
SELECT * FROM profiles WHERE id = '3bbec2be-615c-4fff-88fd-64f86754d9c5';

-- Step 3: If it doesn't exist, create it
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

-- Step 4: Verify profile exists and is admin
SELECT 
  id,
  role,
  full_name,
  created_at,
  CASE 
    WHEN role = 'admin' THEN '✅ IS ADMIN'
    ELSE '❌ NOT ADMIN (role is: ' || COALESCE(role, 'NULL') || ')'
  END as status
FROM profiles 
WHERE id = '3bbec2be-615c-4fff-88fd-64f86754d9c5';

-- Step 5: Test the exact query that's failing in your app
SELECT role FROM profiles WHERE id = '3bbec2be-615c-4fff-88fd-64f86754d9c5';

-- Note: With RLS disabled, your app should work now
-- After confirming it works, we'll re-enable RLS with proper policies
