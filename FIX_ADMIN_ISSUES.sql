-- ============================================================================
-- FIX ADMIN ISSUES
-- ============================================================================
-- 1. Promote existing user to admin
-- 2. Verify profile exists and has admin role

-- Step 1: Check current user status
SELECT 
  u.id,
  u.email,
  u.created_at,
  u.email_confirmed_at,
  p.role,
  p.full_name
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'kabbalallana38@gmail.com';

-- Step 2: Promote user to admin (run this after checking above)
-- If user exists but doesn't have admin role:
UPDATE profiles
SET role = 'admin', updated_at = now()
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'kabbalallana38@gmail.com'
);

-- Step 3: If profile doesn't exist, create it
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
SET role = 'admin', updated_at = now();

-- Step 4: Verify the fix
SELECT 
  u.email,
  p.role,
  CASE 
    WHEN p.role IN ('admin', 'manager', 'support') THEN '✅ IS ADMIN'
    ELSE '❌ NOT ADMIN'
  END as admin_status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'kabbalallana38@gmail.com';
