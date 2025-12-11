# 🔧 Fix Signup Error (500 Authentication Failed)

## Problem
When users try to sign up, you get:
```
babugzeozpudnrbirwtg.supabase.co/auth/v1/signup:1 Failed to load resource: 
the server responded with a status of 500 () authentication failed
```

## Root Cause
Supabase has **email confirmation enabled** but the email sending is failing, causing signup to fail.

---

## ✅ **Solution: Disable Email Confirmation (Recommended for Now)**

### Step 1: Go to Supabase Dashboard
1. Open https://supabase.com/dashboard
2. Select your project: `babugzeozpudnrbirwtg`
3. Go to **Authentication** → **Providers** → **Email**

### Step 2: Disable Email Confirmation
1. Find the setting: **"Enable email confirmations"**
2. **TURN IT OFF** (uncheck it)
3. Click **Save**

### Step 3: Test Signup
1. Try signing up again
2. Should work immediately without email confirmation
3. Welcome email will still be sent (non-blocking)

---

## 🔄 **Alternative: Fix Email Confirmation (Advanced)**

If you want to KEEP email confirmation enabled:

### Option A: Use Supabase's Built-in Email Service

1. **Supabase Dashboard** → **Authentication** → **Email Templates**
2. Keep "Enable email confirmations" **ON**
3. Let Supabase send the confirmation emails (they'll use their SMTP)
4. **Remove** the custom `auth-email` edge function call from code

### Option B: Fix the Edge Function

The edge function is failing because of missing secrets:

```bash
# Set these in Supabase Edge Function Secrets
SUPABASE_URL=https://babugzeozpudnrbirwtg.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
MAILJET_API_KEY=aa0e7b7bd15ff377f13be2cd736da46b
MAILJET_API_SECRET=7a4c2fc5bfa960cc075081944cd3834c
MAILJET_FROM=Plugged <info@pluggedby212.shop>
```

**How to set secrets:**
```bash
# Using Supabase CLI
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_key_here
supabase secrets set MAILJET_API_KEY=aa0e7b7bd15ff377f13be2cd736da46b
supabase secrets set MAILJET_API_SECRET=7a4c2fc5bfa960cc075081944cd3834c
supabase secrets set MAILJET_FROM="Plugged <info@pluggedby212.shop>"
```

**Or via Dashboard:**
1. Go to **Edge Functions** in Supabase Dashboard
2. Select the `auth-email` function
3. Go to **Secrets** tab
4. Add each secret manually

---

## ⚡ **Quick Fix (Recommended for Now)**

**Just disable email confirmation** and let users sign up without verification.

You're still sending welcome emails via the `sendWelcomeEmail()` function, which works fine.

---

## 📝 **What Changed in the Code**

I've updated `src/contexts/AuthContext.tsx` to:

1. ✅ Remove the problematic `auth-email` edge function call
2. ✅ Add better error logging (`console.error`)
3. ✅ Keep the welcome email (non-blocking)
4. ✅ Add `emailRedirectTo` for when you enable confirmation later

---

## 🧪 **Testing After Fix**

1. Disable email confirmation in Supabase
2. Try signing up with a new email
3. Should work immediately
4. Check for welcome email in inbox
5. User should be able to login right away

---

## 🔐 **Security Note**

**Without email confirmation:**
- ✅ Users can sign up faster (better UX)
- ❌ No verification that email is real
- ❌ Potential for spam accounts

**With email confirmation:**
- ✅ Verified email addresses
- ✅ Better security
- ❌ More complex setup (needs working email service)

For now, I recommend **disabling confirmation** to get users signing up. You can enable it later once all email services are tested and working.

---

## ✅ **Action Items**

```
[ ] Go to Supabase Dashboard
[ ] Authentication → Providers → Email
[ ] Disable "Enable email confirmations"
[ ] Click Save
[ ] Test signup again
[ ] Deploy updated code (AuthContext.tsx changed)
```

---

**After you disable email confirmation, signup will work immediately!** 🎉
