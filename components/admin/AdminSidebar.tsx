'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminAuth } from '@/lib/admin-auth-context';
import { LayoutDashboard, Package, ShoppingBag, Star, Settings, LogOut, Zap, ChevronRight, ExternalLink, ShieldCheck } from 'lucide-react';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={17} /> },
  { href: '/admin/products', label: 'Products', icon: <Package size={17} /> },
  { href: '/admin/orders', label: 'Orders', icon: <ShoppingBag size={17} /> },
  { href: '/admin/featured', label: 'Featured Showcase', icon: <Star size={17} /> },
  { href: '/admin/settings', label: 'Settings', icon: <Settings size={17} /> },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { adminLogout } = useAdminAuth();

  const handleLogout = () => {
    adminLogout();
    router.refresh();
  };

  return (
    <aside style={{
      width: 240, height: '100vh', position: 'sticky', top: 0,
      background: 'var(--bg-surface)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #00D4FF, #7B2FFF)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={16} color="#000" fill="#000" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.5px' }}>NEXLETRONICS</div>
            <div style={{ fontSize: 9, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', letterSpacing: '1.5px' }}>ADMIN PANEL</div>
          </div>
        </div>

        {/* Authenticated badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 10, padding: '4px 8px', background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.15)', borderRadius: 6, width: 'fit-content' }}>
          <ShieldCheck size={11} color="var(--success)" />
          <span style={{ fontSize: 10, color: 'var(--success)', fontFamily: 'var(--font-mono)', letterSpacing: '0.5px' }}>AUTHENTICATED</span>
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ padding: '16px 12px', flex: 1 }}>
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 10, padding: '10px 12px', borderRadius: 9, marginBottom: 4,
              textDecoration: 'none', transition: 'all 0.15s ease',
              background: active ? 'rgba(0, 212, 255, 0.08)' : 'transparent',
              color: active ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              borderLeft: active ? '3px solid var(--accent-cyan)' : '3px solid transparent',
              fontWeight: active ? 600 : 400, fontSize: 14,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {icon} {label}
              </div>
              {active && <ChevronRight size={13} />}
            </Link>
          );
        })}
      </nav>

      {/* Footer actions */}
      <div style={{ padding: '12px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {/* View Store */}
        <Link href="/" target="_blank" style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 8,
          textDecoration: 'none', fontSize: 13, color: 'var(--text-muted)',
          border: '1px solid var(--border)', background: 'transparent', transition: 'all 0.2s',
        }}>
          <ExternalLink size={14} /> View Store ↗
        </Link>

        {/* Logout */}
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 8,
          fontSize: 13, color: 'var(--error)', border: '1px solid rgba(255,68,68,0.2)',
          background: 'rgba(255,68,68,0.04)', cursor: 'pointer', transition: 'all 0.2s',
          fontFamily: 'var(--font-main)', width: '100%', textAlign: 'left',
        }}
          onMouseEnter={e => { (e.currentTarget).style.background = 'rgba(255,68,68,0.1)'; }}
          onMouseLeave={e => { (e.currentTarget).style.background = 'rgba(255,68,68,0.04)'; }}
        >
          <LogOut size={14} /> Lock Admin Panel
        </button>
      </div>
    </aside>
  );
}
