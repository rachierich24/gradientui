'use client'

import { LNav, LFooter } from "@/components/landing/sections"
import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
}

type Item = { title: string; desc: string; shared?: string }
type Group = { audience: string; accent: string; surface: string; lead: string; items: Item[] }

const groups: Group[] = [
  {
    audience: 'For cafés',
    accent: '#EA580C',
    surface: '#FBEFE6',
    lead: 'Daily ordering, billing, and sourcing for café owners who buy from three to five suppliers every morning.',
    items: [
      { title: 'Digital ordering', desc: 'Structured orders sent to suppliers in seconds. Full history, live status, and delivery confirmations replace WhatsApp voice notes.', shared: 'Supplier' },
      { title: 'In-app negotiation', desc: 'Negotiate price in an encrypted thread tied to each order. Full audit trail before any goods change hands.', shared: 'Supplier' },
      { title: 'Pre-scheduled orders', desc: 'Set weekly or monthly recurring orders. Suppliers get advance notice and plan stock accordingly.', shared: 'Supplier' },
      { title: 'Digital billing', desc: 'Invoices, outstanding amounts, and payment history in one place. GST-compliant receipts and credit-limit tracking per supplier.' },
      { title: 'Urgent sourcing', desc: 'Broadcast a stock request across every verified supplier in your city. Responses arrive in hours, not days.' },
    ],
  },
  {
    audience: 'For suppliers',
    accent: '#0891B2',
    surface: '#E6F3F4',
    lead: 'Fulfilment, catalogue, and demand insight for city distributors carrying multi-brand inventory.',
    items: [
      { title: 'Supplier catalogue', desc: 'Verified product catalogue with pricing, MOQ, lead times, and live stock. Cafés filter by city, category, and rating.' },
      { title: 'Demand intelligence', desc: 'Aggregated demand trends across your café network. Stock the right products at the right time, by neighbourhood.' },
    ],
  },
  {
    audience: 'For brands',
    accent: '#7C3AED',
    surface: '#EFE9F7',
    lead: 'Consumption and trial workflows for FMCG brands measuring real B2B reach through the supplier network.',
    items: [
      { title: 'Consumption analytics', desc: 'Real-time data on which cafés use your products, at what volumes, in which cities. Updated with every fulfilled order.' },
      { title: 'Brand trial management', desc: 'Run structured product trials: target cafés, distribute samples, collect feedback, track adoption — one workflow.' },
    ],
  },
]

export default function FeaturesPage() {
  let counter = 0
  return (
    <>
      <LNav />
      <main>
        {/* Hero */}
        <section style={{ paddingTop: '160px', paddingBottom: '40px' }}>
          <div className="container" style={{ maxWidth: '960px', marginInline: 'auto' }}>
            <motion.p
              initial="hidden" animate="visible" variants={fadeUp}
              style={{ fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9AA0A6', marginBottom: '24px' }}
            >
              Platform · 09 modules
            </motion.p>
            <motion.h1
              initial="hidden" animate="visible"
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] } } }}
              style={{ fontSize: 'clamp(36px, 5.2vw, 72px)', fontWeight: 400, letterSpacing: '-0.035em', color: '#0A0A0B', lineHeight: 0.98, marginBottom: '28px', textWrap: 'balance' }}
            >
              Built for three sides<br />of the supply chain.
            </motion.h1>
            <motion.p
              initial="hidden" animate="visible"
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.16, ease: [0.22, 1, 0.36, 1] } } }}
              style={{ fontSize: '18px', color: '#5B6471', lineHeight: 1.55, maxWidth: '52ch', textWrap: 'pretty' }}
            >
              Each portal ships only the tools its user needs. Cafés, suppliers, and brands work in the same network without seeing each other&apos;s data.
            </motion.p>
          </div>
        </section>

        {/* Editorial groups */}
        <section style={{ paddingTop: '40px', paddingBottom: '120px' }}>
          <div className="container" style={{ maxWidth: '960px', marginInline: 'auto' }}>
            {groups.map((g, gi) => (
              <section
                key={g.audience}
                style={{ marginTop: gi === 0 ? 0 : '88px' }}
              >
                {/* Group header */}
                <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr', columnGap: '24px', alignItems: 'baseline', marginBottom: '32px' }}>
                  <div aria-hidden style={{ height: '1px', background: g.accent, alignSelf: 'center', marginTop: '6px' }} />
                  <div>
                    <p style={{ fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: g.accent, marginBottom: '12px' }}>
                      {g.audience}
                    </p>
                    <p style={{ fontSize: '20px', color: '#1F2A37', lineHeight: 1.5, maxWidth: '56ch', textWrap: 'pretty' }}>{g.lead}</p>
                  </div>
                </div>

                {/* Items */}
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {g.items.map((it) => {
                    counter += 1
                    const num = String(counter).padStart(2, '0')
                    return (
                      <li
                        key={it.title}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '64px 1fr 140px',
                          columnGap: '24px',
                          alignItems: 'start',
                          padding: '24px 0',
                          borderTop: '1px solid rgba(10,10,11,0.08)',
                        }}
                        className="feat-row"
                      >
                        <span style={{ fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)', fontSize: '13px', fontWeight: 500, color: '#9AA0A6', letterSpacing: '0.02em', fontVariantNumeric: 'tabular-nums', paddingTop: '3px' }}>
                          {num}
                        </span>
                        <div>
                          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0A0A0B', letterSpacing: '-0.01em', marginBottom: '6px', lineHeight: 1.3 }}>{it.title}</h3>
                          <p style={{ fontSize: '14.5px', color: '#5B6471', lineHeight: 1.6, maxWidth: '58ch', textWrap: 'pretty' }}>{it.desc}</p>
                        </div>
                        <div style={{ paddingTop: '4px', textAlign: 'right' }}>
                          {it.shared && (
                            <span style={{ fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)', fontSize: '10.5px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9AA0A6' }}>
                              ↔ {it.shared}
                            </span>
                          )}
                        </div>
                      </li>
                    )
                  })}
                  {/* Bottom rule */}
                  <li aria-hidden style={{ borderTop: '1px solid rgba(10,10,11,0.08)', height: 0, padding: 0, margin: 0 }} />
                </ul>
              </section>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ paddingTop: '64px', paddingBottom: '96px', borderTop: '1px solid rgba(10,10,11,0.08)' }}>
          <div className="container" style={{ maxWidth: '720px', marginInline: 'auto', textAlign: 'center' }}>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
              <h2 style={{ fontSize: 'clamp(26px, 3.2vw, 42px)', fontWeight: 400, color: '#0A0A0B', marginBottom: '14px', letterSpacing: '-0.025em', textWrap: 'balance' }}>
                Replace the chaos.
              </h2>
              <p style={{ fontSize: '16px', color: '#5B6471', lineHeight: 1.6, marginBottom: '28px' }}>
                Free to start. No credit card.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a href="/login" className="btn-l dark">Start free</a>
                <a href="/pricing" className="btn-l ghost">Contact sales</a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <LFooter />

      <style jsx>{`
        :global(.feat-row) { transition: background 200ms ease, padding-left 200ms ease; }
        :global(.feat-row:hover) { background: rgba(10,10,11,0.025); padding-left: 12px; }
        @media (max-width: 720px) {
          :global(.feat-row) { grid-template-columns: 32px 1fr !important; }
          :global(.feat-row > div:last-child) { grid-column: 2; text-align: left !important; padding-top: 8px !important; }
        }
      `}</style>
    </>
  )
}
