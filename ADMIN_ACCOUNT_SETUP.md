# Admin Account Setup

## Admin Credentials

**Email:** `kabbalallana38@gmail.com`  
**Password:** `Lallana99$`

## Setup Instructions

### Option 1: Create Account via Signup (Recommended)

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the main site:**
   ```
   http://localhost:5174
   ```

3. **Click "Sign Up" or open the auth modal**

4. **Create account with:**
   - Full Name: `Admin User` (or your preferred name)
   - Email: `kabbalallana38@gmail.com`
   - Password: `Lallana99$`

5. **The account will automatically be promoted to admin** (configured in the database migration)

6. **Now go to admin login:**
   ```
   http://localhost:5174/admin/login
   ```

7. **Login with the same credentials**

8. **Enter the 2FA code** shown in browser console (F12) or alert dialog

### Option 2: Create Account via Supabase Dashboard

1. **Go to your Supabase Dashboard:**
   ```
   https://app.supabase.com
   ```

2. **Navigate to: Authentication → Users**

3. **Click "Add User" → "Create new user"**

4. **Fill in:**
   - Email: `kabbalallana38@gmail.com`
   - Password: `Lallana99$`
   - Email Confirm: ✅ (check this box)

5. **Click "Create User"**

6. **The user will automatically be promoted to admin** (if migrations are applied)

7. **Verify in SQL Editor:**
   ```sql
   SELECT u.email, p.role 
   FROM auth.users u
   LEFT JOIN profiles p ON u.id = p.id
   WHERE u.email = 'kabbalallana38@gmail.com';
   ```

   Should show `role: 'admin'`

### Option 3: Manual SQL Setup (Advanced)

If you already have the user but need to set password:

1. **Go to Supabase Dashboard → Authentication → Users**

2. **Find the user: `kabbalallana38@gmail.com`**

3. **Click the three dots (...) → "Reset Password"**

4. **Or use SQL to set password hash directly (not recommended)**

## Verification Steps

After creating the account:

1. **Verify user exists:**
   ```sql
   SELECT * FROM auth.users 
   WHERE email = 'kabbalallana38@gmail.com';
   ```

2. **Verify admin role:**
   ```sql
   SELECT * FROM profiles 
   WHERE id = (
     SELECT id FROM auth.users 
     WHERE email = 'kabbalallana38@gmail.com'
   );
   ```
   
   Should show: `role = 'admin'`

3. **Test login:**
   - Go to: `http://localhost:5174/admin/login`
   - Email: `kabbalallana38@gmail.com`
   - Password: `Lallana99$`
   - 2FA Code: Check console (F12)

## Important Notes

### Security
- ⚠️ **Never commit passwords to git!**
- ⚠️ This password is now documented here - delete this file after setup or keep it secure
- ✅ Change password after first login if this is production

### Auto-Promotion
The migration `20251126205606_add_admin_email_auto_promotion.sql` automatically promotes `kabbalallana38@gmail.com` to admin on signup.

### If Login Fails
1. Check email is confirmed in Supabase
2. Verify role in profiles table
3. Check database migrations are applied
4. Clear browser localStorage
5. Try incognito mode

## Troubleshooting

### "User already exists"
If signup says user exists:
1. Go to Supabase Dashboard
2. Authentication → Users
3. Find the user
4. Reset password to `Lallana99$`

### "Access Denied" on login
Verify admin role:
```sql
-- Check role
SELECT * FROM profiles 
WHERE id = (SELECT id FROM auth.users WHERE email = 'kabbalallana38@gmail.com');

-- Manually set to admin if needed
UPDATE profiles 
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'kabbalallana38@gmail.com');
```

### Can't receive 2FA code
In development mode, 2FA codes are shown in:
- Browser console (Press F12 → Console tab)
- Alert dialog popup

Look for: `2FA Code: 123456`

## Quick Test

After setup, test everything:

```bash
# 1. Start server
npm run dev

# 2. Open browser
http://localhost:5174/admin/login

# 3. Login
Email: kabbalallana38@gmail.com
Password: Lallana99$

# 4. Get 2FA code from console (F12)

# 5. Enter code and access dashboard
```

---

**Delete this file after setup for security!**
