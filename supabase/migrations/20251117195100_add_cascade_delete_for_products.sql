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