import { useState, useEffect } from 'react';
import { Shield, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from '../../hooks/useNavigate';
import { supabase } from '../../lib/supabase';
import { validateEmail, sanitizeInput } from '../../utils/security';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Redirect if already admin and authenticated
  useEffect(() => {
    if (user && isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [user, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
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
      // Attempt sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password,
      });

      if (error) {
        setError('Invalid credentials');
        setLoading(false);
        return;
      }

      if (!data.user) {
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
        await supabase.auth.signOut();
        // Generic error - don't reveal that account exists but isn't admin
        setError('Invalid credentials');
        setLoading(false);
        return;
      }

      // Mark admin session in localStorage (simple approach without RPC)
      localStorage.setItem('admin_authenticated', 'true');
      localStorage.setItem('admin_session_expires', (Date.now() + 30 * 60 * 1000).toString());

      // Redirect to admin dashboard
      navigate('/admin/dashboard');
    } catch (error) {
      setError('Authentication error. Please try again.');
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

          <form onSubmit={handleSubmit} className="space-y-6">
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
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-xs">
            This is a secure area. Unauthorized access is prohibited.
          </p>
        </div>
      </div>
    </div>
  );
}
