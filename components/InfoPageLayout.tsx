import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface InfoPageLayoutProps {
  title: string;
  subtitle: string;
  icon: string;
  breadcrumb: string;
  children: React.ReactNode;
  lastUpdated?: string;
}

export default function InfoPageLayout({ title, subtitle, icon, breadcrumb, children, lastUpdated }: InfoPageLayoutProps) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(180deg, rgba(0,212,255,0.06) 0%, transparent 100%)', borderBottom: '1px solid var(--border)', padding: '48px 24px 40px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
            <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
            <ChevronRight size={11} />
            <span style={{ color: 'var(--text-secondary)' }}>{breadcrumb}</span>
          </div>
          <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10, lineHeight: 1.2 }}>{title}</h1>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{subtitle}</p>
          {lastUpdated && (
            <div style={{ marginTop: 14, fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Last updated: {lastUpdated}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px 80px' }}>
        {children}
      </div>

      <Footer />
    </div>
  );
}
