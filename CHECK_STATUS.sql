-- ============================================================================
-- CHECK CURRENT STATUS
-- ============================================================================

-- 1. Check if RLS is disabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'profiles';
-- rowsecurity = false means RLS is DISABLED
-- rowsecurity = true means RLS is ENABLED

-- 2. Check if your profile exists
SELECT 
  id,
  role,
  full_name,
  created_at
FROM profiles 
WHERE id = '3bbec2be-615c-4fff-88fd-64f86754d9c5';

-- 3. Check all profiles to see what's in the table
SELECT id, role, full_name FROM profiles LIMIT 10;

-- 4. If profile doesn't exist, let's see what user IDs we have
SELECT 
  u.id,
  u.email,
  u.created_at,
  p.role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'kabbalallana38@gmail.com';
