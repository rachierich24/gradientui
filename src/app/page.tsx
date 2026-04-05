export default function HomePage() {
  return (
    <main>
      <section style={{
        minHeight: '100vh',
        background: 'var(--portal-surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '24px',
        textAlign: 'center',
        padding: '24px',
      }}>
        <h1 style={{
          fontSize: 'clamp(48px, 8vw, 96px)',
          fontWeight: 300,
          letterSpacing: '-0.03em',
          color: '#061b31',
          lineHeight: 1.05,
          maxWidth: '900px',
        }}>
          The B2B platform built for<br />
          <span style={{ backgroundImage: 'var(--portal-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            modern cafes
          </span>
        </h1>
        <p style={{ fontSize: '20px', color: '#425466', maxWidth: '540px', lineHeight: 1.6 }}>
          Gradient 365 connects cafes, suppliers, and brands in one seamless platform.
        </p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <a href="/cafe" style={{ padding: '14px 28px', borderRadius: '8px', background: 'var(--portal-gradient)', color: '#fff', fontWeight: 600, textDecoration: 'none', fontSize: '16px' }}>
            Cafe Portal
          </a>
          <a href="/supplier" style={{ padding: '14px 28px', borderRadius: '8px', border: '2px solid var(--portal-border)', color: 'var(--portal-primary)', fontWeight: 600, textDecoration: 'none', fontSize: '16px' }}>
            Supplier Portal
          </a>
        </div>
      </section>
    </main>
  )
}
