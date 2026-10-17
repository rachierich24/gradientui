'use client';

import React, { useState } from 'react';

export function SupplierWorkflowSteps() {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <section className="sup-section-shell alt-bg" id="workflow" aria-label="Ordering Lifecycle">
      <div className="sup-container">
        <div className="sup-section-header">
          <div className="sup-section-eyebrow">
            <span className="dot" />
            <span>ORDERING LIFECYCLE</span>
          </div>
          <h2 className="sup-section-title">
            From single checkout to completed morning delivery.
          </h2>
          <p className="sup-section-desc">
            A synchronized 3-step workflow engineered specifically for the operational rhythm of high-volume commercial roasters and café chains.
          </p>
        </div>

        <div className="sup-steps-grid">
          {/* ─── Step 1 ─── */}
          <div
            className="sup-step-card"
            style={{
              borderColor: activeStep === 1 ? 'var(--sup-primary)' : 'var(--sup-border)',
            }}
            onClick={() => setActiveStep(1)}
          >
            <div className="sup-step-num">01</div>
            <h3 className="sup-step-title">Consolidated PO Routing</h3>
            <p className="sup-step-desc">
              Cafés source whole-bean coffee, oat milk, and packaging in a single checkout. The Grabbit signal engine instantly isolates and routes your SKUs to your depot without multi-supplier clutter.
            </p>

            <div className="sup-step-preview">
              <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--sup-forest)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span>SIGNAL ROUTER</span>
                <span style={{ color: 'var(--sup-primary)' }}>AUTO-ISOLATED</span>
              </div>
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--sup-text-secondary)', textDecoration: 'line-through', opacity: 0.5 }}>
                  <span>12x Oat Milk 1L (Oatsome)</span>
                  <span>Routed to Dairy</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--sup-forest)', marginTop: '4px', background: 'var(--sup-pale)', padding: '4px 6px', borderRadius: '4px' }}>
                  <span>10 KG Arabica AA (Roast Depot)</span>
                  <span style={{ color: 'var(--sup-primary)' }}>→ YOUR DEPOT</span>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Step 2 ─── */}
          <div
            className="sup-step-card"
            style={{
              borderColor: activeStep === 2 ? 'var(--sup-primary)' : 'var(--sup-border)',
            }}
            onClick={() => setActiveStep(2)}
          >
            <div className="sup-step-num">02</div>
            <h3 className="sup-step-title">Instant Allocation &amp; Thermal Label</h3>
            <p className="sup-step-desc">
              Accept orders with one tap. Inventory is subtracted from active roasted lots, and packing staff get auto-generated thermal barcode shipping labels with degassing valve instructions.
            </p>

            <div className="sup-step-preview">
              <div style={{ background: '#FFFFFF', border: '1.5px dashed #94A3B8', borderRadius: '8px', padding: '10px', fontSize: '11px', textAlign: 'center' }}>
                <div style={{ fontWeight: 800, letterSpacing: '0.05em', color: 'var(--sup-text-primary)' }}>
                  GRABBIT DISPATCH LABEL
                </div>
                <div style={{ fontSize: '10px', color: 'var(--sup-text-secondary)', margin: '2px 0' }}>
                  BATCH #BT-409 · ROAST: TODAY 05:30 AM
                </div>
                <div style={{ letterSpacing: '3px', fontWeight: 700, fontSize: '14px', margin: '6px 0', fontFamily: 'monospace' }}>
                  ||||| | ||||| || |||
                </div>
                <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--sup-forest)' }}>
                  BLUE TOKAI KORAMANGALA · 10 KG
                </div>
              </div>
            </div>
          </div>

          {/* ─── Step 3 ─── */}
          <div
            className="sup-step-card"
            style={{
              borderColor: activeStep === 3 ? 'var(--sup-primary)' : 'var(--sup-border)',
            }}
            onClick={() => setActiveStep(3)}
          >
            <div className="sup-step-num">03</div>
            <h3 className="sup-step-title">Digital Proof of Delivery (ePOD)</h3>
            <p className="sup-step-desc">
              On arrival, the head barista inspects seals and signs digitally on tablet or smartphone. Verified timestamp, geolocation coordinates, and barcode match trigger automated payout.
            </p>

            <div className="sup-step-preview">
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', fontWeight: 700, marginBottom: '6px' }}>
                  <span style={{ color: 'var(--sup-forest)' }}>DIGITAL SIGN-OFF</span>
                  <span style={{ color: 'var(--sup-primary)' }}>GEO-VERIFIED ✓</span>
                </div>
                <div style={{ fontStyle: 'italic', fontFamily: 'cursive', fontSize: '17px', color: '#1E293B', padding: '4px 0', borderBottom: '1px solid #CBD5E1' }}>
                  Priya Sharma
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: 'var(--sup-text-secondary)', marginTop: '4px' }}>
                  <span>12:04:18 PM · Koramangala 80ft Rd</span>
                  <span style={{ fontWeight: 700, color: 'var(--sup-primary)' }}>ESCROW RELEASED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
