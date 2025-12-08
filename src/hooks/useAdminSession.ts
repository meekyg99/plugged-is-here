import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from './useNavigate';

export function useAdminSession() {
  const [sessionValid, setSessionValid] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  const validateSession = async () => {
    const authenticated = localStorage.getItem('admin_authenticated');
    const expiresStr = localStorage.getItem('admin_session_expires');

    if (!authenticated || !expiresStr) {
      setSessionValid(false);
      setChecking(false);
      return false;
    }

    const expires = parseInt(expiresStr);
    if (Date.now() > expires) {
      // Session expired locally
      clearSession();
      setSessionValid(false);
      setChecking(false);
      return false;
    }

    // Verify user is still authenticated and has admin role
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        clearSession();
        setSessionValid(false);
        setChecking(false);
        return false;
      }

      // Check admin role from database
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || !['admin', 'manager', 'support'].includes(profile.role)) {
        clearSession();
        setSessionValid(false);
        setChecking(false);
        return false;
      }

      // Extend session on successful validation
      localStorage.setItem('admin_session_expires', (Date.now() + 30 * 60 * 1000).toString());

      setSessionValid(true);
      setChecking(false);
      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      clearSession();
      setSessionValid(false);
      setChecking(false);
      return false;
    }
  };

  const clearSession = () => {
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_session_expires');
  };

  const logoutAdmin = async () => {
    clearSession();
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  // Validate session on mount and every 5 minutes
  useEffect(() => {
    validateSession();

    const interval = setInterval(() => {
      validateSession();
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Validate on user activity
  useEffect(() => {
    const handleActivity = () => {
      const expiresStr = localStorage.getItem('admin_session_expires');
      if (expiresStr) {
        const expires = parseInt(expiresStr);
        // If less than 5 minutes remaining, refresh
        if (expires - Date.now() < 5 * 60 * 1000) {
          validateSession();
        }
      }
    };

    window.addEventListener('click', handleActivity);
    window.addEventListener('keydown', handleActivity);

    return () => {
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, []);

  return {
    sessionValid,
    checking,
    validateSession,
    logoutAdmin,
  };
}
