'use client'

import { LNav, LFooter } from '@/components/landing/sections'
import { Icon } from '@/components/landing/icons'
import { openContactSalesModal } from '@/components/ContactSalesModal'
import { motion, type Variants } from 'framer-motion'
import type { CSSProperties, ReactNode } from 'react'

const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } }
const rise: Variants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 0.61, 0.36, 1] } } }

type Perk = { title: string; desc: string; ic: ReactNode; c: string }
const perks: Perk[] = [
  { title: 'Remote-first, Delhi NCR base', desc: 'Work from anywhere in India. Our home base is Delhi NCR, where the founders sit. Most of the team is distributed.', ic: <Icon.Sparkle size={18} />, c: 'var(--c-orange)' },
  { title: 'Move fast', desc: 'No bureaucracy. Ship in days, not months. Your work hits real cafés, suppliers, and brands within the same week.', ic: <Icon.ArrowUp size={18} />, c: 'var(--c-blue)' },
  { title: 'Direct to founders', desc: 'Two cofounders, one product, one chat. Decisions land same-day. No layers of approval, no committees.', ic: <Icon.Users size={18} />, c: 'var(--c-purple)' },
]

type Role = { title: string; dept: string; location: string; type: string; desc: string }
const roles: Role[] = [
  { title: 'Senior full-stack engineer', dept: 'Engineering', location: 'Remote / Delhi NCR', type: 'Full-time', desc: 'Own end-to-end features across the Next.js portals and Spring Boot (Java) backend. PostgreSQL and real-time systems experience preferred. You will ship the supplier-side privacy walls.' },
  { title: 'Product manager, café portal', dept: 'Product', location: 'Delhi NCR', type: 'Full-time', desc: 'Define the roadmap for the café-side product. Half your week in the field with café owners, the other half translating what you heard into shipped features.' },
  { title: 'Business development, supplier partnerships', dept: 'Sales', location: 'Remote / Delhi NCR / Mumbai', type: 'Full-time', desc: 'Sign and onboard F&B distributors and wholesalers onto the supplier network. Strong existing network in Indian F&B supply chain required.' },
  { title: 'Brand partnerships manager', dept: 'Growth', location: 'Remote', type: 'Full-time', desc: 'Work with FMCG brands to structure trial campaigns and consumption-analytics partnerships. Existing brand relationships a plus.' },
]

const deptMeta: Record<string, { c: string; ic: ReactNode }> = {
  Engineering: { c: 'var(--c-blue)', ic: <Icon.Dashboard size={16} /> },
  Product: { c: 'var(--c-purple)', ic: <Icon.Sparkle size={16} /> },
  Sales: { c: 'var(--c-orange)', ic: <Icon.Truck size={16} /> },
  Growth: { c: 'var(--c-green)', ic: <Icon.Chart size={16} /> },
}

export default function CareersPage() {
  return (
    <div className="l-page">
      <LNav />
      <main>
        {/* Hero */}
        <section className="l-sec" style={{ paddingTop: 150, paddingBottom: 40 }}>
          <div className="l-wrap">
            <motion.div variants={container} initial="hidden" animate="show">
              <motion.div className="sec-eyebrow sec-eyebrow--plain" variants={rise}>Careers · {roles.length} open</motion.div>
              <motion.h1 className="sec-h" variants={rise} style={{ maxWidth: '18ch' }}>
                Build the operating system for India&apos;s <em>café supply</em> chain.
              </motion.h1>
              <motion.p className="sec-lead" variants={rise} style={{ marginTop: 20, maxWidth: '54ch' }}>
                Small team, big problem. If you want your work to ship and matter the same week, you&apos;re in the right place.
              </motion.p>
              <motion.div variants={rise} className="hero-ctas" style={{ marginTop: 28 }}>
                <a className="btn-l dark" href="#roles">See open roles <span><Icon.Arrow size={13} /></span></a>
                <a className="btn-l ghost" href="#roles" onClick={(e) => { e.preventDefault(); openContactSalesModal() }}>Send a note</a>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* How we work */}
        <section className="l-sec tight">
          <div className="l-wrap">
            <div className="sec-head-row">
              <div>
                <div className="sec-eyebrow sec-eyebrow--plain">How we work</div>
                <h2 className="sec-h">Two cofounders, distributed team, <em>zero</em> theatre.</h2>
              </div>
              <p className="sec-lead">The whole company fits in one chat. What you build this week is in front of real cafés and suppliers by the next.</p>
            </div>
            <motion.div className="cperks" variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-10%' }}>
              {perks.map((p) => (
                <motion.div className="cperk" key={p.title} variants={rise} style={{ '--pc': p.c } as CSSProperties}>
                  <span className="cperk-ic">{p.ic}</span>
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Open roles */}
        <section className="l-sec tight" id="roles">
          <div className="l-wrap">
            <div className="sec-head-row">
              <div>
                <div className="sec-eyebrow sec-eyebrow--plain">Open roles</div>
                <h2 className="sec-h">Hiring across engineering, product, <em>sales</em> &amp; growth.</h2>
              </div>
              <p className="sec-lead">Every role ships to production. No maker-vs-manager split, no roadmap you never touch.</p>
            </div>

            <motion.div className="croles" variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-8%' }}>
              {roles.map((role) => {
                const dm = deptMeta[role.dept]
                return (
                  <motion.a
                    key={role.title}
                    href="/contact"
                    className="crole"
                    variants={rise}
                    style={{ '--rc': dm.c } as CSSProperties}
                  >
                    <span className="crole-bar" />
                    <div className="crole-main">
                      <span className="crole-dept"><span className="crole-dept-ic">{dm.ic}</span>{role.dept}</span>
                      <h3>{role.title}</h3>
                      <div className="crole-meta">{role.location} · {role.type}</div>
                      <p>{role.desc}</p>
                    </div>
                    <span className="crole-apply">Apply <Icon.Arrow size={14} /></span>
                  </motion.a>
                )
              })}
            </motion.div>

            <div className="crole-pitch">
              <p>
                Don&apos;t see a role that fits?{' '}
                <a href="/contact">Send us a note</a> anyway. We&apos;re always reading.
              </p>
            </div>
          </div>
        </section>
      </main>
      <LFooter />

      <style jsx global>{`
        .cperks { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 44px; }
        .cperk {
          --pc: var(--c-orange);
          border-radius: 20px;
          background:
            radial-gradient(150% 90% at 100% 0%, color-mix(in oklch, var(--pc) 7%, transparent) 0%, transparent 58%),
            var(--surface);
          border: 1px solid color-mix(in oklch, var(--pc) 12%, var(--border-soft));
          box-shadow: 0 2px 4px -2px rgba(15,23,42,.06), 0 12px 26px -20px rgba(15,23,42,.22);
          padding: 24px 24px 26px;
        }
        .cperk-ic {
          width: 42px; height: 42px; border-radius: 12px;
          display: grid; place-items: center;
          color: var(--pc);
          background: color-mix(in oklch, var(--pc) 13%, transparent);
          border: 1px solid color-mix(in oklch, var(--pc) 18%, transparent);
        }
        .cperk h3 { margin: 18px 0 8px; font-size: 18px; font-weight: 700; letter-spacing: -.015em; color: var(--ink); }
        .cperk p { margin: 0; font-size: 13.5px; line-height: 1.55; color: var(--ink-soft); }

        .croles { display: flex; flex-direction: column; gap: 14px; margin-top: 44px; }
        .crole {
          --rc: var(--c-blue);
          position: relative;
          display: flex; align-items: center; gap: 20px;
          padding: 24px 26px 24px 30px;
          border-radius: 18px;
          background: var(--surface);
          border: 1px solid var(--border-soft);
          box-shadow: 0 1px 2px rgba(15,23,42,.03);
          text-decoration: none;
          overflow: hidden;
          transition: transform .28s cubic-bezier(.22,.61,.36,1), box-shadow .28s, border-color .28s;
        }
        .crole-bar { position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: var(--rc); opacity: .85; }
        .crole:hover {
          transform: translateY(-3px);
          border-color: color-mix(in oklch, var(--rc) 40%, transparent);
          box-shadow: 0 22px 48px -28px color-mix(in oklch, var(--rc) 55%, rgba(15,23,42,.4));
        }
        .crole-main { flex: 1; min-width: 0; }
        .crole-dept {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: var(--font-mono); font-size: 10.5px; font-weight: 700;
          letter-spacing: .08em; text-transform: uppercase;
          color: var(--rc);
          background: color-mix(in oklch, var(--rc) 12%, transparent);
          padding: 4px 10px 4px 7px; border-radius: 999px;
        }
        .crole-dept-ic { display: grid; place-items: center; }
        .crole h3 { margin: 12px 0 6px; font-size: 20px; font-weight: 700; letter-spacing: -.02em; color: var(--ink); line-height: 1.2; }
        .crole-meta { font-family: var(--font-mono); font-size: 11.5px; color: var(--ink-soft); margin-bottom: 10px; }
        .crole-main p { margin: 0; font-size: 14px; line-height: 1.55; color: var(--ink-soft); max-width: 68ch; }
        .crole-apply {
          flex-shrink: 0; align-self: flex-start; margin-top: 2px;
          display: inline-flex; align-items: center; gap: 6px;
          font-weight: 600; font-size: 13.5px; color: var(--rc);
          transition: gap .2s ease;
        }
        .crole:hover .crole-apply { gap: 10px; }

        .crole-pitch { margin-top: 26px; }
        .crole-pitch p { font-size: 14.5px; color: var(--ink-soft); line-height: 1.6; margin: 0; }
        .crole-pitch a { color: var(--brand); text-decoration: underline; text-underline-offset: 3px; font-weight: 600; }

        @media (max-width: 860px) {
          .cperks { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .crole { flex-direction: column; align-items: flex-start; gap: 14px; }
          .crole-apply { align-self: flex-start; }
        }
      `}</style>
    </div>
  )
}
