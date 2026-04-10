'use client';
import { useAuth } from '@/lib/auth-context';
import AdminLoginPage from '@/components/admin/AdminLoginPage';
import { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || isLoading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader className="spin" /></div>;

  if (!user || user.role !== 'admin') {
    return <AdminLoginPage />;
  }

  return <>{children}</>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      {children}
    </AdminGuard>
  );
}
