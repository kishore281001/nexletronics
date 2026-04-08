'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminAuth } from '@/lib/admin-auth-context';
import { LayoutDashboard, Package, ShoppingBag, Star, Settings, LogOut, Zap, ExternalLink, ShieldCheck, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const NAV = [
  { href: '/admin',          label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { href: '/admin/products', label: 'Products',  icon: <Package size={20} /> },
  { href: '/admin/orders',   label: 'Orders',    icon: <ShoppingBag size={20} /> },
  { href: '/admin/featured', label: 'Featured',  icon: <Star size={20} /> },
  { href: '/admin/settings', label: 'Settings',  icon: <Settings size={20} /> },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { adminLogout } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Lock body scroll when mobile drawer open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = () => { adminLogout(); router.refresh(); };

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────── */}
      <aside className="admin-sidebar-desktop" style={{
        width: 240, minHeight: '100vh', position: 'sticky', top: 0,
        background: 'var(--bg-surface)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
      }}>
        <SidebarContent pathname={pathname} isActive={isActive} handleLogout={handleLogout} />
      </aside>

      {/* ── Mobile: top bar ─────────────────────────────── */}
      <div className="admin-topbar-mobile" style={{
        display: 'none', position: 'sticky', top: 0, zIndex: 200,
        background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)',
        alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', height: 56,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#00D4FF,#7B2FFF)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={13} color="#000" fill="#000" />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.5px', lineHeight: 1.2 }}>NEXLETRONICS</div>
            <div style={{ fontSize: 7, color: '#A855F7', fontFamily: 'var(--font-mono)', letterSpacing: '1.5px' }}>ADMIN PANEL</div>
          </div>
        </div>

        {/* Hamburger */}
        <button onClick={() => setMobileOpen(o => !o)}
          style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-primary)' }}>
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* ── Mobile drawer ────────────────────────────────── */}
      {mobileOpen && (
        <div className="admin-mobile-drawer-wrap">
          {/* Backdrop */}
          <div onClick={() => setMobileOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 210, backdropFilter: 'blur(4px)' }} />

          {/* Drawer */}
          <div style={{
            position: 'fixed', top: 56, left: 0, bottom: 0, width: 'min(280px, 85vw)',
            background: 'var(--bg-surface)', borderRight: '1px solid var(--border-bright)',
            zIndex: 220, overflowY: 'auto',
            boxShadow: '20px 0 60px rgba(0,0,0,0.5)',
            animation: 'slideInLeft 0.25s ease',
          }}>
            <SidebarContent pathname={pathname} isActive={isActive} handleLogout={handleLogout} />
          </div>
        </div>
      )}

      <style jsx global>{`
        /* Show desktop sidebar on lg screens, hide on mobile */
        @media (min-width: 769px) {
          .admin-sidebar-desktop  { display: flex !important; }
          .admin-topbar-mobile    { display: none !important; }
        }
        @media (max-width: 768px) {
          .admin-sidebar-desktop  { display: none !important; }
          .admin-topbar-mobile    { display: flex !important; }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
        /* Fix iOS keyboard zoom for all admin inputs */
        input, textarea, select {
          font-size: 16px !important;
          -webkit-text-size-adjust: 100%;
        }
      `}</style>
    </>
  );
}

/* ── Shared sidebar content (used in both desktop + drawer) ─── */
function SidebarContent({ pathname, isActive, handleLogout }: {
  pathname: string;
  isActive: (href: string) => boolean;
  handleLogout: () => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo — desktop only (mobile shows topbar) */}
      <div className="admin-sidebar-logo" style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#00D4FF,#7B2FFF)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={16} color="#000" fill="#000" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.5px' }}>NEXLETRONICS</div>
            <div style={{ fontSize: 9, color: '#A855F7', fontFamily: 'var(--font-mono)', letterSpacing: '1.5px' }}>ADMIN PANEL</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 10, padding: '4px 8px', background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.15)', borderRadius: 6, width: 'fit-content' }}>
          <ShieldCheck size={11} color="var(--success)" />
          <span style={{ fontSize: 10, color: 'var(--success)', fontFamily: 'var(--font-mono)', letterSpacing: '0.5px' }}>AUTHENTICATED</span>
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ padding: '12px 10px', flex: 1 }}>
        {NAV.map(({ href, label, icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center',
              gap: 10, padding: '12px 14px', borderRadius: 9, marginBottom: 4,
              textDecoration: 'none',
              background: active ? 'rgba(0,212,255,0.08)' : 'transparent',
              color: active ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              borderLeft: active ? '3px solid var(--accent-cyan)' : '3px solid transparent',
              fontWeight: active ? 600 : 400, fontSize: 15,
              minHeight: 48, // good touch target
            }}>
              {icon}
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '10px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Link href="/" target="_blank" style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
          borderRadius: 8, textDecoration: 'none', fontSize: 13, color: 'var(--text-muted)',
          border: '1px solid var(--border)', minHeight: 44,
        }}>
          <ExternalLink size={14} /> View Store ↗
        </Link>
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
          borderRadius: 8, fontSize: 13, color: 'var(--error)',
          border: '1px solid rgba(255,68,68,0.2)', background: 'rgba(255,68,68,0.04)',
          cursor: 'pointer', fontFamily: 'var(--font-main)', width: '100%',
          textAlign: 'left', minHeight: 44,
        }}>
          <LogOut size={14} /> Lock Admin Panel
        </button>
      </div>
    </div>
  );
}
