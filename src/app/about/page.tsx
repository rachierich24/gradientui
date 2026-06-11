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

const principles = [
  {
    title: 'Builder mentality',
    desc: "We ship, then learn from cafés and suppliers in the field. No feature survives first contact with reality unchanged. We'd rather rewrite something twice than design it once in a vacuum.",
  },
  {
    title: 'Trust by default',
    desc: 'Every transaction is structured and traceable. We replace verbal price agreements with digital records the buyer and seller can both audit. The platform earns trust by being legible to everyone on it.',
  },
  {
    title: 'India-first',
    desc: 'We build for cash-heavy, relationship-driven, deeply regional supply chains. No copy-paste from Silicon Valley playbooks. The product is what it is because the constraints are what they are.',
  },
]

const facts = [
  { k: 'Founded', v: '2026' },
  { k: 'Headquarters', v: 'Delhi, India' },
  { k: 'Parent', v: 'Unified Nexgrade Private Limited' },
  { k: 'Status', v: 'Live, single tenant' },
]

const founders = [
  {
    name: 'Sumit',
    role: 'Co-founder · CEO',
    bio: 'Drives strategy, partnerships, and growth. Previously co-ran The Raydee Cafe, Gradient’s first tenant and the reason the product is shaped the way it is. DTU alumnus.',
  },
  {
    name: 'Sahil',
    role: 'Co-founder · Engineering',
    bio: 'Builds the platform end-to-end: backend, three portals, and the supplier privacy walls. Previously on logistics infrastructure at Jumbotail. DTU alumnus.',
  },
]

const mono = 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)'

export default function AboutPage() {
  return (
    <>
      <LNav />
      <main>
        {/* Hero */}
        <section style={{ paddingTop: '160px', paddingBottom: '48px' }}>
          <div className="container" style={{ maxWidth: '960px', marginInline: 'auto' }}>
            <motion.p
              initial="hidden" animate="visible" variants={fadeUp}
              style={{ fontFamily: mono, fontSize: '11px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9AA0A6', marginBottom: '24px' }}
            >
              About · est. 2026
            </motion.p>
            <motion.h1
              initial="hidden" animate="visible"
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] } } }}
              style={{ fontSize: 'clamp(36px, 5.2vw, 72px)', fontWeight: 400, letterSpacing: '-0.035em', color: '#0A0A0B', lineHeight: 0.98, marginBottom: '28px', textWrap: 'balance' }}
            >
              The supply chain runs<br />on WhatsApp.<br />We&apos;re fixing that.
            </motion.h1>
            <motion.p
              initial="hidden" animate="visible"
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.16, ease: [0.22, 1, 0.36, 1] } } }}
              style={{ fontSize: '18px', color: '#5B6471', lineHeight: 1.55, maxWidth: '56ch', textWrap: 'pretty' }}
            >
              Gradient 365 is the operating system for India&apos;s café supply chain. Built by Unified Nexgrade, a product studio in Delhi making infrastructure for the food economy.
            </motion.p>
          </div>
        </section>

        {/* Mission long-form */}
        <section style={{ paddingTop: '64px', paddingBottom: '80px', borderTop: '1px solid rgba(10,10,11,0.08)' }}>
          <div className="container" style={{ maxWidth: '960px', marginInline: 'auto' }}>
            <div className="g2" style={{ display: 'grid', gridTemplateColumns: '160px 1fr', columnGap: '40px', alignItems: 'baseline' }}>
              <p style={{ fontFamily: mono, fontSize: '11px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9AA0A6' }}>
                Mission
              </p>
              <div>
                <h2 style={{ fontSize: 'clamp(24px, 2.6vw, 36px)', fontWeight: 400, letterSpacing: '-0.025em', color: '#0A0A0B', lineHeight: 1.15, marginBottom: '28px', maxWidth: '22ch', textWrap: 'balance' }}>
                  Replace chaos with clarity for every café in India.
                </h2>
                <p style={{ fontSize: '17px', color: '#3A434E', lineHeight: 1.7, marginBottom: '18px', maxWidth: '62ch', textWrap: 'pretty' }}>
                  The average Indian café owner manages procurement across a dozen WhatsApp groups, juggles verbal price agreements, and has zero visibility into actual consumption. The supplier on the other side of those conversations has the same problem in reverse.
                </p>
                <p style={{ fontSize: '17px', color: '#3A434E', lineHeight: 1.7, maxWidth: '62ch', textWrap: 'pretty' }}>
                  Gradient gives every side of the supply chain (cafés, suppliers, and the FMCG brands behind them) the same structured tools, with privacy walls that let competitors coexist in one network without leaking data to each other.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Facts */}
        <section style={{ paddingTop: '64px', paddingBottom: '80px', borderTop: '1px solid rgba(10,10,11,0.08)' }}>
          <div className="container" style={{ maxWidth: '960px', marginInline: 'auto' }}>
            <div className="g2" style={{ display: 'grid', gridTemplateColumns: '160px 1fr', columnGap: '40px', alignItems: 'baseline' }}>
              <p style={{ fontFamily: mono, fontSize: '11px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9AA0A6' }}>
                The company
              </p>
              <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px 48px', margin: 0 }}>
                {facts.map((f) => (
                  <div key={f.k}>
                    <dt style={{ fontFamily: mono, fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9AA0A6', marginBottom: '6px' }}>{f.k}</dt>
                    <dd style={{ fontSize: '17px', fontWeight: 500, color: '#0A0A0B', margin: 0, letterSpacing: '-0.01em' }}>{f.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* Principles */}
        <section style={{ paddingTop: '64px', paddingBottom: '96px', borderTop: '1px solid rgba(10,10,11,0.08)' }}>
          <div className="container" style={{ maxWidth: '960px', marginInline: 'auto' }}>
            <div className="g2" style={{ display: 'grid', gridTemplateColumns: '160px 1fr', columnGap: '40px', alignItems: 'baseline', marginBottom: '32px' }}>
              <p style={{ fontFamily: mono, fontSize: '11px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9AA0A6' }}>
                Principles
              </p>
              <motion.h2
                initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} variants={fadeUp}
                style={{ fontSize: 'clamp(22px, 2.4vw, 32px)', fontWeight: 400, letterSpacing: '-0.025em', color: '#0A0A0B', maxWidth: '24ch', textWrap: 'balance' }}
              >
                How we make decisions when the answer isn&apos;t obvious.
              </motion.h2>
            </div>
            <ul
              style={{ listStyle: 'none', margin: '0 0 0 200px', padding: 0 }}
              className="principles-list"
            >
              {principles.map((p, i) => (
                <li
                  key={p.title}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '64px 1fr',
                    columnGap: '24px',
                    alignItems: 'start',
                    padding: '24px 0',
                    borderTop: '1px solid rgba(10,10,11,0.08)',
                    borderBottom: i === principles.length - 1 ? '1px solid rgba(10,10,11,0.08)' : 'none',
                  }}
                >
                  <span style={{ fontFamily: mono, fontSize: '13px', fontWeight: 500, color: '#9AA0A6', fontVariantNumeric: 'tabular-nums', paddingTop: '3px' }}>
                    0{i + 1}
                  </span>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0A0A0B', letterSpacing: '-0.01em', marginBottom: '6px' }}>{p.title}</h3>
                    <p style={{ fontSize: '14.5px', color: '#5B6471', lineHeight: 1.6, maxWidth: '58ch', textWrap: 'pretty' }}>{p.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Founders */}
        <section style={{ paddingTop: '64px', paddingBottom: '96px', borderTop: '1px solid rgba(10,10,11,0.08)' }}>
          <div className="container" style={{ maxWidth: '960px', marginInline: 'auto' }}>
            <div className="g2" style={{ display: 'grid', gridTemplateColumns: '160px 1fr', columnGap: '40px', alignItems: 'baseline', marginBottom: '32px' }}>
              <p style={{ fontFamily: mono, fontSize: '11px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9AA0A6' }}>
                Founders
              </p>
              <motion.h2
                initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} variants={fadeUp}
                style={{ fontSize: 'clamp(22px, 2.4vw, 32px)', fontWeight: 400, letterSpacing: '-0.025em', color: '#0A0A0B', maxWidth: '28ch', textWrap: 'balance' }}
              >
                One operator, one engineer. Both DTU. Both shipped this before.
              </motion.h2>
            </div>
            <div
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px 56px', marginLeft: '200px' }}
              className="founders-grid"
            >
              {founders.map((f) => (
                <div key={f.name} style={{ paddingTop: '24px', borderTop: '1px solid rgba(10,10,11,0.08)' }}>
                  <h3 style={{ fontSize: '22px', fontWeight: 500, color: '#0A0A0B', letterSpacing: '-0.015em', marginBottom: '4px' }}>{f.name}</h3>
                  <p style={{ fontFamily: mono, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9AA0A6', marginBottom: '16px' }}>{f.role}</p>
                  <p style={{ fontSize: '15px', color: '#3A434E', lineHeight: 1.65, textWrap: 'pretty' }}>{f.bio}</p>
                </div>
              ))}
            </div>
            <div style={{ marginLeft: '200px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(10,10,11,0.08)' }} className="founders-footnote">
              <p style={{ fontSize: '14.5px', color: '#5B6471', lineHeight: 1.6, maxWidth: '60ch' }}>
                Hiring engineering, ops, and design. Reach{' '}
                <a href="mailto:gradient365.team@gmail.com" style={{ color: '#0A0A0B', textDecoration: 'underline', textUnderlineOffset: '3px' }}>gradient365.team@gmail.com</a>.
              </p>
            </div>
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
                <a href="/contact" className="btn-l ghost">Contact</a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <LFooter />

      <style jsx>{`
        @media (max-width: 720px) {
          :global(.g2) { grid-template-columns: 1fr !important; row-gap: 10px; }
          :global(.principles-list),
          :global(.founders-grid),
          :global(.founders-footnote) { margin-left: 0 !important; }
        }
      `}</style>
    </>
  )
}
