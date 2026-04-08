import InfoPageLayout from '@/components/InfoPageLayout';
import Link from 'next/link';
import { Zap, Package, Users, Target, MapPin } from 'lucide-react';

export const metadata = { title: 'About Us — Nexletronics', description: 'Learn about Nexletronics — your trusted source for premium electronic components and project kits in India.' };

function Card({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="glass" style={{ borderRadius: 14, border: '1px solid var(--border)', padding: 24, textAlign: 'center' }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', color: 'var(--accent-cyan)' }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <InfoPageLayout title="About Nexletronics" subtitle="Your trusted partner for premium electronic components, modules, and project kits — powering India's maker community." icon="⚡" breadcrumb="About Us" lastUpdated="April 2026">

      <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 32 }}>
        Nexletronics was founded with a simple mission: to make high-quality electronic components accessible to every hobbyist, student, and engineer across India. From a single Arduino board to a complete robotics kit, we stock everything you need to bring your ideas to life.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 40 }}>
        <Card icon={<Package size={20} />} title="500+ Products" desc="Curated catalog of genuine electronic components" />
        <Card icon={<Users size={20} />} title="India-Wide" desc="Delivering to every pin code with reliable shipping" />
        <Card icon={<Target size={20} />} title="Quality First" desc="Every product tested and guaranteed genuine" />
        <Card icon={<MapPin size={20} />} title="India Based" desc="Operated by Indian engineers, for Indian makers" />
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>What We Offer</h2>
      {[
        ['🔌', 'Microcontrollers', 'Arduino, ESP32, Raspberry Pi, and more development boards.'],
        ['📡', 'Sensors', 'Ultrasonic, temperature, gas, motion — every sensor you need.'],
        ['📟', 'Displays', 'OLED, LCD, LED matrix displays for all your projects.'],
        ['⚙️', 'Motor Drivers', 'L298N, DRV8825, and servo controllers for robotics.'],
        ['🔧', 'Passive Components', 'Resistors, capacitors, transistors, and more in bulk kits.'],
        ['🚀', 'Project Kits', 'Ready-to-assemble kits for beginners and advanced makers.'],
      ].map(([icon, title, desc]) => (
        <div key={title as string} style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <span style={{ fontSize: 20 }}>{icon}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>{title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</div>
          </div>
        </div>
      ))}

      <div style={{ marginTop: 40, padding: 24, background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 14, textAlign: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Ready to start building? ⚡</div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Browse our full catalog and find everything you need.</p>
        <Link href="/products" className="btn-primary" style={{ padding: '11px 28px', textDecoration: 'none', display: 'inline-flex' }}>Shop Now</Link>
      </div>
    </InfoPageLayout>
  );
}
