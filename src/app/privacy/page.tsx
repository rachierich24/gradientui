import { LNav, LFooter } from "@/components/landing/sections"

export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Gradient. Learn how we collect, use, and protect your data.',
  alternates: { canonical: '/privacy' },
}

const sections = [
  {
    title: '1. Data We Collect',
    body: 'We collect information you provide directly to us, such as your name, email address, business name, GST number, and contact details when you register. We also collect usage data including pages visited, features used, order history, and device information. Payment information is handled by our payment processors and is not stored on our servers.',
  },
  {
    title: '2. How We Use Your Data',
    body: 'We use the information we collect to: (a) create and manage your account; (b) process orders and facilitate transactions between buyers and sellers; (c) provide customer support; (d) send transactional notifications (order updates, payment confirmations); (e) improve and develop new platform features; (f) comply with legal obligations; and (g) prevent fraud and abuse.',
  },
  {
    title: '3. Data Sharing',
    body: 'We share your information with other parties on the platform as necessary to facilitate transactions for example, sharing your delivery address with a supplier when you place an order. We do not sell your personal data to third parties. We may share data with service providers who help us operate the platform (payment processors, cloud hosting, email services) under strict confidentiality agreements.',
  },
  {
    title: '4. Cookies',
    body: 'We use cookies and similar tracking technologies to maintain your session, remember your preferences, and understand how you use our platform. You can control cookie settings through your browser preferences. Disabling certain cookies may affect platform functionality. We use analytics cookies (e.g. Mixpanel, PostHog) to understand aggregate usage patterns these do not identify you personally.',
  },
  {
    title: '5. Data Retention',
    body: 'We retain your personal data for as long as your account is active or as needed to provide you services. After account deletion, we retain certain data for up to 7 years to comply with tax and legal obligations under Indian law. Transaction records are retained in accordance with GST requirements.',
  },
  {
    title: '6. Your Rights',
    body: 'Under the Digital Personal Data Protection Act (DPDP Act), you have the right to: (a) access the personal data we hold about you; (b) correct inaccurate data; (c) request erasure of your data (subject to legal obligations); (d) withdraw consent where processing is based on consent; and (e) nominate a person to exercise your rights in the event of death or incapacity. To exercise these rights, contact us at hello@unifiednexgrade.com.',
  },
  {
    title: '7. Contact',
    body: 'For any privacy-related questions or to exercise your rights, contact our Data Protection Officer at hello@unifiednexgrade.com. We will respond to all requests within 30 days. Our registered office is in Delhi, India.',
  },
]

export default function PrivacyPage() {
  return (
    <>
      <LNav />
      <main>
        {/* Page hero */}
        <section style={{ paddingTop: '140px', paddingBottom: '48px' }}>
          <div className="container" style={{ maxWidth: '760px', marginInline: 'auto' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--portal-primary)', marginBottom: '12px' }}>
              Legal
            </p>
            <h1 style={{ fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 300, letterSpacing: '-0.02em', color: '#061b31', marginBottom: '16px' }}>
              Privacy Policy
            </h1>
            <p style={{ fontSize: '15px', color: '#425466' }}>Last updated: May 2026</p>
          </div>
        </section>

        {/* Content */}
        <section style={{ paddingTop: '0', paddingBottom: '96px' }}>
          <div className="container" style={{ maxWidth: '760px', marginInline: 'auto' }}>
            <p style={{ fontSize: '16px', color: '#425466', lineHeight: 1.75, marginBottom: '40px' }}>
              This Privacy Policy describes how Unified Nexgrade Private Limited ("Gradient 365", "we", "us") collects, uses, and protects your personal data when you use our platform. We are committed to protecting your privacy and complying with the Digital Personal Data Protection Act (DPDP Act, 2023).
            </p>
            {sections.map((s) => (
              <div key={s.title} style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#061b31', marginBottom: '12px' }}>{s.title}</h2>
                <p style={{ fontSize: '16px', color: '#425466', lineHeight: 1.75 }}>{s.body}</p>
              </div>
            ))}
            <div style={{ marginTop: '48px', padding: '24px', background: '#faf5ff', border: '1.5px solid #e9d5ff', borderRadius: '12px' }}>
              <p style={{ fontSize: '14px', color: '#425466', lineHeight: 1.65 }}>
                <strong style={{ color: '#061b31' }}>Privacy questions?</strong>{' '}
                Email us at <a href="mailto:hello@unifiednexgrade.com" style={{ color: 'var(--portal-primary)', textDecoration: 'none' }}>hello@unifiednexgrade.com</a> or read our{' '}
                <a href="/terms" style={{ color: 'var(--portal-primary)', textDecoration: 'none' }}>Terms of Service</a>.
              </p>
            </div>
          </div>
        </section>
      </main>
      <LFooter />
    </>
  )
}
