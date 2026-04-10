'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { Zap, Mail, User, Phone, ArrowLeft, ShieldCheck, AlertCircle, CheckCircle } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { login, register, loginWithGoogle, verifySignupOtp } = useAuth();
  const { showToast } = useToast();

  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const switchTab = (t: 'login' | 'signup') => {
    setTab(t);
    setError('');
    setSuccess('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setError('');
    setLoading(true);

    const result = await login(email.trim(), password);
    setLoading(false);

    if (result === 'not_found' || result === 'error') {
      setError('Invalid email or password.');
      return;
    }
    showToast('success', 'Welcome back! 👋', 'You are now signed in.');
    router.push(redirect);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim() || !password) return;
    setError('');
    setLoading(true);

    const result = await register(email.trim(), password, name.trim(), phone.trim() || undefined);
    setLoading(false);

    if (result === 'already_exists') {
      setError('');
      // Show the "already has account" message with switch-to-login button
      setSuccess('EXISTS');
      return;
    } else if (result === 'needs_verification') {
      setError('');
      setSuccess('VERIFY');
      return;
    } else if (result === 'error') {
       setError('Failed to create account. Please try again.');
       return;
    }

    // Success — auto-logged in (if email confirmation is off)
    showToast('success', `Welcome to Nexletronics, ${name.split(' ')[0]}! 🎉`, 'Your account has been created and you are now signed in.');
    router.push(redirect);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return;
    setError('');
    setLoading(true);

    const result = await verifySignupOtp(email.trim(), otp.trim());
    setLoading(false);

    if (result === 'invalid') {
      setError('Invalid or expired code. Please check your email carefully.');
      return;
    } else if (result === 'error') {
      setError('An error occurred during verification.');
      return;
    }

    showToast('success', 'Email Verified! ✅', 'Your account is now fully active.');
    router.push(redirect);
  };

  const bgGlow1 = { position: 'absolute' as const, top: '20%', left: '15%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' as const };
  const bgGlow2 = { position: 'absolute' as const, bottom: '20%', right: '15%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(123,47,255,0.05) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' as const };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      <div style={bgGlow1} />
      <div style={bgGlow2} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        {/* Back */}
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13, marginBottom: 32 }}>
          <ArrowLeft size={14} /> Back to Store
        </Link>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
          <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #00D4FF, #7B2FFF)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={22} color="#000" fill="#000" />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: 0.5 }}>NEXLETRONICS</div>
            <div style={{ fontSize: 10, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', letterSpacing: '2px' }}>ELECTRONICS STORE</div>
          </div>
        </div>

        <div className="glass" style={{ borderRadius: 18, border: '1px solid var(--border-bright)', overflow: 'hidden' }}>
          {/* Tab switcher */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
            {([
              { key: 'login', label: '🔐 Sign In' },
              { key: 'signup', label: '✨ Create Account' },
            ] as const).map(({ key, label }) => (
              <button key={key} onClick={() => switchTab(key)} style={{
                flex: 1, padding: '16px', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
                background: tab === key ? 'rgba(0,212,255,0.06)' : 'transparent',
                color: tab === key ? 'var(--accent-cyan)' : 'var(--text-muted)',
                borderBottom: tab === key ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                transition: 'all 0.2s', fontFamily: 'var(--font-main)',
              }}>{label}</button>
            ))}
          </div>

          <div style={{ padding: 28 }}>
            {/* ── SIGN IN ── */}
            {tab === 'login' && (
              <>
                <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Welcome back!</h1>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>Sign in with the email you registered with</p>

                <form onSubmit={handleLogin}>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 6 }}>Email Address *</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input className="input-field" style={{ paddingLeft: 36, paddingRight: 12, paddingTop: 11, paddingBottom: 11, fontSize: 14 }}
                        type="email" placeholder="you@example.com" required
                        value={email} onChange={e => { setEmail(e.target.value); setError(''); }} />
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 6 }}>Password *</label>
                    <div style={{ position: 'relative' }}>
                      <ShieldCheck size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input className="input-field" style={{ paddingLeft: 36, paddingRight: 12, paddingTop: 11, paddingBottom: 11, fontSize: 14 }}
                        type="password" placeholder="••••••••" required minLength={6}
                        value={password} onChange={e => { setPassword(e.target.value); setError(''); }} />
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '10px 12px', background: 'rgba(255,68,68,0.07)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: 8, marginBottom: 14 }}>
                      <AlertCircle size={14} color="var(--error)" style={{ marginTop: 1, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 13, color: 'var(--error)', fontWeight: 500 }}>{error}</div>
                        <button type="button" onClick={() => switchTab('signup')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-cyan)', fontSize: 12, padding: 0, marginTop: 4, textDecoration: 'underline', fontFamily: 'var(--font-main)' }}>
                          Create an account →
                        </button>
                      </div>
                    </div>
                  )}

                  <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 15, marginTop: 4, borderRadius: 10 }}>
                    {loading ? '⚡ Signing in...' : '🔐 Sign In'}
                  </button>
                </form>

                <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', marginTop: 16 }}>
                  Don't have an account?{' '}
                  <button onClick={() => switchTab('signup')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-cyan)', fontWeight: 600, fontSize: 13, fontFamily: 'var(--font-main)' }}>
                    Create one
                  </button>
                </p>
              </>
            )}

            {/* ── CREATE ACCOUNT ── */}
            {tab === 'signup' && (
              <>
                <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Create your account</h1>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>Join Nexletronics to track orders and save addresses</p>

                {/* OTP Verification Phase */}
                {success === 'VERIFY' ? (
                  <div style={{ padding: '18px', background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 12, textAlign: 'center' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(0,212,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                      <CheckCircle size={20} color="var(--accent-cyan)" />
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Verify your email</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
                      We sent a 6-digit code to <strong style={{ color: 'var(--accent-cyan)' }}>{email}</strong>. Enter it below to activate your account.
                    </div>
                    <form onSubmit={handleVerify}>
                      <div style={{ marginBottom: 14 }}>
                        <input className="input-field" style={{ padding: '11px', fontSize: 18, textAlign: 'center', letterSpacing: '8px', fontFamily: 'var(--font-mono)' }}
                          placeholder="000000" maxLength={6} required
                          value={otp} onChange={e => { setOtp(e.target.value.replace(/[^0-9]/g, '')); setError(''); }} />
                      </div>
                      {error && (
                        <div style={{ fontSize: 13, color: 'var(--error)', marginBottom: 14 }}>{error}</div>
                      )}
                      <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 14, borderRadius: 10 }}>
                        {loading ? 'Verifying...' : 'Verify Email'}
                      </button>
                    </form>
                    <button onClick={() => setSuccess('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12, marginTop: 14, fontFamily: 'var(--font-main)' }}>
                      Wrong email address? Go back
                    </button>
                  </div>
                ) : success === 'EXISTS' ? (
                  <div style={{ padding: '18px', background: 'rgba(255,184,0,0.06)', border: '1px solid rgba(255,184,0,0.2)', borderRadius: 12, textAlign: 'center' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,184,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                      <AlertCircle size={20} color="var(--warning)" />
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Account already exists!</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
                      An account with <strong style={{ color: 'var(--accent-cyan)' }}>{email}</strong> already exists. Please sign in instead.
                    </div>
                    <button onClick={() => { switchTab('login'); }} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 14, borderRadius: 10 }}>
                      🔐 Sign In to Your Account
                    </button>
                    <button onClick={() => setSuccess('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12, marginTop: 10, fontFamily: 'var(--font-main)' }}>
                      Use a different email
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSignup}>
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 6 }}>Full Name *</label>
                      <div style={{ position: 'relative' }}>
                        <User size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input className="input-field" style={{ paddingLeft: 36, paddingRight: 12, paddingTop: 11, paddingBottom: 11, fontSize: 14 }}
                          placeholder="Your full name" required
                          value={name} onChange={e => setName(e.target.value)} />
                      </div>
                    </div>

                    <div style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 6 }}>Email Address *</label>
                      <div style={{ position: 'relative' }}>
                        <Mail size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input className="input-field" style={{ paddingLeft: 36, paddingRight: 12, paddingTop: 11, paddingBottom: 11, fontSize: 14 }}
                          type="email" placeholder="you@example.com" required
                          value={email} onChange={e => { setEmail(e.target.value); setError(''); setSuccess(''); }} />
                      </div>
                    </div>

                    <div style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 6 }}>Password *</label>
                      <div style={{ position: 'relative' }}>
                        <ShieldCheck size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input className="input-field" style={{ paddingLeft: 36, paddingRight: 12, paddingTop: 11, paddingBottom: 11, fontSize: 14 }}
                          type="password" placeholder="Min. 6 characters" required minLength={6}
                          value={password} onChange={e => { setPassword(e.target.value); setError(''); setSuccess(''); }} />
                      </div>
                    </div>

                    <div style={{ marginBottom: 18 }}>
                      <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 6 }}>Phone Number <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                      <div style={{ position: 'relative' }}>
                        <Phone size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input className="input-field" style={{ paddingLeft: 36, paddingRight: 12, paddingTop: 11, paddingBottom: 11, fontSize: 14 }}
                          type="tel" placeholder="+91 98765 43210"
                          value={phone} onChange={e => setPhone(e.target.value)} />
                      </div>
                    </div>

                    {error && (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 12px', background: 'rgba(255,68,68,0.07)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: 8, marginBottom: 14 }}>
                        <AlertCircle size={14} color="var(--error)" style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: 'var(--error)' }}>{error}</span>
                      </div>
                    )}

                    <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 15, borderRadius: 10 }}>
                      {loading ? '⚡ Creating account...' : '✨ Create Account'}
                    </button>
                  </form>
                )}

                {(success !== 'EXISTS' && success !== 'VERIFY') && (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', marginTop: 16 }}>
                    Already have an account?{' '}
                    <button onClick={() => switchTab('login')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-cyan)', fontWeight: 600, fontSize: 13, fontFamily: 'var(--font-main)' }}>
                      Sign In
                    </button>
                  </p>
                )}
              </>
            )}

            {/* Divider + Google */}
            {(success !== 'EXISTS' && success !== 'VERIFY') && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>or continue with</span>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                </div>
                <button
                  onClick={() => loginWithGoogle()}
                  style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1px solid var(--border-bright)', background: 'var(--bg-elevated)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--text-primary)', fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-main)', transition: 'all 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget).style.borderColor = 'rgba(0,212,255,0.3)'; }}
                  onMouseLeave={e => { (e.currentTarget).style.borderColor = 'var(--border-bright)'; }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign in with Google
                </button>
              </>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 20 }}>
              <ShieldCheck size={13} color="var(--success)" />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Your data is safe. We never share your info.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }} />}>
      <LoginContent />
    </Suspense>
  );
}
