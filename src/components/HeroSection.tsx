'use client'

import { motion } from 'framer-motion'

// Marquee logos — Indian cafe/food brands
const brands = ['Blue Tokai', 'Starbucks', 'Third Wave', 'Chaayos', 'Barista', 'Tata Starbucks', 'Brewberrys', 'Café Delhi Heights', 'The Beer Café', 'Social', 'Pret A Manger', 'Costa Coffee', 'McCafé', 'Madras Coffee House']
const marqueeBrands = [...brands, ...brands]

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18, delayChildren: 0.1 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
}

export default function HeroSection() {
  return (
    <section style={{ position: 'relative', overflow: 'hidden', backgroundColor: '#ffffff', paddingTop: '80px' }}>
      {/* Purple WebGL-style gradient mesh (CSS fallback — no WebGL dep on main package) */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 70% 80% at 85% 40%, rgba(107,33,168,0.18) 0%, rgba(67,56,202,0.10) 50%, transparent 80%)',
      }} />
      <div style={{
        position: 'absolute', top: '10%', right: '-5%', width: '60%', height: '90%', zIndex: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 60% at 60% 40%, rgba(107,33,168,0.12) 0%, transparent 70%)',
        filter: 'blur(40px)',
      }} />

      {/* Main content */}
      <motion.div
        className="container"
        style={{ position: 'relative', zIndex: 10, paddingTop: '40px', paddingBottom: '80px' }}
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        {/* Pulse ticker */}
        <motion.p variants={fadeUp} style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#425466' }}>
          <span className="pulse-dot" />
          India&apos;s first three-sided B2B cafe marketplace — now in beta
        </motion.p>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          style={{ fontSize: 'clamp(36px, 4.5vw, 64px)', fontWeight: 300, lineHeight: 1.08, letterSpacing: '-0.02em', color: '#061b31', maxWidth: '680px', marginBottom: '24px' }}
        >
          The supply chain platform built for{' '}
          <span className="gradient-text">modern cafes.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          style={{ fontSize: '18px', color: '#425466', maxWidth: '520px', lineHeight: 1.65, marginBottom: '40px' }}
        >
          Gradient 365 connects cafes, suppliers, and brands in one seamless platform — replacing WhatsApp chaos with structured digital ordering, negotiation, and analytics.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={fadeUp} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '64px' }}>
          <a href="#portals" className="btn-primary" style={{ fontSize: '16px', padding: '14px 28px' }}>Start for free →</a>
          <a href="#how-it-works" className="btn-secondary" style={{ fontSize: '16px', padding: '14px 28px' }}>See how it works</a>
        </motion.div>

        {/* Portal gateway cards — 3 inline cards */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ maxWidth: '780px' }}>
          {[
            { role: 'Cafe', desc: 'Order from verified suppliers', color: '#EA580C', bg: '#fff7ed', border: '#fed7aa', emoji: '☕', href: 'http://localhost:5174', ariaLabel: 'Open Cafe Portal — Order from verified suppliers' },
            { role: 'Supplier', desc: 'Manage catalogue & fulfill orders', color: '#0891B2', bg: '#f0fdfa', border: '#a7f3d0', emoji: '🏭', href: 'http://localhost:5175', ariaLabel: 'Open Supplier Portal — Manage catalogue & fulfill orders' },
            { role: 'Brand', desc: 'Run trials & track consumption', color: '#7C3AED', bg: '#fdf4ff', border: '#f0abfc', emoji: '🏷️', href: 'http://localhost:5176', ariaLabel: 'Open Brand Portal — Run trials & track consumption' },
          ].map(card => (
            <motion.a
              key={card.role}
              href={card.href}
              aria-label={card.ariaLabel}
              whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              style={{
                display: 'block', textDecoration: 'none',
                padding: '20px', borderRadius: '14px',
                background: card.bg, border: `1.5px solid ${card.border}`,
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>{card.emoji}</div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: card.color, marginBottom: '4px' }}>{card.role} Portal</p>
              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>{card.desc}</p>
            </motion.a>
          ))}
        </motion.div>
      </motion.div>

      {/* Logo marquee */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        style={{ paddingBottom: '48px' }}
      >
        <p style={{ textAlign: 'center', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8898aa', marginBottom: '20px' }}>
          Trusted by teams across India
        </p>
        <div className="marquee-wrapper">
          <div className="marquee-track">
            {marqueeBrands.map((brand, i) => (
              <span key={`${brand}-${i}`} style={{ padding: '0 32px', fontSize: '15px', fontWeight: 500, color: '#64748b', whiteSpace: 'nowrap', opacity: 0.7 }}>
                {brand}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
