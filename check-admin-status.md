# Admin Access Troubleshooting Guide

## Issue Fixed
✅ **Infinite redirect loop** - The `AdminProtectedRoute` component was showing "Access Denied" and redirecting at the same time, causing a loop. This has been fixed.

## What Was Changed
- Removed the "Access Denied" UI that was showing before redirects
- Now shows a consistent "Verifying access..." loading state
- Redirects happen cleanly without the visual loop

## If You Still Can't Access Admin

The most likely issue is that your user account doesn't have an admin role in the database. 

### To Fix Your Admin Role:

1. **Open your Supabase Dashboard** at https://supabase.com
2. Go to **SQL Editor**
3. Run this query (replace with your actual email):

```sql
-- Check your current role
SELECT
  u.email,
  p.role,
  p.full_name
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'your-email@example.com';

-- If role is not 'admin', 'manager', or 'support', run this:
UPDATE profiles
SET role = 'admin', updated_at = now()
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = 'your-email@example.com'
);

-- Verify the change
SELECT
  u.email,
  p.role,
  CASE
    WHEN p.role IN ('admin', 'manager', 'support') THEN '✅ IS ADMIN'
    ELSE '❌ NOT ADMIN'
  END as admin_status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'your-email@example.com';
```

4. **After updating the database**, refresh your browser or sign out and sign back in
5. Try accessing the admin dashboard again

## Testing the Fix

1. Make sure you're logged into the main site
2. Click "Admin Dashboard" in the menu
3. You should see "Verifying access..." briefly
4. If you have admin role: You'll see the dashboard
5. If you don't have admin role: You'll be redirected to home page cleanly (no loop)

## Additional Notes

- The admin roles are: `admin`, `manager`, and `support`
- Regular users with role `customer` cannot access admin areas
- The verification happens server-side for security
