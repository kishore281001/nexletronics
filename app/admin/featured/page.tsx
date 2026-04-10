'use client';
import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { getProducts, updateProduct, getFeaturedProducts, getSiteSettings, saveSiteSettings } from '@/lib/store';
import { Product, SiteSettings } from '@/lib/types';
import { Star, StarOff, ArrowUp, ArrowDown, Eye, Info } from 'lucide-react';

export default function FeaturedPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saved, setSaved] = useState(false);

  const load = async () => {
    setProducts((await getProducts()).filter(p => p.is_active));
    setFeatured(await getFeaturedProducts());
    setSettings(await getSiteSettings());
  };

  useEffect(() => { load(); }, []);

  const toggleFeatured = async (product: Product) => {
    const newOrder = product.is_featured ? 0 : (featured.length + 1);
    await updateProduct(product.id, { is_featured: !product.is_featured, featured_order: newOrder });
    await load();
  };

  const moveOrder = async (productId: string, dir: 'up' | 'down') => {
    const idx = featured.findIndex(p => p.id === productId);
    if (dir === 'up' && idx > 0) {
      await updateProduct(featured[idx].id, { featured_order: idx - 1 });
      await updateProduct(featured[idx - 1].id, { featured_order: idx });
    } else if (dir === 'down' && idx < featured.length - 1) {
      await updateProduct(featured[idx].id, { featured_order: idx + 1 });
      await updateProduct(featured[idx + 1].id, { featured_order: idx });
    }
    await load();
  };

  const handleSettingsSave = async () => {
    if (settings) { await saveSiteSettings(settings); setSaved(true); setTimeout(() => setSaved(false), 2000); }
  };

  const non_featured = products.filter(p => !p.is_featured);

  return (
    <div className="admin-page-wrap" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: 'clamp(14px, 3vw, 32px)', overflowY: 'auto', overflowX: 'hidden', minWidth: 0 }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>⭐ Featured Showcase</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Control which products appear in the scrolling showcase panel on your homepage.</p>
        </div>

        <div className="featured-grid">

          {/* Currently Featured */}
          <div>
            <div className="glass" style={{ borderRadius: 14, border: '1px solid rgba(255, 215, 0, 0.2)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 215, 0, 0.04)' }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Star size={14} fill="var(--accent-gold)" color="var(--accent-gold)" /> In Showcase ({featured.length})
                </h2>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Drag to reorder ↕</span>
              </div>

              {featured.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  No products in showcase yet. Add some from the right panel!
                </div>
              ) : (
                featured.map((p, idx) => (
                  <div key={p.id} style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <button onClick={() => moveOrder(p.id, 'up')} disabled={idx === 0} style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'default' : 'pointer', color: idx === 0 ? 'var(--border)' : 'var(--text-muted)', display: 'flex', padding: 2 }}>
                        <ArrowUp size={12} />
                      </button>
                      <button onClick={() => moveOrder(p.id, 'down')} disabled={idx === featured.length - 1} style={{ background: 'none', border: 'none', cursor: idx === featured.length - 1 ? 'default' : 'pointer', color: idx === featured.length - 1 ? 'var(--border)' : 'var(--text-muted)', display: 'flex', padding: 2 }}>
                        <ArrowDown size={12} />
                      </button>
                    </div>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-gold)', boxShadow: '0 0 6px rgba(255,215,0,0.5)', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--accent-cyan)' }}>₹{(p.discount_price || p.price).toLocaleString()}</div>
                    </div>
                    <button onClick={() => toggleFeatured(p)} title="Remove from showcase" style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(255,68,68,0.1)', border: 'none', cursor: 'pointer', color: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <StarOff size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Panel Settings */}
            {settings && (
              <div className="glass" style={{ borderRadius: 14, border: '1px solid var(--border)', padding: 20, marginTop: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Panel Settings</h3>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 6 }}>Panel Title</label>
                  <input className="input-field" style={{ padding: '9px 12px', fontSize: 13 }} value={settings.featured_panel_title}
                    onChange={e => setSettings(s => s ? { ...s, featured_panel_title: e.target.value } : s)} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 6 }}>Announcement Text</label>
                  <input className="input-field" style={{ padding: '9px 12px', fontSize: 13 }} value={settings.announcement_text}
                    onChange={e => setSettings(s => s ? { ...s, announcement_text: e.target.value } : s)} />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 14 }}>
                  <div style={{ position: 'relative', width: 36, height: 20 }}>
                    <input type="checkbox" checked={settings.show_announcement} onChange={e => setSettings(s => s ? { ...s, show_announcement: e.target.checked } : s)} style={{ opacity: 0, position: 'absolute', width: '100%', height: '100%', cursor: 'pointer', zIndex: 1 }} />
                    <div style={{ width: 36, height: 20, borderRadius: 10, background: settings.show_announcement ? 'var(--accent-cyan)' : 'var(--border)', position: 'relative' }}>
                      <div style={{ position: 'absolute', width: 14, height: 14, borderRadius: '50%', background: '#fff', top: 3, left: settings.show_announcement ? 19 : 3, transition: 'left 0.2s' }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Show announcement banner</span>
                </label>
                <button onClick={handleSettingsSave} className="btn-primary" style={{ padding: '9px 20px', fontSize: 13, width: '100%', justifyContent: 'center' }}>
                  {saved ? '✓ Saved!' : 'Save Panel Settings'}
                </button>
              </div>
            )}
          </div>

          {/* Non-featured products */}
          <div>
            <div className="glass" style={{ borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Available Products ({non_featured.length})</h2>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Click ☆ to add to the featured showcase</p>
              </div>
              {non_featured.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>All products are featured!</div>
              ) : (
                <div style={{ maxHeight: 600, overflowY: 'auto' }}>
                  {non_featured.map(p => (
                    <div key={p.id} style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--border)' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 8 }}>
                          <span>{p.category}</span>
                          <span style={{ color: 'var(--accent-cyan)' }}>₹{(p.discount_price || p.price).toLocaleString()}</span>
                        </div>
                      </div>
                      <button onClick={() => toggleFeatured(p)} title="Add to showcase" style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)', cursor: 'pointer', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Star size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <style jsx global>{`
        .featured-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        @media (max-width: 768px) { .featured-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
