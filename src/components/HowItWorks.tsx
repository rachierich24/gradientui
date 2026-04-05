'use client'

import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'

function RevealCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.15 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(24px)',
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
    }}>
      {children}
    </div>
  )
}

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
        <RevealCard>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--portal-primary)', marginBottom: '12px' }}>
              How it works
            </p>
            <h2 style={{ fontSize: 'clamp(28px, 3.2vw, 46px)', fontWeight: 300, letterSpacing: '-0.02em', color: '#061b31', maxWidth: '560px', margin: '0 auto', lineHeight: 1.15 }}>
              Three sides. One seamless platform.
            </h2>
          </div>
        </RevealCard>

        {/* Steps */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {steps.map((s, i) => (
            <RevealCard key={s.step} delay={i * 120}>
              <motion.div
                whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.10)' }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  padding: '32px', borderRadius: '20px',
                  background: s.bg, border: `1.5px solid ${s.border}`,
                  height: '100%',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: s.color }}>{s.step}</span>
                  <span style={{ fontSize: '32px' }}>{s.emoji}</span>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#061b31', marginBottom: '12px', lineHeight: 1.3 }}>{s.title}</h3>
                <p style={{ fontSize: '15px', color: '#425466', lineHeight: 1.65 }}>{s.desc}</p>
              </motion.div>
            </RevealCard>
          ))}
        </div>
      </div>
    </section>
  )
}
