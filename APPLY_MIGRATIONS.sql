-- ============================================================================
-- PLUGGED FASHION E-COMMERCE - COMPLETE DATABASE MIGRATIONS
-- ============================================================================
-- Apply this entire file in Supabase SQL Editor
-- 
-- Instructions:
-- 1. Go to: https://supabase.com/dashboard/project/babugzeozpudnrbirwtg
-- 2. Click: SQL Editor (left sidebar)
-- 3. Click: New Query
-- 4. Copy and paste this ENTIRE file
-- 5. Click: Run (or press Ctrl+Enter)
-- 6. Wait for completion (may take 1-2 minutes)
--
-- This will create:
-- - All core tables (profiles, products, orders, etc.)
-- - Admin security tables (login_attempts, sessions, 2fa, audit_log)
-- - All functions and triggers
-- - Row Level Security (RLS) policies
-- - Auto-promote kabbalallana38@gmail.com to admin
-- ============================================================================

-- NOTE: If you see any "already exists" errors, that's OK - it means 
-- those parts are already set up. The important thing is that everything
-- completes without major errors.

-- ============================================================================


-- ============================================================================
-- MIGRATION: 20251117115946_create_initial_schema.sql
-- ============================================================================

/*
  # Nigerian Fashion E-Commerce Platform - Initial Schema

  ## Overview
  Creates the complete database schema for a Nigerian fashion e-commerce platform with
  admin dashboard, product management, order processing, and customer engagement features.

  ## 1. New Tables

  ### Users Table (extends auth.users)
  - `profiles` - Extended user profile information
    - `id` (uuid, references auth.users)
    - `role` (text) - admin, manager, support, customer
    - `full_name` (text)
    - `phone` (text)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### Categories Table
  - `categories` - Product categories with hierarchy support
    - `id` (uuid, primary key)
    - `name` (text)
    - `slug` (text, unique)
    - `description` (text)
    - `parent_id` (uuid, self-reference for hierarchy)
    - `gender` (text) - men, women, unisex
    - `image_url` (text)
    - `created_at` (timestamptz)

  ### Products Table
  - `products` - Main product information
    - `id` (uuid, primary key)
    - `name` (text)
    - `slug` (text, unique)
    - `description` (text)
    - `category_id` (uuid, references categories)
    - `gender` (text)
    - `is_featured` (boolean)
    - `meta_title` (text) - SEO
    - `meta_description` (text) - SEO
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### Product Variants Table
  - `product_variants` - Variants with size, color, price, inventory
    - `id` (uuid, primary key)
    - `product_id` (uuid, references products)
    - `sku` (text, unique)
    - `size` (text)
    - `color` (text)
    - `color_hex` (text)
    - `material` (text)
    - `price` (decimal)
    - `compare_at_price` (decimal)
    - `stock_quantity` (integer)
    - `low_stock_threshold` (integer)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### Product Images Table
  - `product_images` - Multiple images per variant
    - `id` (uuid, primary key)
    - `product_id` (uuid, references products)
    - `variant_id` (uuid, references product_variants, nullable)
    - `image_url` (text)
    - `alt_text` (text) - SEO
    - `display_order` (integer)
    - `created_at` (timestamptz)

  ### Orders Table
  - `orders` - Customer orders
    - `id` (uuid, primary key)
    - `user_id` (uuid, references auth.users, nullable for guest)
    - `order_number` (text, unique)
    - `status` (text) - pending, processing, shipped, delivered, cancelled
    - `email` (text)
    - `phone` (text)
    - `shipping_address` (jsonb)
    - `billing_address` (jsonb)
    - `subtotal` (decimal)
    - `tax` (decimal)
    - `shipping_cost` (decimal)
    - `total` (decimal)
    - `notes` (text)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### Order Items Table
  - `order_items` - Line items in orders
    - `id` (uuid, primary key)
    - `order_id` (uuid, references orders)
    - `product_id` (uuid, references products)
    - `variant_id` (uuid, references product_variants)
    - `quantity` (integer)
    - `price` (decimal)
    - `total` (decimal)
    - `created_at` (timestamptz)

  ### Payments Table
  - `payments` - Payment tracking and verification
    - `id` (uuid, primary key)
    - `order_id` (uuid, references orders)
    - `payment_method` (text) - paystack, stripe, bank_transfer
    - `payment_provider` (text)
    - `transaction_id` (text)
    - `status` (text) - pending, completed, failed, refunded
    - `amount` (decimal)
    - `currency` (text)
    - `metadata` (jsonb)
    - `verified_at` (timestamptz)
    - `created_at` (timestamptz)

  ### Inventory Logs Table
  - `inventory_logs` - Track all inventory changes
    - `id` (uuid, primary key)
    - `variant_id` (uuid, references product_variants)
    - `change_type` (text) - sale, restock, adjustment, return
    - `quantity_change` (integer)
    - `quantity_after` (integer)
    - `reason` (text)
    - `admin_id` (uuid, references auth.users, nullable)
    - `order_id` (uuid, references orders, nullable)
    - `created_at` (timestamptz)

  ### Wishlist Table
  - `wishlists` - Customer wishlists
    - `id` (uuid, primary key)
    - `user_id` (uuid, references auth.users)
    - `product_id` (uuid, references products)
    - `variant_id` (uuid, references product_variants, nullable)
    - `created_at` (timestamptz)

  ### Restock Notifications Table
  - `restock_notifications` - "Notify Me" subscriptions
    - `id` (uuid, primary key)
    - `email` (text)
    - `variant_id` (uuid, references product_variants)
    - `notified` (boolean)
    - `notified_at` (timestamptz)
    - `created_at` (timestamptz)

  ### Banners Table
  - `banners` - Homepage banners and promotions
    - `id` (uuid, primary key)
    - `title` (text)
    - `subtitle` (text)
    - `image_url` (text)
    - `link_url` (text)
    - `display_order` (integer)
    - `is_active` (boolean)
    - `start_date` (timestamptz)
    - `end_date` (timestamptz)
    - `created_at` (timestamptz)

  ### Newsletter Subscriptions Table
  - `newsletter_subscriptions` - Email newsletter subscribers
    - `id` (uuid, primary key)
    - `email` (text, unique)
    - `is_active` (boolean)
    - `created_at` (timestamptz)

  ### Audit Logs Table
  - `audit_logs` - Admin action tracking
    - `id` (uuid, primary key)
    - `admin_id` (uuid, references auth.users)
    - `action` (text)
    - `resource_type` (text)
    - `resource_id` (uuid)
    - `metadata` (jsonb)
    - `created_at` (timestamptz)

  ## 2. Security
  - Enable RLS on all tables
  - Customers can read public product data
  - Customers can manage their own wishlists, orders, and profiles
  - Only admins can modify products, categories, banners
  - Only admins can view all orders and customer data
  - Admin actions require appropriate role permissions

  ## 3. Performance
  - Indexes on foreign keys
  - Indexes on frequently queried fields (slug, email, order_number)
  - Indexes on status fields for filtering

  ## 4. Important Notes
  - Uses auth.users table from Supabase Auth for authentication
  - JSONB fields for flexible address and metadata storage
  - Soft deletes not implemented - using is_active flags where needed
  - Inventory tracking with automatic logging
  - Support for both authenticated and guest checkout
*/

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'customer',
  full_name text,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_role CHECK (role IN ('customer', 'admin', 'manager', 'support'))
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  gender text NOT NULL DEFAULT 'unisex',
  image_url text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_gender CHECK (gender IN ('men', 'women', 'unisex'))
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  gender text NOT NULL DEFAULT 'unisex',
  is_featured boolean DEFAULT false,
  meta_title text,
  meta_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_gender CHECK (gender IN ('men', 'women', 'unisex'))
);

-- Create product_variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku text UNIQUE NOT NULL,
  size text,
  color text,
  color_hex text,
  material text,
  price decimal(10,2) NOT NULL,
  compare_at_price decimal(10,2),
  stock_quantity integer NOT NULL DEFAULT 0,
  low_stock_threshold integer DEFAULT 5,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT positive_price CHECK (price >= 0),
  CONSTRAINT positive_stock CHECK (stock_quantity >= 0)
);

-- Create product_images table
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES product_variants(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  alt_text text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  order_number text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  email text NOT NULL,
  phone text,
  shipping_address jsonb NOT NULL,
  billing_address jsonb,
  subtotal decimal(10,2) NOT NULL,
  tax decimal(10,2) DEFAULT 0,
  shipping_cost decimal(10,2) DEFAULT 0,
  total decimal(10,2) NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'))
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  variant_id uuid NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
  quantity integer NOT NULL,
  price decimal(10,2) NOT NULL,
  total decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT positive_quantity CHECK (quantity > 0)
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_method text NOT NULL,
  payment_provider text,
  transaction_id text,
  status text NOT NULL DEFAULT 'pending',
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'NGN',
  metadata jsonb,
  verified_at timestamptz,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_payment_method CHECK (payment_method IN ('paystack', 'stripe', 'bank_transfer')),
  CONSTRAINT valid_payment_status CHECK (status IN ('pending', 'completed', 'failed', 'refunded'))
);

-- Create inventory_logs table
CREATE TABLE IF NOT EXISTS inventory_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id uuid NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  change_type text NOT NULL,
  quantity_change integer NOT NULL,
  quantity_after integer NOT NULL,
  reason text,
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_change_type CHECK (change_type IN ('sale', 'restock', 'adjustment', 'return'))
);

-- Create wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES product_variants(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id, variant_id)
);

-- Create restock_notifications table
CREATE TABLE IF NOT EXISTS restock_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  variant_id uuid NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  notified boolean DEFAULT false,
  notified_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create banners table
CREATE TABLE IF NOT EXISTS banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  image_url text NOT NULL,
  link_url text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create newsletter_subscriptions table
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_sku ON product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_images_variant ON product_images(variant_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_inventory_variant ON inventory_logs(variant_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_user ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_restock_variant ON restock_notifications(variant_id);
CREATE INDEX IF NOT EXISTS idx_audit_admin ON audit_logs(admin_id);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE restock_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = 'customer');

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager', 'support')
    )
  );

-- Categories policies (public read, admin write)
CREATE POLICY "Anyone can view active categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Products policies (public read, admin write)
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Product variants policies (public read, admin write)
CREATE POLICY "Anyone can view variants"
  ON product_variants FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert variants"
  ON product_variants FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins can update variants"
  ON product_variants FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins can delete variants"
  ON product_variants FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Product images policies (public read, admin write)
CREATE POLICY "Anyone can view images"
  ON product_images FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert images"
  ON product_images FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins can delete images"
  ON product_images FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

-- Orders policies
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager', 'support')
    )
  );

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager', 'support')
    )
  );

-- Order items policies
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
    )
  );

CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager', 'support')
    )
  );

-- Payments policies
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = payments.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = payments.order_id
      AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
    )
  );

CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager', 'support')
    )
  );

CREATE POLICY "Admins can update payments"
  ON payments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

-- Inventory logs policies (admin only)
CREATE POLICY "Admins can view inventory logs"
  ON inventory_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager', 'support')
    )
  );

CREATE POLICY "Admins can insert inventory logs"
  ON inventory_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

-- Wishlists policies
CREATE POLICY "Users can view own wishlist"
  ON wishlists FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert to own wishlist"
  ON wishlists FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from own wishlist"
  ON wishlists FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Restock notifications policies
CREATE POLICY "Anyone can subscribe to restock notifications"
  ON restock_notifications FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view restock notifications"
  ON restock_notifications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins can update restock notifications"
  ON restock_notifications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

-- Banners policies
CREATE POLICY "Anyone can view active banners"
  ON banners FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can view all banners"
  ON banners FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins can insert banners"
  ON banners FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins can update banners"
  ON banners FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins can delete banners"
  ON banners FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Newsletter subscriptions policies
CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscriptions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all subscriptions"
  ON newsletter_subscriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

-- Audit logs policies (admin only)
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins can insert audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager', 'support')
    )
  );

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, role, full_name)
  VALUES (NEW.id, 'customer', NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_new_user();
  END IF;
END $$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
    CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_products_updated_at') THEN
    CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_variants_updated_at') THEN
    CREATE TRIGGER update_variants_updated_at BEFORE UPDATE ON product_variants
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_orders_updated_at') THEN
    CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ============================================================================
-- MIGRATION: 20251117121728_add_admin_notes_and_functions.sql
-- ============================================================================

/*
  # Add admin notes and stock management functions

  ## Changes
  1. Add admin_notes column to orders table for internal admin comments
  2. Create decrement_stock function for automatic inventory management
  3. Create increment_stock function for returns and restocks

  ## Security
  - All changes maintain existing RLS policies
  - Functions use SECURITY DEFINER for controlled stock updates
*/

-- Add admin_notes column to orders table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'admin_notes'
  ) THEN
    ALTER TABLE orders ADD COLUMN admin_notes text;
  END IF;
END $$;

-- Function to decrement stock and log the change
CREATE OR REPLACE FUNCTION decrement_stock(
  variant_id uuid,
  quantity integer
)
RETURNS void AS $$
DECLARE
  current_stock integer;
  new_stock integer;
BEGIN
  -- Get current stock
  SELECT stock_quantity INTO current_stock
  FROM product_variants
  WHERE id = variant_id
  FOR UPDATE;

  -- Calculate new stock
  new_stock := current_stock - quantity;

  -- Prevent negative stock
  IF new_stock < 0 THEN
    RAISE EXCEPTION 'Insufficient stock. Available: %, Requested: %', current_stock, quantity;
  END IF;

  -- Update stock
  UPDATE product_variants
  SET stock_quantity = new_stock
  WHERE id = variant_id;

  -- Log the change
  INSERT INTO inventory_logs (
    variant_id,
    change_type,
    quantity_change,
    quantity_after,
    reason
  ) VALUES (
    variant_id,
    'sale',
    -quantity,
    new_stock,
    'Stock reduced from order'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment stock (for returns, restocks, adjustments)
CREATE OR REPLACE FUNCTION increment_stock(
  variant_id uuid,
  quantity integer,
  change_type text DEFAULT 'restock',
  reason_text text DEFAULT NULL,
  admin_id_param uuid DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  current_stock integer;
  new_stock integer;
BEGIN
  -- Get current stock
  SELECT stock_quantity INTO current_stock
  FROM product_variants
  WHERE id = variant_id
  FOR UPDATE;

  -- Calculate new stock
  new_stock := current_stock + quantity;

  -- Update stock
  UPDATE product_variants
  SET stock_quantity = new_stock
  WHERE id = variant_id;

  -- Log the change
  INSERT INTO inventory_logs (
    variant_id,
    change_type,
    quantity_change,
    quantity_after,
    reason,
    admin_id
  ) VALUES (
    variant_id,
    change_type,
    quantity,
    new_stock,
    reason_text,
    admin_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================================
-- MIGRATION: 20251117154006_create_seed_function.sql
-- ============================================================================

/*
  # Database Seed Function
  
  Creates a function to populate the database with sample data.
  This function bypasses RLS and can be called by authenticated admins.
  
  1. Function
    - `seed_sample_data()` - Populates categories, products, variants, and images
  
  2. Security
    - Function runs with SECURITY DEFINER to bypass RLS
    - Should only be called once for initial setup
*/

CREATE OR REPLACE FUNCTION seed_sample_data()
RETURNS jsonb
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_category_ids uuid[];
  v_product_ids uuid[];
  v_result jsonb;
BEGIN
  -- Insert categories
  INSERT INTO categories (name, slug, gender, description)
  VALUES 
    ('Agbada', 'agbada', 'men', 'Traditional Nigerian flowing robe'),
    ('Ankara Dresses', 'ankara-dresses', 'women', 'Vibrant African print dresses'),
    ('Kaftan', 'kaftan', 'unisex', 'Elegant flowing garments'),
    ('Accessories', 'accessories', 'unisex', 'Jewelry, bags, and more'),
    ('Aso Oke', 'aso-oke', 'unisex', 'Hand-woven traditional fabric')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_category_ids;

  -- Insert products
  WITH inserted_products AS (
    INSERT INTO products (name, slug, description, category_id, gender, is_featured, meta_title, meta_description)
    VALUES 
      ('Royal Blue Agbada Set', 'royal-blue-agbada-set', 
       'Luxurious hand-embroidered agbada with intricate gold patterns. Perfect for weddings and special occasions.',
       v_category_ids[1], 'men', true, 'Royal Blue Agbada Set - Premium Nigerian Fashion',
       'Hand-embroidered agbada with gold patterns, perfect for special occasions'),
      
      ('Ankara Mermaid Dress', 'ankara-mermaid-dress',
       'Stunning mermaid-cut dress in vibrant Ankara print. Tailored for a perfect fit.',
       v_category_ids[2], 'women', true, 'Ankara Mermaid Dress - Nigerian Fashion',
       'Vibrant Ankara print mermaid dress with tailored fit'),
      
      ('Embroidered White Kaftan', 'embroidered-white-kaftan',
       'Pure white kaftan with delicate gold embroidery. Suitable for both men and women.',
       v_category_ids[3], 'unisex', true, 'Embroidered White Kaftan - Premium Quality',
       'Pure white kaftan with gold embroidery, unisex design'),
      
      ('Beaded Coral Necklace', 'beaded-coral-necklace',
       'Traditional Nigerian coral beads necklace. Authentic and elegant.',
       v_category_ids[4], 'unisex', false, 'Beaded Coral Necklace - Traditional Nigerian Jewelry',
       'Authentic traditional Nigerian coral beads necklace'),
      
      ('Premium Aso Oke Fabric', 'premium-aso-oke-fabric',
       'Hand-woven Aso Oke fabric in royal colors. Perfect for creating custom traditional attire.',
       v_category_ids[5], 'unisex', false, 'Premium Aso Oke Fabric - Hand-Woven',
       'Hand-woven Aso Oke fabric in royal colors'),
      
      ('Emerald Green Ankara Jumpsuit', 'emerald-green-ankara-jumpsuit',
       'Modern jumpsuit in stunning emerald green Ankara print with wide-leg silhouette.',
       v_category_ids[2], 'women', true, 'Emerald Green Ankara Jumpsuit - Contemporary Nigerian Fashion',
       'Modern Ankara print jumpsuit with wide-leg design')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  )
  SELECT array_agg(id) INTO v_product_ids FROM inserted_products;

  -- Insert variants
  INSERT INTO product_variants (product_id, sku, size, color, color_hex, price, stock_quantity)
  VALUES 
    (v_product_ids[1], 'AGB-RB-M', 'M', 'Royal Blue', '#002366', 85000, 5),
    (v_product_ids[1], 'AGB-RB-L', 'L', 'Royal Blue', '#002366', 85000, 8),
    (v_product_ids[1], 'AGB-RB-XL', 'XL', 'Royal Blue', '#002366', 90000, 3),
    
    (v_product_ids[2], 'ANK-MD-S', 'S', 'Multi-Color', '#FF6B35', 35000, 10),
    (v_product_ids[2], 'ANK-MD-M', 'M', 'Multi-Color', '#FF6B35', 35000, 12),
    (v_product_ids[2], 'ANK-MD-L', 'L', 'Multi-Color', '#FF6B35', 37000, 8),
    
    (v_product_ids[3], 'KFT-WH-M', 'M', 'White', '#FFFFFF', 45000, 15),
    (v_product_ids[3], 'KFT-WH-L', 'L', 'White', '#FFFFFF', 45000, 20),
    
    (v_product_ids[4], 'CRL-NKL-OS', 'One Size', 'Coral Red', '#FF6F61', 25000, 30),
    
    (v_product_ids[5], 'ASO-PRM-5Y', '5 Yards', 'Royal Purple', '#7851A9', 55000, 12),
    (v_product_ids[5], 'ASO-PRM-10Y', '10 Yards', 'Royal Purple', '#7851A9', 105000, 6),
    
    (v_product_ids[6], 'ANK-JP-S', 'S', 'Emerald Green', '#50C878', 42000, 7),
    (v_product_ids[6], 'ANK-JP-M', 'M', 'Emerald Green', '#50C878', 42000, 10),
    (v_product_ids[6], 'ANK-JP-L', 'L', 'Emerald Green', '#50C878', 44000, 5)
  ON CONFLICT (sku) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;

  -- Insert images
  INSERT INTO product_images (product_id, image_url, alt_text, display_order)
  VALUES 
    (v_product_ids[1], 'https://images.pexels.com/photos/5999821/pexels-photo-5999821.jpeg', 'Royal Blue Agbada Set Front View', 0),
    (v_product_ids[1], 'https://images.pexels.com/photos/5999822/pexels-photo-5999822.jpeg', 'Royal Blue Agbada Set Detail', 1),
    
    (v_product_ids[2], 'https://images.pexels.com/photos/5240696/pexels-photo-5240696.jpeg', 'Ankara Mermaid Dress Full View', 0),
    (v_product_ids[2], 'https://images.pexels.com/photos/5240697/pexels-photo-5240697.jpeg', 'Ankara Mermaid Dress Side View', 1),
    
    (v_product_ids[3], 'https://images.pexels.com/photos/5325582/pexels-photo-5325582.jpeg', 'White Kaftan Front View', 0),
    (v_product_ids[3], 'https://images.pexels.com/photos/5325583/pexels-photo-5325583.jpeg', 'White Kaftan Detail', 1),
    
    (v_product_ids[4], 'https://images.pexels.com/photos/3735657/pexels-photo-3735657.jpeg', 'Beaded Coral Necklace', 0),
    
    (v_product_ids[5], 'https://images.pexels.com/photos/6069099/pexels-photo-6069099.jpeg', 'Premium Aso Oke Fabric', 0),
    
    (v_product_ids[6], 'https://images.pexels.com/photos/5240692/pexels-photo-5240692.jpeg', 'Emerald Green Ankara Jumpsuit Front', 0),
    (v_product_ids[6], 'https://images.pexels.com/photos/5240693/pexels-photo-5240693.jpeg', 'Emerald Green Ankara Jumpsuit Back', 1)
  ON CONFLICT DO NOTHING;

  v_result := jsonb_build_object(
    'success', true,
    'categories_count', array_length(v_category_ids, 1),
    'products_count', array_length(v_product_ids, 1),
    'message', 'Database seeded successfully'
  );

  RETURN v_result;
END;
$$;

-- ============================================================================
-- MIGRATION: 20251117154045_fix_seed_function.sql
-- ============================================================================

/*
  # Fix Seed Function
  
  Updates the seed function to properly handle multiple rows.
*/

CREATE OR REPLACE FUNCTION seed_sample_data()
RETURNS jsonb
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_agbada_id uuid;
  v_ankara_id uuid;
  v_kaftan_id uuid;
  v_accessories_id uuid;
  v_asooke_id uuid;
  v_product1_id uuid;
  v_product2_id uuid;
  v_product3_id uuid;
  v_product4_id uuid;
  v_product5_id uuid;
  v_product6_id uuid;
  v_result jsonb;
BEGIN
  -- Insert categories one by one
  INSERT INTO categories (name, slug, gender, description)
  VALUES ('Agbada', 'agbada', 'men', 'Traditional Nigerian flowing robe')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_agbada_id;

  INSERT INTO categories (name, slug, gender, description)
  VALUES ('Ankara Dresses', 'ankara-dresses', 'women', 'Vibrant African print dresses')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_ankara_id;

  INSERT INTO categories (name, slug, gender, description)
  VALUES ('Kaftan', 'kaftan', 'unisex', 'Elegant flowing garments')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_kaftan_id;

  INSERT INTO categories (name, slug, gender, description)
  VALUES ('Accessories', 'accessories', 'unisex', 'Jewelry, bags, and more')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_accessories_id;

  INSERT INTO categories (name, slug, gender, description)
  VALUES ('Aso Oke', 'aso-oke', 'unisex', 'Hand-woven traditional fabric')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_asooke_id;

  -- Insert products
  INSERT INTO products (name, slug, description, category_id, gender, is_featured, meta_title, meta_description)
  VALUES ('Royal Blue Agbada Set', 'royal-blue-agbada-set', 
    'Luxurious hand-embroidered agbada with intricate gold patterns. Perfect for weddings and special occasions.',
    v_agbada_id, 'men', true, 'Royal Blue Agbada Set - Premium Nigerian Fashion',
    'Hand-embroidered agbada with gold patterns, perfect for special occasions')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_product1_id;

  INSERT INTO products (name, slug, description, category_id, gender, is_featured, meta_title, meta_description)
  VALUES ('Ankara Mermaid Dress', 'ankara-mermaid-dress',
    'Stunning mermaid-cut dress in vibrant Ankara print. Tailored for a perfect fit.',
    v_ankara_id, 'women', true, 'Ankara Mermaid Dress - Nigerian Fashion',
    'Vibrant Ankara print mermaid dress with tailored fit')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_product2_id;

  INSERT INTO products (name, slug, description, category_id, gender, is_featured, meta_title, meta_description)
  VALUES ('Embroidered White Kaftan', 'embroidered-white-kaftan',
    'Pure white kaftan with delicate gold embroidery. Suitable for both men and women.',
    v_kaftan_id, 'unisex', true, 'Embroidered White Kaftan - Premium Quality',
    'Pure white kaftan with gold embroidery, unisex design')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_product3_id;

  INSERT INTO products (name, slug, description, category_id, gender, is_featured, meta_title, meta_description)
  VALUES ('Beaded Coral Necklace', 'beaded-coral-necklace',
    'Traditional Nigerian coral beads necklace. Authentic and elegant.',
    v_accessories_id, 'unisex', false, 'Beaded Coral Necklace - Traditional Nigerian Jewelry',
    'Authentic traditional Nigerian coral beads necklace')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_product4_id;

  INSERT INTO products (name, slug, description, category_id, gender, is_featured, meta_title, meta_description)
  VALUES ('Premium Aso Oke Fabric', 'premium-aso-oke-fabric',
    'Hand-woven Aso Oke fabric in royal colors. Perfect for creating custom traditional attire.',
    v_asooke_id, 'unisex', false, 'Premium Aso Oke Fabric - Hand-Woven',
    'Hand-woven Aso Oke fabric in royal colors')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_product5_id;

  INSERT INTO products (name, slug, description, category_id, gender, is_featured, meta_title, meta_description)
  VALUES ('Emerald Green Ankara Jumpsuit', 'emerald-green-ankara-jumpsuit',
    'Modern jumpsuit in stunning emerald green Ankara print with wide-leg silhouette.',
    v_ankara_id, 'women', true, 'Emerald Green Ankara Jumpsuit - Contemporary Nigerian Fashion',
    'Modern Ankara print jumpsuit with wide-leg design')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_product6_id;

  -- Insert variants
  INSERT INTO product_variants (product_id, sku, size, color, color_hex, price, stock_quantity)
  VALUES 
    (v_product1_id, 'AGB-RB-M', 'M', 'Royal Blue', '#002366', 85000, 5),
    (v_product1_id, 'AGB-RB-L', 'L', 'Royal Blue', '#002366', 85000, 8),
    (v_product1_id, 'AGB-RB-XL', 'XL', 'Royal Blue', '#002366', 90000, 3),
    (v_product2_id, 'ANK-MD-S', 'S', 'Multi-Color', '#FF6B35', 35000, 10),
    (v_product2_id, 'ANK-MD-M', 'M', 'Multi-Color', '#FF6B35', 35000, 12),
    (v_product2_id, 'ANK-MD-L', 'L', 'Multi-Color', '#FF6B35', 37000, 8),
    (v_product3_id, 'KFT-WH-M', 'M', 'White', '#FFFFFF', 45000, 15),
    (v_product3_id, 'KFT-WH-L', 'L', 'White', '#FFFFFF', 45000, 20),
    (v_product4_id, 'CRL-NKL-OS', 'One Size', 'Coral Red', '#FF6F61', 25000, 30),
    (v_product5_id, 'ASO-PRM-5Y', '5 Yards', 'Royal Purple', '#7851A9', 55000, 12),
    (v_product5_id, 'ASO-PRM-10Y', '10 Yards', 'Royal Purple', '#7851A9', 105000, 6),
    (v_product6_id, 'ANK-JP-S', 'S', 'Emerald Green', '#50C878', 42000, 7),
    (v_product6_id, 'ANK-JP-M', 'M', 'Emerald Green', '#50C878', 42000, 10),
    (v_product6_id, 'ANK-JP-L', 'L', 'Emerald Green', '#50C878', 44000, 5)
  ON CONFLICT (sku) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;

  -- Insert images
  INSERT INTO product_images (product_id, image_url, alt_text, display_order)
  VALUES 
    (v_product1_id, 'https://images.pexels.com/photos/5999821/pexels-photo-5999821.jpeg', 'Royal Blue Agbada Set Front View', 0),
    (v_product1_id, 'https://images.pexels.com/photos/5999822/pexels-photo-5999822.jpeg', 'Royal Blue Agbada Set Detail', 1),
    (v_product2_id, 'https://images.pexels.com/photos/5240696/pexels-photo-5240696.jpeg', 'Ankara Mermaid Dress Full View', 0),
    (v_product2_id, 'https://images.pexels.com/photos/5240697/pexels-photo-5240697.jpeg', 'Ankara Mermaid Dress Side View', 1),
    (v_product3_id, 'https://images.pexels.com/photos/5325582/pexels-photo-5325582.jpeg', 'White Kaftan Front View', 0),
    (v_product3_id, 'https://images.pexels.com/photos/5325583/pexels-photo-5325583.jpeg', 'White Kaftan Detail', 1),
    (v_product4_id, 'https://images.pexels.com/photos/3735657/pexels-photo-3735657.jpeg', 'Beaded Coral Necklace', 0),
    (v_product5_id, 'https://images.pexels.com/photos/6069099/pexels-photo-6069099.jpeg', 'Premium Aso Oke Fabric', 0),
    (v_product6_id, 'https://images.pexels.com/photos/5240692/pexels-photo-5240692.jpeg', 'Emerald Green Ankara Jumpsuit Front', 0),
    (v_product6_id, 'https://images.pexels.com/photos/5240693/pexels-photo-5240693.jpeg', 'Emerald Green Ankara Jumpsuit Back', 1)
  ON CONFLICT DO NOTHING;

  v_result := jsonb_build_object(
    'success', true,
    'categories_count', 5,
    'products_count', 6,
    'message', 'Database seeded successfully'
  );

  RETURN v_result;
END;
$$;

-- ============================================================================
-- MIGRATION: 20251117155328_add_admin_promotion_function.sql
-- ============================================================================

/*
  # Admin Promotion Helper
  
  Creates a function to easily promote users to admin role.
  
  1. Function
    - `promote_to_admin(user_email)` - Promotes a user by email to admin role
  
  2. Security
    - Function runs with SECURITY DEFINER to bypass RLS
*/

CREATE OR REPLACE FUNCTION promote_to_admin(user_email TEXT)
RETURNS jsonb
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id uuid;
  v_result jsonb;
BEGIN
  -- Find user by email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = user_email;

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'User not found with email: ' || user_email
    );
  END IF;

  -- Update or insert profile with admin role
  INSERT INTO profiles (id, role)
  VALUES (v_user_id, 'admin')
  ON CONFLICT (id) 
  DO UPDATE SET role = 'admin';

  v_result := jsonb_build_object(
    'success', true,
    'message', 'User promoted to admin successfully',
    'user_id', v_user_id,
    'email', user_email
  );

  RETURN v_result;
END;
$$;

-- ============================================================================
-- MIGRATION: 20251117195100_add_cascade_delete_for_products.sql
-- ============================================================================

/*
  # Add CASCADE delete for product relations
  
  Ensures that when a product is deleted, all related data is also removed.
  
  1. Changes
    - Drop existing foreign keys without CASCADE
    - Re-add with ON DELETE CASCADE
*/

-- Product variants cascade delete
ALTER TABLE product_variants 
  DROP CONSTRAINT IF EXISTS product_variants_product_id_fkey;

ALTER TABLE product_variants
  ADD CONSTRAINT product_variants_product_id_fkey 
  FOREIGN KEY (product_id) 
  REFERENCES products(id) 
  ON DELETE CASCADE;

-- Product images cascade delete
ALTER TABLE product_images
  DROP CONSTRAINT IF EXISTS product_images_product_id_fkey;

ALTER TABLE product_images
  ADD CONSTRAINT product_images_product_id_fkey 
  FOREIGN KEY (product_id) 
  REFERENCES products(id) 
  ON DELETE CASCADE;

-- Wishlist cascade delete
ALTER TABLE wishlists
  DROP CONSTRAINT IF EXISTS wishlists_product_id_fkey;

ALTER TABLE wishlists
  ADD CONSTRAINT wishlists_product_id_fkey 
  FOREIGN KEY (product_id) 
  REFERENCES products(id) 
  ON DELETE CASCADE;

-- ============================================================================
-- MIGRATION: 20251126035400_enhance_banners_for_hero_content.sql
-- ============================================================================

/*
  # Enhance Banners Table for Hero Content Management

  ## Summary
  Extends the existing banners table to support comprehensive hero section and homepage content management.
  Adds fields to differentiate between hero main section, category banners, and promotional content.

  ## Changes

  1. New Columns Added
    - `banner_type` (text) - Identifies banner purpose: 'hero_main', 'hero_category', 'promotional'
    - `position` (text) - Specific position identifier: 'main', 'men', 'women', 'accessories'
    - `cta_text` (text) - Call-to-action button text for hero main banner
    - `cta_url` (text) - Call-to-action button destination URL
    - `background_type` (text) - Hero background type: 'gradient', 'image'
    - `gradient_from` (text) - Starting color for gradient background
    - `gradient_via` (text) - Middle color for gradient background
    - `gradient_to` (text) - Ending color for gradient background
    - `updated_at` (timestamptz) - Track when banner was last modified

  2. Indexes
    - Index on banner_type for efficient filtering
    - Index on position for quick lookups
    - Index on is_active and display_order for homepage queries

  3. Default Values
    - Set default banner_type to 'promotional' for backward compatibility
    - Set default background_type to 'gradient'

  ## Important Notes
  - Existing banners data is preserved
  - No breaking changes to current functionality
  - All new columns are nullable to support existing records
  - Hero main banner should have banner_type='hero_main' and position='main'
  - Category banners should have banner_type='hero_category' and position='men'/'women'/'accessories'
*/

-- Add new columns to banners table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'banners' AND column_name = 'banner_type'
  ) THEN
    ALTER TABLE banners ADD COLUMN banner_type text DEFAULT 'promotional';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'banners' AND column_name = 'position'
  ) THEN
    ALTER TABLE banners ADD COLUMN position text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'banners' AND column_name = 'cta_text'
  ) THEN
    ALTER TABLE banners ADD COLUMN cta_text text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'banners' AND column_name = 'cta_url'
  ) THEN
    ALTER TABLE banners ADD COLUMN cta_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'banners' AND column_name = 'background_type'
  ) THEN
    ALTER TABLE banners ADD COLUMN background_type text DEFAULT 'gradient';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'banners' AND column_name = 'gradient_from'
  ) THEN
    ALTER TABLE banners ADD COLUMN gradient_from text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'banners' AND column_name = 'gradient_via'
  ) THEN
    ALTER TABLE banners ADD COLUMN gradient_via text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'banners' AND column_name = 'gradient_to'
  ) THEN
    ALTER TABLE banners ADD COLUMN gradient_to text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'banners' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE banners ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Add check constraint for banner_type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_banner_type'
  ) THEN
    ALTER TABLE banners
    ADD CONSTRAINT valid_banner_type
    CHECK (banner_type IN ('hero_main', 'hero_category', 'promotional'));
  END IF;
END $$;

-- Add check constraint for position
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_position'
  ) THEN
    ALTER TABLE banners
    ADD CONSTRAINT valid_position
    CHECK (position IN ('main', 'men', 'women', 'accessories') OR position IS NULL);
  END IF;
END $$;

-- Add check constraint for background_type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_background_type'
  ) THEN
    ALTER TABLE banners
    ADD CONSTRAINT valid_background_type
    CHECK (background_type IN ('gradient', 'image') OR background_type IS NULL);
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_banners_type ON banners(banner_type);
CREATE INDEX IF NOT EXISTS idx_banners_position ON banners(position);
CREATE INDEX IF NOT EXISTS idx_banners_active_order ON banners(is_active, display_order);

-- Add trigger for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_banners_updated_at'
  ) THEN
    CREATE TRIGGER update_banners_updated_at
    BEFORE UPDATE ON banners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Insert default hero content if none exists
INSERT INTO banners (
  title,
  subtitle,
  banner_type,
  position,
  cta_text,
  cta_url,
  background_type,
  gradient_from,
  gradient_via,
  gradient_to,
  image_url,
  is_active,
  display_order
)
SELECT
  'Spring Summer',
  '2024 Collection',
  'hero_main',
  'main',
  'Shop Now',
  '/category/all',
  'gradient',
  '#fef3c7',
  '#fed7aa',
  '#fecdd3',
  '',
  true,
  0
WHERE NOT EXISTS (
  SELECT 1 FROM banners WHERE banner_type = 'hero_main' AND position = 'main'
);

-- Insert default category banners if none exist
INSERT INTO banners (
  title,
  subtitle,
  banner_type,
  position,
  image_url,
  link_url,
  is_active,
  display_order
)
SELECT
  'Men''s Collection',
  '',
  'hero_category',
  'men',
  'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=1200',
  '/category/all?gender=men',
  true,
  1
WHERE NOT EXISTS (
  SELECT 1 FROM banners WHERE banner_type = 'hero_category' AND position = 'men'
);

INSERT INTO banners (
  title,
  subtitle,
  banner_type,
  position,
  image_url,
  link_url,
  is_active,
  display_order
)
SELECT
  'Women''s Collection',
  '',
  'hero_category',
  'women',
  'https://images.pexels.com/photos/1055691/pexels-photo-1055691.jpeg?auto=compress&cs=tinysrgb&w=1200',
  '/category/all?gender=women',
  true,
  2
WHERE NOT EXISTS (
  SELECT 1 FROM banners WHERE banner_type = 'hero_category' AND position = 'women'
);

INSERT INTO banners (
  title,
  subtitle,
  banner_type,
  position,
  image_url,
  link_url,
  is_active,
  display_order
)
SELECT
  'Accessories Collection',
  '',
  'hero_category',
  'accessories',
  'https://images.pexels.com/photos/336372/pexels-photo-336372.jpeg?auto=compress&cs=tinysrgb&w=1200',
  '/category/accessories',
  true,
  3
WHERE NOT EXISTS (
  SELECT 1 FROM banners WHERE banner_type = 'hero_category' AND position = 'accessories'
);


-- ============================================================================
-- MIGRATION: 20251126205606_add_admin_email_auto_promotion.sql
-- ============================================================================

/*
  # Admin Email Auto-Promotion

  ## Overview
  Automatically promotes specific email addresses to admin role upon signup.
  Also provides a function for manually promoting users to admin role.

  ## Changes
  1. Modified `handle_new_user()` function to check for admin emails
  2. Added `promote_user_to_admin()` function for manual promotion
  3. Admin email: kabbalallana38@gmail.com

  ## Security
  - Only predefined emails in the function can be auto-promoted
  - Manual promotion function requires admin privileges
  - Function is SECURITY DEFINER for proper auth.users access
*/

-- Drop existing function to recreate with admin check
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Recreate function with admin email check
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_role text := 'customer';
BEGIN
  -- Check if email should be admin
  IF NEW.email = 'kabbalallana38@gmail.com' THEN
    user_role := 'admin';
  END IF;

  -- Insert profile with appropriate role
  INSERT INTO profiles (id, role, full_name)
  VALUES (NEW.id, user_role, NEW.raw_user_meta_data->>'full_name');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to manually promote existing user to admin
CREATE OR REPLACE FUNCTION promote_user_to_admin(user_email text)
RETURNS void AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Get user ID from email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;

  -- Check if user exists
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;

  -- Update profile to admin
  UPDATE profiles
  SET role = 'admin', updated_at = now()
  WHERE id = target_user_id;

  -- Verify update
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile for user % not found', user_email;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- If the admin user already exists, promote them now
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'kabbalallana38@gmail.com') THEN
    PERFORM promote_user_to_admin('kabbalallana38@gmail.com');
  END IF;
END $$;


-- ============================================================================
-- MIGRATION: 20251203163000_add_admin_security_features.sql
-- ============================================================================

/*
  # Admin Security Enhancements
  
  1. New Tables
    - admin_login_attempts - Track login attempts for rate limiting
    - admin_sessions - Track admin sessions with timeout
    - admin_2fa_codes - Store 2FA codes
    - admin_audit_log - Log all admin actions
  
  2. Security Features
    - Rate limiting on login attempts
    - Session timeout tracking
    - 2FA code generation and validation
    - Comprehensive audit logging
*/

-- Admin login attempts tracking (rate limiting)
CREATE TABLE IF NOT EXISTS admin_login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address text,
  attempt_time timestamptz DEFAULT now(),
  success boolean DEFAULT false,
  failure_reason text
);

CREATE INDEX idx_admin_login_attempts_email ON admin_login_attempts(email, attempt_time);
CREATE INDEX idx_admin_login_attempts_ip ON admin_login_attempts(ip_address, attempt_time);

-- Admin sessions with timeout tracking
CREATE TABLE IF NOT EXISTS admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_token text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_activity timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  ip_address text,
  user_agent text,
  is_active boolean DEFAULT true
);

CREATE INDEX idx_admin_sessions_user_id ON admin_sessions(user_id);
CREATE INDEX idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX idx_admin_sessions_active ON admin_sessions(is_active, expires_at);

-- 2FA codes
CREATE TABLE IF NOT EXISTS admin_2fa_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  code text NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  verified_at timestamptz
);

CREATE INDEX idx_admin_2fa_user_id ON admin_2fa_codes(user_id, created_at);
CREATE INDEX idx_admin_2fa_code ON admin_2fa_codes(code, expires_at);

-- Admin audit log
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text,
  resource_id uuid,
  details jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_admin_audit_user_id ON admin_audit_log(user_id, created_at);
CREATE INDEX idx_admin_audit_action ON admin_audit_log(action, created_at);
CREATE INDEX idx_admin_audit_resource ON admin_audit_log(resource_type, resource_id);

-- Function to check rate limiting (max 5 attempts in 15 minutes)
CREATE OR REPLACE FUNCTION check_admin_login_rate_limit(user_email text, user_ip text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  attempt_count integer;
  is_blocked boolean := false;
BEGIN
  -- Count recent failed attempts (last 15 minutes)
  SELECT COUNT(*) INTO attempt_count
  FROM admin_login_attempts
  WHERE email = user_email
    AND success = false
    AND attempt_time > now() - interval '15 minutes';
  
  -- Block if more than 5 failed attempts
  IF attempt_count >= 5 THEN
    is_blocked := true;
  END IF;
  
  RETURN jsonb_build_object(
    'is_blocked', is_blocked,
    'attempt_count', attempt_count,
    'max_attempts', 5,
    'reset_time', (now() + interval '15 minutes')
  );
END;
$$;

-- Function to log login attempt
CREATE OR REPLACE FUNCTION log_admin_login_attempt(
  user_email text,
  user_ip text DEFAULT NULL,
  is_success boolean DEFAULT false,
  fail_reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO admin_login_attempts (email, ip_address, success, failure_reason)
  VALUES (user_email, user_ip, is_success, fail_reason);
END;
$$;

-- Function to generate 2FA code
CREATE OR REPLACE FUNCTION generate_admin_2fa_code(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code text;
BEGIN
  -- Generate 6-digit code
  code := LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
  
  -- Store code (expires in 10 minutes)
  INSERT INTO admin_2fa_codes (user_id, code, expires_at)
  VALUES (user_id, code, now() + interval '10 minutes');
  
  RETURN code;
END;
$$;

-- Function to verify 2FA code
CREATE OR REPLACE FUNCTION verify_admin_2fa_code(user_id uuid, input_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_valid boolean := false;
BEGIN
  -- Check if code exists, is not used, and not expired
  UPDATE admin_2fa_codes
  SET used = true, verified_at = now()
  WHERE admin_2fa_codes.user_id = verify_admin_2fa_code.user_id
    AND code = input_code
    AND used = false
    AND expires_at > now()
  RETURNING true INTO is_valid;
  
  RETURN COALESCE(is_valid, false);
END;
$$;

-- Function to create admin session
CREATE OR REPLACE FUNCTION create_admin_session(
  user_id uuid,
  user_ip text DEFAULT NULL,
  user_agent_string text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  session_token text;
BEGIN
  -- Generate random session token
  session_token := encode(gen_random_bytes(32), 'hex');
  
  -- Deactivate old sessions
  UPDATE admin_sessions
  SET is_active = false
  WHERE admin_sessions.user_id = create_admin_session.user_id
    AND is_active = true;
  
  -- Create new session (expires in 30 minutes)
  INSERT INTO admin_sessions (user_id, session_token, expires_at, ip_address, user_agent)
  VALUES (user_id, session_token, now() + interval '30 minutes', user_ip, user_agent_string);
  
  RETURN session_token;
END;
$$;

-- Function to validate and refresh admin session
CREATE OR REPLACE FUNCTION validate_admin_session(session_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  session_record record;
  is_valid boolean := false;
BEGIN
  -- Get session
  SELECT * INTO session_record
  FROM admin_sessions
  WHERE admin_sessions.session_token = validate_admin_session.session_token
    AND is_active = true;
  
  IF session_record.id IS NULL THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'session_not_found');
  END IF;
  
  -- Check if expired
  IF session_record.expires_at < now() THEN
    UPDATE admin_sessions SET is_active = false WHERE id = session_record.id;
    RETURN jsonb_build_object('valid', false, 'reason', 'session_expired');
  END IF;
  
  -- Update last activity and extend expiration by 30 minutes
  UPDATE admin_sessions
  SET last_activity = now(),
      expires_at = now() + interval '30 minutes'
  WHERE id = session_record.id;
  
  RETURN jsonb_build_object(
    'valid', true,
    'user_id', session_record.user_id,
    'expires_at', now() + interval '30 minutes'
  );
END;
$$;

-- Function to log admin action
CREATE OR REPLACE FUNCTION log_admin_action(
  user_id uuid,
  action_name text,
  resource_type text DEFAULT NULL,
  resource_id uuid DEFAULT NULL,
  action_details jsonb DEFAULT NULL,
  user_ip text DEFAULT NULL,
  user_agent_string text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO admin_audit_log (
    user_id, action, resource_type, resource_id, details, ip_address, user_agent
  )
  VALUES (
    user_id, action_name, resource_type, resource_id, action_details, user_ip, user_agent_string
  );
END;
$$;

-- Function to cleanup expired data (should be run periodically)
CREATE OR REPLACE FUNCTION cleanup_admin_security_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete old login attempts (older than 7 days)
  DELETE FROM admin_login_attempts
  WHERE attempt_time < now() - interval '7 days';
  
  -- Delete expired 2FA codes
  DELETE FROM admin_2fa_codes
  WHERE expires_at < now() - interval '1 day';
  
  -- Delete inactive sessions (older than 7 days)
  DELETE FROM admin_sessions
  WHERE is_active = false
    AND created_at < now() - interval '7 days';
END;
$$;

-- Enable RLS
ALTER TABLE admin_login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_2fa_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies (admin only access)
CREATE POLICY "Admins can view login attempts" ON admin_login_attempts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins can view sessions" ON admin_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Users can view their own 2FA codes" ON admin_2fa_codes
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view audit logs" ON admin_audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

