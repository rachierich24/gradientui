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

const perks = [
  { emoji: '🏠', title: 'Remote-first', desc: 'Work from anywhere in India. We have a home base in Bengaluru but our team is distributed.' },
  { emoji: '📈', title: 'Equity from day one', desc: 'Every full-time hire gets meaningful equity. We want you to own a piece of what we\'re building.' },
  { emoji: '⚡', title: 'Move fast', desc: 'No bureaucracy. Ship in days, not months. Your work directly impacts thousands of Indian cafe owners.' },
]

const roles = [
  {
    title: 'Senior Full-Stack Engineer',
    dept: 'Engineering',
    location: 'Remote / Bengaluru',
    type: 'Full-time',
    color: '#7C3AED',
    bg: '#fdf4ff',
    border: '#e9d5ff',
    desc: 'Own end-to-end features across our Next.js frontend and Node.js backend. Experience with PostgreSQL and real-time systems preferred.',
  },
  {
    title: 'Product Manager Cafe Portal',
    dept: 'Product',
    location: 'Bengaluru',
    type: 'Full-time',
    color: '#EA580C',
    bg: '#fff7ed',
    border: '#fed7aa',
    desc: 'Define the roadmap for our cafe-side product. You\'ll spend time in the field talking to cafe owners and translating insights into features.',
  },
  {
    title: 'Business Development Supplier Partnerships',
    dept: 'Sales',
    location: 'Remote / Mumbai / Bengaluru',
    type: 'Full-time',
    color: '#0891B2',
    bg: '#f0fdfa',
    border: '#a7f3d0',
    desc: 'Sign and onboard F&B distributors and wholesalers onto our supplier network. Strong network in Indian F&B supply chain preferred.',
  },
  {
    title: 'Brand Partnerships Manager',
    dept: 'Growth',
    location: 'Remote',
    type: 'Full-time',
    color: '#7C3AED',
    bg: '#fdf4ff',
    border: '#e9d5ff',
    desc: 'Work with FMCG brands to structure trial campaigns and consumption analytics partnerships on our platform.',
  },
]

export default function CareersPage() {
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
              Careers
            </motion.p>
            <motion.h1
              initial="hidden" animate="visible"
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] } } }}
              style={{ fontSize: 'clamp(30px, 4vw, 54px)', fontWeight: 300, letterSpacing: '-0.02em', color: '#061b31', lineHeight: 1.1, marginBottom: '20px' }}
            >
              Join the team building India&apos;s{' '}
              <span className="gradient-text">cafe supply chain.</span>
            </motion.h1>
            <motion.p
              initial="hidden" animate="visible"
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] } } }}
              style={{ fontSize: '17px', color: '#425466', lineHeight: 1.65 }}
            >
              We&apos;re a small team tackling a big problem. If you want your work to matter, you&apos;re in the right place.
            </motion.p>
          </div>
        </section>

        {/* Perks */}
        <section className="section">
          <div className="container">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={fadeUp}
              style={{ textAlign: 'center', marginBottom: '48px' }}
            >
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--portal-primary)', marginBottom: '12px' }}>
                Why join us
              </p>
              <h2 style={{ fontSize: 'clamp(22px, 2.5vw, 36px)', fontWeight: 300, letterSpacing: '-0.02em', color: '#061b31' }}>
                How we work
              </h2>
            </motion.div>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger}
              style={{ maxWidth: '860px', margin: '0 auto' }}
            >
              {perks.map(perk => (
                <motion.div
                  key={perk.title}
                  variants={fadeUp}
                  style={{ padding: '28px', borderRadius: '16px', background: '#faf5ff', border: '1.5px solid #e9d5ff', textAlign: 'center' }}
                >
                  <div style={{ fontSize: '36px', marginBottom: '12px' }}>{perk.emoji}</div>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#061b31', marginBottom: '8px' }}>{perk.title}</h3>
                  <p style={{ fontSize: '14px', color: '#425466', lineHeight: 1.65 }}>{perk.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Open roles */}
        <section className="section" style={{ backgroundColor: 'var(--portal-surface)', borderTop: '1px solid var(--portal-border)' }}>
          <div className="container">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={fadeUp}
              style={{ textAlign: 'center', marginBottom: '48px' }}
            >
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--portal-primary)', marginBottom: '12px' }}>
                Open positions
              </p>
              <h2 style={{ fontSize: 'clamp(22px, 2.5vw, 36px)', fontWeight: 300, letterSpacing: '-0.02em', color: '#061b31' }}>
                We&apos;re hiring
              </h2>
            </motion.div>
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }} variants={stagger}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '800px', margin: '0 auto' }}
            >
              {roles.map(role => (
                <motion.div
                  key={role.title}
                  variants={fadeUp}
                  style={{
                    padding: '24px 28px',
                    borderRadius: '16px',
                    background: 'white',
                    border: '1.5px solid #e6ebf1',
                    display: 'flex',
                    gap: '20px',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: role.color, background: role.color + '15', padding: '3px 8px', borderRadius: '99px' }}>
                        {role.dept}
                      </span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>📍 {role.location}</span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>· {role.type}</span>
                    </div>
                    <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#061b31', marginBottom: '6px' }}>{role.title}</h3>
                    <p style={{ fontSize: '14px', color: '#425466', lineHeight: 1.6 }}>{role.desc}</p>
                  </div>
                  <a
                    href="/contact"
                    className="btn-primary"
                    style={{ flexShrink: 0, fontSize: '14px', padding: '10px 20px', alignSelf: 'center' }}
                  >
                    Apply →
                  </a>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              style={{ textAlign: 'center', marginTop: '40px', padding: '24px', background: 'white', borderRadius: '12px', border: '1.5px solid #e6ebf1', maxWidth: '800px', margin: '40px auto 0' }}
            >
              <p style={{ fontSize: '15px', color: '#425466', lineHeight: 1.65 }}>
                Don&apos;t see a role that fits?{' '}
                <a href="/contact" style={{ color: 'var(--portal-primary)', textDecoration: 'none', fontWeight: 600 }}>
                  Send us your resume anyway →
                </a>
                {' '}We&apos;re always looking for exceptional people.
              </p>
            </motion.div>
          </div>
        </section>
      </main>
      <LFooter />
    </>
  )
}
