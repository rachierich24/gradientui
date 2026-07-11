'use client'

import { LNav, LFooter } from "@/components/landing/sections"
import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export default function PricingPage() {
  return (
    <>
      <LNav />
      <main>
        {/* Contact sales */}
        <section style={{ paddingTop: '140px', paddingBottom: '120px', textAlign: 'center' }}>
          <div className="container" style={{ maxWidth: '640px', marginInline: 'auto' }}>
            <motion.p
              initial="hidden" animate="visible" variants={fadeUp}
              style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--portal-primary)', marginBottom: '12px' }}
            >
              Pricing
            </motion.p>
            <motion.h1
              initial="hidden" animate="visible"
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] } } }}
              style={{ fontSize: 'clamp(30px, 4vw, 54px)', fontWeight: 300, letterSpacing: '-0.02em', color: '#061b31', lineHeight: 1.1, marginBottom: '20px' }}
            >
              Let&apos;s build a plan that fits.
            </motion.h1>
            <motion.p
              initial="hidden" animate="visible"
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] } } }}
              style={{ fontSize: '17px', color: '#425466', lineHeight: 1.65, marginBottom: '36px' }}
            >
              Every café and supply chain runs differently. Tell us your order volume and outlets, and our sales team will put together pricing that fits your operation.
            </motion.p>
            <motion.div
              initial="hidden" animate="visible"
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] } } }}
              style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}
            >
              <a className="btn-l dark" href="mailto:hello@unifiednexgrade.com">Contact sales</a>
              <a className="btn-l ghost" href="/contact">Contact form</a>
            </motion.div>
            <motion.p
              initial="hidden" animate="visible"
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] } } }}
              style={{ fontSize: '15px', color: '#425466', marginTop: '24px' }}
            >
              Or email us directly at{' '}
              <a href="mailto:hello@unifiednexgrade.com" style={{ color: 'var(--portal-primary)', fontWeight: 600, textDecoration: 'none' }}>hello@unifiednexgrade.com</a>
            </motion.p>
          </div>
        </section>
      </main>
      <LFooter />
    </>
  )
}
