'use client';
import type { Metadata } from 'next';
import { AdminAuthProvider, useAdminAuth } from '@/lib/admin-auth-context';
import AdminLoginPage from '@/components/admin/AdminLoginPage';

// Note: metadata export moved to a separate route segment config
// because this is now a 'use client' layout

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAdminAuthenticated } = useAdminAuth();
  if (!isAdminAuthenticated) return <AdminLoginPage />;
  return <>{children}</>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminGuard>
        {children}
      </AdminGuard>
    </AdminAuthProvider>
  );
}
