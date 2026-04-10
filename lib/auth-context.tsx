'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from './supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'admin';
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<'ok' | 'not_found' | 'error'>;
  register: (email: string, password: string, name: string, phone?: string) => Promise<'ok' | 'needs_verification' | 'already_exists' | 'error'>;
  loginWithGoogle: () => Promise<void>;
  verifySignupOtp: (email: string, token: string) => Promise<'ok' | 'invalid' | 'error'>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => 'not_found',
  register: async () => 'ok',
  loginWithGoogle: async () => {},
  verifySignupOtp: async () => 'error',
  logout: async () => {},
  isLoading: true,
});

function supabaseToUser(sbUser: SupabaseUser, role: 'user' | 'admin' = 'user'): User {
  return {
    id: sbUser.id,
    name: sbUser.user_metadata?.name ?? sbUser.email?.split('@')[0] ?? 'User',
    email: sbUser.email ?? '',
    phone: sbUser.user_metadata?.phone,
    avatar: sbUser.user_metadata?.avatar_url,
    role,
    created_at: sbUser.created_at,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
        setUser(supabaseToUser(session.user, data?.role || 'user'));
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };
    fetchSession();

    // Listen for auth changes (login/logout/session refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
        setUser(supabaseToUser(session.user, data?.role || 'user'));
      } else {
        setUser(null);
      }
      setIsLoading(false);
      // Notify other components (e.g. CartProvider)
      window.dispatchEvent(new Event('nxt_auth_change'));
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<'ok' | 'not_found' | 'error'> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes('Invalid login') || error.message.includes('user not found')) return 'not_found';
      console.error('login error:', error);
      return 'error';
    }
    return 'ok';
  };

  const register = async (email: string, password: string, name: string, phone?: string): Promise<'ok' | 'needs_verification' | 'already_exists' | 'error'> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, phone },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    if (error) {
      if (error.message.includes('already registered') || error.message.includes('already exists')) return 'already_exists';
      console.error('register error:', error);
      return 'error';
    }
    if (data.user && !data.session) {
      return 'needs_verification';
    }
    return 'ok';
  };

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      }
    });
  };

  const verifySignupOtp = async (email: string, token: string): Promise<'ok' | 'invalid' | 'error'> => {
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' });
    if (error) {
      if (error.message.includes('expired') || error.message.includes('invalid')) return 'invalid';
      console.error('verifyOtp error:', error);
      return 'error';
    }
    return 'ok';
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, login, register, loginWithGoogle, verifySignupOtp, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
