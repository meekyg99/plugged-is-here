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