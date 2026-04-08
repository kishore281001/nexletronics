'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { getSiteSettings } from '@/lib/store';
import { onStoreUpdate } from '@/lib/sync';
import { ShoppingCart, Search, Zap, X, ChevronDown, User, Package, LogOut, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const cartCount = itemCount;

  useEffect(() => {
    const load = () => {
      const s = getSiteSettings();
      setAnnouncement(s.announcement_text);
      setShowAnnouncement(s.show_announcement);
    };
    load();
    const unsub = onStoreUpdate(load);
    return unsub;
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const initial = user?.name?.charAt(0).toUpperCase();

  return (
    <>
      {/* Announcement bar */}
      {showAnnouncement && announcement && (
        <div style={{ background: 'linear-gradient(90deg, var(--accent-purple), var(--accent-cyan))', padding: '7px 16px', textAlign: 'center', position: 'relative' }}>
          <p style={{ fontSize: 12, color: '#000', fontWeight: 600 }}>{announcement}</p>
          <button onClick={() => setShowAnnouncement(false)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#000', display: 'flex' }}>
            <X size={13} />
          </button>
        </div>
      )}

      {/* Search overlay */}
      {searchOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(5,5,8,0.9)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 80 }}
          onClick={e => { if (e.target === e.currentTarget) setSearchOpen(false); }}>
          <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: 560, padding: '0 24px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-cyan)' }} />
              <input autoFocus className="input-field" style={{ paddingLeft: 48, paddingRight: 16, paddingTop: 16, paddingBottom: 16, fontSize: 17, borderColor: 'rgba(0,212,255,0.4)', boxShadow: '0 0 30px rgba(0,212,255,0.15)', borderRadius: 14 }}
                placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10, textAlign: 'center' }}>Press Enter to search · Esc to close</div>
          </form>
        </div>
      )}

      {/* Main navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100, transition: 'all 0.3s ease',
        background: scrolled ? 'rgba(5,5,8,0.92)' : 'var(--bg-primary)',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: `1px solid ${scrolled ? 'var(--border)' : 'transparent'}`,
        boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.4)' : 'none',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg, #00D4FF, #7B2FFF)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={17} color="#000" fill="#000" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.5px' }}>NEXLETRONICS</div>
              <div style={{ fontSize: 8, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', letterSpacing: '2px' }}>ELECTRONICS STORE</div>
            </div>
          </Link>

          {/* Nav links */}
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            {[['Home', '/'], ['Products', '/products'], ['Microcontrollers', '/products?cat=Microcontrollers'], ['Sensors', '/products?cat=Sensors'], ['Project Kits', '/products?cat=Project+Kits']].map(([label, href]) => (
              <Link key={label} href={href} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 13, fontWeight: 500, transition: 'color 0.2s', whiteSpace: 'nowrap' }}
                onMouseEnter={e => (e.target as HTMLElement).style.color = 'var(--text-primary)'}
                onMouseLeave={e => (e.target as HTMLElement).style.color = 'var(--text-secondary)'}>
                {label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {/* Search */}
            <button id="nav-search" onClick={() => setSearchOpen(true)} style={{ width: 38, height: 38, borderRadius: 9, background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget).style.borderColor = 'rgba(0,212,255,0.4)'; (e.currentTarget).style.color = 'var(--accent-cyan)'; }}
              onMouseLeave={e => { (e.currentTarget).style.borderColor = 'var(--border)'; (e.currentTarget).style.color = 'var(--text-secondary)'; }}>
              <Search size={15} />
            </button>

            {/* Cart */}
            <Link href="/cart" id="nav-cart" style={{ position: 'relative', width: 38, height: 38, borderRadius: 9, background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: 'var(--text-secondary)', transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget).style.borderColor = 'rgba(0,212,255,0.4)'; (e.currentTarget).style.color = 'var(--accent-cyan)'; }}
              onMouseLeave={e => { (e.currentTarget).style.borderColor = 'var(--border)'; (e.currentTarget).style.color = 'var(--text-secondary)'; }}>
              <ShoppingCart size={15} />
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: -5, right: -5, width: 17, height: 17, borderRadius: '50%', background: 'var(--accent-cyan)', color: '#000', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            {user ? (
              <div ref={userMenuRef} style={{ position: 'relative' }}>
                <button id="nav-user" onClick={() => setUserMenuOpen(!userMenuOpen)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 9, background: 'var(--bg-elevated)', border: '1px solid var(--border-bright)', cursor: 'pointer', color: 'var(--text-primary)', transition: 'all 0.2s', fontFamily: 'var(--font-main)' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#000' }}>
                    {initial}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name.split(' ')[0]}</span>
                  <ChevronDown size={12} style={{ transition: 'transform 0.2s', transform: userMenuOpen ? 'rotate(180deg)' : 'none' }} />
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 200, background: 'var(--bg-surface)', border: '1px solid var(--border-bright)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 16px 48px rgba(0,0,0,0.5)', zIndex: 101 }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user.email}</div>
                    </div>
                    {[
                      { href: '/account', label: 'My Account', icon: <User size={13} /> },
                      { href: '/orders', label: 'My Orders', icon: <Package size={13} /> },
                    ].map(({ href, label, icon }) => (
                      <Link key={label} href={href} onClick={() => setUserMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', textDecoration: 'none', color: 'var(--text-secondary)', fontSize: 13, transition: 'all 0.15s' }}
                        onMouseEnter={e => { (e.currentTarget).style.background = 'rgba(0,212,255,0.05)'; (e.currentTarget).style.color = 'var(--text-primary)'; }}
                        onMouseLeave={e => { (e.currentTarget).style.background = 'transparent'; (e.currentTarget).style.color = 'var(--text-secondary)'; }}>
                        {icon} {label}
                      </Link>
                    ))}
                    <div style={{ borderTop: '1px solid var(--border)' }}>
                      <button onClick={() => { logout(); setUserMenuOpen(false); router.push('/'); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', fontSize: 13, fontFamily: 'var(--font-main)', transition: 'all 0.15s', textAlign: 'left' }}
                        onMouseEnter={e => { (e.currentTarget).style.background = 'rgba(255,68,68,0.05)'; }}
                        onMouseLeave={e => { (e.currentTarget).style.background = 'transparent'; }}>
                        <LogOut size={13} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" id="nav-login" className="btn-primary" style={{ padding: '8px 16px', fontSize: 13, textDecoration: 'none', borderRadius: 8 }}>
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
