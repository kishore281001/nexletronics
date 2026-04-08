'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { getProductById, getProducts } from '@/lib/store';
import { Product } from '@/lib/types';
import { useCart } from '@/lib/cart-context';
import { useToast } from '@/lib/toast-context';
import { ShoppingCart, ArrowLeft, Package, CheckCircle, Zap, ChevronRight, Tag, ArrowRight } from 'lucide-react';
import ProductReviews from '@/components/ProductReviews';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    const p = getProductById(id);
    if (!p) { router.push('/products'); return; }
    setProduct(p);
    const rel = getProducts().filter(x => x.id !== id && x.category === p.category && x.is_active).slice(0, 4);
    setRelated(rel);
  }, [id, router]);

  if (!product) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
    </div>
  );

  const price = product.discount_price || product.price;
  const discount = product.discount_price ? Math.round(((product.price - product.discount_price) / product.price) * 100) : 0;
  const inStock = product.stock_qty > 0;

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addItem(product);
    setAdded(true);
    showToast('cart', 'Added to cart!', `${qty} × ${product.name}`);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    for (let i = 0; i < qty; i++) addItem(product);
    router.push('/cart');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />

      {/* Breadcrumb */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
        <ChevronRight size={12} />
        <Link href="/products" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Products</Link>
        <ChevronRight size={12} />
        <Link href={`/products?cat=${product.category}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{product.category}</Link>
        <ChevronRight size={12} />
        <span style={{ color: 'var(--text-secondary)' }}>{product.name}</span>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }} className="product-detail-grid">

          {/* Images */}
          <div>
            <div className="glass" style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)', height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              {product.images.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.images[activeImage]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 24 }} />
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <Package size={64} color="var(--text-muted)" />
                  <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 12 }}>No image available</div>
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div style={{ display: 'flex', gap: 8 }}>
                {product.images.map((img, idx) => (
                  <button key={idx} onClick={() => setActiveImage(idx)} style={{
                    width: 64, height: 64, borderRadius: 8, border: `2px solid ${activeImage === idx ? 'var(--accent-cyan)' : 'var(--border)'}`,
                    overflow: 'hidden', cursor: 'pointer', padding: 0, background: 'var(--bg-elevated)',
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {/* Category + featured */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <span className="badge badge-cyan">{product.category}</span>
              {product.is_featured && <span className="badge badge-gold">⭐ Featured</span>}
              {!inStock && <span className="badge badge-red">Out of Stock</span>}
              {inStock && product.stock_qty <= 10 && <span className="badge badge-orange">Only {product.stock_qty} left</span>}
            </div>

            <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: 16 }}>{product.name}</h1>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
              <span style={{ fontSize: 36, fontWeight: 800, color: 'var(--accent-cyan)' }}>₹{price.toLocaleString()}</span>
              {product.discount_price && (
                <>
                  <span style={{ fontSize: 20, color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{product.price.toLocaleString()}</span>
                  <span className="badge badge-green">{discount}% OFF</span>
                </>
              )}
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>{product.description}</p>

            {/* Quantity + Add to cart + Buy Now */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center' }}>
              <div className="glass" style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ padding: '10px 16px', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 18 }}>−</button>
                <span style={{ padding: '10px 20px', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock_qty, q + 1))} style={{ padding: '10px 16px', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 18 }}>+</button>
              </div>
              <button onClick={handleAddToCart} disabled={!inStock} className="btn-secondary" style={{
                flex: 1, padding: '12px 16px', fontSize: 14, justifyContent: 'center',
                background: added ? 'rgba(0,255,136,0.08)' : undefined,
                borderColor: added ? 'var(--success)' : undefined,
                color: added ? 'var(--success)' : undefined,
                opacity: !inStock ? 0.5 : 1,
              }}>
                {added ? <><CheckCircle size={15} /> Added!</> : <><ShoppingCart size={15} /> Add to Cart</>}
              </button>
            </div>
            <button onClick={handleBuyNow} disabled={!inStock} className="btn-primary" style={{
              width: '100%', padding: '14px 24px', fontSize: 15, justifyContent: 'center', marginBottom: 20,
              opacity: !inStock ? 0.5 : 1,
            }}>
              <Zap size={16} /> Buy Now <ArrowRight size={16} />
            </button>

            {/* Trust */}
            <div className="glass" style={{ borderRadius: 12, padding: 16, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {[
                ['🚚', 'Free shipping on orders above ₹999'],
                ['✅', 'Genuine product guaranteed'],
                ['📦', 'Secure anti-static packaging'],
                ['↩️', '7-day return policy'],
              ].map(([icon, text]) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <span>{icon}</span> {text}
                </div>
              ))}
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                <Tag size={13} color="var(--text-muted)" />
                {product.tags.map(tag => (
                  <span key={tag} className="badge badge-purple">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Specs Table */}
        {Object.keys(product.specs).length > 0 && (
          <div style={{ marginTop: 48 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Zap size={18} color="var(--accent-cyan)" /> Technical Specifications
            </h2>
            <div className="glass" style={{ borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
              <table className="data-table">
                <tbody>
                  {Object.entries(product.specs).map(([key, val], idx) => (
                    <tr key={key}>
                      <td style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: 13, width: '35%', background: idx % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>{key}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13, background: idx % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reviews */}
        <ProductReviews productId={product.id} />

        {/* Related Products */}
        {related.length > 0 && (
          <div style={{ marginTop: 60 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 24 }}>Related Products</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>

      <Footer />

      <style jsx global>{`
        @media (max-width: 768px) {
          .product-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
