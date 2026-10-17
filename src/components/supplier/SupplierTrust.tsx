'use client';

import React from 'react';

export function SupplierTrust() {
  return (
    <section className="sup-section-shell" id="trust" aria-label="Trust and Compliance">
      <div className="sup-container">
        <div className="sup-section-header">
          <div className="sup-section-eyebrow">
            <span className="dot" />
            <span>TRUST &amp; COMPLIANCE</span>
          </div>
          <h2 className="sup-section-title">
            Built for enterprise reliability and wholesale compliance.
          </h2>
          <p className="sup-section-desc">
            Every café and roaster on Grabbit is authenticated for commercial safety, licensing, and trade legitimacy.
          </p>
        </div>

        <div className="sup-trust-grid">
          {/* Card 1 */}
          <div className="sup-trust-card">
            <div className="sup-trust-badge-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3 style={{ fontSize: '19px', fontWeight: 700, color: 'var(--sup-text-primary)', marginBottom: '8px' }}>
              FSSAI &amp; GST Verified
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--sup-text-secondary)', lineHeight: 1.6 }}>
              100% of network participants are authenticated with valid food safety certificates, GST registrations, and commercial entity records before placing or receiving wholesale POs.
            </p>
            <div style={{ marginTop: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: 'var(--sup-primary)', background: 'var(--sup-pale)', padding: '4px 10px', borderRadius: '6px' }}>
              <span>✓ Certified Network Members</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="sup-trust-card">
            <div className="sup-trust-badge-icon" style={{ background: '#FEF3C7', color: '#B45309' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h3 style={{ fontSize: '19px', fontWeight: 700, color: 'var(--sup-text-primary)', marginBottom: '8px' }}>
              Tenant Isolation Security
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--sup-text-secondary)', lineHeight: 1.6 }}>
              Your private negotiated price tiers, café buyer relationships, and historical roast batch recipes remain fully encrypted and strictly isolated from competitor visibility.
            </p>
            <div style={{ marginTop: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#B45309', background: '#FEF3C7', padding: '4px 10px', borderRadius: '6px' }}>
              <span>✓ 256-Bit Encrypted Vault</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="sup-trust-card">
            <div className="sup-trust-badge-icon" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <h3 style={{ fontSize: '19px', fontWeight: 700, color: 'var(--sup-text-primary)', marginBottom: '8px' }}>
              99.98% High Availability
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--sup-text-secondary)', lineHeight: 1.6 }}>
              Engineered on geo-redundant clusters to withstand early-morning ordering surges between 05:00 AM and 08:00 AM without order drops or dispatch delays.
            </p>
            <div style={{ marginTop: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#1D4ED8', background: '#EFF6FF', padding: '4px 10px', borderRadius: '6px' }}>
              <span>✓ Enterprise SLA Guaranteed</span>
            </div>
          </div>
        </div>

        {/* Live Heartbeat Strip */}
        <div style={{ marginTop: '36px', background: '#FFFFFF', border: '1px solid var(--sup-border)', borderRadius: '14px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--sup-fresh)', boxShadow: '0 0 0 4px rgba(34, 197, 94, 0.2)' }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--sup-text-primary)' }}>
              All Network Systems Operational
            </span>
          </div>

          <div style={{ display: 'flex', gap: '24px', fontSize: '12px', color: 'var(--sup-text-secondary)' }}>
            <span>Escrow Settlement Node: <strong style={{ color: 'var(--sup-primary)' }}>Online</strong></span>
            <span>API Gateway Latency: <strong style={{ color: 'var(--sup-forest)' }}>38ms</strong></span>
            <span>Uptime (Trailing 90d): <strong style={{ color: 'var(--sup-forest)' }}>99.99%</strong></span>
          </div>
        </div>
      </div>
    </section>
  );
}
