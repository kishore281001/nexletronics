import InfoPageLayout from '@/components/InfoPageLayout';

export const metadata = { title: 'Terms & Conditions — Nexletronics', description: 'Terms and conditions for using Nexletronics — the electronics components store.' };

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

export default function TermsPage() {
  return (
    <InfoPageLayout title="Terms & Conditions" subtitle="Please read these terms carefully before using Nexletronics. By placing an order, you agree to these terms." icon="📋" breadcrumb="Terms & Conditions" lastUpdated="April 2026">

      <Section title="1. Acceptance of Terms">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          By accessing and using the Nexletronics website and placing orders, you accept and agree to be bound by these Terms & Conditions. If you do not agree, please do not use our platform.
        </p>
      </Section>

      <Section title="2. Product Information">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          We strive to provide accurate product descriptions, images, and specifications. However, slight variations may exist. All product images are for representation purposes. If you find any inaccuracy, please contact us and we will correct it promptly.
        </p>
      </Section>

      <Section title="3. Pricing & Payments">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 12 }}>
          All prices are in Indian Rupees (₹) and inclusive of applicable taxes. We reserve the right to change prices without prior notice; however, orders already placed will be honoured at the original price.
        </p>
        {['Accepted: UPI, Credit/Debit Cards, Net Banking, Wallets', 'Cash on Delivery (COD) available for orders up to ₹5,000', 'Payment must be completed to confirm an order (except COD)', 'Failed payments may result in automatic order cancellation'].map(item => (
          <div key={item} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 14, color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--accent-cyan)' }}>›</span> {item}
          </div>
        ))}
      </Section>

      <Section title="4. Order Cancellation">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          You may cancel your order any time before it is dispatched for shipping. Once the order is shipped, cancellation is not possible — please refer to our Return Policy. To cancel, visit your Orders page or contact us directly.
        </p>
      </Section>

      <Section title="5. Intellectual Property">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          All content on the Nexletronics website, including text, images, logos, and design, is the intellectual property of Nexletronics and may not be reproduced without prior written permission.
        </p>
      </Section>

      <Section title="6. Limitation of Liability">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          Nexletronics shall not be liable for any indirect, incidental, or consequential damages arising from the use or inability to use our products. Our liability is limited to the total value of the order in question.
        </p>
      </Section>

      <Section title="7. Governing Law">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Tamil Nadu, India.
        </p>
      </Section>

      <Section title="8. Contact Us">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          For questions about these terms, email <a href="mailto:support@nexletronics.in" style={{ color: 'var(--accent-cyan)' }}>support@nexletronics.in</a>.
        </p>
      </Section>
    </InfoPageLayout>
  );
}
