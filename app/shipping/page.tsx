import InfoPageLayout from '@/components/InfoPageLayout';

export const metadata = { title: 'Shipping Policy — Nexletronics', description: 'Learn about Nexletronics shipping methods, delivery times, and charges across India.' };

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

export default function ShippingPage() {
  return (
    <InfoPageLayout title="Shipping Policy" subtitle="We deliver to every corner of India. Here's everything you need to know about how and when your order will arrive." icon="🚚" breadcrumb="Shipping Policy" lastUpdated="April 2026">

      <Section title="Delivery Charges">
        <div className="glass" style={{ borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 12 }}>
          {[
            ['Order Value', 'Shipping Charge', 'Estimated Delivery'],
            ['Below ₹999', '₹80 flat', '4–7 business days'],
            ['₹999 and above', 'FREE 🎉', '4–6 business days'],
          ].map(([a, b, c], i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '12px 18px', borderBottom: i < 2 ? '1px solid var(--border)' : 'none', background: i === 0 ? 'rgba(0,212,255,0.05)' : 'transparent', fontSize: i === 0 ? 12 : 14, fontWeight: i === 0 ? 700 : 400, color: i === 0 ? 'var(--accent-cyan)' : 'var(--text-secondary)' }}>
              <span>{a}</span><span>{b}</span><span>{c}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid var(--border)' }}>
          💡 Delivery times are estimates based on Shiprocket's courier network. Actual transit time may vary by destination pin code and courier partner assigned.
        </div>
      </Section>

      <Section title="Order Processing Time">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
          Orders placed before <strong style={{ color: 'var(--text-primary)' }}>2:00 PM IST on business days</strong> are processed and handed over to Shiprocket the same day. Orders placed after 2 PM, on Sundays, or on public holidays will be dispatched the next business day.
        </p>
        <div style={{ padding: '12px 16px', background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.15)', borderRadius: 8, fontSize: 13, color: 'var(--success)' }}>
          ✅ We dispatch Monday to Saturday, excluding public holidays.
        </div>
      </Section>

      <Section title="Delivery Partners">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '16px 20px', background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 12, marginBottom: 16 }}>
          <span style={{ fontSize: 28 }}>🚀</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Powered by Shiprocket</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              All our shipments are managed through <strong style={{ color: 'var(--accent-cyan)' }}>Shiprocket</strong> — India's leading shipping aggregator with 25+ courier partners. Shiprocket automatically assigns the best available courier for your pin code, such as <strong style={{ color: 'var(--text-primary)' }}>Delhivery, DTDC, XpressBees, BlueDart, and Ecom Express</strong>.
            </div>
          </div>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          Once your order is shipped, you will receive a <strong style={{ color: 'var(--text-primary)' }}>Shiprocket tracking link</strong> via email or SMS. You can also track your order from the Orders section in your account.
        </p>
      </Section>

      <Section title="Delivery Areas">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          We ship to <strong style={{ color: 'var(--text-primary)' }}>19,000+ pin codes across India</strong> through Shiprocket's network — covering all states, union territories, and most remote locations. If your pin code is not currently serviceable, we will contact you within 24 hours of placing your order.
        </p>
      </Section>

      <Section title="Damaged or Lost Shipments">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          If your order arrives damaged or is lost in transit, please contact us within <strong style={{ color: 'var(--text-primary)' }}>48 hours of the expected delivery date</strong> at <a href="mailto:support@nexletronics.in" style={{ color: 'var(--accent-cyan)' }}>support@nexletronics.in</a>. We will raise a dispute with Shiprocket and either reship or refund your order.
        </p>
      </Section>

      <Section title="Bulk Orders">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          For orders above <strong style={{ color: 'var(--text-primary)' }}>₹3,000 or 10+ units of a single item</strong>, please reach out to us before ordering. We may offer special pricing and priority dispatch for bulk purchases.
        </p>
      </Section>
    </InfoPageLayout>
  );
}
