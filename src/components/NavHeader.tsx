'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

type PortalLink = { label: string; description: string; href: string; color: string; emoji: string }

const portalLinks: PortalLink[] = [
  { label: 'Cafe Portal',     description: 'Order from suppliers, manage billing & pre-orders', href: 'http://localhost:5174', color: '#EA580C', emoji: '☕' },
  { label: 'Supplier Portal', description: 'Manage catalogue, fulfill cafe orders, serve brands', href: 'http://localhost:5175', color: '#0891B2', emoji: '🏭' },
  { label: 'Brand Portal',    description: 'Run trials, track consumption, manage supply chain', href: 'http://localhost:5176', color: '#7C3AED', emoji: '🏷️' },
]

const mainNavLinks = [
  { label: 'Features',  href: '#how-it-works' },
  { label: 'Pricing',   href: '#pricing' },
  { label: 'About',     href: '#about' },
]

export default function NavHeader() {
  const [scrolled, setScrolled]       = useState(false)
  const [mobileOpen, setMobileOpen]   = useState(false)
  const [portalsOpen, setPortalsOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      className="sticky top-0 w-full"
      style={{ zIndex: 50, backgroundColor: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(8px)' }}
      animate={{ boxShadow: scrolled ? '0 2px 8px rgba(0,0,0,0.08)' : '0 0 0 rgba(0,0,0,0)' }}
      transition={{ duration: 0.2 }}
    >
      <nav className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '20px', fontWeight: 800, backgroundImage: 'var(--portal-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Gradient 365
          </span>
        </Link>

        {/* Desktop Nav */}
        <ul style={{ display: 'flex', alignItems: 'center', listStyle: 'none', gap: '0' }} className="hidden md:flex">
          {/* Portals dropdown */}
          <li style={{ position: 'relative' }}
              onMouseEnter={() => setPortalsOpen(true)}
              onMouseLeave={() => setPortalsOpen(false)}>
            <button style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 16px', fontSize: '15px', color: portalsOpen ? '#061b31' : '#425466', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              Portals
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: portalsOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}>
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <AnimatePresence>
              {portalsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="megamenu-panel"
                  style={{ position: 'absolute', top: 'calc(100% + 8px)', left: '-20px', width: '520px', padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}
                >
                  {portalLinks.map(p => (
                    <a key={p.label} href={p.href} className="megamenu-item" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '12px', textDecoration: 'none' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: p.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{p.emoji}</div>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#061b31' }}>{p.label}</p>
                        <p style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4, marginTop: '2px' }}>{p.description}</p>
                      </div>
                    </a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </li>

          {mainNavLinks.map(l => (
            <li key={l.label}>
              <a href={l.href} style={{ display: 'block', padding: '8px 16px', fontSize: '15px', color: '#425466', textDecoration: 'none', transition: 'color 0.15s' }}
                 onMouseEnter={e => (e.currentTarget.style.color = '#061b31')}
                 onMouseLeave={e => (e.currentTarget.style.color = '#425466')}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="hidden md:flex">
          <a href="/login" style={{ fontSize: '15px', color: '#425466', textDecoration: 'none', padding: '8px' }}>Sign in</a>
          <a href="#portals" className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>Get started →</a>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(m => !m)}
          aria-label="Toggle menu"
          style={{ flexDirection: 'column', gap: '5px', padding: '8px', background: 'none', border: 'none', cursor: 'pointer' }}
          className="flex md:hidden"
        >
          {[0, 1, 2].map(i => (
            <span key={i} style={{
              display: 'block', width: '20px', height: '2px', background: '#061b31',
              transition: 'all 0.2s',
              transform: mobileOpen ? (i === 0 ? 'rotate(45deg) translate(5px, 5px)' : i === 2 ? 'rotate(-45deg) translate(5px, -5px)' : 'scaleX(0)') : 'none',
            }} />
          ))}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ background: 'white', borderTop: '1px solid #e6ebf1', overflow: 'hidden' }}
            className="md:hidden"
          >
            <div className="container" style={{ paddingBlock: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                { label: 'Cafe Portal',     href: 'http://localhost:5174' },
                { label: 'Supplier Portal', href: 'http://localhost:5175' },
                { label: 'Brand Portal',    href: 'http://localhost:5176' },
                { label: 'Features',        href: '#how-it-works' },
                { label: 'Pricing',         href: '#pricing' },
                { label: 'About',           href: '#about' },
              ].map(l => (
                <a key={l.label} href={l.href} style={{ padding: '12px 0', fontSize: '15px', color: '#425466', textDecoration: 'none', borderBottom: '1px solid #f0f4f8' }} onClick={() => setMobileOpen(false)}>{l.label}</a>
              ))}
              <div style={{ display: 'flex', gap: '12px', paddingTop: '16px' }}>
                <a href="/login" className="btn-secondary" style={{ flex: 1, textAlign: 'center' }}>Sign in</a>
                <a href="#portals" className="btn-primary" style={{ flex: 1, textAlign: 'center' }}>Get started</a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
