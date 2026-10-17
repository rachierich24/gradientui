'use client';

import React, { useState } from 'react';

export function SupplierOperationPath({ onJoinClick }: { onJoinClick?: () => void }) {
  const [activeTab, setActiveTab] = useState<'fleet' | 'byo'>('fleet');

  return (
    <section className="sup-section-shell" id="operation-path" aria-label="Choose Your Operation Path">
      <div className="sup-container">
        {/* Header (Relume two-column layout) */}
        <div className="sup-path-header-row">
          <div className="sup-path-left-col">
            <div className="sup-path-eyebrow">
              CHOOSE YOUR OPERATION
            </div>
            <h2 className="sup-path-title">
              Fulfill on Grabbit Fleet, or dispatch with your own logistics.
            </h2>
          </div>

          <div className="sup-path-right-col">
            <p className="sup-path-desc">
              Everything synchronizes through the same order protocol. Deploy Grabbit&apos;s temperature-monitored EV cargo fleet and returnable crates, or connect your in-house drivers and 3PL partners with our driver mobile ePOD app. Same system, your call.
            </p>
          </div>
        </div>

        {/* 2-Column Asymmetric Showcase (Relume pattern) */}
        <div className="sup-path-showcase-grid">
          {/* Card 1: Grabbit Fleet */}
          <div className={`sup-path-card ${activeTab === 'fleet' ? 'active' : ''}`} onClick={() => setActiveTab('fleet')}>
            <div className="sup-path-card-badge">
              <span className="sup-badge-dot" />
              <span>GRABBIT EV FLEET</span>
            </div>

            <h3 className="sup-path-card-title">
              Plug-and-play morning delivery runs with returnable crates
            </h3>

            <p className="sup-path-card-desc">
              Zero vehicle capex or driver management headaches. Our temperature-monitored EV cargo vans pick up from your roastery depot at 09:00 AM and complete morning café deliveries with live telemetry.
            </p>

            <div className="sup-path-card-actions">
              <button
                type="button"
                className="sup-path-btn-primary"
                onClick={onJoinClick}
              >
                <span>Deploy Grabbit Fleet</span>
                <span>→</span>
              </button>
              <a href="#dispatch" className="sup-path-btn-secondary">
                View Crate #C-88 Tracking
              </a>
            </div>

            {/* Interactive Feature Visual Preview */}
            <div className="sup-path-visual-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--sup-forest)' }}>
                  EV CARGO RUN · KORAMANGALA HUB
                </span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--sup-primary)', background: 'var(--sup-pale)', padding: '2px 8px', borderRadius: '4px' }}>
                  ● EN ROUTE
                </span>
              </div>

              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600 }}>Driver: Ramesh Kumar</span>
                  <span style={{ color: 'var(--sup-text-secondary)' }}>Van 04 (Tata Ace EV)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--sup-forest)', fontWeight: 700 }}>
                  <span>Returnable Crates: 4x #C-88</span>
                  <span style={{ color: 'var(--sup-primary)' }}>Temp: 4.2°C (Optimal)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: BYO Fleet & 3PL */}
          <div className={`sup-path-card ${activeTab === 'byo' ? 'active' : ''}`} onClick={() => setActiveTab('byo')}>
            <div className="sup-path-card-badge" style={{ background: '#FEF3C7', color: '#B45309', borderColor: 'rgba(180, 83, 9, 0.2)' }}>
              <span className="sup-badge-dot" style={{ background: '#B45309' }} />
              <span>YOUR OWN DRIVERS &amp; 3PL</span>
            </div>

            <h3 className="sup-path-card-title">
              Equip your in-house fleet with the Driver Mobile ePOD app
            </h3>

            <p className="sup-path-card-desc">
              Already have delivery staff or trusted logistics partners? Simply issue our mobile app for instant barcode scanning, waypoint navigation, and barista digital signatures that release your funds.
            </p>

            <div className="sup-path-card-actions">
              <button
                type="button"
                className="sup-path-btn-primary"
                onClick={onJoinClick}
              >
                <span>Download Driver App</span>
                <span>→</span>
              </button>
              <a href="#integrations" className="sup-path-btn-secondary">
                Explore Tally / ERP Sync
              </a>
            </div>

            {/* Mobile App Visual Preview */}
            <div className="sup-path-visual-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--sup-forest)' }}>
                  DRIVER SMARTPHONE APP
                </span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#B45309', background: '#FEF3C7', padding: '2px 8px', borderRadius: '4px' }}>
                  TAP TO SIGN
                </span>
              </div>

              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600 }}>Destination: Blue Tokai Koramangala</span>
                  <span style={{ color: 'var(--sup-primary)', fontWeight: 700 }}>ARRIVED ✓</span>
                </div>
                <div style={{ fontStyle: 'italic', fontFamily: 'cursive', fontSize: '15px', color: '#1E293B', padding: '4px 0', borderBottom: '1px solid #E2E8F0' }}>
                  Priya Sharma (Barista)
                </div>
                <div style={{ fontSize: '10px', color: 'var(--sup-text-secondary)', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>PO #GRB-1048 Verified</span>
                  <span style={{ fontWeight: 700, color: 'var(--sup-primary)' }}>₹8,200 Unlocked for T+1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
