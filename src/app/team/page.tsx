'use client'

import { LNav, LFooter } from '@/components/landing/sections'
import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
}
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

const team = [
  {
    name: 'Sumit',
    role: 'Co-founder · CEO',
    photo: '/team-photos/sumit.jpeg',
    bio: 'Drives strategy, partnerships, and growth. Previously co-ran The Raydee Cafe, Gradient’s first tenant and the reason the product is shaped the way it is. DTU alumnus.',
  },
  {
    name: 'Sahil',
    role: 'Co-founder · Engineering',
    photo: '/team-photos/sahil.jpeg',
    bio: 'Builds the platform end-to-end: backend, all four portals, and the supplier privacy walls. Previously on logistics infrastructure at Jumbotail. DTU alumnus.',
  },
  {
    name: 'Dr. Saumya Jetley',
    role: 'Advisor · AI & Research',
    photo: '/team-photos/saumya.jpeg',
    bio: 'Oxford PhD in computer vision and ML under Prof. Philip Torr. Postdoc in causal inference at INRIA Paris-Saclay. Founding faculty at Plaksha University and founder of AdhyaAI. Guides our applied-AI direction.',
    link: { label: 'LinkedIn', href: 'https://www.linkedin.com/in/saumyajetley/' },
  },
]

export default function TeamPage() {
  return (
    <div className="l-page">
      <LNav />
      <main>
        {/* Hero */}
        <section style={{ paddingTop: '160px', paddingBottom: '56px' }}>
          <div className="l-wrap" style={{ maxWidth: '960px' }}>
            <motion.div
              initial="hidden" animate="visible" variants={fadeUp}
              className="sec-eyebrow sec-eyebrow--plain" style={{ marginBottom: '20px' }}
            >
              Our people
            </motion.div>
            <motion.h1
              initial="hidden" animate="visible"
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] } } }}
              style={{ fontSize: 'clamp(34px, 5vw, 62px)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--ink)', lineHeight: 1.0, margin: 0, textWrap: 'balance' }}
            >
              A small team, close to the floor.
            </motion.h1>
            <motion.p
              initial="hidden" animate="visible"
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.16, ease: [0.22, 1, 0.36, 1] } } }}
              style={{ marginTop: '22px', fontSize: '18px', color: 'var(--ink-soft)', lineHeight: 1.55, maxWidth: '56ch', textWrap: 'pretty' }}
            >
              Gradient 365 is built by Unified Nexgrade, a product studio in Delhi making infrastructure for India’s food economy. We build with cafés and suppliers, not away from them.
            </motion.p>
          </div>
        </section>

        {/* Team grid */}
        <section style={{ paddingBottom: '80px' }}>
          <motion.div
            className="l-wrap" style={{ maxWidth: '960px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}
          >
            {team.map((m) => (
              <motion.article key={m.name} variants={fadeUp} className="team-card">
                <div className="team-photo">
                  <img src={m.photo} alt={m.name} loading="lazy" />
                </div>
                <h2 className="team-name">{m.name}</h2>
                <div className="team-role">{m.role}</div>
                <p className="team-bio">{m.bio}</p>
                {m.link && (
                  <a className="team-link" href={m.link.href} target="_blank" rel="noopener noreferrer">
                    {m.link.label} <span aria-hidden="true">→</span>
                  </a>
                )}
              </motion.article>
            ))}
          </motion.div>
        </section>

        {/* Hiring strip */}
        <section style={{ paddingBottom: '110px' }}>
          <div className="l-wrap" style={{ maxWidth: '960px' }}>
            <a href="/contact" className="team-hiring">
              <div>
                <div className="team-hiring-label">Open roles</div>
                <div className="team-hiring-title">We’re hiring.</div>
              </div>
              <p className="team-hiring-text">
                We want sharp people who care about the problem as much as the product. Reach out, we’d love to talk.
              </p>
              <span className="team-hiring-arrow" aria-hidden="true">→</span>
            </a>
          </div>
        </section>
      </main>
      <LFooter />
    </div>
  )
}
