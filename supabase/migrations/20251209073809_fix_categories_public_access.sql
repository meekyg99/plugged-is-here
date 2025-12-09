/*
  # Fix Categories Public Access

  1. Changes
    - Drop and recreate the categories SELECT policy to allow public access
    - This fixes the "permission denied for table categories" error
  
  2. Security
    - Categories table remains read-only for public users
    - Only admins/managers can insert, update, or delete categories
*/

-- Drop the old policy
DROP POLICY IF EXISTS "Anyone can view active categories" ON categories;
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;

-- Create new policy with public access
CREATE POLICY "Anyone can view categories"
  ON categories
  FOR SELECT
  TO public
  USING (true);
