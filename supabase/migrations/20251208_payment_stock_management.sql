/*
  # Payment-Triggered Stock Management
  
  This migration adds functions to properly manage stock:
  - Stock is only decremented when payment is confirmed
  - Stock can be restored if order is cancelled/refunded
  
  ## Changes
  1. Add confirm_payment_and_reduce_stock function
  2. Add restore_stock_for_order function
  3. These ensure atomic operations for payment + stock updates
*/

-- Function to confirm payment and reduce stock atomically
CREATE OR REPLACE FUNCTION confirm_payment_and_reduce_stock(
  order_id_param uuid,
  payment_reference text DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  order_record RECORD;
  item_record RECORD;
  current_stock integer;
  new_stock integer;
  result jsonb;
BEGIN
  -- Get the order and check status
  SELECT * INTO order_record
  FROM orders
  WHERE id = order_id_param
  FOR UPDATE;
  
  IF order_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order not found');
  END IF;
  
  -- Check if order is still pending
  IF order_record.status NOT IN ('pending') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order is not in pending status');
  END IF;
  
  -- Update payment status to completed
  UPDATE payments
  SET 
    status = 'completed',
    provider_reference = COALESCE(payment_reference, provider_reference),
    updated_at = now()
  WHERE order_id = order_id_param;
  
  -- Update order status to processing
  UPDATE orders
  SET 
    status = 'processing',
    updated_at = now()
  WHERE id = order_id_param;
  
  -- Loop through order items and decrement stock
  FOR item_record IN 
    SELECT oi.variant_id, oi.quantity 
    FROM order_items oi 
    WHERE oi.order_id = order_id_param
  LOOP
    -- Get current stock with lock
    SELECT stock_quantity INTO current_stock
    FROM product_variants
    WHERE id = item_record.variant_id
    FOR UPDATE;
    
    -- Calculate new stock
    new_stock := current_stock - item_record.quantity;
    
    -- Prevent negative stock
    IF new_stock < 0 THEN
      -- Rollback will happen automatically
      RAISE EXCEPTION 'Insufficient stock for variant %. Available: %, Requested: %', 
        item_record.variant_id, current_stock, item_record.quantity;
    END IF;
    
    -- Update stock
    UPDATE product_variants
    SET 
      stock_quantity = new_stock,
      updated_at = now()
    WHERE id = item_record.variant_id;
    
    -- Log the inventory change
    INSERT INTO inventory_logs (
      variant_id,
      change_type,
      quantity_change,
      quantity_after,
      reason
    ) VALUES (
      item_record.variant_id,
      'sale',
      -item_record.quantity,
      new_stock,
      'Stock reduced for order: ' || order_id_param::text
    );
  END LOOP;
  
  RETURN jsonb_build_object('success', true, 'order_id', order_id_param);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to restore stock when order is cancelled/refunded
CREATE OR REPLACE FUNCTION restore_stock_for_order(
  order_id_param uuid
)
RETURNS jsonb AS $$
DECLARE
  order_record RECORD;
  item_record RECORD;
  current_stock integer;
  new_stock integer;
BEGIN
  -- Get the order
  SELECT * INTO order_record
  FROM orders
  WHERE id = order_id_param
  FOR UPDATE;
  
  IF order_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order not found');
  END IF;
  
  -- Only restore stock for orders that had stock deducted (processing, shipped, delivered)
  IF order_record.status NOT IN ('processing', 'shipped', 'delivered') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order status does not require stock restoration');
  END IF;
  
  -- Loop through order items and restore stock
  FOR item_record IN 
    SELECT oi.variant_id, oi.quantity 
    FROM order_items oi 
    WHERE oi.order_id = order_id_param
  LOOP
    -- Get current stock with lock
    SELECT stock_quantity INTO current_stock
    FROM product_variants
    WHERE id = item_record.variant_id
    FOR UPDATE;
    
    -- Calculate new stock
    new_stock := current_stock + item_record.quantity;
    
    -- Update stock
    UPDATE product_variants
    SET 
      stock_quantity = new_stock,
      updated_at = now()
    WHERE id = item_record.variant_id;
    
    -- Log the inventory change
    INSERT INTO inventory_logs (
      variant_id,
      change_type,
      quantity_change,
      quantity_after,
      reason
    ) VALUES (
      item_record.variant_id,
      'return',
      item_record.quantity,
      new_stock,
      'Stock restored for cancelled/refunded order: ' || order_id_param::text
    );
  END LOOP;
  
  -- Update order status
  UPDATE orders
  SET 
    status = 'refunded',
    updated_at = now()
  WHERE id = order_id_param;
  
  -- Update payment status
  UPDATE payments
  SET 
    status = 'refunded',
    updated_at = now()
  WHERE order_id = order_id_param;
  
  RETURN jsonb_build_object('success', true, 'order_id', order_id_param);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION confirm_payment_and_reduce_stock(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION restore_stock_for_order(uuid) TO authenticated;
