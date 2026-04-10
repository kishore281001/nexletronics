'use client';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, Package, Zap, Lock } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, itemCount } = useCart();
  const { user } = useAuth();
  const shipping = total >= 999 ? 0 : 50;
  const grandTotal = total + shipping;

  if (items.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Navbar />
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <ShoppingCart size={32} color="var(--text-muted)" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>Your cart is empty</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 28, fontSize: 15 }}>Looks like you haven't added anything yet.</p>
          <Link href="/products" className="btn-primary" style={{ padding: '12px 28px', fontSize: 15, textDecoration: 'none' }}>
            <Zap size={16} /> Start Shopping
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Shopping Cart</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 14 }}>{itemCount} item{itemCount !== 1 ? 's' : ''} in your cart</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }} className="cart-grid">
          {/* Items */}
          <div>
            {/* Free shipping banner */}
            {total < 999 && (
              <div style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: 'var(--accent-cyan)' }}>
                ⚡ Add ₹{(999 - total).toFixed(0)} more for <strong>FREE shipping!</strong>
              </div>
            )}
            {total >= 999 && (
              <div style={{ background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.15)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: 'var(--success)' }}>
                🎉 You've unlocked <strong>FREE shipping!</strong>
              </div>
            )}

            <div className="glass" style={{ borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden' }}>
              {items.map((item, idx) => {
                const price = item.product.discount_price || item.product.price;
                return (
                  <div key={item.product.id} style={{ padding: '18px 20px', display: 'flex', gap: 16, alignItems: 'center', borderBottom: idx < items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    {/* Product image/icon */}
                    <div style={{ width: 72, height: 72, borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                      {item.product.images.length > 0 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.product.images[0]} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : <Package size={24} color="var(--text-muted)" />}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>{item.product.category}</div>
                      <Link href={`/products/${item.product.id}`} style={{ textDecoration: 'none' }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.3 }}>{item.product.name}</div>
                      </Link>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent-cyan)' }}>₹{price.toLocaleString()}</div>
                    </div>

                    {/* Quantity */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} style={{ width: 32, height: 32, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Minus size={13} />
                      </button>
                      <span style={{ width: 36, textAlign: 'center', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} style={{ width: 32, height: 32, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Plus size={13} />
                      </button>
                    </div>

                    {/* Subtotal + Remove */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>₹{(price * item.quantity).toLocaleString()}</div>
                      <button onClick={() => removeItem(item.product.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                        <Trash2 size={13} /> Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="glass" style={{ borderRadius: 14, border: '1px solid var(--border)', padding: 24, position: 'sticky', top: 90 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>Order Summary</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-secondary)' }}>
                  <span>Subtotal ({itemCount} items)</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-secondary)' }}>
                  <span>Shipping</span>
                  <span style={{ color: shipping === 0 ? 'var(--success)' : 'var(--text-secondary)' }}>
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
                <span>Total</span>
                <span style={{ color: 'var(--accent-cyan)' }}>₹{grandTotal.toLocaleString()}</span>
              </div>

              {/* Login gate for guests */}
              {!user ? (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ padding: '16px', background: 'rgba(123,47,255,0.06)', border: '1px solid rgba(123,47,255,0.2)', borderRadius: 10, marginBottom: 12, textAlign: 'center' }}>
                    <Lock size={20} color="#A855F7" style={{ marginBottom: 8 }} />
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Sign in to checkout</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>You need an account to place an order and track your delivery.</div>
                    <Link href={`/login?redirect=/checkout`} className="btn-primary" style={{ display: 'flex', justifyContent: 'center', padding: '11px 16px', fontSize: 14, textDecoration: 'none', borderRadius: 9, width: '100%' }}>
                      🔐 Sign In to Checkout
                    </Link>
                    <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                      New here?{' '}
                      <Link href="/login?redirect=/checkout" style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 600 }}>Create a free account</Link>
                    </div>
                  </div>
                </div>
              ) : (
                <Link href="/checkout" className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: 16, textDecoration: 'none', justifyContent: 'center', borderRadius: 10, display: 'flex', marginBottom: 12 }}>
                  Proceed to Checkout <ArrowRight size={16} />
                </Link>
              )}

              <Link href="/products" style={{ display: 'block', textAlign: 'center', marginTop: 14, color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13 }}>
                ← Continue Shopping
              </Link>

              <div style={{ marginTop: 20, padding: '12px', background: 'rgba(0,255,136,0.05)', borderRadius: 8, border: '1px solid rgba(0,255,136,0.1)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Accepted Payments</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>UPI · Credit/Debit Cards · Net Banking · Wallets</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <style jsx global>{`
        @media (max-width: 768px) { .cart-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
