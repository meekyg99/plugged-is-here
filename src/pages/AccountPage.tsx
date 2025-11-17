import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function AccountPage() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <p className="text-lg tracking-wider">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl tracking-wider uppercase font-light mb-8">My Account</h1>

        <div className="bg-white p-8 shadow-sm mb-6">
          <h2 className="text-xl tracking-wider uppercase font-light mb-6">Profile Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm uppercase tracking-wider text-gray-600 mb-2">
                Full Name
              </label>
              <p className="text-lg">{profile?.full_name || 'Not set'}</p>
            </div>
            <div>
              <label className="block text-sm uppercase tracking-wider text-gray-600 mb-2">
                Email
              </label>
              <p className="text-lg">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm uppercase tracking-wider text-gray-600 mb-2">
                Account Type
              </label>
              <p className="text-lg capitalize">{profile?.role || 'Customer'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 shadow-sm">
          <h2 className="text-xl tracking-wider uppercase font-light mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <a
              href="/orders"
              className="block py-3 px-4 border border-black hover:bg-black hover:text-white transition-colors uppercase tracking-wider text-sm"
            >
              View Order History
            </a>
            <a
              href="/wishlist"
              className="block py-3 px-4 border border-black hover:bg-black hover:text-white transition-colors uppercase tracking-wider text-sm"
            >
              View Wishlist
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
