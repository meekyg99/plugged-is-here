import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { isValidEmail, isValidName, sanitizeName, SecureErrors } from '../../utils/security';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup';
}

export default function AuthModal({ isOpen, onClose, defaultMode = 'signin' }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmailConfirmNotice, setShowEmailConfirmNotice] = useState(false);
  const { signIn, signUp } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Client-side validation
      const trimmedEmail = email.toLowerCase().trim();
      
      if (!isValidEmail(trimmedEmail)) {
        setError(SecureErrors.INVALID_EMAIL);
        setLoading(false);
        return;
      }
      
      if (password.length < 8) {
        setError('Password must be at least 8 characters');
        setLoading(false);
        return;
      }
      
      if (mode === 'signin') {
        const { error } = await signIn(trimmedEmail, password);
        if (error) {
          // Error message is already sanitized by AuthContext
          setError(error.message);
        } else {
          onClose();
          resetForm();
        }
      } else {
        const sanitizedName = sanitizeName(fullName);
        
        if (!isValidName(sanitizedName)) {
          setError(SecureErrors.INVALID_NAME);
          setLoading(false);
          return;
        }
        
        const { error } = await signUp(trimmedEmail, password, sanitizedName);
        if (error) {
          // Error message is already sanitized by AuthContext
          setError(error.message);
        } else {
          // Show email confirmation notice
          setShowEmailConfirmNotice(true);
          resetForm();
        }
      }
    } catch {
      // Never expose internal errors
      setError(SecureErrors.SERVER_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setError('');
  };

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full p-8 relative">
        <button
          onClick={() => {
            onClose();
            setShowEmailConfirmNotice(false);
          }}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {showEmailConfirmNotice ? (
          // Email Confirmation Notice
          <div className="text-center py-4">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Check Your Email
            </h2>
            
            <p className="text-gray-600 mb-6">
              We've sent a confirmation email to your inbox. Please check your email and click the confirmation link to activate your account.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-yellow-800">
                <strong>📬 Don't see it?</strong> Check your spam or junk folder.
              </p>
            </div>
            
            <div className="text-sm text-gray-500 space-y-2">
              <p>
                Email sent from: <br />
                <strong className="text-gray-700">info@pluggedby212.shop</strong>
              </p>
              <p className="pt-4">
                <a 
                  href="https://pluggedby212.shop" 
                  className="text-blue-600 hover:text-blue-800 underline"
                  onClick={() => {
                    onClose();
                    setShowEmailConfirmNotice(false);
                  }}
                >
                  Return to PLUGGED
                </a>
              </p>
            </div>
          </div>
        ) : (
          // Login/Signup Form
          <>
            <h2 className="text-2xl font-light tracking-wider uppercase mb-6">
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label htmlFor="fullName" className="block text-sm uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-black focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm uppercase tracking-wider mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-black focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-black focus:outline-none focus:ring-2 focus:ring-black"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-black text-white uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={toggleMode}
            className="text-sm uppercase tracking-wider hover:underline"
          >
            {mode === 'signin' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
          </button>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
