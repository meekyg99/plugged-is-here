# 🔴 FIX 401 UNAUTHORIZED EMAIL ERROR

## Problem
```
POST https://pluggedby212.shop/api/send-email 401 (Unauthorized)
```

This means **Mailjet credentials are NOT set on Vercel** (or incorrect).

---

## ✅ Solution: Add Environment Variables to Vercel

### Step 1: Go to Vercel Dashboard
1. Open https://vercel.com/dashboard
2. Select your project: **plugged-is-here** (or similar name)
3. Click **Settings** tab
4. Click **Environment Variables** in left sidebar

### Step 2: Add These 3 Variables

**Variable 1:**
```
Name:  MAILJET_API_KEY
Value: aa0e7b7bd15ff377f13be2cd736da46b
```

**Variable 2:**
```
Name:  MAILJET_API_SECRET
Value: 7a4c2fc5bfa960cc075081944cd3834c
```

**Variable 3:**
```
Name:  MAILJET_FROM
Value: Plugged <info@pluggedby212.shop>
```

### Step 3: Apply to All Environments
For each variable, select:
- ✅ Production
- ✅ Preview
- ✅ Development

Then click **Save** for each one.

### Step 4: Redeploy
**Option A (Automatic):**
```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

**Option B (Manual):**
1. Go to **Deployments** tab in Vercel
2. Click on latest deployment
3. Click **⋯** (three dots) → **Redeploy**

---

## ⏳ Wait 2-3 Minutes

Vercel needs to rebuild with the new environment variables.

---

## ✅ Test After Redeployment

1. **Sign up** with new email
2. Check console - should see **NO 401 error**
3. Check your email inbox - should receive **welcome email**

---

## Why This Happened

- **Local `.env` file** = Only works on your computer
- **Vercel environment variables** = Work on live site

The Mailjet credentials were in your local `.env` but **not on Vercel**, so the serverless function couldn't authenticate with Mailjet.

---

## Quick Verification

After adding variables, check they're there:
1. Vercel Dashboard → Settings → Environment Variables
2. Should see 3 variables: `MAILJET_API_KEY`, `MAILJET_API_SECRET`, `MAILJET_FROM`
3. Each should have green checkmarks for Production/Preview/Development

---

**Status:** ⏳ WAITING - Add variables to Vercel NOW  
**Next:** Redeploy and test signup
