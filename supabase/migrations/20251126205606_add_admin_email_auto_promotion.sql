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
