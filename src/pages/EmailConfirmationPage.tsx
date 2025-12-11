import { useEffect, useState } from 'react';
import { CheckCircle, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EmailConfirmationPage() {
  const [confirmed, setConfirmed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if URL has confirmation token
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const type = params.get('type');
    
    if (token && type === 'signup') {
      setConfirmed(true);
    }
  }, []);

  if (confirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Email Confirmed! 🎉
          </h1>
          
          <p className="text-gray-600 mb-6">
            Your email has been successfully verified. You can now access all features of your account.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-black text-white py-3 px-6 hover:bg-gray-800 transition-colors font-medium"
            >
              Start Shopping
            </button>
            
            <button
              onClick={() => navigate('/account')}
              className="w-full border border-black text-black py-3 px-6 hover:bg-gray-50 transition-colors font-medium"
            >
              Go to My Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Mail className="w-10 h-10 text-blue-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Check Your Email
        </h1>
        
        <p className="text-gray-600 mb-6">
          We've sent a confirmation email to your inbox. Please check your email and click the confirmation link to activate your account.
        </p>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>📬 Don't see it?</strong> Check your spam or junk folder.
          </p>
        </div>
        
        <div className="text-sm text-gray-500 space-y-2">
          <p>
            The confirmation email was sent from: <br />
            <strong className="text-gray-700">info@pluggedby212.shop</strong>
          </p>
          <p className="pt-4">
            <a href="https://pluggedby212.shop" className="text-blue-600 hover:text-blue-800 underline">
              Return to PLUGGED
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
