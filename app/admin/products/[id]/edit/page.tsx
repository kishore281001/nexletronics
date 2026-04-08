'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import ImageUploader from '@/components/admin/ImageUploader';
import { getProductById, updateProduct } from '@/lib/store';
import { Product } from '@/lib/types';
import { Plus, X, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = ['Microcontrollers', 'Sensors', 'Displays', 'Motor Drivers', 'Project Kits', 'Passive Components', 'Power Supply', 'Communication Modules', 'Robotics', 'Tools', 'Cables & Connectors', 'Other'];

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: '', short_description: '', description: '', price: '',
    discount_price: '', stock_qty: '', category: '',
    is_active: true, is_featured: false, featured_order: '0',
  });

  useEffect(() => {
    const p = getProductById(id);
    if (!p) { router.push('/admin/products'); return; }
    setProduct(p);
    setForm({
      name: p.name, short_description: p.short_description, description: p.description,
      price: String(p.price), discount_price: p.discount_price ? String(p.discount_price) : '',
      stock_qty: String(p.stock_qty), category: p.category,
      is_active: p.is_active, is_featured: p.is_featured, featured_order: String(p.featured_order),
    });
    setSpecs(Object.entries(p.specs).map(([key, value]) => ({ key, value })));
    setTags(p.tags);
    setImageUrls(p.images);
  }, [id, router]);

  const update = (field: string, val: string | boolean) => setForm(f => ({ ...f, [field]: val }));
  const addSpec = () => setSpecs(s => [...s, { key: '', value: '' }]);
  const removeSpec = (idx: number) => setSpecs(s => s.filter((_, i) => i !== idx));
  const updateSpec = (idx: number, field: 'key' | 'value', val: string) => setSpecs(s => s.map((sp, i) => i === idx ? { ...sp, [field]: val } : sp));
  const addTag = () => { const t = tagInput.trim().toLowerCase(); if (t && !tags.includes(t)) setTags(prev => [...prev, t]); setTagInput(''); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const specsObj = Object.fromEntries(specs.filter(s => s.key && s.value).map(s => [s.key, s.value]));
    updateProduct(id, {
      name: form.name, short_description: form.short_description, description: form.description,
      price: parseFloat(form.price),
      discount_price: form.discount_price ? parseFloat(form.discount_price) : undefined,
      stock_qty: parseInt(form.stock_qty) || 0,
      category: form.category, images: imageUrls, specs: specsObj,
      is_active: form.is_active, is_featured: form.is_featured,
      featured_order: parseInt(form.featured_order) || 0, tags,
    });
    setSaving(false);
    router.push('/admin/products');
  };

  if (!product) return <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Loading...</div>;

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="glass" style={{ borderRadius: 14, border: '1px solid var(--border)', padding: 24, marginBottom: 20 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>{title}</h3>
      {children}
    </div>
  );

  const Field = ({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 6 }}>{label} {required && <span style={{ color: 'var(--error)' }}>*</span>}</label>
      {children}
      {hint && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{hint}</div>}
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: 32, overflowY: 'auto', maxWidth: 900 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
          <Link href="/admin/products" style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', textDecoration: 'none' }}>
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Edit Product</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{product.name}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Section title="📦 Basic Information">
            <Field label="Product Name" required><input className="input-field" style={{ padding: '10px 14px', fontSize: 14 }} required value={form.name} onChange={e => update('name', e.target.value)} /></Field>
            <Field label="Short Description" required><input className="input-field" style={{ padding: '10px 14px', fontSize: 14 }} required value={form.short_description} onChange={e => update('short_description', e.target.value)} /></Field>
            <Field label="Full Description" required><textarea className="input-field" style={{ padding: '10px 14px', fontSize: 14, minHeight: 120, resize: 'vertical', lineHeight: 1.6 }} required value={form.description} onChange={e => update('description', e.target.value)} /></Field>
            <Field label="Category" required>
              <select className="input-field" style={{ padding: '10px 14px', fontSize: 14 }} required value={form.category} onChange={e => update('category', e.target.value)}>
                <option value="">Select a category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </Section>

          <Section title="💰 Pricing & Stock">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <Field label="Original Price (₹)" required><input className="input-field" style={{ padding: '10px 14px', fontSize: 14 }} type="number" required min="0" step="0.01" value={form.price} onChange={e => update('price', e.target.value)} /></Field>
              <Field label="Discounted Price (₹)" hint="Leave blank for no discount"><input className="input-field" style={{ padding: '10px 14px', fontSize: 14 }} type="number" min="0" step="0.01" value={form.discount_price} onChange={e => update('discount_price', e.target.value)} /></Field>
              <Field label="Stock Quantity" required><input className="input-field" style={{ padding: '10px 14px', fontSize: 14 }} type="number" required min="0" value={form.stock_qty} onChange={e => update('stock_qty', e.target.value)} /></Field>
            </div>
          </Section>

          <Section title="🖼️ Product Images">
            <ImageUploader images={imageUrls} onChange={setImageUrls} />
          </Section>

          <Section title="⚡ Technical Specifications">
            {specs.map((spec, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
                <input className="input-field" style={{ padding: '9px 12px', fontSize: 13, flex: 1 }} placeholder="Spec name" value={spec.key} onChange={e => updateSpec(i, 'key', e.target.value)} />
                <span style={{ color: 'var(--text-muted)' }}>→</span>
                <input className="input-field" style={{ padding: '9px 12px', fontSize: 13, flex: 1 }} placeholder="Value" value={spec.value} onChange={e => updateSpec(i, 'value', e.target.value)} />
                <button type="button" onClick={() => removeSpec(i)} style={{ width: 32, height: 32, borderRadius: 7, background: 'rgba(255,68,68,0.1)', border: 'none', cursor: 'pointer', color: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={13} /></button>
              </div>
            ))}
            <button type="button" onClick={addSpec} className="btn-ghost" style={{ padding: '8px 16px', fontSize: 13 }}><Plus size={13} /> Add Spec</button>
          </Section>

          <Section title="🏷️ Tags">
            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <input className="input-field" style={{ padding: '9px 12px', fontSize: 13, flex: 1 }} placeholder="Add tag" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} />
              <button type="button" onClick={addTag} className="btn-ghost" style={{ padding: '9px 16px', fontSize: 13 }}>Add</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {tags.map(tag => (
                <span key={tag} className="badge badge-purple" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>#{tag}
                  <button type="button" onClick={() => setTags(t => t.filter(x => x !== tag))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex' }}><X size={10} /></button>
                </span>
              ))}
            </div>
          </Section>

          <Section title="🔧 Visibility & Featured">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { field: 'is_active', label: 'Show on Store', sub: 'Visible to customers', color: 'var(--accent-cyan)' },
                { field: 'is_featured', label: 'Include in Featured Showcase', sub: 'Appears in homepage panel', color: '#FFD700' },
              ].map(({ field, label, sub, color }) => (
                <label key={field} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                  <div style={{ position: 'relative', width: 40, height: 22 }}>
                    <input type="checkbox" checked={form[field as 'is_active' | 'is_featured']} onChange={e => update(field, e.target.checked)} style={{ opacity: 0, position: 'absolute', width: '100%', height: '100%', cursor: 'pointer', zIndex: 1 }} />
                    <div style={{ width: 40, height: 22, borderRadius: 11, background: form[field as 'is_active' | 'is_featured'] ? color : 'var(--border)', transition: 'background 0.2s', position: 'relative' }}>
                      <div style={{ position: 'absolute', width: 16, height: 16, borderRadius: '50%', background: '#fff', top: 3, left: form[field as 'is_active' | 'is_featured'] ? 21 : 3, transition: 'left 0.2s' }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</div>
                  </div>
                </label>
              ))}
              {form.is_featured && (
                <div style={{ paddingLeft: 52 }}>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 6 }}>Display Order</label>
                  <input className="input-field" style={{ padding: '8px 12px', fontSize: 13, maxWidth: 120 }} type="number" min="0" value={form.featured_order} onChange={e => update('featured_order', e.target.value)} />
                </div>
              )}
            </div>
          </Section>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Link href="/admin/products" className="btn-ghost" style={{ padding: '12px 24px', fontSize: 14, textDecoration: 'none' }}>Cancel</Link>
            <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '12px 28px', fontSize: 15 }}>
              {saving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
