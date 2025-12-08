-- ============================================
-- SECURITY HARDENING: Role-Based Access Control
-- Principle of Least Privilege Implementation
-- ============================================

-- ============================================
-- 1. PROFILES TABLE - Users can only access their own profile
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can only read their own profile (id MUST match auth.uid() from JWT)
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT
  USING (id = auth.uid());

-- Users can only update their own profile
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Profile is created on signup (handled by trigger, but allow self-insert)
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT
  WITH CHECK (id = auth.uid());

-- ============================================
-- 2. ORDERS TABLE - Users can only access their own orders
-- ============================================

DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
DROP POLICY IF EXISTS "orders_select_own" ON orders;
DROP POLICY IF EXISTS "orders_insert_own" ON orders;
DROP POLICY IF EXISTS "orders_select_admin" ON orders;
DROP POLICY IF EXISTS "orders_update_admin" ON orders;

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Regular users can only see their own orders (user_id MUST match auth.uid())
CREATE POLICY "orders_select_own" ON orders
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR 
    -- Admins can see all orders (verified via profiles table, not client claims)
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'manager', 'support')
    )
  );

-- Users can only create orders for themselves
CREATE POLICY "orders_insert_own" ON orders
  FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Only admins can update orders
CREATE POLICY "orders_update_admin" ON orders
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'manager', 'support')
    )
  );

-- ============================================
-- 3. ORDER ITEMS TABLE - Inherit access from orders
-- ============================================

DROP POLICY IF EXISTS "order_items_select" ON order_items;
DROP POLICY IF EXISTS "order_items_insert" ON order_items;

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Users can see order items for orders they own
CREATE POLICY "order_items_select" ON order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND (
        orders.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role IN ('admin', 'manager', 'support')
        )
      )
    )
  );

-- Users can insert order items for their own orders
CREATE POLICY "order_items_insert" ON order_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
    )
  );

-- ============================================
-- 4. PRODUCTS TABLE - Public read, admin write
-- ============================================

DROP POLICY IF EXISTS "products_select_all" ON products;
DROP POLICY IF EXISTS "products_insert_admin" ON products;
DROP POLICY IF EXISTS "products_update_admin" ON products;
DROP POLICY IF EXISTS "products_delete_admin" ON products;

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Anyone can view products (public catalog)
CREATE POLICY "products_select_all" ON products
  FOR SELECT
  USING (true);

-- Only admins can insert products
CREATE POLICY "products_insert_admin" ON products
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'manager')
    )
  );

-- Only admins can update products
CREATE POLICY "products_update_admin" ON products
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'manager')
    )
  );

-- Only admins can delete products
CREATE POLICY "products_delete_admin" ON products
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- 5. WISHLISTS TABLE - Users can only access their own wishlist
-- ============================================

DROP POLICY IF EXISTS "wishlist_select_own" ON wishlists;
DROP POLICY IF EXISTS "wishlist_insert_own" ON wishlists;
DROP POLICY IF EXISTS "wishlist_delete_own" ON wishlists;

ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wishlist_select_own" ON wishlists
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "wishlist_insert_own" ON wishlists
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "wishlist_delete_own" ON wishlists
  FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- 6. ADMIN SESSIONS TABLE - Only own sessions
-- ============================================

DROP POLICY IF EXISTS "admin_sessions_select_own" ON admin_sessions;
DROP POLICY IF EXISTS "admin_sessions_insert_own" ON admin_sessions;
DROP POLICY IF EXISTS "admin_sessions_update_own" ON admin_sessions;

ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_sessions_select_own" ON admin_sessions
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "admin_sessions_insert_own" ON admin_sessions
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "admin_sessions_update_own" ON admin_sessions
  FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================
-- 7. ADMIN LOGIN ATTEMPTS - Admin only access
-- ============================================

DROP POLICY IF EXISTS "admin_login_attempts_admin" ON admin_login_attempts;

ALTER TABLE admin_login_attempts ENABLE ROW LEVEL SECURITY;

-- Only admins can view login attempts
CREATE POLICY "admin_login_attempts_admin" ON admin_login_attempts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- 8. ADMIN AUDIT LOG - Admin only access
-- ============================================

DROP POLICY IF EXISTS "admin_audit_log_admin" ON admin_audit_log;

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "admin_audit_log_admin" ON admin_audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- 9. SERVER-SIDE AUTHORIZATION FUNCTION
-- Verify admin role from JWT, not client claims
-- ============================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'manager', 'support')
  );
$$;

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
$$;

-- ============================================
-- 10. SECURE RPC FUNCTIONS WITH AUTHORIZATION
-- Every function must verify permissions
-- ============================================

-- Secure function to get user's own orders only
CREATE OR REPLACE FUNCTION get_my_orders()
RETURNS SETOF orders
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT * FROM orders 
  WHERE user_id = auth.uid()
  ORDER BY created_at DESC;
$$;

-- Secure function to update order status (admin only)
CREATE OR REPLACE FUNCTION update_order_status(
  order_id UUID,
  new_status TEXT,
  admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- AUTHORIZATION CHECK: Must be admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  -- Validate status
  IF new_status NOT IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;
  
  UPDATE orders 
  SET 
    status = new_status,
    updated_at = NOW()
  WHERE id = order_id;
  
  RETURN FOUND;
END;
$$;

-- ============================================
-- 11. GRANT MINIMAL PERMISSIONS
-- Principle of Least Privilege
-- ============================================

-- Revoke all default permissions
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;

-- Grant only necessary permissions to authenticated users
GRANT SELECT ON products TO anon, authenticated;
GRANT SELECT, INSERT ON orders TO authenticated;
GRANT SELECT, INSERT ON order_items TO authenticated;
GRANT SELECT, UPDATE ON profiles TO authenticated;
GRANT SELECT, INSERT, DELETE ON wishlists TO authenticated;

-- Grant admin permissions via RLS (handled by policies above)
GRANT UPDATE ON orders TO authenticated;
GRANT INSERT, UPDATE, DELETE ON products TO authenticated;

-- Grant execute on safe functions
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION get_my_orders() TO authenticated;
GRANT EXECUTE ON FUNCTION update_order_status(UUID, TEXT, TEXT) TO authenticated;
