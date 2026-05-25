'use client'

import { LNav, LFooter } from "@/components/landing/sections"
import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
}

const mono = 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)'

type Perk = { title: string; desc: string }
const perks: Perk[] = [
  {
    title: 'Remote-first, Delhi NCR base',
    desc: 'Work from anywhere in India. Our home base is Delhi NCR, where the founders sit. Most of the team is distributed.',
  },
  {
    title: 'Move fast',
    desc: 'No bureaucracy. Ship in days, not months. Your work hits real cafés, suppliers, and brands within the same week.',
  },
  {
    title: 'Direct to founders',
    desc: 'Two cofounders, one product, one chat. Decisions land same-day. No layers of approval, no committees.',
  },
]

type Role = {
  title: string
  dept: string
  location: string
  type: string
  desc: string
}
const roles: Role[] = [
  {
    title: 'Senior full-stack engineer',
    dept: 'Engineering',
    location: 'Remote / Delhi NCR',
    type: 'Full-time',
    desc: 'Own end-to-end features across the Next.js portals and Node.js backend. PostgreSQL and real-time systems experience preferred. You will ship the supplier-side privacy walls.',
  },
  {
    title: 'Product manager, café portal',
    dept: 'Product',
    location: 'Delhi NCR',
    type: 'Full-time',
    desc: 'Define the roadmap for the café-side product. You will spend half your week in the field with café owners, the other half translating what you heard into shipped features.',
  },
  {
    title: 'Business development, supplier partnerships',
    dept: 'Sales',
    location: 'Remote / Delhi NCR / Mumbai',
    type: 'Full-time',
    desc: 'Sign and onboard F&B distributors and wholesalers onto the supplier network. Strong existing network in Indian F&B supply chain required.',
  },
  {
    title: 'Brand partnerships manager',
    dept: 'Growth',
    location: 'Remote',
    type: 'Full-time',
    desc: 'Work with FMCG brands to structure trial campaigns and consumption-analytics partnerships. Existing brand relationships a plus.',
  },
]

export default function CareersPage() {
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
              Careers · {roles.length} open
            </motion.p>
            <motion.h1
              initial="hidden" animate="visible"
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] } } }}
              style={{ fontSize: 'clamp(36px, 5.2vw, 72px)', fontWeight: 400, letterSpacing: '-0.035em', color: '#0A0A0B', lineHeight: 0.98, marginBottom: '28px', textWrap: 'balance' }}
            >
              Build the operating system<br />for India&apos;s café supply chain.
            </motion.h1>
            <motion.p
              initial="hidden" animate="visible"
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.16, ease: [0.22, 1, 0.36, 1] } } }}
              style={{ fontSize: '18px', color: '#5B6471', lineHeight: 1.55, maxWidth: '56ch', textWrap: 'pretty' }}
            >
              Small team, big problem. If you want your work to ship and matter the same week, you&apos;re in the right place.
            </motion.p>
          </div>
        </section>

        {/* How we work */}
        <section style={{ paddingTop: '64px', paddingBottom: '96px', borderTop: '1px solid rgba(10,10,11,0.08)' }}>
          <div className="container" style={{ maxWidth: '960px', marginInline: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', columnGap: '40px', alignItems: 'baseline', marginBottom: '32px' }}>
              <p style={{ fontFamily: mono, fontSize: '11px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9AA0A6' }}>
                How we work
              </p>
              <h2 style={{ fontSize: 'clamp(22px, 2.4vw, 32px)', fontWeight: 400, letterSpacing: '-0.025em', color: '#0A0A0B', maxWidth: '28ch', textWrap: 'balance' }}>
                Two cofounders, distributed team, zero theatre.
              </h2>
            </div>
            <ul style={{ listStyle: 'none', margin: '0 0 0 200px', padding: 0 }} className="perks-list">
              {perks.map((p, i) => (
                <li
                  key={p.title}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '64px 1fr',
                    columnGap: '24px',
                    alignItems: 'start',
                    padding: '24px 0',
                    borderTop: '1px solid rgba(10,10,11,0.08)',
                    borderBottom: i === perks.length - 1 ? '1px solid rgba(10,10,11,0.08)' : 'none',
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

        {/* Open roles */}
        <section style={{ paddingTop: '64px', paddingBottom: '96px', borderTop: '1px solid rgba(10,10,11,0.08)' }}>
          <div className="container" style={{ maxWidth: '960px', marginInline: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', columnGap: '40px', alignItems: 'baseline', marginBottom: '32px' }}>
              <p style={{ fontFamily: mono, fontSize: '11px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9AA0A6' }}>
                Open roles
              </p>
              <h2 style={{ fontSize: 'clamp(22px, 2.4vw, 32px)', fontWeight: 400, letterSpacing: '-0.025em', color: '#0A0A0B', maxWidth: '28ch', textWrap: 'balance' }}>
                We&apos;re hiring across engineering, product, sales, and growth.
              </h2>
            </div>
            <ul style={{ listStyle: 'none', margin: '0 0 0 200px', padding: 0 }} className="roles-list">
              {roles.map((role, i) => (
                <li
                  key={role.title}
                  className="role-row"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '64px 1fr 120px',
                    columnGap: '24px',
                    alignItems: 'start',
                    padding: '28px 0',
                    borderTop: '1px solid rgba(10,10,11,0.08)',
                    borderBottom: i === roles.length - 1 ? '1px solid rgba(10,10,11,0.08)' : 'none',
                  }}
                >
                  <span style={{ fontFamily: mono, fontSize: '13px', fontWeight: 500, color: '#9AA0A6', fontVariantNumeric: 'tabular-nums', paddingTop: '4px' }}>
                    0{i + 1}
                  </span>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 500, color: '#0A0A0B', letterSpacing: '-0.015em', marginBottom: '8px', lineHeight: 1.25 }}>{role.title}</h3>
                    <p style={{ fontFamily: mono, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9AA0A6', marginBottom: '12px' }}>
                      {role.dept} · {role.location} · {role.type}
                    </p>
                    <p style={{ fontSize: '14.5px', color: '#5B6471', lineHeight: 1.6, maxWidth: '60ch', textWrap: 'pretty' }}>{role.desc}</p>
                  </div>
                  <div style={{ paddingTop: '4px', textAlign: 'right' }}>
                    <a
                      href="/contact"
                      style={{
                        display: 'inline-block',
                        fontFamily: mono,
                        fontSize: '12px',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        color: '#0A0A0B',
                        textDecoration: 'none',
                        padding: '8px 14px',
                        border: '1px solid rgba(10,10,11,0.2)',
                        borderRadius: '999px',
                        transition: 'background 180ms ease, color 180ms ease, border-color 180ms ease',
                      }}
                      className="apply-btn"
                    >
                      Apply ↗
                    </a>
                  </div>
                </li>
              ))}
            </ul>

            <div style={{ marginLeft: '200px', marginTop: '32px' }} className="open-pitch">
              <p style={{ fontSize: '14.5px', color: '#5B6471', lineHeight: 1.6, maxWidth: '60ch' }}>
                Don&apos;t see a role that fits?{' '}
                <a href="/contact" style={{ color: '#0A0A0B', textDecoration: 'underline', textUnderlineOffset: '3px' }}>Send us a note</a>{' '}
                anyway. We&apos;re always reading.
              </p>
            </div>
          </div>
        </section>
      </main>
      <LFooter />

      <style jsx>{`
        :global(.apply-btn:hover) {
          background: #0A0A0B;
          color: #fff;
          border-color: #0A0A0B;
        }
        :global(.role-row) { transition: background 200ms ease; }
        :global(.role-row:hover) { background: rgba(10,10,11,0.02); }
        @media (max-width: 720px) {
          :global(.perks-list),
          :global(.roles-list),
          :global(.open-pitch) { margin-left: 0 !important; }
          :global(.role-row) { grid-template-columns: 48px 1fr !important; }
          :global(.role-row > div:last-child) { grid-column: 2; text-align: left !important; padding-top: 16px !important; }
        }
      `}</style>
    </>
  )
}
