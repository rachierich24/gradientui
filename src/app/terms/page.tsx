import { LNav, LFooter } from "@/components/landing/sections"

export const metadata = {
  title: 'Terms of Service — Gradient 365',
  description: 'Terms of Service for Gradient 365, India\'s B2B cafe supply chain marketplace.',
}

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: 'By accessing or using the Gradient 365 platform ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access or use the Service. These terms apply to all users of the platform, including cafes, suppliers, and brand partners.',
  },
  {
    title: '2. Description of Service',
    body: 'Gradient 365 operates a three-sided B2B marketplace that connects cafes, suppliers, and FMCG brands for the purpose of supply chain management, digital ordering, price negotiation, trial management, and consumption analytics. We do not take title to any goods transacted on the platform.',
  },
  {
    title: '3. User Obligations',
    body: 'You agree to (a) provide accurate and complete registration information; (b) maintain the security of your account credentials; (c) notify us immediately of any unauthorized use of your account; (d) use the platform only for lawful business purposes; and (e) not attempt to reverse-engineer, scrape, or otherwise misuse the platform. You are responsible for all activity conducted under your account.',
  },
  {
    title: '4. Intellectual Property',
    body: 'All content, features, and functionality of the Gradient 365 platform — including but not limited to software, text, graphics, logos, icons, and design — are the exclusive property of Gradient 365 and are protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written consent.',
  },
  {
    title: '5. Limitation of Liability',
    body: 'To the maximum extent permitted by applicable law, Gradient 365 shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the Service. Our aggregate liability in connection with any claim arising out of or related to these terms shall not exceed the amount you paid to Gradient 365 in the twelve months preceding the event giving rise to the claim.',
  },
  {
    title: '6. Governing Law',
    body: 'These Terms of Service are governed by and construed in accordance with the laws of India. Any disputes arising under or related to these terms shall be subject to the exclusive jurisdiction of the courts of Bengaluru, Karnataka, India. The United Nations Convention on Contracts for the International Sale of Goods does not apply.',
  },
  {
    title: '7. Changes to Terms',
    body: 'We reserve the right to modify these Terms of Service at any time. We will provide notice of material changes by updating the "Last updated" date at the top of this page and, where appropriate, sending an email to registered users. Your continued use of the Service following the posting of changes constitutes your acceptance of the revised terms.',
  },
]

export default function TermsPage() {
  return (
    <>
      <LNav />
      <main>
        {/* Page hero */}
        <section style={{ backgroundColor: '#fafbfc', borderBottom: '1px solid #e6ebf1', paddingBlock: '64px' }}>
          <div className="container" style={{ maxWidth: '760px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--portal-primary)', marginBottom: '12px' }}>
              Legal
            </p>
            <h1 style={{ fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 300, letterSpacing: '-0.02em', color: '#061b31', marginBottom: '16px' }}>
              Terms of Service
            </h1>
            <p style={{ fontSize: '15px', color: '#425466' }}>Last updated: April 2025</p>
          </div>
        </section>

        {/* Content */}
        <section style={{ paddingBlock: '64px' }}>
          <div className="container" style={{ maxWidth: '760px' }}>
            <p style={{ fontSize: '16px', color: '#425466', lineHeight: 1.75, marginBottom: '48px' }}>
              Please read these Terms of Service carefully before using the Gradient 365 platform. These terms constitute a legally binding agreement between you and Gradient 365 Technologies Pvt. Ltd.
            </p>
            {sections.map((s) => (
              <div key={s.title} style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#061b31', marginBottom: '12px' }}>{s.title}</h2>
                <p style={{ fontSize: '16px', color: '#425466', lineHeight: 1.75 }}>{s.body}</p>
              </div>
            ))}
            <div style={{ marginTop: '48px', padding: '24px', background: '#faf5ff', border: '1.5px solid #e9d5ff', borderRadius: '12px' }}>
              <p style={{ fontSize: '14px', color: '#425466', lineHeight: 1.65 }}>
                <strong style={{ color: '#061b31' }}>Questions about these terms?</strong>{' '}
                Contact us at <a href="mailto:legal@gradient365.com" style={{ color: 'var(--portal-primary)', textDecoration: 'none' }}>legal@gradient365.com</a> or visit our{' '}
                <a href="/contact" style={{ color: 'var(--portal-primary)', textDecoration: 'none' }}>Contact page</a>.
              </p>
            </div>
          </div>
        </section>
      </main>
      <LFooter />
    </>
  )
}
