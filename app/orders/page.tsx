'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getOrders, updateOrderStatus } from '@/lib/store';
import { onStoreUpdate } from '@/lib/sync';
import { useToast } from '@/lib/toast-context';
import { Order } from '@/lib/types';
import Link from 'next/link';
import { Package, Truck, CheckCircle, Clock, XCircle, MapPin, AlertTriangle, X, CreditCard, Banknote, ShieldCheck, ChevronDown, ChevronUp, Star, Send, MessageSquare } from 'lucide-react';
import { getOrderFeedback, addOrderFeedback } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';

// ─── Whether an order is Cash on Delivery ────────────────────────────
const isCOD = (order: Order) => !order.payment_id && order.status !== 'paid';

// ─── Steps for Online Payment orders ────────────────────────────
const ONLINE_STEPS: { key: Order['status']; label: string; desc: string; icon: React.ReactNode }[] = [
  { key: 'pending',    label: 'Order Placed',         desc: 'Your order has been received',                icon: <Clock size={14} />        },
  { key: 'paid',       label: 'Payment Confirmed',    desc: 'Payment received successfully',               icon: <CreditCard size={14} />   },
  { key: 'processing', label: 'Packing',              desc: 'Order is being packed & quality checked',     icon: <Package size={14} />      },
  { key: 'shipped',    label: 'Shipped',              desc: 'On the way to your doorstep',                 icon: <Truck size={14} />        },
  { key: 'delivered',  label: 'Delivered',            desc: 'Package delivered successfully',              icon: <CheckCircle size={14} />  },
];

// ─── Steps for COD orders ────────────────────────────
const COD_STEPS: { key: string; label: string; desc: string; icon: React.ReactNode }[] = [
  { key: 'pending',    label: 'Order Placed',         desc: 'Your order has been received',                icon: <Clock size={14} />        },
  { key: 'processing', label: 'Packing',              desc: 'Order is being packed & quality checked',     icon: <Package size={14} />      },
  { key: 'shipped',    label: 'Out for Delivery',     desc: 'Delivery partner is on the way',              icon: <Truck size={14} />        },
  { key: 'delivered',  label: 'Delivered + Paid',     desc: 'Delivered & cash collected at your door',     icon: <Banknote size={14} />     },
];

const STATUS_BADGE: Record<Order['status'], { label: string; color: string; bg: string; border: string }> = {
  pending:    { label: 'Order Placed',      color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)'  },
  paid:       { label: 'Payment Confirmed', color: '#10B981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)'  },
  processing: { label: 'Packing',           color: '#00D4FF', bg: 'rgba(0,212,255,0.08)',   border: 'rgba(0,212,255,0.2)'   },
  shipped:    { label: 'Shipped',           color: '#A855F7', bg: 'rgba(168,85,247,0.08)',  border: 'rgba(168,85,247,0.2)'  },
  delivered:  { label: 'Delivered',         color: '#10B981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)'  },
  cancelled:  { label: 'Cancelled',         color: '#EF4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)'   },
};

const CANCELLABLE: Order['status'][] = ['pending', 'paid', 'processing'];

function OrderTracker({ order }: { order: Order }) {
  const cod = isCOD(order);
  const steps = cod ? COD_STEPS : ONLINE_STEPS;

  // Map current status to step index
  const getCurrentIdx = () => {
    if (cod) {
      const map: Record<string, number> = { pending: 0, processing: 1, shipped: 2, delivered: 3 };
      return map[order.status] ?? -1;
    } else {
      const map: Record<string, number> = { pending: 0, paid: 1, processing: 2, shipped: 3, delivered: 4 };
      return map[order.status] ?? -1;
    }
  };

  const currentIdx = getCurrentIdx();
  const pct = currentIdx < 0 ? 0 : Math.min(100, (currentIdx / (steps.length - 1)) * 100);

  return (
    <div style={{ margin: '20px 0 16px' }}>
      {/* COD badge */}
      {cod && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 20, marginBottom: 16 }}>
          <Banknote size={12} color="#F59E0B" />
          <span style={{ fontSize: 11, color: '#F59E0B', fontWeight: 600 }}>Cash on Delivery — Pay when delivered</span>
        </div>
      )}
      {!cod && order.status !== 'cancelled' && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 20, marginBottom: 16 }}>
          <ShieldCheck size={12} color="#10B981" />
          <span style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>Online Payment Confirmed</span>
        </div>
      )}

      {/* Steps */}
      <div style={{ position: 'relative', paddingBottom: 4 }}>
        {/* Track line background */}
        <div style={{ position: 'absolute', top: 14, left: 14, right: 14, height: 2, background: 'var(--border)', zIndex: 0 }} />
        {/* Track line progress */}
        <div style={{ position: 'absolute', top: 14, left: 14, height: 2, background: 'linear-gradient(90deg, var(--accent-cyan), #7B2FFF)', zIndex: 1, transition: 'width 0.6s ease', width: `calc(${pct}% * (100% - 28px) / 100)` }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
          {steps.map((step, i) => {
            const done = currentIdx >= i;
            const active = currentIdx === i;
            return (
              <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 80, flex: 1 }}>
                {/* Circle */}
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', marginBottom: 8,
                  background: done ? (active ? 'linear-gradient(135deg, #00D4FF, #7B2FFF)' : 'var(--accent-cyan)') : 'var(--bg-elevated)',
                  border: `2px solid ${done ? (active ? 'transparent' : 'var(--accent-cyan)') : 'var(--border-bright)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: active ? '0 0 16px rgba(0,212,255,0.5)' : done ? '0 0 6px rgba(0,212,255,0.2)' : 'none',
                  transition: 'all 0.3s',
                  color: done ? '#000' : 'var(--text-muted)',
                }}>
                  {done ? (active ? step.icon : <CheckCircle size={13} />) : step.icon}
                </div>
                {/* Label */}
                <span style={{ fontSize: 9, color: done ? (active ? 'var(--accent-cyan)' : 'var(--text-secondary)') : 'var(--text-muted)', fontWeight: done ? 600 : 400, textAlign: 'center', lineHeight: 1.3, letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                  {step.label}
                </span>
                {/* Active desc */}
                {active && (
                  <span style={{ fontSize: 9, color: 'var(--text-muted)', textAlign: 'center', marginTop: 2 }}>{step.desc}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Post-delivery Feedback Widget ────────────────────────────
function StarPicker({ value, onSelect }: { value: number; onSelect: (v: number) => void }) {
  const [hov, setHov] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1,2,3,4,5].map(s => (
        <span key={s}
          onClick={() => onSelect(s)}
          onMouseEnter={() => setHov(s)}
          onMouseLeave={() => setHov(0)}
          style={{ cursor: 'pointer' }}
        >
          <Star size={20}
            fill={(hov || value) >= s ? '#FFB800' : 'transparent'}
            color={(hov || value) >= s ? '#FFB800' : 'var(--text-muted)'}
            style={{ transition: 'all 0.1s' }}
          />
        </span>
      ))}
    </div>
  );
}

function FeedbackWidget({ order, userId }: { order: Order; userId: string }) {
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [productRating, setProductRating]   = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [existing] = useState(() => getOrderFeedback(order.id));
  const [open, setOpen] = useState(false);

  if (existing || submitted) {
    return (
      <div style={{ margin: '12px 0 0', padding: '10px 14px', background: 'rgba(0,255,136,0.04)', border: '1px solid rgba(0,255,136,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
        <CheckCircle size={13} color="var(--success)" />
        <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>Thank you for your feedback!</span>
        <div style={{ display: 'flex', gap: 2, marginLeft: 'auto' }}>
          {[1,2,3,4,5].map(s => <Star key={s} size={12} fill={(existing?.delivery_rating ?? deliveryRating) >= s ? '#FFB800' : 'transparent'} color={(existing?.delivery_rating ?? deliveryRating) >= s ? '#FFB800' : 'var(--text-muted)'} />)}
        </div>
      </div>
    );
  }

  const submit = () => {
    if (!deliveryRating || !productRating) return;
    addOrderFeedback({ order_id: order.id, user_id: userId, delivery_rating: deliveryRating as 1|2|3|4|5, product_rating: productRating as 1|2|3|4|5, comment: comment.trim() });
    setSubmitted(true);
  };

  return (
    <div style={{ marginTop: 12 }}>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', background: 'rgba(255,184,0,0.06)', border: '1px solid rgba(255,184,0,0.2)', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#FFB800', fontFamily: 'var(--font-main)', width: '100%', justifyContent: 'center', transition: 'all 0.2s' }}
        >
          <MessageSquare size={13} /> How was your order? Share feedback
        </button>
      ) : (
        <div style={{ padding: '18px 20px', background: 'rgba(255,184,0,0.03)', border: '1px solid rgba(255,184,0,0.15)', borderRadius: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MessageSquare size={15} color="#FFB800" /> How was your experience?
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Delivery Experience</div>
              <StarPicker value={deliveryRating} onSelect={setDeliveryRating} />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                {['','Terrible','Bad','OK','Good','Excellent'][deliveryRating] || 'Rate delivery'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Product Quality</div>
              <StarPicker value={productRating} onSelect={setProductRating} />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                {['','Terrible','Bad','OK','Good','Excellent'][productRating] || 'Rate products'}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>Any comments? (optional)</label>
            <textarea
              className="input-field"
              style={{ padding: '9px 12px', fontSize: 13, resize: 'none', minHeight: 70, fontFamily: 'var(--font-main)' }}
              placeholder="Packaging, speed, product accuracy..."
              value={comment}
              onChange={e => setComment(e.target.value.slice(0, 300))}
            />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={submit}
              disabled={!deliveryRating || !productRating}
              className="btn-primary"
              style={{ padding: '9px 20px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, opacity: (!deliveryRating || !productRating) ? 0.5 : 1 }}
            >
              <Send size={12} /> Submit Feedback
            </button>
            <button onClick={() => setOpen(false)} style={{ padding: '9px 16px', fontSize: 13, background: 'none', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-muted)', fontFamily: 'var(--font-main)' }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { showToast } = useToast();
  const { user } = useAuth();

  const load = () => setOrders(getOrders());
  useEffect(() => {
    load();
    const unsub = onStoreUpdate(load);
    return unsub;
  }, []);

  const handleCancel = (orderId: string) => {
    updateOrderStatus(orderId, 'cancelled');
    setConfirmCancel(null);
    load();
    showToast('success', 'Order cancelled', 'Your order has been cancelled. Refund within 5–7 days if paid online.');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>My Orders</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Track, manage and review your Nexletronics orders</p>
        </div>

        {orders.length === 0 ? (
          <div className="glass" style={{ borderRadius: 20, border: '1px solid var(--border)', padding: '80px 24px', textAlign: 'center' }}>
            <Package size={56} color="var(--text-muted)" style={{ margin: '0 auto 18px', display: 'block' }} />
            <h3 style={{ fontSize: 20, color: 'var(--text-secondary)', marginBottom: 10 }}>No orders yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 14 }}>Browse our catalog and place your first order!</p>
            <Link href="/products" className="btn-primary" style={{ padding: '12px 28px', textDecoration: 'none' }}>Shop Now ⚡</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {orders.map(order => {
              const badge = STATUS_BADGE[order.status];
              const canCancel = CANCELLABLE.includes(order.status);
              const isExpanded = expanded === order.id;
              const cod = isCOD(order);

              return (
                <div key={order.id} className="glass" style={{
                  borderRadius: 18, border: `1px solid ${order.status === 'cancelled' ? 'rgba(239,68,68,0.2)' : 'var(--border)'}`,
                  overflow: 'hidden', transition: 'border-color 0.2s',
                }}>

                  {/* Cancelled banner */}
                  {order.status === 'cancelled' && (
                    <div style={{ background: 'rgba(239,68,68,0.07)', borderBottom: '1px solid rgba(239,68,68,0.15)', padding: '8px 22px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <XCircle size={13} color="#EF4444" />
                      <span style={{ fontSize: 12, color: '#EF4444', fontWeight: 600 }}>Order Cancelled</span>
                    </div>
                  )}

                  {/* Main card */}
                  <div style={{ padding: '20px 24px' }}>

                    {/* Top row: order number + date + total + badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 4 }}>
                      <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: 3 }}>{order.order_number}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                          {' · '}
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>₹{order.total.toLocaleString()}</span>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px',
                          borderRadius: 20, fontSize: 11, fontWeight: 700,
                          color: badge.color, background: badge.bg, border: `1px solid ${badge.border}`,
                        }}>
                          {ORDER_ICON(order.status, cod)} {cod && order.status === 'pending' ? 'Order Placed (COD)' : badge.label}
                        </span>
                      </div>
                    </div>

                    {/* Progress Tracker */}
                    {order.status !== 'cancelled' && <OrderTracker order={order} />}

                    {/* Items summary */}
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14, padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid var(--border)' }}>
                      {order.items.map(item => (
                        <span key={item.product.id} style={{ marginRight: 12 }}>
                          📦 {item.product.name} <span style={{ color: 'var(--text-muted)' }}>× {item.quantity}</span>
                        </span>
                      ))}
                    </div>

                    {/* Address + tracking + actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                        <MapPin size={11} />
                        {order.shipping_address.city}, {order.shipping_address.state} — {order.shipping_address.pincode}
                      </div>

                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* Expand toggle */}
                        <button onClick={() => setExpanded(isExpanded ? null : order.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', fontSize: 12, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-secondary)', fontFamily: 'var(--font-main)', transition: 'all 0.2s' }}>
                          {isExpanded ? <><ChevronUp size={12} /> Hide Details</> : <><ChevronDown size={12} /> View Details</>}
                        </button>

                        {/* Cancel button */}
                        {canCancel && (
                          confirmCancel === order.id ? (
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                              <span style={{ fontSize: 12, color: '#F59E0B', fontWeight: 600 }}>Confirm cancel?</span>
                              <button onClick={() => handleCancel(order.id)} style={{ padding: '7px 14px', fontSize: 12, background: '#EF4444', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontFamily: 'var(--font-main)' }}>
                                Yes, Cancel
                              </button>
                              <button onClick={() => setConfirmCancel(null)} style={{ padding: '7px 10px', fontSize: 12, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-secondary)', fontFamily: 'var(--font-main)', display: 'flex', alignItems: 'center' }}>
                                <X size={12} />
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmCancel(order.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', fontSize: 12, fontWeight: 600, background: 'rgba(239,68,68,0.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-main)', transition: 'all 0.2s' }}>
                              <XCircle size={12} /> Cancel Order
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {/* Tracking ID chip */}
                    {order.tracking_id && (
                      <div style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 8 }}>
                        <Truck size={12} color="#A855F7" />
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Tracking ID:</span>
                        <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: '#A855F7', fontWeight: 700 }}>{order.tracking_id}</span>
                      </div>
                    )}

                    {/* Post-delivery feedback prompt */}
                    {order.status === 'delivered' && user && (
                      <FeedbackWidget order={order} userId={user.id} />
                    )}
                  </div>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <div style={{ borderTop: '1px solid var(--border)', padding: '20px 24px', background: 'rgba(255,255,255,0.01)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>

                        {/* Items breakdown */}
                        <div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700, marginBottom: 12 }}>Order Items</div>
                          {order.items.map(item => (
                            <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{item.product.name}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Qty {item.quantity} × ₹{(item.product.discount_price || item.product.price).toLocaleString()}</div>
                              </div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                                ₹{((item.product.discount_price || item.product.price) * item.quantity).toLocaleString()}
                              </div>
                            </div>
                          ))}
                          {/* Totals */}
                          <div style={{ paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                              <span>Subtotal</span><span>₹{order.subtotal?.toLocaleString() ?? order.total}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                              <span>Shipping</span><span>{(order.shipping ?? 0) === 0 ? '🎉 FREE' : `₹${order.shipping}`}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
                              <span>Total</span><span style={{ color: 'var(--accent-cyan)' }}>₹{order.total.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right column */}
                        <div>
                          {/* Delivery address */}
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700, marginBottom: 10 }}>Delivery Address</div>
                          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 2 }}>
                            <strong style={{ color: 'var(--text-primary)' }}>{order.shipping_address.name}</strong><br />
                            {order.shipping_address.phone}<br />
                            {order.shipping_address.line1}{order.shipping_address.line2 ? `, ${order.shipping_address.line2}` : ''}<br />
                            {order.shipping_address.city}, {order.shipping_address.state}, {order.shipping_address.pincode}
                          </div>

                          {/* Payment info */}
                          <div style={{ marginTop: 20 }}>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700, marginBottom: 10 }}>Payment</div>
                            {cod ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8 }}>
                                <Banknote size={14} color="#F59E0B" />
                                <div>
                                  <div style={{ fontSize: 13, fontWeight: 700, color: '#F59E0B' }}>Cash on Delivery</div>
                                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                    {order.status === 'delivered' ? '✅ Payment collected at delivery' : 'Pay ₹' + order.total.toLocaleString() + ' at your doorstep'}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8 }}>
                                <ShieldCheck size={14} color="#10B981" />
                                <div>
                                  <div style={{ fontSize: 13, fontWeight: 700, color: '#10B981' }}>Online Payment</div>
                                  {order.payment_id && (
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{order.payment_id}</div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Cancellable warning */}
                      {canCancel && (
                        <div style={{ marginTop: 18, padding: '10px 14px', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 10, display: 'flex', gap: 8 }}>
                          <AlertTriangle size={14} color="#F59E0B" style={{ marginTop: 1, flexShrink: 0 }} />
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            You can cancel this order before it is shipped. Once shipped, cancellation is not possible. Refunds for online payments take 5–7 business days.
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

// Status icon helper
function ORDER_ICON(status: Order['status'], cod: boolean) {
  if (status === 'cancelled') return <XCircle size={11} />;
  if (status === 'delivered') return <CheckCircle size={11} />;
  if (status === 'shipped') return <Truck size={11} />;
  if (status === 'processing') return <Package size={11} />;
  if (status === 'paid') return <CreditCard size={11} />;
  return cod ? <Banknote size={11} /> : <Clock size={11} />;
}
