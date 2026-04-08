'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import ImageUploader from '@/components/admin/ImageUploader';
import { addProduct } from '@/lib/store';
import { Plus, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = ['Microcontrollers', 'Sensors', 'Displays', 'Motor Drivers', 'Project Kits', 'Passive Components', 'Power Supply', 'Communication Modules', 'Robotics', 'Tools', 'Cables & Connectors', 'Other'];

export default function NewProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([{ key: '', value: '' }]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const [form, setForm] = useState({
    name: '',
    short_description: '',
    description: '',
    price: '',
    discount_price: '',
    stock_qty: '',
    category: '',
    is_active: true,
    is_featured: false,
    featured_order: '0',
  });

  const update = (field: string, val: string | boolean) => setForm(f => ({ ...f, [field]: val }));

  const addSpec = () => setSpecs(s => [...s, { key: '', value: '' }]);
  const removeSpec = (idx: number) => setSpecs(s => s.filter((_, i) => i !== idx));
  const updateSpec = (idx: number, field: 'key' | 'value', val: string) =>
    setSpecs(s => s.map((sp, i) => i === idx ? { ...sp, [field]: val } : sp));

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t)) { setTags(prev => [...prev, t]); }
    setTagInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const specsObj = Object.fromEntries(specs.filter(s => s.key && s.value).map(s => [s.key, s.value]));
    addProduct({
      name: form.name,
      short_description: form.short_description,
      description: form.description,
      price: parseFloat(form.price),
      discount_price: form.discount_price ? parseFloat(form.discount_price) : undefined,
      stock_qty: parseInt(form.stock_qty) || 0,
      category: form.category,
      images: imageUrls,
      specs: specsObj,
      is_active: form.is_active,
      is_featured: form.is_featured,
      featured_order: parseInt(form.featured_order) || 0,
      tags,
    });
    setSaving(false);
    router.push('/admin/products');
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="glass" style={{ borderRadius: 14, border: '1px solid var(--border)', padding: 24, marginBottom: 20 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>{title}</h3>
      {children}
    </div>
  );

  const Field = ({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 6, letterSpacing: '0.3px' }}>
        {label} {required && <span style={{ color: 'var(--error)' }}>*</span>}
      </label>
      {children}
      {hint && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{hint}</div>}
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: 32, overflowY: 'auto', maxWidth: 900 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
          <Link href="/admin/products" style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', textDecoration: 'none' }}>
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Add New Product</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Fill in the details below to list a new product</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <Section title="📦 Basic Information">
            <Field label="Product Name" required>
              <input className="input-field" style={{ padding: '10px 14px', fontSize: 14 }} required
                value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g., Arduino Nano V3.0" />
            </Field>
            <Field label="Short Description" required hint="Shown on product cards (max 100 chars)">
              <input className="input-field" style={{ padding: '10px 14px', fontSize: 14 }} required maxLength={120}
                value={form.short_description} onChange={e => update('short_description', e.target.value)} placeholder="Brief one-line description" />
            </Field>
            <Field label="Full Description" required hint="Full product details, use multiple paragraphs">
              <textarea className="input-field" style={{ padding: '10px 14px', fontSize: 14, minHeight: 130, resize: 'vertical', lineHeight: 1.6 }} required
                value={form.description} onChange={e => update('description', e.target.value)} placeholder="Detailed product description. Include features, specifications, use cases, compatibility..." />
            </Field>
            <Field label="Category" required>
              <select className="input-field" style={{ padding: '10px 14px', fontSize: 14 }} required
                value={form.category} onChange={e => update('category', e.target.value)}>
                <option value="">Select a category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </Section>

          {/* Pricing */}
          <Section title="💰 Pricing & Stock">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <Field label="Original Price (₹)" required>
                <input className="input-field" style={{ padding: '10px 14px', fontSize: 14 }} type="number" required min="0" step="0.01"
                  value={form.price} onChange={e => update('price', e.target.value)} placeholder="299" />
              </Field>
              <Field label="Discounted Price (₹)" hint="Leave blank for no discount">
                <input className="input-field" style={{ padding: '10px 14px', fontSize: 14 }} type="number" min="0" step="0.01"
                  value={form.discount_price} onChange={e => update('discount_price', e.target.value)} placeholder="249" />
              </Field>
              <Field label="Stock Quantity" required>
                <input className="input-field" style={{ padding: '10px 14px', fontSize: 14 }} type="number" required min="0"
                  value={form.stock_qty} onChange={e => update('stock_qty', e.target.value)} placeholder="50" />
              </Field>
            </div>
          </Section>

          {/* Images */}
          <Section title="🖼️ Product Images">
            <ImageUploader images={imageUrls} onChange={setImageUrls} />
          </Section>

          {/* Technical Specs */}
          <Section title="⚡ Technical Specifications">
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Add key-value pairs for the specs table (e.g., Operating Voltage → 5V)</p>
            {specs.map((spec, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
                <input className="input-field" style={{ padding: '9px 12px', fontSize: 13, flex: 1 }} placeholder="Spec name (e.g., Operating Voltage)"
                  value={spec.key} onChange={e => updateSpec(i, 'key', e.target.value)} />
                <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>→</span>
                <input className="input-field" style={{ padding: '9px 12px', fontSize: 13, flex: 1 }} placeholder="Value (e.g., 5V DC)"
                  value={spec.value} onChange={e => updateSpec(i, 'value', e.target.value)} />
                <button type="button" onClick={() => removeSpec(i)} style={{ width: 32, height: 32, borderRadius: 7, background: 'rgba(255,68,68,0.1)', border: 'none', cursor: 'pointer', color: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <X size={13} />
                </button>
              </div>
            ))}
            <button type="button" onClick={addSpec} className="btn-ghost" style={{ padding: '8px 16px', fontSize: 13, marginTop: 4 }}>
              <Plus size={13} /> Add Specification
            </button>
          </Section>

          {/* Tags */}
          <Section title="🏷️ Tags">
            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <input className="input-field" style={{ padding: '9px 12px', fontSize: 13, flex: 1 }} placeholder="Add tag (e.g., arduino, sensor, wifi)"
                value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} />
              <button type="button" onClick={addTag} className="btn-ghost" style={{ padding: '9px 16px', fontSize: 13 }}>Add</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {tags.map(tag => (
                <span key={tag} className="badge badge-purple" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px' }}>
                  #{tag}
                  <button type="button" onClick={() => setTags(t => t.filter(x => x !== tag))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', alignItems: 'center', padding: 0, marginLeft: 2 }}>
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          </Section>

          {/* Visibility */}
          <Section title="🔧 Visibility & Featured">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <div style={{ position: 'relative', width: 40, height: 22 }}>
                  <input type="checkbox" checked={form.is_active} onChange={e => update('is_active', e.target.checked)} style={{ opacity: 0, position: 'absolute', width: '100%', height: '100%', cursor: 'pointer', zIndex: 1 }} />
                  <div style={{ width: 40, height: 22, borderRadius: 11, background: form.is_active ? 'var(--accent-cyan)' : 'var(--border)', transition: 'background 0.2s', position: 'relative' }}>
                    <div style={{ position: 'absolute', width: 16, height: 16, borderRadius: '50%', background: '#fff', top: 3, left: form.is_active ? 21 : 3, transition: 'left 0.2s' }} />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Show on Store</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Visible to customers when enabled</div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <div style={{ position: 'relative', width: 40, height: 22 }}>
                  <input type="checkbox" checked={form.is_featured} onChange={e => update('is_featured', e.target.checked)} style={{ opacity: 0, position: 'absolute', width: '100%', height: '100%', cursor: 'pointer', zIndex: 1 }} />
                  <div style={{ width: 40, height: 22, borderRadius: 11, background: form.is_featured ? '#FFD700' : 'var(--border)', transition: 'background 0.2s', position: 'relative' }}>
                    <div style={{ position: 'absolute', width: 16, height: 16, borderRadius: '50%', background: '#fff', top: 3, left: form.is_featured ? 21 : 3, transition: 'left 0.2s' }} />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Include in Featured Showcase</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Appears in the scrolling showcase panel on the homepage</div>
                </div>
              </label>

              {form.is_featured && (
                <div style={{ paddingLeft: 52 }}>
                  <Field label="Display Order" hint="Lower number appears first in showcase">
                    <input className="input-field" style={{ padding: '8px 12px', fontSize: 13, maxWidth: 120 }} type="number" min="0"
                      value={form.featured_order} onChange={e => update('featured_order', e.target.value)} />
                  </Field>
                </div>
              )}
            </div>
          </Section>

          {/* Submit */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Link href="/admin/products" className="btn-ghost" style={{ padding: '12px 24px', fontSize: 14, textDecoration: 'none' }}>
              Cancel
            </Link>
            <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '12px 28px', fontSize: 15 }}>
              {saving ? 'Saving...' : <><Plus size={16} /> Save Product</>}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
