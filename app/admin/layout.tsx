'use client';
import { AdminAuthProvider, useAdminAuth } from '@/lib/admin-auth-context';
import AdminLoginPage from '@/components/admin/AdminLoginPage';


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
