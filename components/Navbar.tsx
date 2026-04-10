'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { getSiteSettings } from '@/lib/store';
import { ShoppingCart, Search, Zap, X, ChevronDown, User, Package, LogOut, Menu } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

const NAV_LINKS = [
  ['Home',             '/'],
  ['Products',         '/products'],
  ['Microcontrollers', '/products?cat=Microcontrollers'],
  ['Sensors',          '/products?cat=Sensors'],
  ['Project Kits',     '/products?cat=Project+Kits'],
] as const;

export default function Navbar() {
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();

  const [scrolled,          setScrolled]          = useState(false);
  const [announcement,      setAnnouncement]      = useState('');
  const [showAnnouncement,  setShowAnnouncement]  = useState(true);
  const [searchOpen,        setSearchOpen]        = useState(false);
  const [searchQuery,       setSearchQuery]       = useState('');
  const [userMenuOpen,      setUserMenuOpen]      = useState(false);
  const [mobileMenuOpen,    setMobileMenuOpen]    = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef   = useRef<HTMLInputElement>(null);

  // Close mobile menu on route change
  useEffect(() => { setMobileMenuOpen(false); setUserMenuOpen(false); }, [pathname]);

  useEffect(() => {
    const load = async () => {
      const s = await getSiteSettings();
      if (s) {
        setAnnouncement(s.announcement_text);
        setShowAnnouncement(s.show_announcement);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Close user dropdown on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  // Close search on Escape
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') { setSearchOpen(false); setMobileMenuOpen(false); } };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setMobileMenuOpen(false);
      setSearchQuery('');
    }
  };

  const initial    = user?.name?.charAt(0).toUpperCase();
  const cartCount  = itemCount;

  return (
    <>
      {/* ── Announcement bar ─────────────────────────────── */}
      {showAnnouncement && announcement && (
        <div style={{ background: 'linear-gradient(90deg,var(--accent-purple),var(--accent-cyan))', padding: '7px 40px 7px 16px', textAlign: 'center', position: 'relative', zIndex: 110 }}>
          <p style={{ fontSize: 12, color: '#000', fontWeight: 600 }}>{announcement}</p>
          <button onClick={() => setShowAnnouncement(false)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#000', padding: 4, display: 'flex' }}>
            <X size={13} />
          </button>
        </div>
      )}

      {/* ── Search overlay ───────────────────────────────── */}
      {searchOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(5,5,8,0.92)', zIndex: 300, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 80 }}
          onClick={e => { if (e.target === e.currentTarget) setSearchOpen(false); }}>
          <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: 560, padding: '0 16px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-cyan)', pointerEvents: 'none' }} />
              {/* font-size 16px prevents iOS zoom on focus */}
              <input
                ref={searchRef}
                autoFocus
                className="input-field"
                style={{ paddingLeft: 48, paddingRight: 48, paddingTop: 16, paddingBottom: 16, fontSize: 16, borderColor: 'rgba(0,212,255,0.4)', boxShadow: '0 0 30px rgba(0,212,255,0.15)', borderRadius: 14 }}
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button type="button" onClick={() => setSearchOpen(false)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, display: 'flex' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10, textAlign: 'center' }}>Press Enter to search · Esc to close</div>
          </form>
        </div>
      )}

      {/* ── Main navbar ──────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: scrolled ? 'rgba(5,5,8,0.95)' : 'var(--bg-primary)',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: `1px solid ${scrolled ? 'var(--border)' : 'transparent'}`,
        boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.4)' : 'none',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#00D4FF,#7B2FFF)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={16} color="#000" fill="#000" />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.5px', lineHeight: 1.2 }}>NEXLETRONICS</div>
              <div style={{ fontSize: 7, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', letterSpacing: '2px' }}>ELECTRONICS STORE</div>
            </div>
          </Link>

          {/* Desktop nav links — hidden on mobile */}
          <div className="nav-links" style={{ display: 'flex', gap: 20, alignItems: 'center', flex: 1, justifyContent: 'center' }}>
            {NAV_LINKS.map(([label, href]) => (
              <Link key={label} href={href} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.target as HTMLElement).style.color = 'var(--text-primary)'}
                onMouseLeave={e => (e.target as HTMLElement).style.color = 'var(--text-secondary)'}>
                {label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>

            {/* Search button */}
            <button onClick={() => setSearchOpen(true)} aria-label="Search"
              style={{ width: 40, height: 40, borderRadius: 9, background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', flexShrink: 0 }}>
              <Search size={15} />
            </button>

            {/* Cart */}
            <Link href="/cart" aria-label="Cart"
              style={{ position: 'relative', width: 40, height: 40, borderRadius: 9, background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: 'var(--text-secondary)', flexShrink: 0 }}>
              <ShoppingCart size={15} />
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: -5, right: -5, width: 18, height: 18, borderRadius: '50%', background: 'var(--accent-cyan)', color: '#000', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-primary)' }}>
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* User menu — desktop only */}
            <div className="nav-user-desktop" ref={userMenuRef} style={{ position: 'relative' }}>
              {user ? (
                <>
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 9, background: 'var(--bg-elevated)', border: '1px solid var(--border-bright)', cursor: 'pointer', color: 'var(--text-primary)', fontFamily: 'var(--font-main)' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent-cyan),var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#000', flexShrink: 0 }}>
                      {initial}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500, maxWidth: 72, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name.split(' ')[0]}</span>
                    <ChevronDown size={12} style={{ transform: userMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
                  </button>

                  {userMenuOpen && (
                    <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 200, background: 'var(--bg-surface)', border: '1px solid var(--border-bright)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 16px 48px rgba(0,0,0,0.5)', zIndex: 101 }}>
                      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{user.email}</div>
                      </div>
                      {[{ href: '/account', label: 'My Account', icon: <User size={13} /> }, { href: '/orders', label: 'My Orders', icon: <Package size={13} /> }].map(({ href, label, icon }) => (
                        <Link key={label} href={href} onClick={() => setUserMenuOpen(false)}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', textDecoration: 'none', color: 'var(--text-secondary)', fontSize: 13 }}
                          onMouseEnter={e => { (e.currentTarget).style.background = 'rgba(0,212,255,0.05)'; (e.currentTarget).style.color = 'var(--text-primary)'; }}
                          onMouseLeave={e => { (e.currentTarget).style.background = 'transparent'; (e.currentTarget).style.color = 'var(--text-secondary)'; }}>
                          {icon} {label}
                        </Link>
                      ))}
                      <div style={{ borderTop: '1px solid var(--border)' }}>
                        <button onClick={() => { logout(); setUserMenuOpen(false); router.push('/'); }}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', fontSize: 13, fontFamily: 'var(--font-main)', textAlign: 'left' }}
                          onMouseEnter={e => { (e.currentTarget).style.background = 'rgba(255,68,68,0.05)'; }}
                          onMouseLeave={e => { (e.currentTarget).style.background = 'transparent'; }}>
                          <LogOut size={13} /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Link href="/login" className="btn-primary" style={{ padding: '8px 16px', fontSize: 13, textDecoration: 'none', borderRadius: 8, whiteSpace: 'nowrap' }}>
                  Sign In
                </Link>
              )}
            </div>

            {/* ☰ Hamburger button — mobile only */}
            <button
              className="nav-hamburger"
              onClick={() => setMobileMenuOpen(o => !o)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              style={{ width: 40, height: 40, borderRadius: 9, background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'none', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-primary)', flexShrink: 0 }}>
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile drawer ─────────────────────────────────── */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div onClick={() => setMobileMenuOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 150, backdropFilter: 'blur(4px)' }} />

          {/* Drawer panel */}
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(300px, 85vw)',
            background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-bright)',
            zIndex: 160, display: 'flex', flexDirection: 'column', overflowY: 'auto',
            boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
            animation: 'slideInRight 0.25s ease',
          }}>
            {/* Drawer header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#00D4FF,#7B2FFF)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={13} color="#000" fill="#000" />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.5px' }}>NEXLETRONICS</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)}
                style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={16} />
              </button>
            </div>

            {/* User info in drawer */}
            {user && (
              <div style={{ padding: '16px 20px', background: 'rgba(0,212,255,0.04)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent-cyan),var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#000', flexShrink: 0 }}>
                    {initial}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user.email}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Nav links */}
            <div style={{ padding: '8px 0' }}>
              <div style={{ padding: '8px 20px 4px', fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Browse</div>
              {NAV_LINKS.map(([label, href]) => (
                <Link key={label} href={href} onClick={() => setMobileMenuOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', padding: '13px 20px', textDecoration: 'none', color: 'var(--text-secondary)', fontSize: 15, fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget).style.background = 'rgba(0,212,255,0.05)'; (e.currentTarget).style.color = 'var(--text-primary)'; }}
                  onMouseLeave={e => { (e.currentTarget).style.background = 'transparent'; (e.currentTarget).style.color = 'var(--text-secondary)'; }}>
                  {label}
                </Link>
              ))}
            </div>

            {/* Account links */}
            <div style={{ padding: '8px 0', borderTop: '1px solid var(--border)' }}>
              <div style={{ padding: '8px 20px 4px', fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Account</div>
              {user ? (
                <>
                  {[{ href: '/account', label: 'My Account', icon: <User size={15} /> }, { href: '/orders', label: 'My Orders', icon: <Package size={15} /> }].map(({ href, label, icon }) => (
                    <Link key={label} href={href} onClick={() => setMobileMenuOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px', textDecoration: 'none', color: 'var(--text-secondary)', fontSize: 15 }}>
                      {icon} {label}
                    </Link>
                  ))}
                  <button onClick={() => { logout(); setMobileMenuOpen(false); router.push('/'); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', fontSize: 15, fontFamily: 'var(--font-main)', textAlign: 'left' }}>
                    <LogOut size={15} /> Sign Out
                  </button>
                </>
              ) : (
                <div style={{ padding: '12px 20px' }}>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '13px', textDecoration: 'none', borderRadius: 10, fontSize: 15, display: 'flex' }}>
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Responsive styles */}
      <style jsx global>{`
        /* Show hamburger, hide desktop nav on mobile */
        @media (max-width: 768px) {
          .nav-links            { display: none !important; }
          .nav-user-desktop     { display: none !important; }
          .nav-hamburger        { display: flex !important; }
        }
        /* Hide hamburger on desktop */
        @media (min-width: 769px) {
          .nav-hamburger        { display: none !important; }
          .nav-user-desktop     { display: flex !important; }
        }
        /* Slide-in animation for drawer */
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        /* Fix: inputs must be 16px on mobile to prevent iOS keyboard zoom/scroll */
        @media (max-width: 768px) {
          input, textarea, select {
            font-size: 16px !important;
          }
        }
      `}</style>
    </>
  );
}
