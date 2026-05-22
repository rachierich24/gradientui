'use client'

import { LNav, LFooter } from "@/components/landing/sections"
import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}

const features = [
  { emoji: '🛒', title: 'Digital Ordering', desc: 'Place structured orders with your suppliers instantly. Full order history, status tracking, and delivery confirmations — no more WhatsApp voice notes.', color: '#EA580C', bg: '#fff7ed', border: '#fed7aa', portal: 'Cafe & Supplier' },
  { emoji: '💬', title: 'In-app Negotiation', desc: 'Negotiate prices in encrypted order threads with a full audit trail. Agree on terms digitally before any goods change hands.', color: '#0891B2', bg: '#f0fdfa', border: '#a7f3d0', portal: 'Cafe & Supplier' },
  { emoji: '📊', title: 'Consumption Analytics', desc: 'FMCG brands see real-time data on which cafes are using their products, at what volumes, and in which cities — updated with every fulfilled order.', color: '#7C3AED', bg: '#fdf4ff', border: '#f0abfc', portal: 'Brand' },
  { emoji: '🔄', title: 'Pre-scheduled Orders', desc: 'Set up recurring orders for weekly or monthly deliveries. Suppliers get advance notice and can plan stock accordingly — reducing shortages and waste.', color: '#EA580C', bg: '#fff7ed', border: '#fed7aa', portal: 'Cafe & Supplier' },
  { emoji: '📦', title: 'Supplier Catalogue', desc: 'Suppliers build a verified product catalogue with pricing, MOQ, lead times, and stock levels. Cafes browse and filter by city, category, and rating.', color: '#0891B2', bg: '#f0fdfa', border: '#a7f3d0', portal: 'Supplier' },
  { emoji: '🏷️', title: 'Brand Trial Management', desc: 'Brands run structured product trials — identify target cafes, distribute samples, collect feedback, and track adoption — all in one workflow.', color: '#7C3AED', bg: '#fdf4ff', border: '#f0abfc', portal: 'Brand' },
  { emoji: '💳', title: 'Digital Billing', desc: 'View invoices, outstanding amounts, and payment history in one place. Generate GST-compliant receipts and track credit limits with your suppliers.', color: '#EA580C', bg: '#fff7ed', border: '#fed7aa', portal: 'Cafe' },
  { emoji: '🚨', title: 'Urgent Sourcing', desc: 'Need stock fast? Post urgent sourcing requests and get responses from verified suppliers in your city within hours — not days.', color: '#0891B2', bg: '#f0fdfa', border: '#a7f3d0', portal: 'Cafe' },
  { emoji: '📈', title: 'Demand Intelligence', desc: 'Suppliers get aggregated insights into product demand trends across their cafe network — helping them stock the right products at the right time.', color: '#7C3AED', bg: '#fdf4ff', border: '#f0abfc', portal: 'Supplier' },
]

export default function FeaturesPage() {
  return (
    <>
      <LNav />
      <main>
        {/* Hero */}
        <section style={{ backgroundColor: '#fafbfc', borderBottom: '1px solid #e6ebf1', paddingBlock: '80px', textAlign: 'center' }}>
          <div className="container" style={{ maxWidth: '680px' }}>
            <motion.p
              initial="hidden" animate="visible" variants={fadeUp}
              style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--portal-primary)', marginBottom: '12px' }}
            >
              Platform features
            </motion.p>
            <motion.h1
              initial="hidden" animate="visible"
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] } } }}
              style={{ fontSize: 'clamp(30px, 4vw, 54px)', fontWeight: 300, letterSpacing: '-0.02em', color: '#061b31', lineHeight: 1.1, marginBottom: '20px' }}
            >
              Everything your cafe supply chain needs
            </motion.h1>
            <motion.p
              initial="hidden" animate="visible"
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] } } }}
              style={{ fontSize: '17px', color: '#425466', lineHeight: 1.65 }}
            >
              Gradient 365 ships tools built specifically for each side of the supply chain — not generic software awkwardly retrofitted.
            </motion.p>
          </div>
        </section>

        {/* Feature grid */}
        <section className="section">
          <div className="container">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }} variants={stagger}
            >
              {features.map(f => (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.10)' }}
                  style={{ padding: '32px', borderRadius: '20px', background: f.bg, border: `1.5px solid ${f.border}`, display: 'flex', flexDirection: 'column', gap: '12px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '32px' }}>{f.emoji}</span>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: f.color, background: f.color + '15', padding: '3px 8px', borderRadius: '99px', whiteSpace: 'nowrap' }}>
                      {f.portal}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#061b31', lineHeight: 1.3 }}>{f.title}</h3>
                  <p style={{ fontSize: '14px', color: '#425466', lineHeight: 1.65 }}>{f.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-sm" style={{ backgroundColor: 'var(--portal-surface)', textAlign: 'center', borderTop: '1px solid var(--portal-border)' }}>
          <div className="container" style={{ maxWidth: '480px' }}>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
              <h2 style={{ fontSize: 'clamp(22px, 2.5vw, 34px)', fontWeight: 300, color: '#061b31', marginBottom: '16px', letterSpacing: '-0.02em' }}>
                Ready to replace the chaos?
              </h2>
              <p style={{ fontSize: '16px', color: '#425466', lineHeight: 1.65, marginBottom: '28px' }}>
                Get started free. No credit card required.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a href="/login" className="btn-primary">Start for free →</a>
                <a href="/pricing" className="btn-secondary">See pricing</a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <LFooter />
    </>
  )
}
