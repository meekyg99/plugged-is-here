# How to Apply Database Migrations

## Quick Steps (5 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to: **https://supabase.com/dashboard/project/babugzeozpudnrbirwtg**
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New Query"**

### Step 2: Copy the SQL

Open the file: **`APPLY_MIGRATIONS.sql`** (in this project folder)

- **Option A:** Open in text editor, Ctrl+A to select all, Ctrl+C to copy
- **Option B:** Use command: `Get-Content APPLY_MIGRATIONS.sql | Set-Clipboard`

### Step 3: Paste and Run

1. Paste the entire content into Supabase SQL Editor
2. Click **"Run"** button (or press `Ctrl+Enter`)
3. Wait 1-2 minutes for completion

### Step 4: Verify Success

You should see:
- ✅ "Success. No rows returned" (or similar success message)
- ⚠️ Some "already exists" warnings are OK (means already created)
- ❌ If you see errors, share them with me

### Step 5: Verify Tables Created

1. In Supabase Dashboard, click **"Table Editor"**
2. You should see these tables:
   - ✅ profiles
   - ✅ products
   - ✅ product_variants
   - ✅ orders
   - ✅ categories
   - ✅ **admin_login_attempts** (new)
   - ✅ **admin_sessions** (new)
   - ✅ **admin_2fa_codes** (new)
   - ✅ **admin_audit_log** (new)

## What This Migration Does

### Core E-Commerce Tables
- Users & profiles system
- Products, variants, and images
- Orders and order items
- Categories and banners
- Wishlist and reviews
- Payment tracking

### Admin Security Features (New!)
- **admin_login_attempts** - Rate limiting (5 attempts / 15 min)
- **admin_sessions** - Session management (30-min timeout)
- **admin_2fa_codes** - Two-factor authentication codes
- **admin_audit_log** - Complete action tracking

### Functions Created
- `check_admin_login_rate_limit()` - Check if user can login
- `log_admin_login_attempt()` - Record login attempts
- `generate_admin_2fa_code()` - Create 6-digit codes
- `verify_admin_2fa_code()` - Validate codes
- `create_admin_session()` - Initialize sessions
- `validate_admin_session()` - Check & refresh sessions
- `log_admin_action()` - Log admin actions
- `cleanup_admin_security_data()` - Maintenance
- `promote_user_to_admin()` - Promote users to admin
- Plus seed functions and helper functions

### Auto-Admin Promotion
- Email `kabbalallana38@gmail.com` is automatically promoted to admin on signup

## Troubleshooting

### "relation already exists" errors
✅ **This is fine!** It means tables are already created. Skip these errors.

### "permission denied" errors
❌ **Problem:** You might not have admin access
- Check you're logged into the correct Supabase project
- Make sure you're the project owner

### "syntax error" 
❌ **Problem:** SQL might not have copied correctly
- Make sure you copied the ENTIRE file
- Check no characters were cut off at start/end

### Migration takes too long (>5 minutes)
- Refresh the page and check Table Editor
- Tables might already be created
- Try running just the security migration (see below)

## Alternative: Run Migrations Individually

If the combined file is too large or has issues, run each migration separately:

### Migration 1: Core Schema
File: `supabase/migrations/20251117115946_create_initial_schema.sql`

### Migration 2: Admin Functions
File: `supabase/migrations/20251117121728_add_admin_notes_and_functions.sql`

### Migration 3: Seed Function
File: `supabase/migrations/20251117154006_create_seed_function.sql`

### Migration 4: Fix Seed
File: `supabase/migrations/20251117154045_fix_seed_function.sql`

### Migration 5: Admin Promotion
File: `supabase/migrations/20251117155328_add_admin_promotion_function.sql`

### Migration 6: Cascade Delete
File: `supabase/migrations/20251117195100_add_cascade_delete_for_products.sql`

### Migration 7: Banner Enhancement
File: `supabase/migrations/20251126035400_enhance_banners_for_hero_content.sql`

### Migration 8: Admin Email Auto-Promotion
File: `supabase/migrations/20251126205606_add_admin_email_auto_promotion.sql`

### Migration 9: Admin Security Features ⭐ (Most Important!)
File: `supabase/migrations/20251203163000_add_admin_security_features.sql`

Run each one separately in SQL Editor.

## After Migrations Complete

✅ **Next steps:**

1. **Test connection:**
   ```bash
   npm run dev
   ```
   Should NOT see "Missing Supabase environment variables"

2. **Create admin account:**
   - Go to http://localhost:5174
   - Click "Sign Up"
   - Email: `kabbalallana38@gmail.com`
   - Password: `Lallana99$`
   - Auto-promoted to admin!

3. **Test admin login:**
   - Go to http://localhost:5174/admin/login
   - Login with credentials above
   - Enter 2FA code from console (F12)
   - Access granted!

## Need Help?

If you encounter issues:
1. Share the error message
2. Check which table/function failed
3. I can provide specific fixes

---

**File:** `APPLY_MIGRATIONS.sql` (67 KB)
**Tables Created:** 20+
**Functions Created:** 10+
**Time:** ~2 minutes
