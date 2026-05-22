'use client'

import { LNav, LFooter } from "@/components/landing/sections"
import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
}

const values = [
  { emoji: '🏗️', title: 'Builder mentality', desc: 'We ship fast, learn from cafes and suppliers in the field, and iterate relentlessly. No feature survives first contact with reality unchanged.', color: '#EA580C', bg: '#fff7ed', border: '#fed7aa' },
  { emoji: '🔒', title: 'Trust by default', desc: 'Every transaction on our platform is structured and traceable. We replace verbal agreements with digital records that protect everyone.', color: '#0891B2', bg: '#f0fdfa', border: '#a7f3d0' },
  { emoji: '🇮🇳', title: 'India-first', desc: 'We build for the reality of Indian F&B supply chains cash-heavy, relationship-driven, and deeply regional. No copy-paste from Silicon Valley playbooks.', color: '#7C3AED', bg: '#fdf4ff', border: '#f0abfc' },
]

const team = [
  { name: 'Sahil Kumar', role: 'Co-founder & CEO', initials: 'SK', color: '#6B21A8' },
  { name: 'Arjun Patel', role: 'Co-founder & CTO', initials: 'AP', color: '#0891B2' },
  { name: 'Priya Sharma', role: 'Head of Operations', initials: 'PS', color: '#EA580C' },
  { name: 'Kavya Nair', role: 'Head of Growth', initials: 'KN', color: '#7C3AED' },
]

export default function AboutPage() {
  return (
    <>
      <LNav />
      <main>
        {/* Hero */}
        <section style={{ backgroundColor: '#fafbfc', borderBottom: '1px solid #e6ebf1', paddingBlock: '80px', textAlign: 'center' }}>
          <div className="container" style={{ maxWidth: '700px' }}>
            <motion.p
              initial="hidden" animate="visible" variants={fadeUp}
              style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--portal-primary)', marginBottom: '12px' }}
            >
              Our story
            </motion.p>
            <motion.h1
              initial="hidden" animate="visible"
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] } } }}
              style={{ fontSize: 'clamp(30px, 4vw, 54px)', fontWeight: 300, letterSpacing: '-0.02em', color: '#061b31', lineHeight: 1.1, marginBottom: '24px' }}
            >
              We&apos;re building India&apos;s cafe{' '}
              <span className="gradient-text">supply chain.</span>
            </motion.h1>
            <motion.p
              initial="hidden" animate="visible"
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] } } }}
              style={{ fontSize: '17px', color: '#425466', lineHeight: 1.7 }}
            >
              Gradient 365 was founded to fix the fragmented, WhatsApp-driven supply chains that every Indian cafe owner knows too well. We connect cafes, suppliers, and brands in one structured platform.
            </motion.p>
          </div>
        </section>

        {/* Mission */}
        <section className="section">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12" style={{ alignItems: 'center', maxWidth: '960px', margin: '0 auto' }}>
              <motion.div
                initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}
              >
                <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--portal-primary)', marginBottom: '12px' }}>
                  Our mission
                </p>
                <h2 style={{ fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 300, letterSpacing: '-0.02em', color: '#061b31', lineHeight: 1.15, marginBottom: '20px' }}>
                  Replace chaos with clarity for every cafe in India.
                </h2>
                <p style={{ fontSize: '16px', color: '#425466', lineHeight: 1.75, marginBottom: '16px' }}>
                  The average Indian cafe owner manages procurement across 12+ WhatsApp groups, juggles verbal price agreements, and has zero visibility into actual consumption data. We think that&apos;s a solvable problem.
                </p>
                <p style={{ fontSize: '16px', color: '#425466', lineHeight: 1.75 }}>
                  Our platform gives every side of the supply chain cafes, suppliers, and FMCG brands the tools they need to work together efficiently, at scale.
                </p>
              </motion.div>
              <motion.div
                initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
                variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] } } }}
              >
                <div style={{
                  borderRadius: '24px', overflow: 'hidden',
                  background: 'linear-gradient(135deg, #faf5ff 0%, #eff6ff 50%, #fff7ed 100%)',
                  border: '1.5px solid #e6ebf1',
                  padding: '40px',
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px',
                }}>
                  {[
                    { num: '3', label: 'Sides connected', color: '#7C3AED' },
                    { num: '∞', label: 'WhatsApp groups replaced', color: '#EA580C' },
                    { num: '100%', label: 'Digital audit trail', color: '#0891B2' },
                    { num: '24/7', label: 'Platform uptime', color: '#6B21A8' },
                  ].map(stat => (
                    <div key={stat.label} style={{ textAlign: 'center', padding: '20px', background: 'white', borderRadius: '12px', border: '1px solid #e6ebf1' }}>
                      <p style={{ fontSize: '28px', fontWeight: 800, color: stat.color, marginBottom: '4px' }}>{stat.num}</p>
                      <p style={{ fontSize: '12px', color: '#425466', lineHeight: 1.4 }}>{stat.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="section" style={{ backgroundColor: 'var(--portal-surface)' }}>
          <div className="container">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={fadeUp}
              style={{ textAlign: 'center', marginBottom: '56px' }}
            >
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--portal-primary)', marginBottom: '12px' }}>
                How we work
              </p>
              <h2 style={{ fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 300, letterSpacing: '-0.02em', color: '#061b31' }}>
                Our values
              </h2>
            </motion.div>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger}
            >
              {values.map(v => (
                <motion.div
                  key={v.title}
                  variants={fadeUp}
                  whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.10)' }}
                  style={{ padding: '32px', borderRadius: '20px', background: v.bg, border: `1.5px solid ${v.border}` }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '16px' }}>{v.emoji}</div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#061b31', marginBottom: '10px' }}>{v.title}</h3>
                  <p style={{ fontSize: '15px', color: '#425466', lineHeight: 1.65 }}>{v.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Team */}
        <section className="section">
          <div className="container">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={fadeUp}
              style={{ textAlign: 'center', marginBottom: '56px' }}
            >
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--portal-primary)', marginBottom: '12px' }}>
                The team
              </p>
              <h2 style={{ fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 300, letterSpacing: '-0.02em', color: '#061b31' }}>
                People behind Gradient 365
              </h2>
            </motion.div>
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger}
              style={{ maxWidth: '800px', margin: '0 auto' }}
            >
              {team.map(member => (
                <motion.div
                  key={member.name}
                  variants={fadeUp}
                  style={{ textAlign: 'center' }}
                >
                  <div style={{
                    width: '72px', height: '72px', borderRadius: '50%',
                    background: member.color + '18',
                    border: `2px solid ${member.color}33`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px', fontWeight: 800, color: member.color,
                    margin: '0 auto 12px',
                  }}>
                    {member.initials}
                  </div>
                  <p style={{ fontSize: '15px', fontWeight: 700, color: '#061b31', marginBottom: '4px' }}>{member.name}</p>
                  <p style={{ fontSize: '13px', color: '#425466' }}>{member.role}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-sm" style={{ backgroundColor: '#061b31', textAlign: 'center' }}>
          <div className="container" style={{ maxWidth: '560px' }}>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
              <h2 style={{ fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 300, color: 'white', marginBottom: '16px', letterSpacing: '-0.02em' }}>
                Ready to get started?
              </h2>
              <p style={{ fontSize: '16px', color: '#8898aa', lineHeight: 1.65, marginBottom: '32px' }}>
                Join cafes, suppliers, and brands already using Gradient 365.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a href="/login" className="btn-primary" style={{ fontSize: '15px' }}>Start for free →</a>
                <a href="/contact" className="btn-secondary" style={{ fontSize: '15px', borderColor: '#1e3a5f', color: '#8898aa' }}>Contact us</a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <LFooter />
    </>
  )
}
