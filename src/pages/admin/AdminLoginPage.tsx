import { useState, useEffect } from 'react';
import { Shield, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from '../../hooks/useNavigate';
import { supabase } from '../../lib/supabase';
import { validateEmail, sanitizeInput } from '../../utils/security';

export default function AdminLoginPage() {
  const [step, setStep] = useState<'email' | '2fa'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Redirect if already admin and authenticated
  useEffect(() => {
    if (user && isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [user, isAdmin, navigate]);

  const checkRateLimit = async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('check_admin_login_rate_limit', {
        user_email: email,
        user_ip: null, // Could be enhanced with actual IP
      });

      if (error) throw error;

      if (data?.is_blocked) {
        const resetTime = new Date(data.reset_time);
        const minutes = Math.ceil((resetTime.getTime() - Date.now()) / 60000);
        setError(`Too many login attempts. Please try again in ${minutes} minutes.`);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Rate limit check error:', error);
      return true; // Allow login if rate limit check fails
    }
  };

  const logLoginAttempt = async (
    email: string,
    success: boolean,
    reason?: string
  ) => {
    try {
      await supabase.rpc('log_admin_login_attempt', {
        user_email: email,
        user_ip: null,
        is_success: success,
        fail_reason: reason,
      });
    } catch (error) {
      console.error('Failed to log login attempt:', error);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Input validation
    const sanitizedEmail = sanitizeInput(email.trim().toLowerCase());
    
    if (!validateEmail(sanitizedEmail)) {
      setError('Invalid credentials');
      setLoading(false);
      return;
    }

    if (!password || password.length < 1) {
      setError('Invalid credentials');
      setLoading(false);
      return;
    }

    try {
      // Check rate limiting
      const canProceed = await checkRateLimit(sanitizedEmail);
      if (!canProceed) {
        setLoading(false);
        return;
      }

      // Attempt sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password,
      });

      if (error) {
        await logLoginAttempt(sanitizedEmail, false, 'auth_error');
        setError('Invalid credentials');
        setLoading(false);
        return;
      }

      if (!data.user) {
        await logLoginAttempt(sanitizedEmail, false, 'auth_error');
        setError('Invalid credentials');
        setLoading(false);
        return;
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (!profile || !['admin', 'manager', 'support'].includes(profile.role)) {
        await logLoginAttempt(sanitizedEmail, false, 'access_denied');
        await supabase.auth.signOut();
        // Generic error - don't reveal that account exists but isn't admin
        setError('Invalid credentials');
        setLoading(false);
        return;
      }

      // Generate 2FA code
      const { data: code2fa, error: codeError } = await supabase.rpc(
        'generate_admin_2fa_code',
        { user_id: data.user.id }
      );

      if (codeError) {
        await logLoginAttempt(sanitizedEmail, false, '2fa_error');
        setError('Authentication error. Please try again.');
        setLoading(false);
        return;
      }

      // In production, send code via email
      // For now, show it in console (REMOVE IN PRODUCTION)
      console.log('2FA Code:', code2fa);
      alert(`Your 2FA code is: ${code2fa}\n\n(In production, this will be sent via email)`);

      setUserId(data.user.id);
      setStep('2fa');
      await logLoginAttempt(sanitizedEmail, true);
    } catch (error) {
      await logLoginAttempt(sanitizedEmail, false, 'unexpected_error');
      setError('Authentication error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate 2FA code format (should be 6 digits)
    const sanitizedCode = sanitizeInput(twoFactorCode.trim());
    if (!/^\d{6}$/.test(sanitizedCode)) {
      setError('Invalid verification code');
      setLoading(false);
      return;
    }

    try {
      if (!userId) {
        setError('Session expired. Please start over.');
        setStep('email');
        setPassword('');
        setTwoFactorCode('');
        setLoading(false);
        return;
      }

      // Verify 2FA code
      const { data: isValid, error: verifyError } = await supabase.rpc(
        'verify_admin_2fa_code',
        {
          user_id: userId,
          input_code: sanitizedCode,
        }
      );

      if (verifyError || !isValid) {
        setError('Invalid verification code');
        setLoading(false);
        return;
      }

      // Create admin session
      const { data: token, error: sessionError } = await supabase.rpc(
        'create_admin_session',
        {
          user_id: userId,
          user_ip: null,
          user_agent_string: navigator.userAgent,
        }
      );

      if (sessionError || !token) {
        setError('Authentication error. Please try again.');
        setLoading(false);
        return;
      }

      // Store session token in localStorage
      localStorage.setItem('admin_session_token', token);
      localStorage.setItem('admin_session_expires', (Date.now() + 30 * 60 * 1000).toString());

      // Log successful admin login
      await supabase.rpc('log_admin_action', {
        user_id: userId,
        action_name: 'admin_login',
        action_details: { method: '2fa' },
      });

      // Redirect to admin dashboard
      navigate('/admin/dashboard');
    } catch (error) {
      setError('Authentication error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend2FA = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const { data: code2fa, error } = await supabase.rpc(
        'generate_admin_2fa_code',
        { user_id: userId }
      );

      if (error) throw error;

      console.log('2FA Code:', code2fa);
      alert(`Your new 2FA code is: ${code2fa}\n\n(In production, this will be sent via email)`);
      setError('');
    } catch (error) {
      setError('Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
            <Shield className="w-8 h-8 text-gray-900" />
          </div>
          <h1 className="text-3xl font-light tracking-wider uppercase text-white mb-2">
            Admin Portal
          </h1>
          <p className="text-gray-400 text-sm tracking-wide">
            Secure administrator access
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm uppercase tracking-wider mb-2 text-gray-700"
                >
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 focus:border-black focus:outline-none transition-colors"
                  placeholder="admin@example.com"
                  required
                  autoComplete="username"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm uppercase tracking-wider mb-2 text-gray-700"
                >
                  <Lock className="w-4 h-4 inline mr-2" />
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 focus:border-black focus:outline-none transition-colors"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-black text-white uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Verifying...' : 'Continue'}
              </button>

              <div className="mt-4 p-4 bg-gray-50 border border-gray-200">
                <p className="text-xs text-gray-600 text-center">
                  <Shield className="w-3 h-3 inline mr-1" />
                  This login requires two-factor authentication
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handle2FASubmit} className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                  <Lock className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-xl font-medium tracking-wider uppercase mb-2">
                  Verify Your Identity
                </h2>
                <p className="text-gray-600 text-sm">
                  Enter the 6-digit code sent to your email
                </p>
              </div>

              <div>
                <label
                  htmlFor="code"
                  className="block text-sm uppercase tracking-wider mb-2 text-gray-700"
                >
                  Verification Code
                </label>
                <input
                  type="text"
                  id="code"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 border-2 border-gray-300 focus:border-black focus:outline-none transition-colors text-center text-2xl tracking-widest font-mono"
                  placeholder="000000"
                  required
                  maxLength={6}
                  pattern="[0-9]{6}"
                  autoComplete="off"
                />
              </div>

              <button
                type="submit"
                disabled={loading || twoFactorCode.length !== 6}
                className="w-full py-3 bg-black text-white uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>

              <div className="flex justify-between items-center text-sm">
                <button
                  type="button"
                  onClick={handleResend2FA}
                  disabled={loading}
                  className="text-gray-600 hover:text-black transition-colors uppercase tracking-wider"
                >
                  Resend Code
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setTwoFactorCode('');
                    setError('');
                  }}
                  className="text-gray-600 hover:text-black transition-colors uppercase tracking-wider"
                >
                  Back
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-xs">
            This is a secure area. All login attempts are monitored and logged.
          </p>
        </div>
      </div>
    </div>
  );
}
