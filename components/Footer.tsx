'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSiteSettings } from '@/lib/store';
import { Zap, Mail, Phone } from 'lucide-react';

const InstagramIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);
const TwitterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
);

export default function Footer() {
  const [email, setEmail] = useState('support@nexletronics.in');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');

  useEffect(() => {
    const load = async () => {
      const s = await getSiteSettings();
      if (s) {
        if (s.contact_email) setEmail(s.contact_email);
        if (s.contact_phone) setPhone(s.contact_phone);
        setInstagram(s.instagram_url || '');
        setTwitter(s.twitter_url || '');
      }
    };
    load();
  }, []);

  return (
    <footer style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', padding: '60px 24px 30px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* Top row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 48 }}>

          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={18} color="#FFF" fill="#FFF" />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>NEXLETRONICS</div>
                <div style={{ fontSize: 9, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', letterSpacing: '2px' }}>ELECTRONICS STORE</div>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.7, maxWidth: 220 }}>
              Your trusted source for premium electronic components, modules & project kits. Serving hobbyists & engineers across India.
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <a
                href={instagram || '#'}
                target={instagram ? '_blank' : undefined}
                rel="noreferrer"
                style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: instagram ? 'var(--text-primary)' : 'var(--text-muted)', transition: 'all 0.2s' }}
              >
                <InstagramIcon />
              </a>
              <a
                href={twitter || '#'}
                target={twitter ? '_blank' : undefined}
                rel="noreferrer"
                style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: twitter ? 'var(--text-primary)' : 'var(--text-muted)', transition: 'all 0.2s' }}
              >
                <TwitterIcon />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 16, fontSize: 14 }}>Shop</h4>
            {[
              ['All Products', '/products'],
              ['Microcontrollers', '/products?cat=Microcontrollers'],
              ['Sensors', '/products?cat=Sensors'],
              ['Displays', '/products?cat=Displays'],
              ['Motor Drivers', '/products?cat=Motor+Drivers'],
              ['Project Kits', '/products?cat=Project+Kits'],
              ['Passive Components', '/products?cat=Passive+Components'],
            ].map(([label, href]) => (
              <Link key={href} href={href} style={{ display: 'block', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 13, marginBottom: 8, transition: 'color 0.2s' }}
                onMouseEnter={e => (e.target as HTMLElement).style.color = 'var(--accent-cyan)'}
                onMouseLeave={e => (e.target as HTMLElement).style.color = 'var(--text-secondary)'}>
                {label}
              </Link>
            ))}
          </div>

          {/* Info */}
          <div>
            <h4 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 16, fontSize: 14 }}>Information</h4>
            {[
              ['About Us', '/about'],
              ['Shipping Policy', '/shipping'],
              ['Return Policy', '/returns'],
              ['Privacy Policy', '/privacy'],
              ['Terms & Conditions', '/terms'],
              ['Track Your Order', '/orders'],
            ].map(([label, href]) => (
              <Link key={label} href={href} style={{ display: 'block', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 13, marginBottom: 8, transition: 'color 0.2s' }}
                onMouseEnter={e => (e.target as HTMLElement).style.color = 'var(--accent-cyan)'}
                onMouseLeave={e => (e.target as HTMLElement).style.color = 'var(--text-secondary)'}>
                {label}
              </Link>
            ))}
          </div>

          {/* Contact — reads live from settings */}
          <div>
            <h4 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 16, fontSize: 14 }}>Contact Us</h4>
            <a href={`mailto:${email}`} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--text-secondary)', fontSize: 13, textDecoration: 'none' }}>
              <Mail size={14} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
              {email}
            </a>
            <a href={`tel:${phone}`} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, color: 'var(--text-secondary)', fontSize: 13, textDecoration: 'none' }}>
              <Phone size={14} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
              {phone}
            </a>
            <div style={{ padding: '12px 16px', background: 'rgba(0, 212, 255, 0.05)', border: '1px solid rgba(0, 212, 255, 0.15)', borderRadius: 10 }}>
              <div style={{ fontSize: 12, color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: 4 }}>Payment Methods</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>UPI · Cards · Net Banking · Wallets</div>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
            © 2026 Nexletronics. All rights reserved.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
            Made with <span style={{ color: 'var(--accent-cyan)' }}>⚡</span> for electronics enthusiasts
          </p>
        </div>
      </div>
    </footer>
  );
}
