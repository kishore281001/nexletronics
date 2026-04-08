'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  created_at: string;
}

interface RegisteredAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string) => 'ok' | 'not_found';
  register: (email: string, name: string, phone?: string) => 'ok' | 'already_exists';
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => 'not_found',
  register: () => 'ok',
  logout: () => {},
  isLoading: true,
});

// Helper – get all registered accounts (our local "user DB")
function getAccounts(): RegisteredAccount[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem('nxt_accounts');
  return raw ? JSON.parse(raw) : [];
}
function saveAccounts(accounts: RegisteredAccount[]) {
  localStorage.setItem('nxt_accounts', JSON.stringify(accounts));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('nxt_user');
    if (stored) setUser(JSON.parse(stored));
    setIsLoading(false);
  }, []);

  /** Sign in with email. Returns 'ok' if found, 'not_found' if no account. */
  const login = (email: string): 'ok' | 'not_found' => {
    const accounts = getAccounts();
    const found = accounts.find(a => a.email.toLowerCase() === email.toLowerCase());
    if (!found) return 'not_found';
    const sessionUser: User = { ...found };
    localStorage.setItem('nxt_user', JSON.stringify(sessionUser));
    setUser(sessionUser);
    window.dispatchEvent(new Event('nxt_auth_change')); // notify CartProvider same-tab
    return 'ok';
  };

  /** Create a new account. Returns 'already_exists' if email is taken. */
  const register = (email: string, name: string, phone?: string): 'ok' | 'already_exists' => {
    const accounts = getAccounts();
    const exists = accounts.find(a => a.email.toLowerCase() === email.toLowerCase());
    if (exists) return 'already_exists';

    const newAccount: RegisteredAccount = {
      id: crypto.randomUUID(),
      name,
      email,
      phone,
      created_at: new Date().toISOString(),
    };
    saveAccounts([...accounts, newAccount]);

    // Auto-login after registration
    const sessionUser: User = { ...newAccount };
    localStorage.setItem('nxt_user', JSON.stringify(sessionUser));
    setUser(sessionUser);
    window.dispatchEvent(new Event('nxt_auth_change')); // notify CartProvider same-tab
    return 'ok';
  };

  const logout = () => {
    localStorage.removeItem('nxt_user');
    setUser(null);
    window.dispatchEvent(new Event('nxt_auth_change')); // notify CartProvider same-tab
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
