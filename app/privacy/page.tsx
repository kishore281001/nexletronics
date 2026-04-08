import InfoPageLayout from '@/components/InfoPageLayout';

export const metadata = { title: 'Privacy Policy — Nexletronics', description: 'How Nexletronics collects, uses, and protects your personal information.' };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 3, height: 18, background: 'var(--accent-cyan)', borderRadius: 2, display: 'inline-block' }} />
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <InfoPageLayout title="Privacy Policy" subtitle="We take your privacy seriously. This policy explains what data we collect, how we use it, and how it is protected." icon="🔒" breadcrumb="Privacy Policy" lastUpdated="April 2026">

      <Section title="Information We Collect">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 12 }}>When you use Nexletronics, we may collect the following:</p>
        {['Full name and contact details (email, phone number)', 'Delivery address for processing orders', 'Order history and transaction records', 'Payment method (we do not store card details — handled by Razorpay)', 'Browser type and approximate location for analytics'].map(item => (
          <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 14, color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--accent-cyan)', flexShrink: 0 }}>›</span> {item}
          </div>
        ))}
      </Section>

      <Section title="How We Use Your Information">
        {[['📦', 'Order Fulfilment', 'To process, pack, and deliver your orders accurately and on time.'],
          ['📞', 'Customer Support', 'To resolve any issues, returns, or queries related to your orders.'],
          ['📧', 'Communication', 'To send order confirmations, shipping updates, and important notices.'],
          ['📊', 'Improvement', 'To improve our website, product catalog, and customer experience.']].map(([icon, title, desc]) => (
          <div key={title as string} style={{ display: 'flex', gap: 14, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: 18 }}>{icon}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>{title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</div>
            </div>
          </div>
        ))}
      </Section>

      <Section title="Data Security">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          Your data is stored securely and we use industry-standard security measures to protect it. <strong style={{ color: 'var(--text-primary)' }}>We do not sell or share your personal information</strong> with third parties for marketing purposes. All payment processing is handled by Razorpay, which is PCI-DSS compliant.
        </p>
      </Section>

      <Section title="Cookies">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          We use cookies and local storage to keep your cart, preferences, and login session active. You can clear these at any time from your browser settings. No tracking cookies or advertising cookies are used on our platform.
        </p>
      </Section>

      <Section title="Your Rights">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 12 }}>You have the right to:</p>
        {['Request access to the data we hold about you', 'Request correction of incorrect information', 'Request deletion of your account and associated data', 'Opt out of any marketing communications'].map(item => (
          <div key={item} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 14, color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--success)', flexShrink: 0 }}>✓</span> {item}
          </div>
        ))}
      </Section>

      <Section title="Contact">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          For any privacy-related concerns, email us at <a href="mailto:support@nexletronics.in" style={{ color: 'var(--accent-cyan)' }}>support@nexletronics.in</a>.
        </p>
      </Section>
    </InfoPageLayout>
  );
}
