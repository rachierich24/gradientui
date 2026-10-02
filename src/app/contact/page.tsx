'use client'

import { useState } from 'react'
import { LNav, LFooter } from "@/components/landing/sections"
import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  fontSize: '15px',
  border: '1.5px solid #e6ebf1',
  borderRadius: '8px',
  outline: 'none',
  fontFamily: 'inherit',
  color: '#061b31',
  background: '#fff',
  transition: 'border-color 0.15s',
}

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (sending) return
    setSending(true)
    setError(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({ ok: false, reason: 'bad-response' }))
      if (!res.ok || !data.ok) {
        setError(
          data?.reason === 'email-not-configured'
            ? 'Email is temporarily unavailable. Please reach us at hello@unifiednexgrade.com.'
            : 'Could not send your message. Please try again or email hello@unifiednexgrade.com.'
        )
        return
      }
      setSubmitted(true)
    } catch {
      setError('Network error. Please try again or email hello@unifiednexgrade.com.')
    } finally {
      setSending(false)
    }
  }

  const fieldStyle = (field: string) => ({
    ...inputStyle,
    borderColor: focused === field ? 'var(--portal-primary)' : '#e6ebf1',
  })

  return (
    <>
      <LNav />
      <main>
        {/* Page hero */}
        <section style={{ paddingTop: '140px', paddingBottom: '48px' }}>
          <div className="container" style={{ textAlign: 'center', maxWidth: '640px', marginInline: 'auto' }}>
            <motion.p
              initial="hidden" animate="visible" variants={fadeUp}
              style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--portal-primary)', marginBottom: '12px' }}
            >
              Contact
            </motion.p>
            <motion.h1
              initial="hidden" animate="visible" variants={{ ...fadeUp, visible: { ...fadeUp.visible, transition: { duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] } } }}
              style={{ fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 300, letterSpacing: '-0.02em', color: '#061b31', marginBottom: '16px' }}
            >
              Get in touch
            </motion.h1>
            <motion.p
              initial="hidden" animate="visible" variants={{ ...fadeUp, visible: { ...fadeUp.visible, transition: { duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] } } }}
              style={{ fontSize: '17px', color: '#425466', lineHeight: 1.65 }}
            >
              Have a question, want to partner with us, or need help? We&apos;d love to hear from you.
            </motion.p>
          </div>
        </section>

        {/* Content */}
        <section className="section">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12" style={{ maxWidth: '900px', margin: '0 auto' }}>

              {/* Form */}
              <motion.div
                initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}
              >
                {submitted ? (
                  <div style={{ padding: '40px', background: '#faf5ff', border: '1.5px solid #e9d5ff', borderRadius: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '40px', marginBottom: '16px' }}>✅</div>
                    <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#061b31', marginBottom: '8px' }}>Message received!</h2>
                    <p style={{ fontSize: '15px', color: '#425466', lineHeight: 1.65 }}>
                      Thanks for reaching out. We&apos;ll get back to you within 1–2 business days.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#061b31', marginBottom: '6px' }}>Full name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Rohan Mehta"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        onFocus={() => setFocused('name')}
                        onBlur={() => setFocused(null)}
                        style={fieldStyle('name')}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#061b31', marginBottom: '6px' }}>Work email *</label>
                      <input
                        type="email"
                        required
                        placeholder="rohan@mycafe.com"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        onFocus={() => setFocused('email')}
                        onBlur={() => setFocused(null)}
                        style={fieldStyle('email')}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#061b31', marginBottom: '6px' }}>Company</label>
                      <input
                        type="text"
                        placeholder="My Cafe Pvt. Ltd."
                        value={form.company}
                        onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                        onFocus={() => setFocused('company')}
                        onBlur={() => setFocused(null)}
                        style={fieldStyle('company')}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#061b31', marginBottom: '6px' }}>Message *</label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Tell us about your business and how we can help..."
                        value={form.message}
                        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                        onFocus={() => setFocused('message')}
                        onBlur={() => setFocused(null)}
                        style={{ ...fieldStyle('message'), resize: 'vertical', lineHeight: 1.6 }}
                      />
                    </div>
                    {error && (
                      <div role="alert" style={{ padding: '12px 14px', background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '8px', fontSize: '13px', color: '#991b1b' }}>
                        {error}
                      </div>
                    )}
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={sending}
                      style={{ fontSize: '15px', padding: '14px 28px', justifyContent: 'center', opacity: sending ? 0.6 : 1, cursor: sending ? 'wait' : 'pointer' }}
                    >
                      {sending ? 'Sending…' : 'Send message →'}
                    </button>
                  </form>
                )}
              </motion.div>

              {/* Contact info */}
              <motion.div
                initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
                variants={{ ...fadeUp, visible: { ...fadeUp.visible, transition: { duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] } } }}
                style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}
              >
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#061b31', marginBottom: '16px' }}>Contact info</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[
                      { icon: '📧', label: 'General enquiries', value: 'hello@unifiednexgrade.com', href: 'mailto:hello@unifiednexgrade.com' },
                      { icon: '📍', label: 'Headquarters', value: 'Delhi NCR, India', href: null },
                    ].map(item => (
                      <div key={item.label} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '18px', marginTop: '1px' }}>{item.icon}</span>
                        <div>
                          <p style={{ fontSize: '12px', fontWeight: 600, color: '#425466', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>{item.label}</p>
                          {item.href ? (
                            <a className="link-underline" href={item.href} style={{ fontSize: '15px', color: 'var(--portal-primary)', textDecoration: 'none' }}>{item.value}</a>
                          ) : (
                            <p style={{ fontSize: '15px', color: '#061b31' }}>{item.value}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>

            </div>
          </div>
        </section>
      </main>
      <LFooter />
    </>
  )
}
