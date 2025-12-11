import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile } from '../types/database';
import { sendWelcomeEmail } from '../services/emailService';
import { 
  isValidEmail, 
  isValidName, 
  sanitizeName, 
  SecureErrors, 
  toSafeError 
} from '../utils/security';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Validate inputs
      const trimmedEmail = email.toLowerCase().trim();
      const sanitizedName = sanitizeName(fullName);
      
      if (!isValidEmail(trimmedEmail)) {
        return { error: new Error(SecureErrors.INVALID_EMAIL) };
      }
      
      if (!isValidName(sanitizedName)) {
        return { error: new Error(SecureErrors.INVALID_NAME) };
      }
      
      if (password.length < 8) {
        return { error: new Error('Password must be at least 8 characters') };
      }
      
      const { error, data } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: sanitizedName,
          },
        },
      });
      
      if (error) {
        // Never reveal if email exists - use generic message
        return { error: new Error(SecureErrors.AUTH_GENERIC) };
      }

      // Send welcome email (non-blocking - don't fail signup if email fails)
      if (data.user) {
        sendWelcomeEmail(trimmedEmail, sanitizedName, window.location.origin)
          .catch(() => { /* Silently fail - don't expose email errors */ });

        // Send Supabase-generated verification link with our custom template via edge function
        supabase.functions.invoke('auth-email', {
          body: {
            type: 'verify',
            email: trimmedEmail,
            userName: sanitizedName,
          },
        }).catch(() => { /* do not block signup on email errors */ });
      }
      
      return { error: null };
    } catch (error) {
      // Never expose internal errors
      return { error: new Error(toSafeError(error, 'signUp')) };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Validate email format
      const trimmedEmail = email.toLowerCase().trim();
      
      if (!isValidEmail(trimmedEmail)) {
        // Don't reveal that email format is wrong vs wrong credentials
        return { error: new Error(SecureErrors.AUTH_FAILED) };
      }
      
      const { error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });
      
      if (error) {
        // SECURITY: Always show same message for any auth failure
        // Never reveal if email exists, wrong password, account locked, etc.
        return { error: new Error(SecureErrors.AUTH_FAILED) };
      }
      
      return { error: null };
    } catch (error) {
      // Never expose internal errors
      return { error: new Error(SecureErrors.AUTH_FAILED) };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const isAdmin = profile?.role === 'admin' || profile?.role === 'manager' || profile?.role === 'support';

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      loading,
      signUp,
      signIn,
      signOut,
      isAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
