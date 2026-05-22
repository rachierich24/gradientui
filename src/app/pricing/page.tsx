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

const plans = [
  {
    name: 'Starter',
    price: '₹0',
    period: '/month',
    desc: 'For cafes and suppliers getting started with digital ordering.',
    color: '#EA580C',
    bg: '#fff7ed',
    border: '#fed7aa',
    cta: 'Get started free',
    ctaHref: '/login',
    features: [
      'Up to 50 orders/month',
      'Basic supplier catalogue access',
      'Digital order tracking',
      'In-app messaging',
      'Email support',
    ],
    badge: null,
  },
  {
    name: 'Growth',
    price: '₹2,999',
    period: '/month',
    desc: 'For growing cafes and suppliers handling significant volume.',
    color: '#7C3AED',
    bg: '#fdf4ff',
    border: '#e9d5ff',
    cta: 'Start Growth trial',
    ctaHref: '/login',
    features: [
      'Unlimited orders',
      'In-app price negotiation',
      'Pre-scheduled recurring orders',
      'Digital billing & invoicing',
      'Urgent sourcing requests',
      'Analytics dashboard',
      'Priority support',
    ],
    badge: 'Most popular',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For FMCG brands and multi-location cafe chains with custom needs.',
    color: '#0891B2',
    bg: '#f0fdfa',
    border: '#a7f3d0',
    cta: 'Contact us',
    ctaHref: '/contact',
    features: [
      'Everything in Growth',
      'Brand trial management',
      'Live consumption analytics',
      'Supplier network management',
      'Custom integrations (ERP, POS)',
      'Dedicated account manager',
      'SLA-backed uptime',
    ],
    badge: null,
  },
]

const faqs = [
  { q: 'Is there a free trial for paid plans?', a: 'Yes Growth comes with a 14-day free trial. No credit card required to start. You\'ll only be charged after the trial ends if you choose to continue.' },
  { q: 'Can I change my plan later?', a: 'Absolutely. You can upgrade or downgrade at any time from your account settings. Changes take effect at the start of your next billing cycle.' },
  { q: 'How does pricing work for multi-location businesses?', a: 'Enterprise pricing is customized based on your number of locations, order volume, and specific feature requirements. Contact our team to get a quote tailored to your business.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit/debit cards, UPI, net banking, and NEFT transfers. GST invoices are issued for all paid plans.' },
]

export default function PricingPage() {
  return (
    <>
      <LNav />
      <main>
        {/* Hero */}
        <section style={{ backgroundColor: '#fafbfc', borderBottom: '1px solid #e6ebf1', paddingBlock: '80px', textAlign: 'center' }}>
          <div className="container" style={{ maxWidth: '640px' }}>
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
              Simple, transparent pricing
            </motion.h1>
            <motion.p
              initial="hidden" animate="visible"
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] } } }}
              style={{ fontSize: '17px', color: '#425466', lineHeight: 1.65 }}
            >
              Start free. Upgrade when you grow. No hidden fees, no lock-in.
            </motion.p>
          </div>
        </section>

        {/* Pricing cards */}
        <section className="section">
          <div className="container">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }} variants={stagger}
              style={{ maxWidth: '960px', margin: '0 auto', alignItems: 'stretch' }}
            >
              {plans.map(plan => (
                <motion.div
                  key={plan.name}
                  variants={fadeUp}
                  style={{
                    position: 'relative',
                    padding: '32px',
                    borderRadius: '20px',
                    background: plan.bg,
                    border: `1.5px solid ${plan.border}`,
                    display: 'flex',
                    flexDirection: 'column',
                    ...(plan.badge ? { boxShadow: `0 0 0 3px ${plan.color}22, 0 20px 40px rgba(0,0,0,0.08)` } : {}),
                  }}
                >
                  {plan.badge && (
                    <div style={{
                      position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                      background: plan.color, color: 'white',
                      fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em',
                      padding: '4px 12px', borderRadius: '99px', whiteSpace: 'nowrap',
                    }}>
                      {plan.badge.toUpperCase()}
                    </div>
                  )}

                  <div style={{ marginBottom: '24px' }}>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: plan.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>{plan.name}</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '40px', fontWeight: 800, color: '#061b31', letterSpacing: '-0.02em' }}>{plan.price}</span>
                      {plan.period && <span style={{ fontSize: '15px', color: '#425466' }}>{plan.period}</span>}
                    </div>
                    <p style={{ fontSize: '14px', color: '#425466', lineHeight: 1.5 }}>{plan.desc}</p>
                  </div>

                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px', flexGrow: 1 }}>
                    {plan.features.map(feature => (
                      <li key={feature} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '14px', color: '#425466' }}>
                        <span style={{ color: plan.color, fontWeight: 700, flexShrink: 0, marginTop: '1px' }}>✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <a
                    href={plan.ctaHref}
                    className={plan.badge ? 'btn-primary' : 'btn-secondary'}
                    style={{
                      textAlign: 'center',
                      justifyContent: 'center',
                      ...(plan.badge ? {} : { borderColor: plan.border, color: plan.color }),
                    }}
                  >
                    {plan.cta} →
                  </a>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section" style={{ backgroundColor: 'var(--portal-surface)', borderTop: '1px solid var(--portal-border)' }}>
          <div className="container" style={{ maxWidth: '720px' }}>
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={fadeUp}
              style={{ textAlign: 'center', marginBottom: '48px' }}
            >
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--portal-primary)', marginBottom: '12px' }}>
                FAQ
              </p>
              <h2 style={{ fontSize: 'clamp(22px, 2.5vw, 36px)', fontWeight: 300, letterSpacing: '-0.02em', color: '#061b31' }}>
                Common questions
              </h2>
            </motion.div>
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              {faqs.map(faq => (
                <motion.div
                  key={faq.q}
                  variants={fadeUp}
                  style={{ padding: '24px', background: 'white', borderRadius: '12px', border: '1.5px solid #e6ebf1' }}
                >
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#061b31', marginBottom: '8px' }}>{faq.q}</h3>
                  <p style={{ fontSize: '15px', color: '#425466', lineHeight: 1.65 }}>{faq.a}</p>
                </motion.div>
              ))}
            </motion.div>
            <motion.p
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              style={{ textAlign: 'center', marginTop: '32px', fontSize: '15px', color: '#425466' }}
            >
              More questions?{' '}
              <a href="/contact" style={{ color: 'var(--portal-primary)', textDecoration: 'none', fontWeight: 600 }}>Talk to our team →</a>
            </motion.p>
          </div>
        </section>
      </main>
      <LFooter />
    </>
  )
}
