import InfoPageLayout from '@/components/InfoPageLayout';
import Link from 'next/link';

export const metadata = { title: 'Return & Refund Policy — Nexletronics', description: 'Our 7-day hassle-free return and refund policy for electronic components and project kits.' };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 3, height: 18, background: 'var(--accent-cyan)', borderRadius: 2, display: 'inline-block' }} />
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function ReturnsPage() {
  return (
    <InfoPageLayout title="Return & Refund Policy" subtitle="We want you to be 100% satisfied. If something is not right, we will make it right — within 7 days." icon="↩️" breadcrumb="Return Policy" lastUpdated="April 2026">

      <div style={{ padding: '14px 18px', background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.15)', borderRadius: 10, marginBottom: 36, fontSize: 14, color: 'var(--success)', fontWeight: 600 }}>
        ✅ 7-Day Return Window · Free Return Pickup on Defective Items
      </div>

      <Section title="What Can Be Returned?">
        {[
          ['✅ Accepted', [
            'Defective or non-functioning components',
            'Wrong item delivered',
            'Damaged product (report within 48 hours)',
            'Missing accessories or parts',
          ]],
          ['❌ Not Accepted', [
            'Items used or soldered by the customer',
            'Products with physical damage caused by customer',
            'Items returned without original packaging',
            'Consumables like wires, solder, batteries (opened)',
          ]],
        ].map(([label, items]) => (
          <div key={label as string} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: (label as string).includes('✅') ? 'var(--success)' : 'var(--error)', marginBottom: 8 }}>{label}</div>
            <ul style={{ margin: 0, padding: '0 0 0 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(items as string[]).map(item => (
                <li key={item} style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </Section>

      <Section title="How to Request a Return">
        {[
          ['1', 'Email us', 'Send an email to support@nexletronics.in with your order number, photo of the item, and reason for return.'],
          ['2', 'Approval', 'We will review and approve your return request within 24 hours on business days.'],
          ['3', 'Pickup', 'We will arrange a free pickup for defective items. For other returns, you may need to ship the item back.'],
          ['4', 'Refund', 'Once we receive and inspect the item, your refund will be processed within 3–5 business days.'],
        ].map(([step, title, desc]) => (
          <div key={step as string} style={{ display: 'flex', gap: 16, padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--accent-cyan)', flexShrink: 0 }}>{step}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</div>
            </div>
          </div>
        ))}
      </Section>

      <Section title="Refund Methods">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          Refunds are processed to the <strong style={{ color: 'var(--text-primary)' }}>original payment method</strong>. Online payments (UPI, card, net banking) are refunded within 3–5 business days. Cash on Delivery refunds are made via bank transfer — please provide your bank account details when contacting us.
        </p>
      </Section>

      <div style={{ marginTop: 20, padding: '16px 20px', background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
        📧 Need help? Email us at <a href="mailto:support@nexletronics.in" style={{ color: 'var(--accent-cyan)' }}>support@nexletronics.in</a>
      </div>
    </InfoPageLayout>
  );
}
