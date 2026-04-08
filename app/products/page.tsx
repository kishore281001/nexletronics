'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { getProducts } from '@/lib/store';
import { onStoreUpdate } from '@/lib/sync';
import { Product } from '@/lib/types';
import { Search, X, SlidersHorizontal, Package } from 'lucide-react';

const CATEGORIES = ['All', 'Microcontrollers', 'Sensors', 'Displays', 'Motor Drivers', 'Project Kits', 'Passive Components', 'Power Supply', 'Communication Modules', 'Robotics'];

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('newest');
  const [maxPrice, setMaxPrice] = useState(10000);
  const [showFilters, setShowFilters] = useState(false);

  const loadProducts = () => {
    const all = getProducts().filter(p => p.is_active);
    setProducts(all);
  };

  useEffect(() => {
    loadProducts();
    const cat = searchParams.get('cat');
    if (cat) setCategory(cat);
    // Auto-refresh when admin adds/edits products
    const unsub = onStoreUpdate(loadProducts);
    return unsub;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    let result = [...products];
    if (category !== 'All') result = result.filter(p => p.category === category);
    if (search) result = result.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    );
    result = result.filter(p => (p.discount_price || p.price) <= maxPrice);
    if (sort === 'newest') result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    if (sort === 'price-asc') result.sort((a, b) => (a.discount_price || a.price) - (b.discount_price || b.price));
    if (sort === 'price-desc') result.sort((a, b) => (b.discount_price || b.price) - (a.discount_price || a.price));
    if (sort === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
    setFiltered(result);
  }, [products, category, search, sort, maxPrice]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />

      {/* Header */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '40px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', letterSpacing: '2px' }}>NEXLETRONICS</span>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
            {category === 'All' ? 'All Products' : category}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{filtered.length} product{filtered.length !== 1 ? 's' : ''} found</p>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
        {/* Search + controls */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="input-field"
              style={{ paddingLeft: 38, paddingRight: 12, paddingTop: 10, paddingBottom: 10, fontSize: 14 }}
              placeholder="Search components, sensors, kits..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort */}
          <select className="input-field" style={{ width: 'auto', padding: '10px 14px', fontSize: 13 }} value={sort} onChange={e => setSort(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name A-Z</option>
          </select>

          {/* Filter toggle (mobile) */}
          <button className="btn-ghost" style={{ padding: '10px 14px', fontSize: 13 }} onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal size={14} /> Filters
          </button>
        </div>

        <div style={{ display: 'flex', gap: 24 }}>
          {/* Sidebar filters */}
          <aside style={{ width: 220, flexShrink: 0 }}>
            {/* Category filter */}
            <div className="glass" style={{ borderRadius: 12, padding: 16, border: '1px solid var(--border)', marginBottom: 16 }}>
              <h4 style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12, fontFamily: 'var(--font-mono)' }}>Category</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setCategory(cat)} style={{
                    textAlign: 'left', padding: '7px 10px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13,
                    background: category === cat ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                    color: category === cat ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    fontWeight: category === cat ? 600 : 400,
                    transition: 'all 0.15s ease',
                  }}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price filter */}
            <div className="glass" style={{ borderRadius: 12, padding: 16, border: '1px solid var(--border)' }}>
              <h4 style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12, fontFamily: 'var(--font-mono)' }}>Max Price</h4>
              <div style={{ color: 'var(--accent-cyan)', fontSize: 18, fontWeight: 700, marginBottom: 10 }}>₹{maxPrice.toLocaleString()}</div>
              <input type="range" min={50} max={10000} step={50} value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                <span>₹50</span><span>₹10,000</span>
              </div>
            </div>
          </aside>

          {/* Product grid */}
          <div style={{ flex: 1 }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                <Package size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
                <h3 style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>No products found</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Try adjusting your filters or search term</p>
                <button className="btn-secondary" style={{ marginTop: 16, padding: '8px 20px' }} onClick={() => { setSearch(''); setCategory('All'); setMaxPrice(10000); }}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
                {filtered.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
