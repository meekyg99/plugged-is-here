# Supabase Project Setup

You need to create a Supabase project and connect it to this application.

## Step 1: Create Supabase Project

### Option A: Using Supabase Cloud (Recommended)

1. **Go to Supabase:**
   ```
   https://app.supabase.com
   ```

2. **Sign in or Create Account**
   - Use GitHub, Google, or email

3. **Create New Project:**
   - Click "New Project"
   - Organization: Select or create one
   - Project Name: `plugged-fashion` (or your choice)
   - Database Password: **Save this!** (e.g., `YourSecurePassword123!`)
   - Region: Choose closest to you
   - Click "Create new project"

4. **Wait for project to initialize** (2-3 minutes)

5. **Get your credentials:**
   - Go to: Settings (⚙️) → API
   - Copy:
     - **Project URL** (e.g., `https://xxxxx.supabase.co`)
     - **anon public** key (the long string)

### Option B: Using Supabase CLI (Local Development)

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase
supabase init

# Start local Supabase
supabase start

# This will output:
# - API URL: http://localhost:54321
# - anon key: your-local-key
```

## Step 2: Create .env File

Create a file named `.env` in the project root:

**Location:** `C:\Users\USER\plugged-is-here-main\.env`

**Content:**
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# For local development, use:
# VITE_SUPABASE_URL=http://localhost:54321
# VITE_SUPABASE_ANON_KEY=your-local-anon-key
```

**Important:**
- Replace `your-project-id` with your actual project ID
- Replace `your-anon-key-here` with your actual anon key
- **Never commit this file to git!** (already in .gitignore)

## Step 3: Apply Database Migrations

### If using Supabase Cloud:

1. **Link your project:**
   ```bash
   supabase link --project-ref your-project-id
   ```
   
   You'll need:
   - Project ID (from dashboard URL)
   - Database password (from Step 1)

2. **Apply migrations:**
   ```bash
   supabase db push
   ```

### If using Supabase CLI (local):

```bash
# Already applied automatically when you run:
supabase start

# Or manually:
supabase db reset
```

## Step 4: Verify Connection

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Open browser console (F12)**

3. **Check for Supabase errors:**
   - Should NOT see: "Missing Supabase environment variables"
   - Should see normal app loading

4. **Test in Supabase Dashboard:**
   - Go to: Table Editor
   - Should see tables:
     - profiles
     - products
     - orders
     - admin_login_attempts (new)
     - admin_sessions (new)
     - admin_2fa_codes (new)
     - admin_audit_log (new)

## Step 5: Configure Authentication

In Supabase Dashboard:

1. **Go to: Authentication → URL Configuration**

2. **Set Site URL:**
   ```
   http://localhost:5174
   ```
   (Or your production URL when deploying)

3. **Add Redirect URLs:**
   ```
   http://localhost:5174/**
   http://localhost:5174/admin/**
   ```

4. **Email Templates (Optional for Development):**
   - Authentication → Email Templates
   - Can customize confirmation emails later

## Step 6: Test Database Connection

Run this test query in Supabase SQL Editor:

```sql
-- Should return successfully
SELECT NOW();

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check if admin functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name LIKE '%admin%';
```

## Quick Setup Commands

```bash
# 1. Create Supabase project (on supabase.com)

# 2. Create .env file with credentials

# 3. Install Supabase CLI (if not installed)
npm install -g supabase

# 4. Login to Supabase CLI
supabase login

# 5. Link your project
supabase link --project-ref your-project-id

# 6. Apply migrations
supabase db push

# 7. Start dev server
npm run dev

# 8. Test at http://localhost:5174
```

## Troubleshooting

### "Missing Supabase environment variables"
- Check `.env` file exists
- Verify `VITE_` prefix on variables
- Restart dev server after creating .env

### "Project ref not found"
- Check project ID is correct
- Make sure you're logged in: `supabase login`
- Try using full project reference

### "Invalid API key"
- Copy anon key again from dashboard
- Make sure no extra spaces in .env
- Use the `anon` key, not `service_role` key

### Migrations fail
- Check database password is correct
- Verify project is fully initialized (not still setting up)
- Try: `supabase db reset` (local) or reapply migrations

### Can't connect locally
If using local Supabase:
```bash
# Stop and restart
supabase stop
supabase start

# Check status
supabase status
```

## Example .env File

**For Cloud (Production/Staging):**
```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxMjUwMDAwMCwiZXhwIjoxOTI3MTAwMDAwfQ.example-key-here
```

**For Local Development:**
```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

## Security Reminders

⚠️ **Important:**
- `.env` is already in `.gitignore` - never commit it!
- Use different projects for development/production
- Rotate keys if accidentally exposed
- Never use `service_role` key in frontend code
- Only use `anon` key (public key)

## Next Steps

After Supabase is connected:

1. ✅ Create admin account (see ADMIN_ACCOUNT_SETUP.md)
2. ✅ Test admin login with 2FA
3. ✅ Verify audit logging works
4. ✅ Deploy to production with production Supabase project

---

**Need Help?**
- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
