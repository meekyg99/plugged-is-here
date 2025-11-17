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
