# 🚨 URGENT FIX - Category Dropdown Not Working

## The Problem
The category dropdown shows "Select Category" but no options appear when clicked. This is a **database permissions issue** (RLS - Row Level Security).

## The Solution - Run This SQL NOW

### Step 1: Open Supabase SQL Editor
Go to: https://supabase.com/dashboard/project/babugzeozpudnrbirwtg/sql/new

### Step 2: Copy and Paste This ENTIRE SQL Block

```sql
-- ============================================================================
-- FIX 1: Add categories if they don't exist
-- ============================================================================
INSERT INTO categories (name, slug, gender, description, created_at)
VALUES
  ('Agbada', 'agbada', 'men', 'Traditional Nigerian flowing robe', now()),
  ('Ankara Dresses', 'ankara-dresses', 'women', 'Vibrant African print dresses', now()),
  ('Kaftan', 'kaftan', 'unisex', 'Elegant flowing garments', now()),
  ('Accessories', 'accessories', 'unisex', 'Jewelry, bags, and more', now()),
  ('Aso Oke', 'aso-oke', 'unisex', 'Hand-woven traditional fabric', now())
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- FIX 2: Fix permissions so categories can be read
-- ============================================================================

-- Drop any restrictive policies
DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON categories;
DROP POLICY IF EXISTS "Public categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;

-- Allow EVERYONE to read categories (safe - categories are public data)
CREATE POLICY "Anyone can view categories"
ON categories
FOR SELECT
TO public
USING (true);

-- Allow admins to manage categories
CREATE POLICY "Admins can manage categories"
ON categories
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager', 'support')
  )
);

-- Ensure RLS is enabled
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- VERIFY: Check that it worked
-- ============================================================================
SELECT 
  '✅ Categories in database:' as status,
  COUNT(*) as count 
FROM categories;

SELECT name, slug, gender FROM categories ORDER BY name;
```

### Step 3: Click "Run" (or press Ctrl+Enter)

You should see:
- "✅ Categories in database: 5"
- List of 5 categories

### Step 4: Test the Dropdown
1. Go back to your admin panel: `http://localhost:5173/admin/products/new`
2. Click the "Select Category" dropdown
3. **You should now see 5 options!** 🎉

---

## If It STILL Doesn't Work

### Check Browser Console:
1. Press `F12` in your browser
2. Go to the "Console" tab
3. Look for the line that says: `Categories fetched: ...`
4. Tell me what it shows - this will tell us the exact error

### Alternative: Disable RLS Temporarily
If you want to just get it working FAST (for testing only):

```sql
-- TEMPORARY FIX - Disable RLS (not recommended for production)
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
```

Then refresh the product page. The dropdown should work.

---

## Why This Happened
The `categories` table has Row Level Security (RLS) enabled, which blocks reads unless there's a policy. The SQL above creates a policy that allows everyone to read categories (which is safe since categories are public information).
