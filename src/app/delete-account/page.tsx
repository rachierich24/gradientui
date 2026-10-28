import { LNav, LFooter } from "@/components/landing/sections"

export const metadata = {
  title: 'Delete your account',
  description: 'How to delete your Gradient account and what happens to your data.',
  alternates: { canonical: '/delete-account' },
}

const steps = [
  'Open the Gradient app and sign in.',
  'Go to Profile and tap Delete account.',
  'Read the confirmation and tap Delete account again. This cannot be undone.',
]

const erased = ['Your cafe name and contact details', 'Your saved delivery addresses', 'Your product reviews', 'Your sign-in sessions on every device']

const kept = [
  'Orders you have already placed stay with the suppliers who fulfilled them, as their business records.',
  'Transaction and invoice records are retained for up to 7 years to meet tax and GST obligations under Indian law.',
]

const h2 = { fontSize: '20px', fontWeight: 700, color: '#061b31', marginBottom: '12px' } as const
const p = { fontSize: '16px', color: '#425466', lineHeight: 1.75 } as const

export default function DeleteAccountPage() {
  return (
    <>
      <LNav />
      <main>
        <section style={{ paddingTop: '140px', paddingBottom: '48px' }}>
          <div className="container" style={{ maxWidth: '760px', marginInline: 'auto' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--portal-primary)', marginBottom: '12px' }}>
              Account
            </p>
            <h1 style={{ fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 300, letterSpacing: '-0.02em', color: '#061b31', marginBottom: '16px' }}>
              Delete your Gradient account
            </h1>
            <p style={{ fontSize: '15px', color: '#425466' }}>For the Gradient app by Unified Nexgrade Private Limited</p>
          </div>
        </section>

        <section style={{ paddingTop: '0', paddingBottom: '96px' }}>
          <div className="container" style={{ maxWidth: '760px', marginInline: 'auto' }}>
            <div style={{ marginBottom: '40px' }}>
              <h2 style={h2}>Delete it in the app</h2>
              <ol style={{ ...p, paddingLeft: '20px' }}>
                {steps.map((s) => <li key={s}>{s}</li>)}
              </ol>
            </div>
            <div style={{ marginBottom: '40px' }}>
              <h2 style={h2}>Can&apos;t open the app?</h2>
              <p style={p}>
                Email <a href="mailto:hello@unifiednexgrade.com?subject=Delete%20my%20Gradient%20account" style={{ color: 'var(--portal-primary)', textDecoration: 'none' }}>hello@unifiednexgrade.com</a> from
                the address on your account, or tell us the phone number you signed in with. We will confirm it is you and delete the account within 30 days.
              </p>
            </div>
            <div style={{ marginBottom: '40px' }}>
              <h2 style={h2}>What is deleted</h2>
              <ul style={{ ...p, paddingLeft: '20px' }}>{erased.map((s) => <li key={s}>{s}</li>)}</ul>
            </div>
            <div style={{ marginBottom: '40px' }}>
              <h2 style={h2}>What is kept, and why</h2>
              <ul style={{ ...p, paddingLeft: '20px' }}>{kept.map((s) => <li key={s}>{s}</li>)}</ul>
            </div>
            <p style={p}>
              See our <a href="/privacy" style={{ color: 'var(--portal-primary)', textDecoration: 'none' }}>Privacy Policy</a> for everything we collect.
            </p>
          </div>
        </section>
      </main>
      <LFooter />
    </>
  )
}
