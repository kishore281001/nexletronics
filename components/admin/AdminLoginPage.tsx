'use client';
import { useAuth } from '@/lib/auth-context';
import { Zap, ShieldAlert, LogIn, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const { user } = useAuth();

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Glows */}
      <div style={{ position: 'absolute', top: '20%', left: '20%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(123,47,255,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '20%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1, textAlign: 'center' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 60, height: 60, background: 'linear-gradient(135deg, #00D4FF, #7B2FFF)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 30px rgba(0,212,255,0.25)' }}>
            <Zap size={28} color="#000" fill="#000" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: 1 }}>NEXLETRONICS</div>
          <div style={{ fontSize: 10, color: '#A855F7', fontFamily: 'var(--font-mono)', letterSpacing: '3px', marginTop: 2 }}>ADMIN PORTAL</div>
        </div>

        {/* Card */}
        <div
          className="glass"
          style={{ borderRadius: 18, border: '1px solid var(--border-bright)', padding: 32 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={20} color="var(--error)" />
            </div>
          </div>

          <h3 style={{ fontSize: 18, color: 'var(--text-primary)', marginBottom: 12 }}>Access Denied</h3>

          {user ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              Your account (<strong>{user.email}</strong>) does not have administrator privileges.
            </p>
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              You must be logged into an administrator account to access this portal.
            </p>
          )}

          {!user && (
            <Link href="/login?redirect=/admin"
              style={{
                display: 'inline-flex', padding: '12px 24px', fontSize: 14, fontWeight: 600,
                background: 'linear-gradient(135deg, #00D4FF, #7B2FFF)',
                color: '#fff', border: 'none', borderRadius: 10,
                cursor: 'pointer', textDecoration: 'none', alignItems: 'center', gap: 8,
                boxShadow: '0 0 20px rgba(0,212,255,0.25)',
              }}
            >
              <LogIn size={15} />
              Sign In to Continue
              <ArrowRight size={14} />
            </Link>
          )}

          {user && (
            <Link href="/"
              style={{
                display: 'inline-flex', padding: '12px 24px', fontSize: 14, fontWeight: 600,
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', borderRadius: 10,
                cursor: 'pointer', textDecoration: 'none', alignItems: 'center', gap: 8,
              }}
            >
              Return Home
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
