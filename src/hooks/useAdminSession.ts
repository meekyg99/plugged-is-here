import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from './useNavigate';

export function useAdminSession() {
  const [sessionValid, setSessionValid] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  const validateSession = async () => {
    const token = localStorage.getItem('admin_session_token');
    const expiresStr = localStorage.getItem('admin_session_expires');

    if (!token || !expiresStr) {
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

    try {
      // Validate with backend and refresh
      const { data, error } = await supabase.rpc('validate_admin_session', {
        session_token: token,
      });

      if (error || !data?.valid) {
        clearSession();
        setSessionValid(false);
        setChecking(false);
        return false;
      }

      // Update expiration time
      const newExpires = new Date(data.expires_at).getTime();
      localStorage.setItem('admin_session_expires', newExpires.toString());

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
    localStorage.removeItem('admin_session_token');
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
