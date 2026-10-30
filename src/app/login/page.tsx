import { LNav, LFooter } from '@/components/landing/sections'

const mono = '"JetBrains Mono", ui-monospace, monospace'

// Each portal is its own app with its own login; this page only routes people to the right one.
const portals = [
  { name: 'Café portal', desc: 'Order supplies, track deliveries and pay suppliers.', href: 'https://cafe.gradient365.com' },
  { name: 'Supplier portal', desc: 'Accept café orders, dispatch and get paid.', href: 'https://supplier.gradient365.com' },
  { name: 'Brand portal', desc: 'List your products and run trials with cafés.', href: 'https://brand.gradient365.com' },
]

export default function LoginPage() {
  return (
    <>
      <LNav />
      <main>
        <section style={{ paddingTop: '160px', paddingBottom: '96px' }}>
          <div className="container" style={{ maxWidth: '720px', marginInline: 'auto' }}>
            <p style={{ fontFamily: mono, fontSize: '11px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9AA0A6', marginBottom: '24px' }}>
              Log in
            </p>
            <h1 style={{ fontSize: 'clamp(32px, 4.4vw, 56px)', fontWeight: 400, letterSpacing: '-0.035em', color: '#0A0A0B', lineHeight: 1.02, marginBottom: '16px', textWrap: 'balance' }}>
              Which portal do you use?
            </h1>
            <p style={{ fontSize: '17px', color: '#5B6471', lineHeight: 1.55, marginBottom: '40px' }}>
              Pick your account type. You will sign in on the next screen.
            </p>
            <div style={{ display: 'grid', gap: '12px' }}>
              {portals.map((p) => (
                <a
                  key={p.name}
                  href={p.href}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '20px 24px', borderRadius: '16px', border: '1px solid rgba(10,10,11,0.08)', background: '#fff' }}
                >
                  <span>
                    <span style={{ display: 'block', fontSize: '17px', fontWeight: 600, color: '#0A0A0B', marginBottom: '4px' }}>{p.name}</span>
                    <span style={{ display: 'block', fontSize: '14px', color: '#5B6471' }}>{p.desc}</span>
                  </span>
                  <span className="btn-l dark" style={{ flexShrink: 0 }}>Log in</span>
                </a>
              ))}
            </div>
            <p style={{ fontSize: '14px', color: '#5B6471', marginTop: '32px' }}>
              New to Gradient? <a href="/contact" style={{ color: '#0A0A0B', textDecoration: 'underline' }}>Talk to us</a> and we will set up your account.
            </p>
          </div>
        </section>
      </main>
      <LFooter />
    </>
  )
}
