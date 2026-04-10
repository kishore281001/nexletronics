'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { getProducts } from '@/lib/store';
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

  const loadProducts = async () => {
    const all = (await getProducts()).filter(p => p.is_active);
    setProducts(all);
  };

  useEffect(() => {
    loadProducts();
    const cat = searchParams.get('cat');
    if (cat) setCategory(cat);
    const q = searchParams.get('q');
    if (q) setSearch(q);
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
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search — takes full width on mobile */}
          <div style={{ flex: '1 1 100%', position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              className="input-field"
              style={{ paddingLeft: 38, paddingRight: 36, paddingTop: 10, paddingBottom: 10, fontSize: 14, width: '100%' }}
              placeholder="Search components, sensors, kits..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: 4 }}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort + Filter row */}
          <div style={{ display: 'flex', gap: 8, flex: '1 1 auto' }}>
            <select className="input-field" style={{ flex: 1, padding: '10px 12px', fontSize: 13 }} value={sort} onChange={e => setSort(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name A-Z</option>
            </select>
            <button className="btn-ghost" style={{ padding: '10px 14px', fontSize: 13, whiteSpace: 'nowrap', flexShrink: 0 }} onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal size={14} /> Filters
            </button>
          </div>
        </div>

        {/* Sidebar + Grid — stacks on mobile */}
        <div className="products-layout">
          {/* Category sidebar */}
          <aside className="products-sidebar">
            <div className="glass" style={{ borderRadius: 12, padding: 16, border: '1px solid var(--border)', marginBottom: 16 }}>
              <h4 style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12, fontFamily: 'var(--font-mono)' }}>Category</h4>
              {/* Mobile: horizontal scroll row */}
              <div className="category-list">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setCategory(cat)} className="category-btn" style={{
                    textAlign: 'left', padding: '7px 10px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13,
                    background: category === cat ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                    color: category === cat ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    fontWeight: category === cat ? 600 : 400,
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap',
                  }}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass price-filter-box" style={{ borderRadius: 12, padding: 16, border: '1px solid var(--border)' }}>
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
          <div style={{ flex: 1, minWidth: 0 }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
                {filtered.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </div>

        <style jsx global>{`
          /* Products layout: sidebar + grid side by side on desktop */
          .products-layout {
            display: flex;
            gap: 24px;
            align-items: flex-start;
          }
          .products-sidebar {
            width: 220px;
            flex-shrink: 0;
          }
          .category-list {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          .price-filter-box {
            display: block;
          }
          /* Mobile: stack sidebar ABOVE products */
          @media (max-width: 640px) {
            .products-layout {
              flex-direction: column;
            }
            .products-sidebar {
              width: 100%;
            }
            /* Horizontal scrolling category pills on mobile */
            .category-list {
              flex-direction: row;
              overflow-x: auto;
              gap: 6px;
              padding-bottom: 4px;
              -webkit-overflow-scrolling: touch;
              scrollbar-width: none;
            }
            .category-list::-webkit-scrollbar { display: none; }
            .category-btn {
              flex-shrink: 0;
              border-radius: 20px !important;
              padding: 6px 14px !important;
              border: 1px solid var(--border) !important;
            }
            .price-filter-box {
              display: none; /* hide price slider on mobile to save space */
            }
          }
        `}</style>
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
