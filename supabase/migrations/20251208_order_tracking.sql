/*
  # Order Tracking Feature
  
  This migration adds a tracking system for orders:
  - Sequential tracking IDs like PLUG-11000, PLUG-11001, etc.
  - Tracking ID is generated automatically on order creation
  
  ## Changes
  1. Add tracking_id column to orders table
  2. Create sequence for tracking numbers
  3. Create function to generate tracking ID
  4. Create trigger to auto-generate tracking ID
*/

-- Create a sequence for tracking numbers starting at 11000
CREATE SEQUENCE IF NOT EXISTS order_tracking_seq START WITH 11000;

-- Add tracking_id column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_id text UNIQUE;

-- Function to generate tracking ID
CREATE OR REPLACE FUNCTION generate_tracking_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate tracking ID in format PLUG-XXXXX
  IF NEW.tracking_id IS NULL THEN
    NEW.tracking_id := 'PLUG-' || nextval('order_tracking_seq')::text;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate tracking ID on insert
DROP TRIGGER IF EXISTS set_tracking_id ON orders;
CREATE TRIGGER set_tracking_id
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_tracking_id();

-- Add index for tracking ID lookups
CREATE INDEX IF NOT EXISTS idx_orders_tracking_id ON orders(tracking_id);

-- Function to get order by tracking ID (public access for tracking page)
CREATE OR REPLACE FUNCTION get_order_by_tracking_id(tracking_id_param text)
RETURNS jsonb AS $$
DECLARE
  order_data jsonb;
BEGIN
  SELECT jsonb_build_object(
    'id', o.id,
    'tracking_id', o.tracking_id,
    'order_number', o.order_number,
    'status', o.status,
    'created_at', o.created_at,
    'updated_at', o.updated_at,
    'shipping_address', jsonb_build_object(
      'city', o.shipping_address->>'city',
      'state', o.shipping_address->>'state',
      'country', o.shipping_address->>'country'
    ),
    'items', (
      SELECT jsonb_agg(jsonb_build_object(
        'name', p.name,
        'quantity', oi.quantity,
        'color', pv.color,
        'size', pv.size
      ))
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      JOIN product_variants pv ON pv.id = oi.variant_id
      WHERE oi.order_id = o.id
    )
  ) INTO order_data
  FROM orders o
  WHERE UPPER(o.tracking_id) = UPPER(tracking_id_param);
  
  RETURN order_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission for anonymous users (for tracking page)
GRANT EXECUTE ON FUNCTION get_order_by_tracking_id(text) TO anon;
GRANT EXECUTE ON FUNCTION get_order_by_tracking_id(text) TO authenticated;
