'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export function SupplierBentoFeatures() {
  const prefersReduced = useReducedMotion();
  const isReduced = prefersReduced ?? false;

  // Tile 1 interactive state
  const [activeBubble, setActiveBubble] = useState<number>(1);

  // Tile 2 interactive approval toggle
  const [autoApproveActive, setAutoApproveActive] = useState<boolean>(true);

  // Tile 4 interactive payout simulated trigger
  const [payoutTriggered, setPayoutTriggered] = useState<boolean>(false);

  // Tile 5 active integration tooltip/hover
  const [activeIntegration, setActiveIntegration] = useState<string>('petpooja');

  return (
    <section
      className="sup-bento-section"
      id="features"
      aria-label="Core Supplier Capabilities"
    >
      <div className="sup-container">
        {/* ─── A. SECTION INTRODUCTION (Ramp Two-Tone Headline & Dual CTAs) ─── */}
        <motion.div
          className="sup-bento-intro"
          initial={isReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="sup-bento-eyebrow">
            <span className="sup-bento-eyebrow-dot" />
            <span>ONE PLATFORM FOR WHOLESALE SUPPLY</span>
          </div>
          <h2 className="sup-bento-heading">
            One platform for all café supply.<br />
            <span className="sup-bento-heading-muted">Agents for every workflow, working 24/7.</span>
          </h2>
          <div className="sup-bento-cta-row">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('join') || document.getElementById('onboarding');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('open-supplier-modal'));
                }
              }}
              className="sup-bento-btn-primary"
            >
              Switch in days, not months
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('order-workspace') || document.getElementById('demo');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  window.scrollTo({ top: 850, behavior: 'smooth' });
                }
              }}
              className="sup-bento-btn-secondary"
            >
              View Demo
            </button>
          </div>
        </motion.div>

        {/* ─── B. FIVE-TILE ASYMMETRIC BENTO GRID (Ramp Exact 2-Top + 3-Bottom Layout) ─── */}
        <div className="sup-bento-grid-wrapper">
          {/* ══════════════════════════════════════════════════════════════
              TOP ROW: 2 Prominent Cards (Tile 1: ~60% | Tile 2: ~40%)
             ══════════════════════════════════════════════════════════════ */}
          <div className="sup-bento-row sup-bento-top-row">
            {/* ─── TILE 1: CARDS & ORDERS THAT HANDLE THEMSELVES ─── */}
            <motion.article
              className="sup-bento-card sup-bento-card-order"
              initial={isReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.55, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="sup-bento-card-inner">
                {/* Header: Two-tone title + Ramp-style 36px white arrow affordance */}
                <div className="sup-bento-card-header">
                  <h3 className="sup-bento-title">
                    Cards &amp; Orders <span className="text-hushed">that handle themselves</span>
                  </h3>
                  <div className="sup-bento-arrow-affordance" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="7" y1="17" x2="17" y2="7" />
                      <polyline points="7 7 17 7 17 17" />
                    </svg>
                  </div>
                </div>

                {/* Miniature Interface Preview: Physical Card + Floating Dialogue (Ramp Element) */}
                <div className="sup-bento-preview-container sup-preview-card-canvas">
                  {/* Subtle Background Particle Grid & Dark Grabbit Fleet Card */}
                  <div className="sup-dispatch-card-graphic" aria-hidden="true">
                    <div className="sup-card-graphic-top">
                      <div className="sup-card-logo">
                        <span className="sup-card-g">G</span>
                        <span className="sup-card-brand">grabbit</span>
                      </div>
                      <span className="sup-card-tier-badge">PRIME SUPPLIER</span>
                    </div>

                    <div className="sup-card-chip-row">
                      <div className="sup-card-chip">
                        <div className="sup-card-chip-lines" />
                      </div>
                      {/* Contactless waves icon */}
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round">
                        <path d="M8.5 16.5a5 5 0 0 1 0-7" />
                        <path d="M12 19a8.5 8.5 0 0 1 0-12" />
                        <path d="M15.5 21.5a12 12 0 0 1 0-17" />
                      </svg>
                    </div>

                    <div className="sup-card-graphic-bottom">
                      <span className="sup-card-num">•••• 2048</span>
                      <span className="sup-card-label">BLUE TOKAI ROASTERY HUB</span>
                    </div>
                  </div>

                  {/* Floating Notification Card 1 (Top Left) */}
                  <div
                    className={`sup-floating-bubble bubble-top ${activeBubble === 1 ? 'focused' : ''}`}
                    onClick={() => setActiveBubble(1)}
                  >
                    <div className="sup-bubble-icon">☕</div>
                    <div className="sup-bubble-content">
                      <div className="sup-bubble-title">₹18,400 at Blue Tokai Café</div>
                      <div className="sup-bubble-sub">
                        <span className="sup-bubble-sub-highlight">🟢 Matched to Inventory</span> · Bay 02 · No manual entry
                      </div>
                    </div>
                  </div>

                  {/* Floating Notification Card 2 (Bottom Right) */}
                  <div
                    className={`sup-floating-bubble bubble-bottom ${activeBubble === 2 ? 'focused' : ''}`}
                    onClick={() => setActiveBubble(2)}
                  >
                    <div className="sup-bubble-check">✓</div>
                    <div className="sup-bubble-content">
                      <div className="sup-bubble-title">Order #GRB-2048 verified &amp; dispatched</div>
                      <div className="sup-bubble-sub">
                        <span className="sup-bubble-sub-highlight">⚡ Escrow Released in 24h</span> · Driver: Rajesh K.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.article>

            {/* ─── TILE 2: PROCURE TO PAY WITHOUT CHASING APPROVALS ─── */}
            <motion.article
              className="sup-bento-card sup-bento-card-procure"
              initial={isReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.55, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="sup-bento-card-inner">
                {/* Header */}
                <div className="sup-bento-card-header">
                  <h3 className="sup-bento-title">
                    Procure to pay <span className="text-hushed">without chasing approvals</span>
                  </h3>
                  <div className="sup-bento-arrow-affordance" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="7" y1="17" x2="17" y2="7" />
                      <polyline points="7 7 17 7 17 17" />
                    </svg>
                  </div>
                </div>

                {/* Visual Stage: 3-Way Match & Multi-Level Approval Engine (Ramp Element) */}
                <div className="sup-bento-preview-container sup-procure-stage">
                  {/* Miniature Purchase Order Card */}
                  <div className="sup-procure-po-card">
                    <div className="sup-procure-po-header">
                      <div className="sup-procure-buyer-meta">
                        <span className="sup-procure-cafe-dot" />
                        <span className="sup-procure-cafe-name">Araku Specialty Roastery</span>
                      </div>
                      <span className="sup-procure-po-id">#PO-8941</span>
                    </div>

                    <div className="sup-procure-items">
                      <div className="sup-procure-item-row">
                        <span className="item-name">Arabica AA Estate (25kg)</span>
                        <span className="item-val">₹20,500</span>
                      </div>
                      <div className="sup-procure-item-row">
                        <span className="item-name">Barista Oat Milk (10 cases)</span>
                        <span className="item-val">₹9,600</span>
                      </div>
                    </div>

                    <div className="sup-procure-po-footer">
                      <div className="sup-procure-tier-pill">
                        <span>🔒 Tier-1 Rate: -15% Applied</span>
                      </div>
                      <div className="sup-procure-total">
                        <span className="total-lbl">Total:</span>
                        <span className="total-amount">₹30,100</span>
                      </div>
                    </div>
                  </div>

                  {/* 3-Way Match Automated Verification Steps */}
                  <div className="sup-procure-steps-card">
                    <div className="sup-procure-step-item done">
                      <span className="step-circle">✓</span>
                      <div className="step-details">
                        <span className="step-title">PO vs Inventory Match</span>
                        <span className="step-sub">35 units reserved · Bay 02</span>
                      </div>
                      <span className="step-time">0.2s</span>
                    </div>

                    <div className="sup-procure-step-item done">
                      <span className="step-circle">✓</span>
                      <div className="step-details">
                        <span className="step-title">Contract Rate Verified</span>
                        <span className="step-sub">Pre-negotiated wholesale price</span>
                      </div>
                      <span className="step-time">0.1s</span>
                    </div>

                    <div className={`sup-procure-step-item ${autoApproveActive ? 'done' : 'active'}`}>
                      <span className="step-circle">{autoApproveActive ? '⚡' : '●'}</span>
                      <div className="step-details">
                        <span className="step-title">Escrow Locked &amp; Dispatched</span>
                        <span className="step-sub">₹30,100 secured in Gradient Vault</span>
                      </div>
                      <span className="step-time">Instant</span>
                    </div>
                  </div>

                  {/* Bottom Autonomous Verification Badge */}
                  <div
                    className="sup-procure-autobadge"
                    onClick={() => setAutoApproveActive(!autoApproveActive)}
                    role="button"
                    tabIndex={0}
                    title="Toggle autonomous approval"
                  >
                    <span className="auto-icon">🟢</span>
                    <span className="auto-text">100% Autonomous Match Enabled · 0 min manual entry</span>
                  </div>
                </div>
              </div>
            </motion.article>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              BOTTOM ROW: 3 Balanced Cards (Tile 3 | Tile 4 | Tile 5)
             ══════════════════════════════════════════════════════════════ */}
          <div className="sup-bento-row sup-bento-bottom-row">
            {/* ─── TILE 3: ACCOUNTING AUTOMATION ELIMINATES MONTH-END MADNESS ─── */}
            <motion.article
              className="sup-bento-card sup-bento-card-ledger"
              initial={isReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.55, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="sup-bento-card-inner">
                {/* Header */}
                <div className="sup-bento-card-header">
                  <h3 className="sup-bento-title">
                    Accounting automation <span className="text-hushed">eliminates month-end madness</span>
                  </h3>
                  <div className="sup-bento-arrow-affordance" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="7" y1="17" x2="17" y2="7" />
                      <polyline points="7 7 17 7 17 17" />
                    </svg>
                  </div>
                </div>

                {/* Visual Stage: Streaming General Ledger with Category Tags & Fade Masks (Ramp Element) */}
                <div className="sup-bento-preview-container sup-ledger-stage">
                  <div className="sup-ledger-table-header">
                    <span>TRANSACTION</span>
                    <span>CATEGORY</span>
                    <span>SYNC</span>
                  </div>

                  <div className="sup-ledger-stream">
                    <div className="sup-ledger-row">
                      <div className="sup-ledger-col-trans">
                        <span className="trans-title">Arabica AA Estate (10kg)</span>
                        <span className="trans-amount">₹8,200</span>
                      </div>
                      <span className="sup-ledger-pill cogs">COGS: Coffee</span>
                      <span className="sup-ledger-sync">🟢 Petpooja</span>
                    </div>

                    <div className="sup-ledger-row">
                      <div className="sup-ledger-col-trans">
                        <span className="trans-title">Barista Oat Milk (12x)</span>
                        <span className="trans-amount">₹2,880</span>
                      </div>
                      <span className="sup-ledger-pill inv">Inventory</span>
                      <span className="sup-ledger-sync">🟢 Tally Prime</span>
                    </div>

                    <div className="sup-ledger-row">
                      <div className="sup-ledger-col-trans">
                        <span className="trans-title">Cold Brew Concentrate (5L)</span>
                        <span className="trans-amount">₹2,400</span>
                      </div>
                      <span className="sup-ledger-pill base">Beverage Base</span>
                      <span className="sup-ledger-sync">🟢 Zoho Books</span>
                    </div>

                    <div className="sup-ledger-row">
                      <div className="sup-ledger-col-trans">
                        <span className="trans-title">V60 Paper Filters (500x)</span>
                        <span className="trans-amount">₹950</span>
                      </div>
                      <span className="sup-ledger-pill supplies">Supplies</span>
                      <span className="sup-ledger-sync">🟢 QuickBooks</span>
                    </div>
                  </div>

                  {/* Ramp Signature Fade Masks */}
                  <div className="sup-ledger-fade-bottom" aria-hidden="true" />
                  <div className="sup-ledger-fade-right" aria-hidden="true" />

                  {/* Live sync metric tag */}
                  <div className="sup-ledger-sync-footer">
                    <span>🟢 100% GST Invoices &amp; E-Way Bills Auto-Filed</span>
                  </div>
                </div>
              </div>
            </motion.article>

            {/* ─── TILE 4: ESCROW & BANKING THAT FLOWS MONEY TO HIGHEST RETURN ─── */}
            <motion.article
              className="sup-bento-card sup-bento-card-banking"
              initial={isReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.55, delay: 0.27, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="sup-bento-card-inner">
                {/* Header */}
                <div className="sup-bento-card-header">
                  <h3 className="sup-bento-title">
                    Escrow &amp; Banking <span className="text-hushed">that flows money to the highest return</span>
                  </h3>
                  <div className="sup-bento-arrow-affordance" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="7" y1="17" x2="17" y2="7" />
                      <polyline points="7 7 17 7 17 17" />
                    </svg>
                  </div>
                </div>

                {/* Visual Stage: Real-Time Treasury & Cash Flow Velocity Graph (Ramp Element) */}
                <div className="sup-bento-preview-container sup-banking-stage">
                  <div className="sup-bank-balance-card">
                    <div className="sup-bank-label-row">
                      <span className="sup-bank-label">ESCROW SETTLEMENT VAULT</span>
                      <span className="sup-bank-yield-pill">+4.8% APY</span>
                    </div>
                    <div className="sup-bank-amount-row">
                      <span className="sup-bank-currency">₹</span>
                      <span className="sup-bank-amount">4,82,500</span>
                      <span className="sup-bank-cents">.00</span>
                    </div>
                  </div>

                  {/* Sparkline Cash Velocity SVG */}
                  <div className="sup-bank-chart-container" aria-hidden="true">
                    <svg viewBox="0 0 300 68" className="sup-bank-sparkline" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="supBankGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#1FA952" stopOpacity="0.28" />
                          <stop offset="100%" stopColor="#1FA952" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,58 C45,54 75,44 110,48 C145,52 175,28 210,32 C245,36 270,12 300,10 L300,68 L0,68 Z"
                        fill="url(#supBankGradient)"
                      />
                      <path
                        d="M0,58 C45,54 75,44 110,48 C145,52 175,28 210,32 C245,36 270,12 300,10"
                        fill="none"
                        stroke="#1FA952"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                      />
                      {/* Active glowing node */}
                      <circle cx="300" cy="10" r="4" fill="#1FA952" />
                      <circle cx="300" cy="10" r="8" fill="#1FA952" fillOpacity="0.25" />
                    </svg>
                  </div>

                  {/* Next Automated Disbursement Progress */}
                  <div className="sup-bank-disburse-card">
                    <div className="sup-bank-disburse-top">
                      <span className="disburse-title">Next Auto-Disbursement</span>
                      <span className="disburse-timing">Today · 12:00 PM</span>
                    </div>
                    <div className="sup-bank-progress-track">
                      <div className="sup-bank-progress-fill" style={{ width: payoutTriggered ? '100%' : '84%' }} />
                    </div>
                    <div className="sup-bank-disburse-footer">
                      <span className="guarantee-text">🔒 24-Hour Settlement Guarantee · ₹0 Bad Debts</span>
                      <button
                        type="button"
                        className="sup-bank-payout-btn"
                        onClick={() => setPayoutTriggered(!payoutTriggered)}
                      >
                        {payoutTriggered ? 'Disbursed ✓' : 'Instant ⚡'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.article>

            {/* ─── TILE 5: 20+ INTEGRATIONS TO THE TOOLS YOU ALREADY USE ─── */}
            <motion.article
              className="sup-bento-card sup-bento-card-integrations"
              initial={isReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.55, delay: 0.34, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="sup-bento-card-inner">
                {/* Header */}
                <div className="sup-bento-card-header">
                  <h3 className="sup-bento-title">
                    20+ Integrations <span className="text-hushed">to the tools you already use</span>
                  </h3>
                  <div className="sup-bento-arrow-affordance" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="7" y1="17" x2="17" y2="7" />
                      <polyline points="7 7 17 7 17 17" />
                    </svg>
                  </div>
                </div>

                {/* Visual Stage: Radial Masked Ecosystem Constellation (Ramp Element) */}
                <div className="sup-bento-preview-container sup-integrations-stage">
                  <div className="sup-orbit-constellation">
                    {/* Concentric Orbital Rings */}
                    <div className="sup-orbit-ring ring-1" aria-hidden="true" />
                    <div className="sup-orbit-ring ring-2" aria-hidden="true" />
                    <div className="sup-orbit-ring ring-3" aria-hidden="true" />

                    {/* Central Gradient Hub */}
                    <div className="sup-orbit-center-hub" title="Gradient Core Wholesale Engine">
                      <span className="hub-g">G</span>
                      <span className="hub-pulse" />
                    </div>

                    {/* Orbiting Partner Badge: Petpooja (POS) */}
                    <div
                      className={`sup-orbit-chip chip-petpooja ${activeIntegration === 'petpooja' ? 'active' : ''}`}
                      onClick={() => setActiveIntegration('petpooja')}
                      title="Petpooja Restaurant POS"
                    >
                      <span className="chip-badge-icon" style={{ background: '#FF5722' }}>P</span>
                      <span className="chip-label">Petpooja</span>
                      <span className="chip-status-dot" />
                    </div>

                    {/* Orbiting Partner Badge: Tally Prime (Accounting) */}
                    <div
                      className={`sup-orbit-chip chip-tally ${activeIntegration === 'tally' ? 'active' : ''}`}
                      onClick={() => setActiveIntegration('tally')}
                      title="Tally Prime ERP"
                    >
                      <span className="chip-badge-icon" style={{ background: '#0284C7' }}>T</span>
                      <span className="chip-label">Tally</span>
                      <span className="chip-status-dot" />
                    </div>

                    {/* Orbiting Partner Badge: WhatsApp Business API */}
                    <div
                      className={`sup-orbit-chip chip-whatsapp ${activeIntegration === 'whatsapp' ? 'active' : ''}`}
                      onClick={() => setActiveIntegration('whatsapp')}
                      title="WhatsApp Autonomous Order Gateway"
                    >
                      <span className="chip-badge-icon" style={{ background: '#25D366' }}>W</span>
                      <span className="chip-label">WhatsApp</span>
                      <span className="chip-status-dot" />
                    </div>

                    {/* Orbiting Partner Badge: Zoho Books */}
                    <div
                      className={`sup-orbit-chip chip-zoho ${activeIntegration === 'zoho' ? 'active' : ''}`}
                      onClick={() => setActiveIntegration('zoho')}
                      title="Zoho Books Automated GST Invoicing"
                    >
                      <span className="chip-badge-icon" style={{ background: '#E11D48' }}>Z</span>
                      <span className="chip-label">Zoho</span>
                      <span className="chip-status-dot" />
                    </div>

                    {/* Orbiting Partner Badge: UrbanPiper */}
                    <div
                      className={`sup-orbit-chip chip-urbanpiper ${activeIntegration === 'urbanpiper' ? 'active' : ''}`}
                      onClick={() => setActiveIntegration('urbanpiper')}
                      title="UrbanPiper Café Aggregator Sync"
                    >
                      <span className="chip-badge-icon" style={{ background: '#8B5CF6' }}>U</span>
                      <span className="chip-label">UrbanPiper</span>
                      <span className="chip-status-dot" />
                    </div>

                    {/* Orbiting Partner Badge: QuickBooks */}
                    <div
                      className={`sup-orbit-chip chip-quickbooks ${activeIntegration === 'quickbooks' ? 'active' : ''}`}
                      onClick={() => setActiveIntegration('quickbooks')}
                      title="QuickBooks Online"
                    >
                      <span className="chip-badge-icon" style={{ background: '#10B981' }}>Q</span>
                      <span className="chip-label">QuickBooks</span>
                      <span className="chip-status-dot" />
                    </div>
                  </div>

                  {/* Footnote */}
                  <div className="sup-integrations-footer">
                    <span>Plug &amp; Play · Real-time 2-way sync across all café outlets</span>
                  </div>
                </div>
              </div>
            </motion.article>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SupplierBentoFeatures;
