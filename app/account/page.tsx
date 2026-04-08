'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { getOrders, updateOrderStatus } from '@/lib/store';
import { onStoreUpdate } from '@/lib/sync';
import { Order } from '@/lib/types';
import Link from 'next/link';
import { User, ShoppingBag, Package, LogOut, Edit, Clock, XCircle, X } from 'lucide-react';

const STATUS_BADGE: Record<string, string> = {
  pending: 'badge-orange', paid: 'badge-green', processing: 'badge-cyan',
  shipped: 'badge-purple', delivered: 'badge-green', cancelled: 'badge-red',
};

export default function AccountPage() {
  const { user, logout, isLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);

  const CANCELLABLE: Order['status'][] = ['pending', 'paid', 'processing'];

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/account');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      const loadOrders = () => {
        const allOrders = getOrders();
        setOrders(allOrders.filter(o => o.user_email === user.email));
      };
      loadOrders();
      setEditName(user.name);
      setEditPhone(user.phone || '');
      const unsub = onStoreUpdate(loadOrders);
      return unsub;
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    showToast('info', 'Signed out', 'Come back soon!');
    router.push('/');
  };

  const handleCancel = (orderId: string) => {
    updateOrderStatus(orderId, 'cancelled');
    setConfirmCancel(null);
    showToast('success', 'Order cancelled', 'Your order has been cancelled successfully.');
  };

  const saveProfile = () => {
    if (!user) return;
    const updated = { ...user, name: editName, phone: editPhone };
    localStorage.setItem('nxt_user', JSON.stringify(updated));
    showToast('success', 'Profile updated!');
  };

  if (isLoading || !user) {
    return <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading...</div>;
  }

  const initial = user.name.charAt(0).toUpperCase();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />

      {/* Header */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '40px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, color: '#000', flexShrink: 0 }}>
            {initial}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{user.name}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{user.email}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>
              Member since {new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button onClick={handleLogout} className="btn-ghost" style={{ padding: '10px 18px', fontSize: 13, flexShrink: 0 }}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: 'var(--bg-elevated)', borderRadius: 10, padding: 4, width: 'fit-content', border: '1px solid var(--border)' }}>
          {[{ key: 'orders', label: '📦 My Orders', icon: <ShoppingBag size={14} /> }, { key: 'profile', label: '👤 Profile', icon: <User size={14} /> }].map(({ key, label }) => (
            <button key={key} onClick={() => setActiveTab(key as 'orders' | 'profile')} style={{
              padding: '9px 20px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              background: activeTab === key ? 'var(--accent-cyan)' : 'transparent',
              color: activeTab === key ? '#000' : 'var(--text-secondary)',
              fontFamily: 'var(--font-main)', transition: 'all 0.15s',
            }}>{label}</button>
          ))}
        </div>

        {/* Orders tab */}
        {activeTab === 'orders' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{orders.length} order{orders.length !== 1 ? 's' : ''} placed</div>
              <Link href="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 600 }}>
                <Package size={13} /> View Full Tracker →
              </Link>
            </div>
            {orders.length === 0 ? (
              <div className="glass" style={{ borderRadius: 16, border: '1px solid var(--border)', padding: '60px 24px', textAlign: 'center' }}>
                <Package size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
                <h3 style={{ fontSize: 18, color: 'var(--text-secondary)', marginBottom: 8 }}>No orders yet</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>Your order history will appear here once you make a purchase.</p>
                <Link href="/products" className="btn-primary" style={{ padding: '12px 24px', fontSize: 14, textDecoration: 'none' }}>
                  Start Shopping ⚡
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {orders.map(order => (
                  <div key={order.id} className="glass card-hover" style={{ borderRadius: 14, border: `1px solid ${order.status === 'cancelled' ? 'rgba(255,68,68,0.15)' : 'var(--border)'}`, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent-cyan)' }}>{order.order_number}</span>
                          <span className={`badge ${STATUS_BADGE[order.status]}`} style={{ textTransform: 'capitalize' }}>{order.status}</span>
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Clock size={12} /> {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-cyan)' }}>₹{order.total.toLocaleString()}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{order.items.length} item(s)</div>
                      </div>
                    </div>
                    {/* Items */}
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {order.items.map(item => (
                        <div key={item.product.id} style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'var(--bg-elevated)', padding: '4px 10px', borderRadius: 20, border: '1px solid var(--border)' }}>
                          {item.product.name} × {item.quantity}
                        </div>
                      ))}
                    </div>
                    {order.tracking_id && (
                      <div style={{ marginTop: 10, fontSize: 12, color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Package size={11} /> Tracking: <span style={{ fontFamily: 'var(--font-mono)' }}>{order.tracking_id}</span>
                      </div>
                    )}
                    {/* Cancel action */}
                    {CANCELLABLE.includes(order.status) && (
                      <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                        {confirmCancel === order.id ? (
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span style={{ fontSize: 12, color: 'var(--warning)' }}>Are you sure?</span>
                            <button onClick={() => handleCancel(order.id)} style={{ padding: '6px 14px', fontSize: 12, fontWeight: 700, background: 'var(--error)', color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer', fontFamily: 'var(--font-main)' }}>Yes, Cancel</button>
                            <button onClick={() => setConfirmCancel(null)} className="btn-ghost" style={{ padding: '6px 10px', fontSize: 12 }}><X size={12} /></button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmCancel(order.id)} style={{ padding: '7px 14px', fontSize: 12, fontWeight: 600, background: 'rgba(255,68,68,0.08)', color: 'var(--error)', border: '1px solid rgba(255,68,68,0.25)', borderRadius: 7, cursor: 'pointer', fontFamily: 'var(--font-main)', display: 'flex', alignItems: 'center', gap: 5, transition: 'background 0.15s' }}
                            onMouseEnter={e => { (e.currentTarget).style.background = 'rgba(255,68,68,0.15)'; }}
                            onMouseLeave={e => { (e.currentTarget).style.background = 'rgba(255,68,68,0.08)'; }}>
                            <XCircle size={12} /> Cancel Order
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile tab */}
        {activeTab === 'profile' && (
          <div className="glass" style={{ borderRadius: 16, border: '1px solid var(--border)', padding: 28, maxWidth: 520 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 24 }}>Edit Profile</h2>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 6 }}>Full Name</label>
              <input className="input-field" style={{ padding: '11px 14px', fontSize: 14 }}
                value={editName} onChange={e => setEditName(e.target.value)} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 6 }}>Email Address</label>
              <input className="input-field" style={{ padding: '11px 14px', fontSize: 14, opacity: 0.6 }}
                value={user.email} readOnly />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Email cannot be changed</div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 6 }}>Phone Number</label>
              <input className="input-field" style={{ padding: '11px 14px', fontSize: 14 }}
                type="tel" placeholder="+91 98765 43210"
                value={editPhone} onChange={e => setEditPhone(e.target.value)} />
            </div>
            <button onClick={saveProfile} className="btn-primary" style={{ padding: '12px 24px', fontSize: 14 }}>
              <Edit size={15} /> Save Changes
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
