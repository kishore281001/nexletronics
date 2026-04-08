'use client';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { useCart } from '@/lib/cart-context';
import { useToast } from '@/lib/toast-context';
import { ShoppingCart, Star, Package } from 'lucide-react';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    setAdded(true);
    showToast('cart', `Added to cart!`, product.name);
    setTimeout(() => setAdded(false), 1500);
  };

  const discount = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  const isLowStock = product.stock_qty <= 10 && product.stock_qty > 0;
  const isOutOfStock = product.stock_qty === 0;

  return (
    <Link href={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
      <div className="glass card-hover" style={{
        borderRadius: 14, overflow: 'hidden', height: '100%',
        display: 'flex', flexDirection: 'column', cursor: 'pointer',
        border: '1px solid var(--border)',
      }}>
        {/* Image */}
        <div style={{
          height: 180, background: 'var(--bg-elevated)', position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
        }}>
          {product.images.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 56, height: 56, borderRadius: 12, background: 'rgba(0, 212, 255, 0.08)', border: '1px solid rgba(0, 212, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={24} color="var(--accent-cyan)" />
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{product.category}</span>
            </div>
          )}

          {/* Badges */}
          <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {discount > 0 && (
              <span className="badge badge-cyan">-{discount}%</span>
            )}
            {product.is_featured && (
              <span className="badge badge-gold">
                <Star size={8} fill="currentColor" /> Featured
              </span>
            )}
          </div>

          {/* Stock badge top-right */}
          {isOutOfStock && (
            <div style={{ position: 'absolute', top: 10, right: 10 }}>
              <span className="badge badge-red">Out of Stock</span>
            </div>
          )}
          {isLowStock && !isOutOfStock && (
            <div style={{ position: 'absolute', top: 10, right: 10 }}>
              <span className="badge badge-orange">Low Stock</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 11, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', letterSpacing: '0.5px' }}>
            {product.category}
          </div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4, margin: 0 }}>
            {product.name}
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0, flex: 1 }}>
            {product.short_description}
          </p>

          {/* Price row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-cyan)' }}>
                ₹{(product.discount_price || product.price).toLocaleString()}
              </span>
              {product.discount_price && (
                <span style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  ₹{product.price.toLocaleString()}
                </span>
              )}
            </div>

            <button
              onClick={handleAdd}
              disabled={isOutOfStock}
              className="btn-primary"
              style={{
                padding: '6px 12px', fontSize: 12,
                opacity: isOutOfStock ? 0.5 : 1,
                background: added ? 'linear-gradient(135deg, #00FF88, #00CC70)' : undefined,
              }}
            >
              {isOutOfStock ? 'Out of Stock' : added ? '✓ Added' : (
                <><ShoppingCart size={12} /> Add</>
              )}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
