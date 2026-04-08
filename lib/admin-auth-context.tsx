'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  adminLogin: (password: string) => Promise<boolean>;
  adminLogout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  isAdminAuthenticated: false,
  adminLogin: async () => false,
  adminLogout: () => {},
});

const ADMIN_SESSION_KEY = 'nxt_admin_session';
const ADMIN_HASH_KEY    = 'nxt_admin_hash';      // stores SHA-256 hash, never plain text
const DEFAULT_PASSWORD  = 'nexletronics@admin';

// ── SHA-256 helper using Web Crypto API (no libraries needed) ──
async function sha256(text: string): Promise<string> {
  const encoder  = new TextEncoder();
  const data     = encoder.encode(text);
  const hashBuf  = await crypto.subtle.digest('SHA-256', data);
  const hashArr  = Array.from(new Uint8Array(hashBuf));
  return hashArr.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Get stored hash (or hash of the default password if none set) ──
async function getAdminHash(): Promise<string> {
  if (typeof window === 'undefined') return sha256(DEFAULT_PASSWORD);
  const stored = localStorage.getItem(ADMIN_HASH_KEY);
  if (stored) return stored;
  // First run: store hash of default password so plain text never persists
  const defaultHash = await sha256(DEFAULT_PASSWORD);
  localStorage.setItem(ADMIN_HASH_KEY, defaultHash);
  return defaultHash;
}

// Exposed for the settings page — hashes before storing
export async function setAdminPassword(newPassword: string): Promise<void> {
  const hash = await sha256(newPassword);
  localStorage.setItem(ADMIN_HASH_KEY, hash);
}

// Verify a candidate password against the stored hash
export async function verifyAdminPassword(candidate: string): Promise<boolean> {
  const storedHash    = await getAdminHash();
  const candidateHash = await sha256(candidate);
  return storedHash === candidateHash;
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Migrate any plain text password that was stored before this fix
    const oldPlain = localStorage.getItem('nxt_admin_password');
    if (oldPlain) {
      sha256(oldPlain).then(hash => {
        localStorage.setItem(ADMIN_HASH_KEY, hash);
        localStorage.removeItem('nxt_admin_password'); // remove plain text permanently
      });
    }

    const session = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (session === 'true') setIsAdminAuthenticated(true);
    setChecked(true);
  }, []);

  const adminLogin = async (password: string): Promise<boolean> => {
    const ok = await verifyAdminPassword(password);
    if (ok) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      setIsAdminAuthenticated(true);
    }
    return ok;
  };

  const adminLogout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAdminAuthenticated(false);
  };

  if (!checked) return null;

  return (
    <AdminAuthContext.Provider value={{ isAdminAuthenticated, adminLogin, adminLogout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
