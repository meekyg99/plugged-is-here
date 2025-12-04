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
