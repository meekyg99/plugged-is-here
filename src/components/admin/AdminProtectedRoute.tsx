import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from '../../hooks/useNavigate';
import { Shield } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AdminProtectedRouteProps {
  children: ReactNode;
}

/**
 * Server-side role verification - NEVER trust client-side role claims
 * This fetches the role directly from the database using the JWT session
 */
async function verifyAdminRoleFromServer(userId: string): Promise<boolean> {
  try {
    // Get role directly from profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error || !data) {
      console.error('Failed to verify admin role:', error);
      return false;
    }
    
    // Only these roles have admin access
    const adminRoles = ['admin', 'manager', 'support'];
    return adminRoles.includes(data.role);
  } catch (err) {
    console.error('Error verifying admin role:', err);
    return false;
  }
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [verifyingRole, setVerifyingRole] = useState(true);
  const [isVerifiedAdmin, setIsVerifiedAdmin] = useState(false);

  // Server-side role verification
  useEffect(() => {
    const verifyRole = async () => {
      if (!user) {
        setIsVerifiedAdmin(false);
        setVerifyingRole(false);
        return;
      }
      
      // Verify role from server, not client state
      const isAdmin = await verifyAdminRoleFromServer(user.id);
      setIsVerifiedAdmin(isAdmin);
      setVerifyingRole(false);
    };
    
    if (!authLoading && user) {
      verifyRole();
    } else if (!authLoading) {
      setVerifyingRole(false);
    }
  }, [user, authLoading]);

  // Handle redirects
  useEffect(() => {
    if (!authLoading && !verifyingRole) {
      // Not authenticated at all
      if (!user) {
        navigate('/admin/login');
        return;
      }

      // Not a verified admin - redirect to home
      if (!isVerifiedAdmin) {
        navigate('/');
        return;
      }
    }
  }, [user, isVerifiedAdmin, authLoading, verifyingRole, navigate]);

  // Show loading while checking
  if (authLoading || verifyingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          <p className="mt-4 text-gray-600 tracking-wider">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Access denied
  if (!user || !isVerifiedAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl tracking-wider uppercase mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You do not have permission to access this area.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-black text-white uppercase tracking-wider hover:bg-gray-800 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
