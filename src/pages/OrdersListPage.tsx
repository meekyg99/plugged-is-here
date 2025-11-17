import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function OrdersListPage() {
  const { user, loading } = useAuth();
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl tracking-wider uppercase font-light mb-8">Order History</h1>

        <div className="bg-white p-12 shadow-sm text-center">
          <p className="text-lg text-gray-500 tracking-wider mb-4">
            No orders yet
          </p>
          <p className="text-sm text-gray-400 tracking-wide mb-6">
            Start shopping to see your order history here
          </p>
          <a
            href="/products"
            className="inline-block px-8 py-3 bg-black text-white uppercase tracking-wider hover:bg-gray-800 transition-colors"
          >
            Start Shopping
          </a>
        </div>
      </div>
    </div>
  );
}
