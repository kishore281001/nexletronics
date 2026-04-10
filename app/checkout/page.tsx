'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { addOrder, decrementStock, sendOrderEmail } from '@/lib/store';
import { Address } from '@/lib/types';
import { Package, CreditCard, CheckCircle, ArrowRight, Truck } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh','Puducherry'];

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user, isLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [step, setStep] = useState<'address' | 'payment' | 'success'>('address');
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);

  const shipping = total >= 999 ? 0 : 80;
  const grandTotal = total + shipping;

  const [address, setAddress] = useState<Address>({
    name: user?.name || '', phone: user?.phone || '', line1: '', line2: '', city: '', state: '', pincode: '',
  });

  // 🔒 Auth guard — redirect to login if not signed in
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login?redirect=/checkout');
    }
  }, [user, isLoading, router]);

  // Show loading while auth is resolving
  if (isLoading || !user) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--accent-cyan)', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Verifying your session...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }


  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
    window.scrollTo(0, 0);
  };

  const handlePayment = async (method: 'cod' | 'online') => {
    setLoading(true);

    try {
      // 1. Call Backend to create Order
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          address,
          user_id: user?.id,
          user_email: user?.email || address.phone + '@guest.nexletronics.in',
          user_name: user?.name || address.name,
          total: grandTotal,
          method
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to checkout');

      if (method === 'cod') {
        const order = data.order;
        setOrderId(order.order_number);
        sendOrderEmail(order); 
        clearCart();
        setStep('success');
        showToast('success', '🎉 Order placed!', `Order ${order.order_number} confirmed.`);
        setLoading(false);
        return;
      }

      // 2. Razorpay Flow
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY || 'rzp_test_placeholder',
          amount: data.amount,
          currency: data.currency,
          name: 'Nexletronics',
          description: `Order - ${items.length} item(s)`,
          order_id: data.razorpay_order_id, // Important: use backend RZP order ID
          prefill: { name: address.name, contact: address.phone },
          theme: { color: '#00D4FF' },
          handler: async (response: { razorpay_payment_id: string, razorpay_signature: string }) => {
            // Under V2 architecture, webhooks handle DB writing. We just show success here immediately.
            setOrderId(data.order_number);
            clearCart();
            setStep('success');
            showToast('success', '✅ Payment successful!', `Order ${data.order_number} confirmed.`);
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', () => showToast('error', 'Payment Failed', 'Transaction cancelled'));
        rzp.open();
        setLoading(false);
      };
    } catch (error: any) {
      showToast('error', 'Checkout Error', error.message);
      setLoading(false);
    }
  };

  if (items.length === 0 && step !== 'success') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Navbar />
        <div style={{ maxWidth: 500, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: 16 }}>Your cart is empty</h2>
          <Link href="/products" className="btn-primary" style={{ padding: '12px 24px', textDecoration: 'none' }}>Shop Now</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 32 }}>Checkout</h1>

        {/* Steps indicator */}
        {step !== 'success' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40 }}>
            {[{ label: 'Address', key: 'address' }, { label: 'Payment', key: 'payment' }].map(({ label, key }, idx) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: step === key ? 'var(--accent-cyan)' : (step === 'payment' && key === 'address') ? 'var(--success)' : 'var(--bg-elevated)',
                  color: step === key ? '#000' : (step === 'payment' && key === 'address') ? '#000' : 'var(--text-muted)',
                  fontSize: 13, fontWeight: 700, border: '1px solid var(--border)',
                }}>
                  {step === 'payment' && key === 'address' ? '✓' : idx + 1}
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: step === key ? 'var(--text-primary)' : 'var(--text-muted)' }}>{label}</span>
                {idx < 1 && <div style={{ width: 40, height: 1, background: 'var(--border)' }} />}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: step === 'success' ? '1fr' : '1fr 320px', gap: 24 }} className="checkout-grid">
          {/* Main content */}
          <div>
            {/* ADDRESS STEP */}
            {step === 'address' && (
              <div className="glass" style={{ borderRadius: 14, border: '1px solid var(--border)', padding: 28 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Truck size={18} color="var(--accent-cyan)" /> Shipping Address
                </h2>
                <form onSubmit={handleAddressSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>Full Name *</label>
                      <input className="input-field" style={{ padding: '10px 14px', fontSize: 14 }} required value={address.name} onChange={e => setAddress(a => ({ ...a, name: e.target.value }))} placeholder="Rahul Sharma" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>Phone Number *</label>
                      <input className="input-field" style={{ padding: '10px 14px', fontSize: 14 }} required value={address.phone} onChange={e => setAddress(a => ({ ...a, phone: e.target.value }))} placeholder="+91 98765 43210" type="tel" />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>Address Line 1 *</label>
                    <input className="input-field" style={{ padding: '10px 14px', fontSize: 14 }} required value={address.line1} onChange={e => setAddress(a => ({ ...a, line1: e.target.value }))} placeholder="House no., Street name" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>Address Line 2</label>
                    <input className="input-field" style={{ padding: '10px 14px', fontSize: 14 }} value={address.line2} onChange={e => setAddress(a => ({ ...a, line2: e.target.value }))} placeholder="Apartment, area, landmark (optional)" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>City *</label>
                      <input className="input-field" style={{ padding: '10px 14px', fontSize: 14 }} required value={address.city} onChange={e => setAddress(a => ({ ...a, city: e.target.value }))} placeholder="Chennai" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>State *</label>
                      <select className="input-field" style={{ padding: '10px 14px', fontSize: 14 }} required value={address.state} onChange={e => setAddress(a => ({ ...a, state: e.target.value }))}>
                        <option value="">Select State</option>
                        {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>PIN Code *</label>
                      <input className="input-field" style={{ padding: '10px 14px', fontSize: 14 }} required value={address.pincode} onChange={e => setAddress(a => ({ ...a, pincode: e.target.value }))} placeholder="600001" maxLength={6} pattern="[0-9]{6}" />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary" style={{ padding: '13px 24px', fontSize: 15, marginTop: 8, justifyContent: 'center' }}>
                    Continue to Payment <ArrowRight size={16} />
                  </button>
                </form>
              </div>
            )}

            {/* PAYMENT STEP */}
            {step === 'payment' && (
              <div className="glass" style={{ borderRadius: 14, border: '1px solid var(--border)', padding: 28 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CreditCard size={18} color="var(--accent-cyan)" /> Choose Payment Method
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 28 }}>
                  Delivering to: {address.line1}, {address.city}, {address.state} - {address.pincode}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Online Payment */}
                  <button onClick={() => handlePayment('online')} disabled={loading} className="glass" style={{
                    borderRadius: 12, padding: 20, border: '1px solid rgba(0, 212, 255, 0.3)',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', background: 'rgba(0, 212, 255, 0.04)',
                    opacity: loading ? 0.7 : 1,
                  }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>💳 Pay Online</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>UPI, Credit/Debit Card, Net Banking, Wallets via Razorpay</div>
                    <div style={{ marginTop: 8 }}><span className="badge badge-cyan">Recommended</span></div>
                  </button>

                  {/* COD */}
                  <button onClick={() => handlePayment('cod')} disabled={loading} className="glass" style={{
                    borderRadius: 12, padding: 20, border: '1px solid var(--border)',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                    opacity: loading ? 0.7 : 1,
                  }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>🏠 Cash on Delivery</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Pay when your order arrives at your doorstep</div>
                    <div style={{ marginTop: 8 }}><span className="badge badge-purple">COD Available</span></div>
                  </button>
                </div>

                <button onClick={() => setStep('address')} style={{ marginTop: 16, background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  ← Back to Address
                </button>
              </div>
            )}

            {/* SUCCESS */}
            {step === 'success' && (
              <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: '40px 0' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(0, 255, 136, 0.1)', border: '2px solid var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 20px rgba(0, 255, 136, 0.2)' }}>
                  <CheckCircle size={40} color="var(--success)" />
                </div>
                <h2 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>Order Placed! 🎉</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 6, fontSize: 16 }}>Thank you for shopping with Nexletronics!</p>
                <div className="badge badge-cyan" style={{ fontSize: 14, padding: '8px 20px', margin: '16px auto', display: 'inline-flex' }}>Order: {orderId}</div>
                <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 32 }}>You will receive a confirmation shortly. We'll notify you when your order is shipped.</p>
                <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link href="/orders" className="btn-primary" style={{ padding: '12px 24px', textDecoration: 'none' }}>Track Order</Link>
                  <Link href="/products" className="btn-secondary" style={{ padding: '12px 24px', textDecoration: 'none' }}>Continue Shopping</Link>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          {step !== 'success' && (
            <aside>
              <div className="glass" style={{ borderRadius: 14, border: '1px solid var(--border)', padding: 20, position: 'sticky', top: 90 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Order Summary</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                  {items.map(item => (
                    <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: 'var(--text-secondary)', flex: 1, marginRight: 8 }}>{item.product.name} × {item.quantity}</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>₹{((item.product.discount_price || item.product.price) * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)' }}>
                    <span>Subtotal</span><span>₹{total.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)' }}>
                    <span>Shipping</span>
                    <span style={{ color: shipping === 0 ? 'var(--success)' : undefined }}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
                    <span>Total</span>
                    <span style={{ color: 'var(--accent-cyan)' }}>₹{grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      <Footer />
      <style jsx global>{`
        @media (max-width: 768px) { .checkout-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
