'use client';
import { useState } from 'react';
import { useAdminAuth } from '@/lib/admin-auth-context';
import { Zap, Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const { adminLogin } = useAdminAuth();
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));

    const ok = await adminLogin(password);
    setLoading(false);

    if (!ok) {
      setError('Incorrect password. Please try again.');
      setPassword('');
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
    // If ok, AdminGuard will automatically show the admin content
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, position: 'relative', overflow: 'hidden',
    }}>
      {/* Glows */}
      <div style={{ position: 'absolute', top: '20%', left: '20%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(123,47,255,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '20%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
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
          style={{
            borderRadius: 18, border: '1px solid var(--border-bright)', padding: 32,
            animation: shake ? 'shake 0.5s ease' : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(123,47,255,0.1)', border: '1px solid rgba(123,47,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={16} color="#A855F7" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Admin Access</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Enter your admin password to continue</div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 6 }}>Admin Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  autoFocus
                  className="input-field"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter admin password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  style={{ paddingLeft: 36, paddingRight: 44, paddingTop: 12, paddingBottom: 12, fontSize: 15 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 12px', background: 'rgba(255,68,68,0.07)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: 8, marginBottom: 14 }}>
                <AlertCircle size={14} color="var(--error)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'var(--error)' }}>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              style={{
                width: '100%', padding: '13px', fontSize: 15, fontWeight: 700,
                background: 'linear-gradient(135deg, #7B2FFF, #5B0FDF)',
                color: '#fff', border: 'none', borderRadius: 10,
                cursor: loading || !password ? 'not-allowed' : 'pointer',
                opacity: !password ? 0.6 : 1,
                transition: 'all 0.2s', fontFamily: 'var(--font-main)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: password ? '0 0 20px rgba(123,47,255,0.3)' : 'none',
              }}
            >
              <Lock size={15} />
              {loading ? 'Verifying...' : 'Enter Admin Portal'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 20 }}>
            <ShieldCheck size={13} color="var(--success)" />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Session expires when browser closes</span>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--text-muted)' }}>
          This portal is for store owners only
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
