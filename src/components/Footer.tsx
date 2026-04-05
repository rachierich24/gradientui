export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer style={{ background: '#061b31', color: '#8898aa', paddingBlock: '64px' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '48px', marginBottom: '48px' }}>
          {/* Brand col */}
          <div>
            <p style={{ fontSize: '20px', fontWeight: 800, backgroundImage: 'var(--portal-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '16px' }}>
              Gradient 365
            </p>
            <p style={{ fontSize: '14px', lineHeight: 1.65, color: '#8898aa', maxWidth: '280px' }}>
              The three-sided B2B marketplace connecting cafes, suppliers, and brands across India.
            </p>
          </div>
          {/* Portals */}
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#425466', marginBottom: '16px' }}>Portals</p>
            {['Cafe Portal', 'Supplier Portal', 'Brand Portal'].map(l => (
              <a key={l} href="#" style={{ display: 'block', fontSize: '14px', color: '#8898aa', textDecoration: 'none', marginBottom: '10px', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#8898aa')}>{l}</a>
            ))}
          </div>
          {/* Company */}
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#425466', marginBottom: '16px' }}>Company</p>
            {['About', 'Careers', 'Blog', 'Privacy'].map(l => (
              <a key={l} href="#" style={{ display: 'block', fontSize: '14px', color: '#8898aa', textDecoration: 'none', marginBottom: '10px', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#8898aa')}>{l}</a>
            ))}
          </div>
          {/* Legal */}
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#425466', marginBottom: '16px' }}>Legal</p>
            {['Terms of Service', 'Privacy Policy', 'Cookie Policy'].map(l => (
              <a key={l} href="#" style={{ display: 'block', fontSize: '14px', color: '#8898aa', textDecoration: 'none', marginBottom: '10px', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#8898aa')}>{l}</a>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid #1e3a5f', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '13px' }}>© {year} Gradient 365. All rights reserved.</p>
          <p style={{ fontSize: '13px' }}>Made for India 🇮🇳</p>
        </div>
      </div>
    </footer>
  )
}
