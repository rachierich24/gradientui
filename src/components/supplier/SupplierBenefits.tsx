'use client';

import React, { useState } from 'react';

export function SupplierBenefits() {
  const [parsed, setParsed] = useState(true);
  const [activeBlend, setActiveBlend] = useState<'arabica' | 'blend'>('arabica');

  return (
    <section className="sup-section-shell" id="benefits" aria-label="Operational Benefits">
      <div className="sup-container">
        <div className="sup-section-header">
          <div className="sup-section-eyebrow">
            <span className="dot" />
            <span>OPERATIONAL EXCELLENCE</span>
          </div>
          <h2 className="sup-section-title">
            Why 340+ wholesale suppliers run their operations on Grabbit.
          </h2>
          <p className="sup-section-desc">
            Eliminate communication fragmentation, protect your margins with private pricing, and automate daily production scheduling.
          </p>
        </div>

        <div className="sup-bento-grid">
          {/* ─── Bento Card 1: Zero WhatsApp Chaos (Span 2) ─── */}
          <div className="sup-bento-card span-2">
            <div className="sup-bento-card-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              <span>Automated Signal Ingestion</span>
            </div>
            <h3 className="sup-bento-card-title">Zero WhatsApp Chaos</h3>
            <p className="sup-bento-card-desc">
              Auto-parse incoming voice notes, chaotic chat threads, and late-night messages into standardized digital purchase orders with verified SKUs, grind profiles, and cutoff times.
            </p>

            <div className="sup-wa-transformer">
              {/* Left: Raw WhatsApp Message */}
              <div className="sup-wa-chat-bubble">
                <div className="sup-wa-sender">
                  <span>Priya (Blue Tokai)</span>
                  <span style={{ fontWeight: 400, opacity: 0.7 }}>08:42 AM</span>
                </div>
                <div>
                  &quot;Hey bhaiya Koramangala outlet needs 10kg Arabica AA by 12:00 PM please grind medium-fine for espresso and send bill.&quot;
                </div>
                <div className="sup-wa-audio-bar">
                  <span>▶</span>
                  <span style={{ letterSpacing: '2px' }}>ılılllıılıl</span>
                  <span>0:14 voice note</span>
                </div>
              </div>

              {/* Center: Transform Indicator */}
              <div className="sup-wa-arrow">
                <div className="sup-wa-arrow-badge">AI PARSED</div>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>

              {/* Right: Structured PO */}
              <div className="sup-po-result">
                <div className="sup-po-header">
                  <span style={{ color: 'var(--sup-forest)' }}>PO #GRB-1048</span>
                  <span style={{ color: 'var(--sup-primary)' }}>● ESCROW LOCKED</span>
                </div>
                <div className="sup-po-item">Arabica AA Estate (10 KG)</div>
                <div className="sup-po-meta">
                  <span>Grind: Medium-Fine</span>
                  <span>Slot: Today 12:05 PM</span>
                </div>
                <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700 }}>
                  <span>Tariff: ₹8,200</span>
                  <span style={{ color: 'var(--sup-primary)' }}>Ready to Pack ✓</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setParsed(!parsed)}
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--sup-primary)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>{parsed ? '↺ Reset Simulation' : '▶ Simulate Auto-Extraction'}</span>
              </button>
            </div>
          </div>

          {/* ─── Bento Card 2: Guaranteed T+1 Bank Settlement ─── */}
          <div className="sup-bento-card">
            <div className="sup-bento-card-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <span>Liquidity Protection</span>
            </div>
            <h3 className="sup-bento-card-title">Guaranteed T+1 Payout</h3>
            <p className="sup-bento-card-desc">
              Eliminate bad debt risk and 45-day invoice chasing. Every PO is funded into commercial escrow before dispatch and disbursed directly to your current account.
            </p>

            <div className="sup-escrow-track">
              <div className="sup-escrow-row">
                <div className="sup-escrow-icon done">✓</div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--sup-text-primary)' }}>Escrow Funded</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--sup-text-secondary)' }}>₹8,200 held securely at checkout</div>
                </div>
              </div>

              <div className="sup-escrow-row">
                <div className="sup-escrow-icon done">✓</div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--sup-text-primary)' }}>Barista ePOD Signed</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--sup-text-secondary)' }}>GPS verified delivery at Koramangala</div>
                </div>
              </div>

              <div className="sup-escrow-row">
                <div className="sup-escrow-icon done" style={{ background: 'var(--sup-forest)', color: '#fff' }}>₹</div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--sup-forest)' }}>Disbursed: 09:00 AM T+1</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--sup-text-secondary)' }}>HDFC Current A/c #9940</div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', fontWeight: 600, color: 'var(--sup-forest)' }}>
              <span>0 Days DSO</span>
              <span>100% Escrow Backed</span>
            </div>
          </div>

          {/* ─── Bento Card 3: Batch Roast Scheduling ─── */}
          <div className="sup-bento-card">
            <div className="sup-bento-card-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
              </svg>
              <span>Production Synchronization</span>
            </div>
            <h3 className="sup-bento-card-title">Consolidated Batching</h3>
            <p className="sup-bento-card-desc">
              Aggregate morning café demand into synchronized batch runs before your 6:00 AM roastery production starts. Zero roasted bean waste.
            </p>

            <div className="sup-roast-calc">
              <div className="sup-roast-header">
                <span style={{ color: 'var(--sup-text-primary)' }}>
                  {activeBlend === 'arabica' ? 'Batch A: Arabica AA 100%' : 'Batch B: House Blend 80/20'}
                </span>
                <span style={{ color: 'var(--sup-primary)' }}>94% Load</span>
              </div>
              <div className="sup-roast-bar-bg">
                <div className="sup-roast-bar-fill" style={{ width: activeBlend === 'arabica' ? '94%' : '88%' }} />
              </div>
              <div className="sup-roast-breakdown">
                <span>Aggregated: 33 KG</span>
                <span>Probat 35KG Roaster</span>
              </div>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setActiveBlend('arabica')}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: activeBlend === 'arabica' ? '1px solid var(--sup-primary)' : '1px solid var(--sup-border)',
                  background: activeBlend === 'arabica' ? 'var(--sup-pale)' : '#FFFFFF',
                  color: activeBlend === 'arabica' ? 'var(--sup-forest)' : 'var(--sup-text-secondary)',
                }}
              >
                Arabica AA
              </button>
              <button
                type="button"
                onClick={() => setActiveBlend('blend')}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: activeBlend === 'blend' ? '1px solid var(--sup-primary)' : '1px solid var(--sup-border)',
                  background: activeBlend === 'blend' ? 'var(--sup-pale)' : '#FFFFFF',
                  color: activeBlend === 'blend' ? 'var(--sup-forest)' : 'var(--sup-text-secondary)',
                }}
              >
                House Espresso
              </button>
            </div>
          </div>

          {/* ─── Bento Card 4: Multi-Outlet Routing (Span 2) ─── */}
          <div className="sup-bento-card span-2">
            <div className="sup-bento-card-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>Multi-Outlet Chain Accounts</span>
            </div>
            <h3 className="sup-bento-card-title">Centralized Multi-Store Hierarchy</h3>
            <p className="sup-bento-card-desc">
              Serve 10+ café outlets under a single umbrella brand account. Centralized corporate billing with decentralized local dispatch and custom delivery windows per outlet.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginTop: 'auto' }}>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--sup-forest)' }}>OUTLET 01 · KORAMANGALA</div>
                <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '4px' }}>10 KG · 12:05 PM</div>
                <div style={{ fontSize: '11px', color: 'var(--sup-primary)', marginTop: '2px' }}>● In Transit (Van 04)</div>
              </div>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--sup-forest)' }}>OUTLET 02 · INDIRANAGAR</div>
                <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '4px' }}>15 KG · 01:30 PM</div>
                <div style={{ fontSize: '11px', color: '#B45309', marginTop: '2px' }}>● Packed &amp; Staged</div>
              </div>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--sup-forest)' }}>OUTLET 03 · WHITEFIELD</div>
                <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '4px' }}>20 KG · Tomorrow 08 AM</div>
                <div style={{ fontSize: '11px', color: 'var(--sup-text-muted)', marginTop: '2px' }}>● Scheduled</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
