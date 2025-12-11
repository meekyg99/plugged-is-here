# 🔴 VERCEL ENVIRONMENT VARIABLES - STEP BY STEP

## The 401 Error Means: Mailjet credentials NOT on Vercel

Let's fix this carefully:

---

## ✅ Step 1: DELETE Old Variables (If Any Exist)

1. Go to: https://vercel.com/dashboard
2. Select your project (pluggedby212.shop)
3. Click: **Settings** tab
4. Click: **Environment Variables** (left sidebar)
5. If you see ANY of these, **DELETE THEM ALL**:
   - MAILJET_API_KEY
   - MAILJET_API_SECRET
   - MAILJET_FROM
   - VITE_RESEND_API_KEY
   - Any other email-related variables

**Why?** Start fresh to avoid conflicts.

---

## ✅ Step 2: Add Variables ONE BY ONE

### Variable 1: MAILJET_API_KEY

1. Click: **Add New** button
2. **Name (Key):** `MAILJET_API_KEY`
3. **Value:** `aa0e7b7bd15ff377f13be2cd736da46b`
4. **Select ALL THREE checkboxes:**
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Click: **Save**

### Variable 2: MAILJET_API_SECRET

1. Click: **Add New** button again
2. **Name (Key):** `MAILJET_API_SECRET`
3. **Value:** `7a4c2fc5bfa960cc075081944cd3834c`
4. **Select ALL THREE checkboxes:**
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Click: **Save**

### Variable 3: MAILJET_FROM

1. Click: **Add New** button again
2. **Name (Key):** `MAILJET_FROM`
3. **Value:** `Plugged <info@pluggedby212.shop>`
4. **Select ALL THREE checkboxes:**
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Click: **Save**

---

## ✅ Step 3: VERIFY Variables Are Saved

Look at the Environment Variables list. You should see:

```
MAILJET_API_KEY         Production, Preview, Development
MAILJET_API_SECRET      Production, Preview, Development
MAILJET_FROM            Production, Preview, Development
```

**CRITICAL:** Each one MUST show "Production" in the list!

---

## ✅ Step 4: Force Redeploy

Variables only take effect on NEW deployments. Do this:

**Option A (Recommended):**
```bash
git commit --allow-empty -m "Force redeploy with Mailjet env vars"
git push
```

**Option B (Manual):**
1. In Vercel, go to: **Deployments** tab
2. Find the latest deployment
3. Click: **⋯** (three dots menu)
4. Click: **Redeploy**
5. Click: **Redeploy** again to confirm

---

## ⏳ Step 5: Wait for Deployment

1. Go to: **Deployments** tab in Vercel
2. Watch the top deployment
3. Wait until it shows: **✅ Ready** (usually 2-3 minutes)
4. Status should be: "Ready" with green checkmark

---

## 🧪 Step 6: Test Again

1. Go to: https://pluggedby212.shop
2. **Hard refresh:** Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
3. Open console (F12)
4. Try signing up with NEW email
5. Check console for errors

---

## 📸 If Still Failing

Take a screenshot of:
1. Vercel → Settings → Environment Variables page (showing all 3 variables)
2. Browser console showing the 401 error
3. Vercel → Deployments page showing latest deployment status

---

## 🔍 Common Mistakes

❌ **Not clicking "Production" checkbox**
❌ **Typo in variable names** (must be exact: MAILJET_API_KEY, not Mailjet_Api_Key)
❌ **Extra spaces in values**
❌ **Not redeploying after adding variables**
❌ **Old deployment still active**

---

## ✅ Checklist

```
[ ] Deleted any old email-related variables
[ ] Added MAILJET_API_KEY with Production checked
[ ] Added MAILJET_API_SECRET with Production checked
[ ] Added MAILJET_FROM with Production checked
[ ] All 3 variables saved successfully
[ ] Triggered new deployment (git push or manual redeploy)
[ ] Waited for deployment to finish (shows "Ready")
[ ] Hard refreshed browser (Ctrl+Shift+R)
[ ] Tested signup with new email
```

---

**Start with Step 1 and go through each step carefully. Tell me when you've completed each step!**
