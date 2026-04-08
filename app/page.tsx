'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { getProducts, getFeaturedProducts, getSiteSettings } from '@/lib/store';
import { onStoreUpdate } from '@/lib/sync';
import { Product, SiteSettings } from '@/lib/types';
import {
  Zap, ArrowRight, ShieldCheck, Truck, Package, Cpu,
  Radio, Monitor, RotateCcw, ChevronRight, Star
} from 'lucide-react';

// --- Circuit SVG Background ---
function CircuitBg() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <svg width="100%" height="100%" style={{ opacity: 0.04 }}>
        <defs>
          <pattern id="circuit" width="120" height="120" patternUnits="userSpaceOnUse">
            <line x1="60" y1="0" x2="60" y2="40" stroke="#00D4FF" strokeWidth="1"/>
            <line x1="60" y1="80" x2="60" y2="120" stroke="#00D4FF" strokeWidth="1"/>
            <line x1="0" y1="60" x2="40" y2="60" stroke="#00D4FF" strokeWidth="1"/>
            <line x1="80" y1="60" x2="120" y2="60" stroke="#00D4FF" strokeWidth="1"/>
            <circle cx="60" cy="60" r="6" fill="none" stroke="#00D4FF" strokeWidth="1"/>
            <circle cx="60" cy="60" r="2" fill="#00D4FF"/>
            <circle cx="0" cy="0" r="2" fill="#7B2FFF"/>
            <circle cx="120" cy="120" r="2" fill="#7B2FFF"/>
            <circle cx="0" cy="120" r="2" fill="#7B2FFF"/>
            <circle cx="120" cy="0" r="2" fill="#7B2FFF"/>
            <line x1="40" y1="60" x2="40" y2="40" stroke="#7B2FFF" strokeWidth="0.5"/>
            <line x1="80" y1="60" x2="80" y2="80" stroke="#7B2FFF" strokeWidth="0.5"/>
            <rect x="36" y="36" width="8" height="8" fill="none" stroke="#7B2FFF" strokeWidth="0.5"/>
            <rect x="76" y="76" width="8" height="8" fill="none" stroke="#7B2FFF" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#circuit)"/>
      </svg>
      {/* Radial glow spots */}
      <div style={{ position: 'absolute', top: '20%', left: '10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%)', borderRadius: '50%' }}/>
      <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(123,47,255,0.04) 0%, transparent 70%)', borderRadius: '50%' }}/>
    </div>
  );
}

// --- Featured Showcase Panel ---
function FeaturedShowcase({ products, title }: { products: Product[]; title: string }) {
  if (products.length === 0) return null;
  const doubled = [...products, ...products]; // for seamless marquee

  return (
    <section style={{ padding: '60px 0', overflow: 'hidden', position: 'relative' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 3, height: 20, background: 'linear-gradient(#00D4FF, #7B2FFF)', borderRadius: 2 }} />
              <span style={{ fontSize: 12, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', letterSpacing: '2px', textTransform: 'uppercase' }}>Spotlight</span>
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{title}</h2>
          </div>
          <Link href="/products?featured=true" className="btn-secondary" style={{ padding: '8px 16px', fontSize: 13, textDecoration: 'none' }}>
            <span>View All</span> <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Gradient masks */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 120, height: '100%', background: 'linear-gradient(90deg, var(--bg-primary), transparent)', zIndex: 2, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, right: 0, width: 120, height: '100%', background: 'linear-gradient(270deg, var(--bg-primary), transparent)', zIndex: 2, pointerEvents: 'none' }} />

      <div style={{ display: 'flex', overflow: 'hidden' }}>
        <div className="animate-marquee" style={{ display: 'flex', gap: 20, paddingLeft: 20 }}>
          {doubled.map((product, idx) => (
            <Link href={`/products/${product.id}`} key={`${product.id}-${idx}`} style={{ textDecoration: 'none', flexShrink: 0, width: 260 }}>
              <div className="glass glow-cyan" style={{
                borderRadius: 14, padding: 18, border: '1px solid var(--border)',
                transition: 'all 0.25s ease', cursor: 'pointer', height: '100%',
              }}
                onMouseEnter={e => {
                  const el = e.currentTarget;
                  el.style.borderColor = 'rgba(0, 212, 255, 0.4)';
                  el.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget;
                  el.style.borderColor = 'var(--border)';
                  el.style.transform = 'translateY(0)';
                }}
              >
                {/* Product image or icon */}
                <div style={{ height: 100, background: 'var(--bg-elevated)', borderRadius: 10, marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                  {product.images.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} />
                  ) : (
                    <Package size={32} color="var(--accent-cyan)" />
                  )}
                </div>
                <div style={{ fontSize: 10, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', marginBottom: 6, letterSpacing: '0.5px' }}>{product.category}</div>
                <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px', lineHeight: 1.4 }}>{product.name}</h4>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent-cyan)' }}>₹{(product.discount_price || product.price).toLocaleString()}</span>
                  {product.discount_price && (
                    <span className="badge badge-cyan" style={{ fontSize: 10 }}>
                      -{Math.round(((product.price - product.discount_price) / product.price) * 100)}% OFF
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Category data ---
const CATEGORIES = [
  { name: 'Microcontrollers', slug: 'Microcontrollers', icon: <Cpu size={22} />, color: '#00D4FF', desc: 'Arduino, ESP32 & more' },
  { name: 'Sensors', slug: 'Sensors', icon: <Radio size={22} />, color: '#7B2FFF', desc: 'Ultrasonic, IR, DHT & more' },
  { name: 'Displays', slug: 'Displays', icon: <Monitor size={22} />, color: '#FFD700', desc: 'OLED, LCD, TFT & more' },
  { name: 'Motor Drivers', slug: 'Motor Drivers', icon: <RotateCcw size={22} />, color: '#00FF88', desc: 'L298N, TB6612 & more' },
  { name: 'Project Kits', slug: 'Kits', icon: <Package size={22} />, color: '#FF6B6B', desc: 'Complete DIY project kits' },
  { name: 'Passive Components', slug: 'Passive Components', icon: <Zap size={22} />, color: '#FFB800', desc: 'Resistors, Caps, LEDs & more' },
];

export default function HomePage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  const loadData = () => {
    setAllProducts(getProducts().filter(p => p.is_active));
    setFeaturedProducts(getFeaturedProducts());
    setSettings(getSiteSettings());
  };

  useEffect(() => {
    loadData();
    // Listen for changes from admin tab — auto-refresh without page reload
    const unsub = onStoreUpdate(loadData);
    return unsub;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const newArrivals = [...allProducts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 4);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />

      {/* ── HERO ── */}
      <section style={{ position: 'relative', minHeight: '88vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <CircuitBg />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px', position: 'relative', zIndex: 1, width: '100%' }}>
          <div style={{ maxWidth: 720 }}>
            {/* Eyebrow */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 99, background: 'rgba(0, 212, 255, 0.08)', border: '1px solid rgba(0, 212, 255, 0.2)', marginBottom: 28 }}>
              <div className="pulse-cyan" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-cyan)' }} />
              <span style={{ fontSize: 12, color: 'var(--accent-cyan)', fontWeight: 600, letterSpacing: '1px', fontFamily: 'var(--font-mono)' }}>INDIA'S ELECTRONICS DESTINATION</span>
            </div>

            {/* Headline */}
            <h1 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-1px', marginBottom: 24, color: 'var(--text-primary)' }}>
              Build <span className="gradient-text">Something</span>
              <br />
              <span style={{ color: 'var(--text-secondary)' }}>Extraordinary</span>
            </h1>

            <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 520, marginBottom: 36 }}>
              Premium electronic components, Arduino kits, sensors and project modules — delivered fast anywhere in India. Everything you need to build your next big project.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link href="/products" className="btn-primary" style={{ padding: '14px 28px', fontSize: 15, textDecoration: 'none', borderRadius: 10 }}>
                <Zap size={16} /> Shop Now
              </Link>
              <Link href="/products?cat=Kits" className="btn-secondary" style={{ padding: '14px 28px', fontSize: 15, textDecoration: 'none', borderRadius: 10 }}>
                View Project Kits <ArrowRight size={16} />
              </Link>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 40, marginTop: 52, flexWrap: 'wrap' }}>
              {[['500+', 'Products'], ['1000+', 'Orders'], ['4.9★', 'Rating'], ['Pan-India', 'Delivery']].map(([val, label]) => (
                <div key={label}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{val}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative right element */}
        <div style={{ position: 'absolute', right: -100, top: '50%', transform: 'translateY(-50%)', width: 600, height: 600, opacity: 0.06, background: 'radial-gradient(circle, #00D4FF 0%, transparent 70%)', pointerEvents: 'none' }} />
      </section>

      {/* ── TRUST BADGES ── */}
      <div style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 24px', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 16 }}>
          {[
            { icon: <Truck size={16} />, label: 'Fast Delivery', sub: 'Pan-India Shipping' },
            { icon: <ShieldCheck size={16} />, label: 'Genuine Parts', sub: '100% Authentic' },
            { icon: <Package size={16} />, label: 'Secure Packaging', sub: 'Anti-static packing' },
            { icon: <RotateCcw size={16} />, label: 'Easy Returns', sub: '7-day return policy' },
          ].map(({ icon, label, sub }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ color: 'var(--accent-cyan)' }}>{icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURED SHOWCASE PANEL ── */}
      <FeaturedShowcase
        products={featuredProducts}
        title={settings?.featured_panel_title || 'Featured Products'}
      />

      {/* ── CATEGORIES ── */}
      <section style={{ padding: '60px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 3, height: 20, background: 'linear-gradient(#00D4FF, #7B2FFF)', borderRadius: 2 }} />
              <span style={{ fontSize: 12, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', letterSpacing: '2px' }}>BROWSE BY TYPE</span>
              <div style={{ width: 3, height: 20, background: 'linear-gradient(#7B2FFF, #00D4FF)', borderRadius: 2 }} />
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)' }}>Shop by Category</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
            {CATEGORIES.map(cat => (
              <Link href={`/products?cat=${cat.slug}`} key={cat.name} style={{ textDecoration: 'none' }}>
                <div className="glass card-hover" style={{
                  borderRadius: 14, padding: '24px 16px', textAlign: 'center',
                  border: '1px solid var(--border)', cursor: 'pointer',
                }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 12, margin: '0 auto 14px',
                    background: `${cat.color}15`, border: `1px solid ${cat.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: cat.color, transition: 'all 0.2s',
                  }}>
                    {cat.icon}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{cat.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{cat.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEW ARRIVALS ── */}
      {newArrivals.length > 0 && (
        <section style={{ padding: '60px 24px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 3, height: 20, background: 'linear-gradient(#00FF88, #00D4FF)', borderRadius: 2 }} />
                  <span style={{ fontSize: 12, color: '#00FF88', fontFamily: 'var(--font-mono)', letterSpacing: '2px' }}>JUST LANDED</span>
                </div>
                <h2 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>New Arrivals</h2>
              </div>
              <Link href="/products" className="btn-ghost" style={{ padding: '8px 16px', fontSize: 13, textDecoration: 'none' }}>
                View All <ChevronRight size={14} />
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
              {newArrivals.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── WHY NEXLETRONICS ── */}
      <section style={{ padding: '80px 24px', position: 'relative', overflow: 'hidden' }}>
        <CircuitBg />
        <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Why Choose <span className="gradient-text">Nexletronics?</span></h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 500, margin: '0 auto' }}>
              Trusted by hobbyists, students and engineers across India
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {[
              { title: 'Genuine Components', desc: 'Every product sourced from verified manufacturers. No clones, no counterfeits.', color: '#00D4FF' },
              { title: 'Expert Support', desc: 'Technical support from real electronics engineers. We help you build.', color: '#7B2FFF' },
              { title: 'Fast India-wide Shipping', desc: 'Orders dispatched within 24 hours. Delivery across all pin codes.', color: '#00FF88' },
              { title: 'Competitive Pricing', desc: 'Best prices guaranteed. Direct sourcing means savings for you.', color: '#FFD700' },
            ].map(({ title, desc, color }) => (
              <div key={title} className="glass" style={{ borderRadius: 14, padding: 28, border: '1px solid var(--border)' }}>
                <div style={{ width: 44, height: 4, background: color, borderRadius: 2, marginBottom: 20 }} />
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>{title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{
            borderRadius: 20, padding: '50px 40px',
            background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.08) 0%, rgba(123, 47, 255, 0.08) 100%)',
            border: '1px solid rgba(0, 212, 255, 0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24,
          }}>
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>Ready to start building?</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Browse hundreds of components and get them delivered fast.</p>
            </div>
            <Link href="/products" className="btn-primary" style={{ padding: '16px 32px', fontSize: 16, textDecoration: 'none', borderRadius: 12, whiteSpace: 'nowrap' }}>
              <Zap size={18} /> Shop All Products
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
