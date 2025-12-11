# 🔴 FIX: 422 Signup Error

## Problem
```
422 Error on signup
Auth failed
```

## Root Cause
Supabase email confirmation is enabled but the redirect URL `https://pluggedby212.shop/auth/callback` is not in the allowed list.

---

## ✅ SOLUTION: Add Redirect URL to Supabase

### Step 1: Add to Redirect URLs
1. Go to: https://supabase.com/dashboard/project/babugzeozpudnrbirwtg/auth/url-configuration
2. Find: **"Redirect URLs"** section
3. Add this URL: `https://pluggedby212.shop/auth/callback`
4. Also add: `http://localhost:5173/auth/callback` (for local testing)
5. Click: **Save**

### Step 2: Check Site URL
1. In the same page, find: **"Site URL"**
2. Should be: `https://pluggedby212.shop`
3. If not, update it
4. Click: **Save**

---

## 🧪 Test After Fix

1. **Wait 1 minute** for Supabase to update config
2. **Go to:** https://pluggedby212.shop
3. **Hard refresh:** Ctrl+Shift+R
4. **Sign up** with new email
5. **Should work!**

---

## ⚠️ Alternative: Use Supabase's Default Confirmation

If you want simpler setup without custom redirect:

### Option A: Let Supabase handle email confirmation
1. Remove `emailRedirectTo` from code
2. Supabase will use their default confirmation page
3. Then redirect to your site URL

### Option B: Keep email confirmation OFF (current working state)
1. Turn OFF email confirmation in Supabase
2. Users sign up and login immediately
3. Welcome email still sends
4. No confirmation required

---

## 📝 Which Option?

**Recommended for now:** Turn email confirmation OFF

Why?
- ✅ Signup works immediately
- ✅ Better user experience
- ✅ Welcome email still works
- ✅ No configuration headaches
- ❌ Less secure (no email verification)

**For production:** Enable confirmation + add redirect URLs

---

## Quick Commands

### Check current auth settings:
```bash
# In Supabase Dashboard:
# Settings → Auth → URL Configuration
```

### Turn OFF email confirmation (simplest fix):
```bash
# In Supabase Dashboard:
# Authentication → Providers → Email
# Turn OFF: "Confirm email"
# Save
```

---

**Quick Fix:** Just turn OFF email confirmation for now. Users can sign up normally and still get welcome emails!
