'use client'

import { motion } from 'framer-motion'

const steps = [
  {
    step: '01', title: 'Suppliers list their catalogue',
    desc: 'Distributors and wholesalers build their product catalogue with pricing, MOQ, and stock levels. Cafes browse verified suppliers in their city.',
    color: '#0891B2', bg: '#f0fdfa', border: '#a7f3d0', emoji: '📦',
  },
  {
    step: '02', title: 'Cafes order, negotiate, and pay',
    desc: 'Place orders instantly or negotiate prices in encrypted order threads. Pre-schedule recurring orders. Track delivery status in real time.',
    color: '#EA580C', bg: '#fff7ed', border: '#fed7aa', emoji: '🛒',
  },
  {
    step: '03', title: 'Brands track consumption live',
    desc: 'FMCG brands see exactly which cafes are consuming their products, in what volumes, and at what frequency — updated in real time as orders are fulfilled.',
    color: '#7C3AED', bg: '#fdf4ff', border: '#f0abfc', emoji: '📊',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section" style={{ backgroundColor: 'var(--portal-surface)' }}>
      <div className="container">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, amount: 0.15 }}
          style={{ textAlign: 'center', marginBottom: '64px' }}
        >
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--portal-primary)', marginBottom: '12px' }}>
            How it works
          </p>
          <h2 style={{ fontSize: 'clamp(28px, 3.2vw, 46px)', fontWeight: 300, letterSpacing: '-0.02em', color: '#061b31', maxWidth: '560px', margin: '0 auto', lineHeight: 1.15 }}>
            Three sides. One seamless platform.
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true, amount: 0.15 }}
              whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.10)' }}
              style={{
                padding: '32px', borderRadius: '20px',
                background: s.bg, border: `1.5px solid ${s.border}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: s.color }}>{s.step}</span>
                <span style={{ fontSize: '32px' }}>{s.emoji}</span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#061b31', marginBottom: '12px', lineHeight: 1.3 }}>{s.title}</h3>
              <p style={{ fontSize: '15px', color: '#425466', lineHeight: 1.65 }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
