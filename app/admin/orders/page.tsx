'use client';
import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { getOrders, updateOrderStatus } from '@/lib/store';
import { onStoreUpdate } from '@/lib/sync';
import { Order } from '@/lib/types';
import { Package, Truck, CheckCircle, Clock, XCircle, Eye, Banknote, CreditCard } from 'lucide-react';

const STATUS_OPTIONS = ['all', 'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'] as const;
const STATUS_BADGE: Record<string, string> = {
  pending: 'badge-orange', paid: 'badge-green', processing: 'badge-cyan',
  shipped: 'badge-purple', delivered: 'badge-green', cancelled: 'badge-red',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Order | null>(null);
  const [trackingInput, setTrackingInput] = useState('');

  const load = () => setOrders(getOrders());
  useEffect(() => {
    load();
    const unsub = onStoreUpdate(load);
    return unsub;
  }, []);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const handleStatusUpdate = (id: string, status: Order['status']) => {
    updateOrderStatus(id, status, trackingInput || undefined);
    load();
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status, tracking_id: trackingInput || prev.tracking_id } : null);
    setTrackingInput('');
  };

  return (
    <div className="admin-page-wrap" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: 'clamp(14px, 3vw, 32px)', overflowY: 'auto', overflowX: 'hidden', minWidth: 0 }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Orders</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{orders.length} total orders received</p>
        </div>

        {/* Status filter tabs */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
          {STATUS_OPTIONS.map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '6px 14px', borderRadius: 20, border: '1px solid', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              borderColor: filter === s ? 'var(--accent-cyan)' : 'var(--border)',
              background: filter === s ? 'rgba(0,212,255,0.1)' : 'transparent',
              color: filter === s ? 'var(--accent-cyan)' : 'var(--text-muted)',
              textTransform: 'capitalize', transition: 'all 0.15s',
            }}>
              {s === 'all' ? `All (${orders.length})` : `${s} (${orders.filter(o => o.status === s).length})`}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selected ? 'minmax(0,1fr) 380px' : '1fr', gap: 20 }}
          className={selected ? 'orders-grid-selected' : ''}>
          <style jsx global>{`
            @media (max-width: 768px) {
              .orders-grid-selected {
                grid-template-columns: 1fr !important;
              }
            }
          `}</style>
          {/* Orders table */}
          <div className="glass" style={{ borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              {filtered.length === 0 ? (
                <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                  <Package size={36} style={{ marginBottom: 12, display: 'block', margin: '0 auto 12px' }} />
                  No {filter !== 'all' ? filter : ''} orders yet
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Payment</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(order => (
                      <tr key={order.id} onClick={() => setSelected(order)} style={{ cursor: 'pointer', background: selected?.id === order.id ? 'rgba(0, 212, 255, 0.04)' : undefined }}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent-cyan)' }}>{order.order_number}</td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{order.user_name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{order.shipping_address.city}</div>
                        </td>
                        <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{order.items.length} item(s)</td>
                        <td style={{ fontWeight: 700 }}>₹{order.total.toLocaleString()}</td>
                        <td><span className={`badge ${STATUS_BADGE[order.status]}`} style={{ textTransform: 'capitalize' }}>{order.status}</span></td>
                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td>
                          {order.payment_id
                            ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#10B981', fontWeight: 600 }}><CreditCard size={10} /> Online</span>
                            : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#F59E0B', fontWeight: 600 }}><Banknote size={10} /> COD</span>
                          }
                        </td>
                        <td>
                          <button onClick={e => { e.stopPropagation(); setSelected(order); }} style={{ width: 30, height: 30, borderRadius: 7, background: 'rgba(0,212,255,0.1)', border: 'none', cursor: 'pointer', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Eye size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Order detail panel */}
          {selected && (
            <div className="glass" style={{ borderRadius: 14, border: '1px solid var(--border)', padding: 24, height: 'fit-content', position: 'sticky', top: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>{selected.order_number}</div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Order Details</h3>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
              </div>

              {/* Items */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>Items Ordered</div>
                {selected.items.map(item => (
                  <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{item.product.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Qty: {item.quantity} × ₹{(item.product.discount_price || item.product.price).toLocaleString()}</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>₹{((item.product.discount_price || item.product.price) * item.quantity).toLocaleString()}</div>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', marginTop: 4 }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Total</span>
                  <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--accent-cyan)' }}>₹{selected.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Customer + Address */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>Shipping Details</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>{selected.shipping_address.name}</strong><br />
                  {selected.shipping_address.phone}<br />
                  {selected.shipping_address.line1}{selected.shipping_address.line2 ? `, ${selected.shipping_address.line2}` : ''}<br />
                  {selected.shipping_address.city}, {selected.shipping_address.state} - {selected.shipping_address.pincode}
                </div>
              </div>

              {/* Payment */}
              {selected.payment_id && (
                <div style={{ marginBottom: 18, padding: '10px 12px', background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.1)', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Payment ID</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--success)' }}>{selected.payment_id}</div>
                </div>
              )}

              {/* Tracking */}
              {selected.tracking_id && (
                <div style={{ marginBottom: 18, padding: '10px 12px', background: 'rgba(123,47,255,0.05)', border: '1px solid rgba(123,47,255,0.15)', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Tracking ID</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#A855F7' }}>{selected.tracking_id}</div>
                </div>
              )}

              {/* Update Status */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Update Order Status</div>
                <input className="input-field" style={{ padding: '8px 12px', fontSize: 12, marginBottom: 10 }} placeholder="Tracking ID (optional)" value={trackingInput} onChange={e => setTrackingInput(e.target.value)} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {(['paid', 'processing', 'shipped', 'delivered', 'cancelled'] as Order['status'][]).map(st => (
                    <button key={st} onClick={() => handleStatusUpdate(selected.id, st)} style={{
                      padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', textTransform: 'capitalize',
                      fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
                      background: selected.status === st ? 'var(--accent-cyan)' : 'var(--bg-elevated)',
                      color: selected.status === st ? '#000' : 'var(--text-secondary)',
                    }}>
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
