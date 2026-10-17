'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export function SupplierBentoFeatures() {
  const prefersReduced = useReducedMotion();
  const isReduced = prefersReduced ?? false;

  // Tile 1 interactive state
  const [activeBubble, setActiveBubble] = useState<number>(1);

  // Tile 4 interactive state: workflow step
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<number>(2);

  // Tile 5 interactive state: selected stock alert
  const [selectedStock, setSelectedStock] = useState<string>('arabica');

  return (
    <section
      className="sup-bento-section"
      id="features"
      aria-label="Core Supplier Capabilities"
    >
      <div className="sup-container">
        {/* ─── A. SECTION INTRODUCTION (Ramp Two-Tone Style) ─── */}
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
            <a href="#join" className="sup-bento-btn-primary">
              Switch in days, not months
            </a>
            <a href="#demo" className="sup-bento-btn-secondary">
              View Demo
            </a>
          </div>
        </motion.div>

        {/* ─── B. FIVE-TILE ASYMMETRIC BENTO GRID ─── */}
        <div className="sup-bento-grid-wrapper">
          {/* ══════════════════════════════════════════════════════════════
              TOP ROW: 2 Prominent Cards (Tile 1 ~60% | Tile 2 ~40%)
             ══════════════════════════════════════════════════════════════ */}
          <div className="sup-bento-row sup-bento-top-row">
            {/* ─── TILE 1: ORDER MANAGEMENT (~60% width) ─── */}
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
                    <span>↗</span>
                  </div>
                </div>

                {/* ─── Miniature Interface Preview: Physical Card + Floating Dialogue ─── */}
                <div className="sup-bento-preview-container sup-preview-card-canvas">
                  {/* Subtle Background Pattern & Dark Grabbit Card */}
                  <div className="sup-dispatch-card-graphic" aria-hidden="true">
                    <div className="sup-card-graphic-top">
                      <div className="sup-card-logo">
                        <span className="sup-card-g">G</span>
                        <span className="sup-card-brand">grabbit</span>
                      </div>
                      <span className="sup-card-tier-badge">PRIME SUPPLIER</span>
                    </div>
                    <div className="sup-card-chip">
                      <div className="sup-card-chip-lines" />
                    </div>
                    <div className="sup-card-graphic-bottom">
                      <span className="sup-card-num">•••• 2048</span>
                      <span className="sup-card-label">DISPATCH TERMINAL #02</span>
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
                      <div className="sup-bubble-sub">We&apos;re matching your inventory... no action needed!</div>
                    </div>
                  </div>

                  {/* Floating Notification Card 2 (Bottom Right) */}
                  <div
                    className={`sup-floating-bubble bubble-bottom ${activeBubble === 2 ? 'focused' : ''}`}
                    onClick={() => setActiveBubble(2)}
                  >
                    <div className="sup-bubble-check">✓</div>
                    <div className="sup-bubble-content">
                      <div className="sup-bubble-title">Order #GR-2048 verified &amp; dispatched</div>
                      <div className="sup-bubble-sub">
                        <span className="sup-bubble-sub-highlight">📦 Matched to &quot;Morning Shift Priority&quot;</span> · Bay 02
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.article>

            {/* ─── TILE 2: CATALOGUE BUILDING (~40% width) ─── */}
            <motion.article
              className="sup-bento-card sup-bento-card-catalogue"
              initial={isReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.55, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="sup-bento-card-inner">
                {/* Header */}
                <div className="sup-bento-card-header">
                  <h3 className="sup-bento-title">
                    Wholesale catalogue <span className="text-hushed">ready for business</span>
                  </h3>
                  <div className="sup-bento-arrow-affordance" aria-hidden="true">
                    <span>↗</span>
                  </div>
                </div>

                {/* ─── Miniature Interface Preview: macOS App Window (Catalogue) ─── */}
                <div className="sup-bento-preview-container sup-mac-window">
                  {/* macOS Window Top Bar */}
                  <div className="sup-mac-header">
                    <div className="sup-mac-dots" aria-hidden="true">
                      <span className="dot dot-red" />
                      <span className="dot dot-yellow" />
                      <span className="dot dot-green" />
                    </div>
                    <div className="sup-mac-address-bar">
                      <span>grabbit.app/catalogue</span>
                    </div>
                    <div className="sup-mac-action">
                      <span className="sup-mac-pill-btn">+ SKU</span>
                    </div>
                  </div>

                  {/* Window Content: Clean Catalogue List */}
                  <div className="sup-mac-content">
                    <div className="sup-cat-table">
                      {/* Product Row 1 */}
                      <div className="sup-cat-line-item">
                        <span className="sup-cat-idx">01</span>
                        <div className="sup-cat-meta">
                          <span className="sup-cat-title">Specialty Arabica AA</span>
                          <span className="sup-cat-spec">1 kg valve bag · Whole bean</span>
                        </div>
                        <div className="sup-cat-numbers">
                          <span className="sup-cat-price">₹820</span>
                          <span className="sup-cat-stock-pill in-stock">140 kg</span>
                        </div>
                      </div>

                      {/* Product Row 2 */}
                      <div className="sup-cat-line-item">
                        <span className="sup-cat-idx">02</span>
                        <div className="sup-cat-meta">
                          <span className="sup-cat-title">Barista Oat Milk</span>
                          <span className="sup-cat-spec">Case of 12 · 1 L cartons</span>
                        </div>
                        <div className="sup-cat-numbers">
                          <span className="sup-cat-price">₹2,880</span>
                          <span className="sup-cat-stock-pill in-stock">68 cases</span>
                        </div>
                      </div>

                      {/* Product Row 3 */}
                      <div className="sup-cat-line-item">
                        <span className="sup-cat-idx">03</span>
                        <div className="sup-cat-meta">
                          <span className="sup-cat-title">Cold Brew Concentrate</span>
                          <span className="sup-cat-spec">2 L single origin jug</span>
                        </div>
                        <div className="sup-cat-numbers">
                          <span className="sup-cat-price">₹1,150</span>
                          <span className="sup-cat-stock-pill in-stock">42 units</span>
                        </div>
                      </div>
                    </div>

                    {/* Private Wholesale Rates Bar */}
                    <div className="sup-private-rate-bar">
                      <span className="rate-lock-icon">🔒</span>
                      <span>Private Pricing: Cafés only see their approved contract rates</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.article>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              BOTTOM ROW: 3 Balanced Cards (Tile 3 | Tile 4 | Tile 5)
             ══════════════════════════════════════════════════════════════ */}
          <div className="sup-bento-row sup-bento-bottom-row">
            {/* ─── TILE 3: NEW SUPPLIER VISIBILITY (1/3 width) ─── */}
            <motion.article
              className="sup-bento-card sup-bento-card-visibility"
              initial={isReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.55, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="sup-bento-card-inner">
                {/* Header */}
                <div className="sup-bento-card-header">
                  <h3 className="sup-bento-title">
                    New café visibility <span className="text-hushed">where buyers search</span>
                  </h3>
                  <div className="sup-bento-arrow-affordance" aria-hidden="true">
                    <span>↗</span>
                  </div>
                </div>

                {/* ─── Miniature Interface Preview: macOS App Window (Buyer Matches) ─── */}
                <div className="sup-bento-preview-container sup-mac-window">
                  {/* macOS Header */}
                  <div className="sup-mac-header">
                    <div className="sup-mac-dots" aria-hidden="true">
                      <span className="dot dot-red" />
                      <span className="dot dot-yellow" />
                      <span className="dot dot-green" />
                    </div>
                    <div className="sup-mac-search-bar">
                      <span>🔍 Filter 300+ cafés...</span>
                    </div>
                    <span className="sup-verified-badge">✓ Verified</span>
                  </div>

                  {/* Window Content: Matched Cafés Table */}
                  <div className="sup-mac-content">
                    <div className="sup-vis-match-list">
                      {/* Match 1 */}
                      <div className="sup-vis-match-row">
                        <div className="sup-vis-cafe-avatar">SB</div>
                        <div className="sup-vis-cafe-info">
                          <span className="sup-vis-cafe-name">Subko Specialty</span>
                          <span className="sup-vis-cafe-query">Looking for Arabica AA</span>
                        </div>
                        <span className="sup-vis-match-badge high">98% match</span>
                      </div>

                      {/* Match 2 */}
                      <div className="sup-vis-match-row">
                        <div className="sup-vis-cafe-avatar">DG</div>
                        <div className="sup-vis-cafe-info">
                          <span className="sup-vis-cafe-name">The Daily Grind</span>
                          <span className="sup-vis-cafe-query">Bulk Oat Milk · 5 outlets</span>
                        </div>
                        <span className="sup-vis-match-badge high">95% match</span>
                      </div>

                      {/* Match 3 */}
                      <div className="sup-vis-match-row">
                        <div className="sup-vis-cafe-avatar">AK</div>
                        <div className="sup-vis-cafe-info">
                          <span className="sup-vis-cafe-name">Araku Roasters</span>
                          <span className="sup-vis-cafe-query">Cold Brew Concentrate</span>
                        </div>
                        <span className="sup-vis-match-badge med">92% match</span>
                      </div>
                    </div>

                    {/* Weekly Reach Banner */}
                    <div className="sup-vis-weekly-banner">
                      <span className="sup-vis-eye-icon">👁</span>
                      <span><strong>38 specialty cafés</strong> viewed catalogue this week</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.article>

            {/* ─── TILE 4: WHATSAPP WORKFLOW AUTOMATION (1/3 width) ─── */}
            <motion.article
              className="sup-bento-card sup-bento-card-whatsapp"
              initial={isReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.55, delay: 0.27, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="sup-bento-card-inner">
                {/* Header */}
                <div className="sup-bento-card-header">
                  <h3 className="sup-bento-title">
                    Turn chats <span className="text-hushed">into automated workflows</span>
                  </h3>
                  <div className="sup-bento-arrow-affordance" aria-hidden="true">
                    <span>↗</span>
                  </div>
                </div>

                {/* ─── Miniature Interface Preview: macOS App Window (WhatsApp Gateway) ─── */}
                <div className="sup-bento-preview-container sup-mac-window">
                  {/* macOS Header */}
                  <div className="sup-mac-header">
                    <div className="sup-mac-dots" aria-hidden="true">
                      <span className="dot dot-red" />
                      <span className="dot dot-yellow" />
                      <span className="dot dot-green" />
                    </div>
                    <div className="sup-mac-address-bar">
                      <span>grabbit.app/whatsapp-gateway</span>
                    </div>
                    <span className="sup-wa-connected-badge">🟢 24/7 Agent</span>
                  </div>

                  {/* Window Content: Conversation + Pipeline */}
                  <div className="sup-mac-content">
                    {/* Chat Messages */}
                    <div className="sup-wa-thread-ramp">
                      <div className="sup-wa-msg incoming">
                        <div className="sup-wa-msg-sender">Priya · Araku Flagship (08:14 AM)</div>
                        <div className="sup-wa-msg-body">
                          &quot;Need 15kg Arabica AA + 4 crates Oat Milk by 11 AM tomorrow.&quot;
                        </div>
                      </div>

                      <div className="sup-wa-msg outgoing">
                        <div className="sup-wa-msg-sender">Grabbit Autonomous Agent (08:15 AM · ✓✓)</div>
                        <div className="sup-wa-msg-body">
                          <strong>PO #GR-2051</strong> logged &amp; verified. Invoiced ₹18,400 with contract rate applied. Delivery: 10:30 AM.
                        </div>
                      </div>
                    </div>

                    {/* Pipeline Stage Tracker */}
                    <div className="sup-wa-pipeline-ramp">
                      <div className={`sup-pipe-stage ${activeWorkflowStep >= 1 ? 'done' : ''}`}>
                        <span className="sup-pipe-icon">✓</span>
                        <span className="sup-pipe-text">Received</span>
                      </div>
                      <span className="sup-pipe-divider" />
                      <div className={`sup-pipe-stage ${activeWorkflowStep >= 2 ? 'done' : ''}`}>
                        <span className="sup-pipe-icon">✓</span>
                        <span className="sup-pipe-text">Invoiced</span>
                      </div>
                      <span className="sup-pipe-divider" />
                      <div className={`sup-pipe-stage ${activeWorkflowStep >= 3 ? 'done' : 'active'}`}>
                        <span className="sup-pipe-icon">●</span>
                        <span className="sup-pipe-text">Bay Dispatch</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.article>

            {/* ─── TILE 5: EARLY STOCK-OUT ALERTS (1/3 width) ─── */}
            <motion.article
              className="sup-bento-card sup-bento-card-alerts"
              initial={isReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.55, delay: 0.34, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="sup-bento-card-inner">
                {/* Header */}
                <div className="sup-bento-card-header">
                  <h3 className="sup-bento-title">
                    Stock alerts <span className="text-hushed">before depletion happens</span>
                  </h3>
                  <div className="sup-bento-arrow-affordance" aria-hidden="true">
                    <span>↗</span>
                  </div>
                </div>

                {/* ─── Miniature Interface Preview: macOS App Window (Inventory Telemetry) ─── */}
                <div className="sup-bento-preview-container sup-mac-window">
                  {/* macOS Header */}
                  <div className="sup-mac-header">
                    <div className="sup-mac-dots" aria-hidden="true">
                      <span className="dot dot-red" />
                      <span className="dot dot-yellow" />
                      <span className="dot dot-green" />
                    </div>
                    <div className="sup-mac-address-bar">
                      <span>grabbit.app/telemetry</span>
                    </div>
                    <span className="sup-alert-status-pill">⚠️ 1 Low Stock</span>
                  </div>

                  {/* Window Content: Depletion Telemetry */}
                  <div className="sup-mac-content">
                    <div className="sup-stock-telemetry-list">
                      {/* Stock Item 1: Urgent Alert */}
                      <div
                        className={`sup-stock-item-ramp ${selectedStock === 'arabica' ? 'selected' : ''}`}
                        onClick={() => setSelectedStock('arabica')}
                      >
                        <div className="sup-stock-header-row">
                          <span className="sup-stock-title">Arabica Beans AA</span>
                          <span className="sup-stock-urgency-badge warning">8 kg left · 1.2d</span>
                        </div>
                        <div className="sup-stock-progress-track">
                          <div className="sup-stock-progress-fill warning" style={{ width: '18%' }} />
                        </div>
                        <div className="sup-stock-action-inline">
                          <span>⚡ 1-Click Auto-Draft PO (50 kg) →</span>
                        </div>
                      </div>

                      {/* Stock Item 2: Healthy */}
                      <div
                        className={`sup-stock-item-ramp ${selectedStock === 'oat' ? 'selected' : ''}`}
                        onClick={() => setSelectedStock('oat')}
                      >
                        <div className="sup-stock-header-row">
                          <span className="sup-stock-title">Barista Oat Milk</span>
                          <span className="sup-stock-urgency-badge healthy">24 cases · 4.8d</span>
                        </div>
                        <div className="sup-stock-progress-track">
                          <div className="sup-stock-progress-fill healthy" style={{ width: '68%' }} />
                        </div>
                        <div className="sup-stock-info-inline">
                          <span>Buffer healthy · Next café cutoff in 14 hrs</span>
                        </div>
                      </div>
                    </div>
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
