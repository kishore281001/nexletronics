'use client';
import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { getProducts, getOrders } from '@/lib/store';
import { Package, ShoppingBag, TrendingUp, IndianRupee, Clock, CheckCircle, Truck } from 'lucide-react';
import Link from 'next/link';
import { Order } from '@/lib/types';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, pending: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    async function loadData() {
      const products = await getProducts();
      const orders = await getOrders();
      const revenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
      const pending = orders.filter(o => o.status === 'pending').length;
      setStats({ products: products.length, orders: orders.length, revenue, pending });
      setRecentOrders(orders.slice(0, 5));
    }
    loadData();
  }, []);

  const statusColor: Record<string, string> = {
    pending: 'badge-orange', paid: 'badge-green', processing: 'badge-cyan',
    shipped: 'badge-purple', delivered: 'badge-green', cancelled: 'badge-red',
  };

  return (
    <div className="admin-page-wrap" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)', flexDirection: 'row' }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: 'clamp(16px, 3vw, 32px)', overflowY: 'auto', overflowX: 'hidden', maxWidth: '100%' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Welcome back! Here's what's happening with Nexletronics.</p>
        </div>

        {/* Stats cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
          {[
            { label: 'Total Products', value: stats.products, icon: <Package size={20} />, color: 'var(--accent-cyan)', sub: 'Active in store' },
            { label: 'Total Orders', value: stats.orders, icon: <ShoppingBag size={20} />, color: 'var(--accent-purple)', sub: 'All time' },
            { label: 'Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: <IndianRupee size={20} />, color: '#00FF88', sub: 'Total collected' },
            { label: 'Pending Orders', value: stats.pending, icon: <Clock size={20} />, color: 'var(--warning)', sub: 'Needs attention' },
          ].map(({ label, value, icon, color, sub }) => (
            <div key={label} className="glass" style={{ borderRadius: 14, padding: 24, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
                  {icon}
                </div>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>{value}</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 32 }}>
          {[
            { href: '/admin/products/new', label: '+ Add New Product', style: 'btn-primary' },
            { href: '/admin/orders', label: '📋 Manage Orders', style: 'btn-secondary' },
            { href: '/admin/featured', label: '⭐ Edit Featured Panel', style: 'btn-secondary' },
            { href: '/admin/settings', label: '⚙️ Settings', style: 'btn-ghost' },
          ].map(({ href, label, style }) => (
            <Link key={href} href={href} className={style} style={{ padding: '12px 16px', fontSize: 13, textDecoration: 'none', justifyContent: 'center', borderRadius: 10 }}>
              {label}
            </Link>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="glass" style={{ borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Recent Orders</h2>
            <Link href="/admin/orders" style={{ fontSize: 12, color: 'var(--accent-cyan)', textDecoration: 'none' }}>View All →</Link>
          </div>
          {recentOrders.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>No orders yet. Share your store link to start receiving orders!</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent-cyan)' }}>{order.order_number}</td>
                      <td>{order.user_name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{order.items.length} item(s)</td>
                      <td style={{ fontWeight: 700 }}>₹{order.total.toLocaleString()}</td>
                      <td><span className={`badge ${statusColor[order.status]}`}>{order.status}</span></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(order.created_at).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
