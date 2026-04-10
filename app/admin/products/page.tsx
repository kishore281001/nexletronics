'use client';
import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { getProducts, deleteProduct, updateProduct } from '@/lib/store';
import { Product } from '@/lib/types';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, EyeOff, Star, Package, Search } from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const load = async () => setProducts(await getProducts());
  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    await deleteProduct(id);
    setConfirmDelete(null);
    load();
  };

  const toggleActive = async (id: string, val: boolean) => {
    await updateProduct(id, { is_active: val });
    load();
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-page-wrap" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: 'clamp(14px, 3vw, 32px)', overflowY: 'auto', overflowX: 'hidden', minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Products</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{products.length} products in your store</p>
          </div>
          <Link href="/admin/products/new" className="btn-primary" style={{ padding: '10px 20px', fontSize: 14, textDecoration: 'none' }}>
            <Plus size={16} /> Add Product
          </Link>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input-field" style={{ paddingLeft: 38, paddingRight: 12, paddingTop: 10, paddingBottom: 10, maxWidth: 360, fontSize: 14 }}
            placeholder="Search by name or category..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Product table */}
        <div className="glass" style={{ borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      <Package size={32} style={{ marginBottom: 12, display: 'block', margin: '0 auto 12px' }} />
                      {search ? 'No products match your search' : 'No products yet. Add your first product!'}
                    </td>
                  </tr>
                ) : filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 7, background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                          {p.images.length > 0
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={p.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <Package size={16} color="var(--text-muted)" />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-cyan">{p.category}</span></td>
                    <td>
                      <div style={{ fontWeight: 700 }}>₹{(p.discount_price || p.price).toLocaleString()}</div>
                      {p.discount_price && <div style={{ fontSize: 11, color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{p.price.toLocaleString()}</div>}
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: p.stock_qty === 0 ? 'var(--error)' : p.stock_qty <= 10 ? 'var(--warning)' : 'var(--success)' }}>
                        {p.stock_qty}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => toggleActive(p.id, !p.is_active)} style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className={`badge ${p.is_active ? 'badge-green' : 'badge-red'}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {p.is_active ? <><Eye size={10} /> Active</> : <><EyeOff size={10} /> Hidden</>}
                        </span>
                      </button>
                    </td>
                    <td>
                      {p.is_featured
                        ? <span className="badge badge-gold" style={{ display: 'flex', alignItems: 'center', gap: 4, width: 'fit-content' }}><Star size={10} fill="currentColor" /> Yes</span>
                        : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Link href={`/admin/products/${p.id}/edit`} style={{ width: 30, height: 30, borderRadius: 7, background: 'rgba(0,212,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)', textDecoration: 'none' }}>
                          <Edit size={13} />
                        </Link>
                        <Link href={`/products/${p.id}`} target="_blank" style={{ width: 30, height: 30, borderRadius: 7, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                          <Eye size={13} />
                        </Link>
                        {confirmDelete === p.id ? (
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button onClick={() => handleDelete(p.id)} style={{ fontSize: 11, padding: '4px 8px', background: 'var(--error)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Delete</button>
                            <button onClick={() => setConfirmDelete(null)} style={{ fontSize: 11, padding: '4px 8px', background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDelete(p.id)} style={{ width: 30, height: 30, borderRadius: 7, background: 'rgba(255,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--error)', border: 'none', cursor: 'pointer' }}>
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
