'use client';

import React, { useState } from 'react';

export function SupplierCta({ onJoinClick }: { onJoinClick?: () => void }) {
  const [businessName, setBusinessName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onJoinClick) {
      onJoinClick();
    }
  };

  return (
    <section className="sup-section-shell" id="cta" aria-label="Join as a Supplier" style={{ background: '#FFFFFF', padding: '120px 0' }}>
      <div className="sup-container">
        <div className="sup-closing-cta-card">
          {/* Left Column */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '9999px', background: 'rgba(255, 255, 255, 0.12)', border: '1px solid rgba(255, 255, 255, 0.2)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--sup-fresh)', marginBottom: '20px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--sup-fresh)' }} />
              <span>JOIN 340+ VERIFIED WHOLESALE SUPPLIERS</span>
            </div>

            <h2 className="sup-closing-cta-title">
              Ready to streamline your wholesale café supply?
            </h2>

            <p className="sup-closing-cta-desc">
              Receive structured orders, eliminate WhatsApp chaos, sync with your roaster production queue, and automate guaranteed next-day bank settlement.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.12)' }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF' }}>340+</div>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>Verified Roasters</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--sup-fresh)' }}>₹48 Cr+</div>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>Fulfilled via Escrow</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF' }}>T+1</div>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>Guaranteed Payout</div>
              </div>
            </div>
          </div>

          {/* Right Column: Quick Onboarding Card */}
          <div className="sup-closing-form">
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
              Get verified in under 2 hours
            </h3>
            <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.75)', marginBottom: '20px' }}>
              Enter your roastery, dairy, or wholesale business name to start priority verification.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '6px' }}>
                  Business / Roastery Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Subko Specialty Roasters"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '9px',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    fontSize: '14px',
                    color: '#0F172A',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '6px' }}>
                  Primary Supply Category
                </label>
                <select
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '9px',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    fontSize: '14px',
                    color: '#0F172A',
                    outline: 'none',
                  }}
                  defaultValue="Specialty Coffee Roaster"
                >
                  <option value="Specialty Coffee Roaster">Specialty Coffee Roaster (Single Origin &amp; Blends)</option>
                  <option value="Commercial Dairy & Oat Milk">Wholesale Dairy, Oat &amp; Plant Milk</option>
                  <option value="Eco Packaging & Takeaway Supplies">Biodegradable Packaging &amp; Cups</option>
                  <option value="Syrups, Matcha & Bakery Premixes">Beverage Syrups, Matcha &amp; Bakery</option>
                </select>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  marginTop: '8px',
                  padding: '13px',
                  borderRadius: '9px',
                  background: 'var(--sup-fresh)',
                  color: '#064E3B',
                  fontWeight: 700,
                  fontSize: '14.5px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(34, 197, 94, 0.3)',
                  transition: 'transform 0.15s ease',
                }}
              >
                <span>Apply as Verified Supplier</span>
                <span>→</span>
              </button>

              <div style={{ textAlign: 'center', fontSize: '11.5px', color: 'rgba(255, 255, 255, 0.6)', marginTop: '4px' }}>
                🔒 Zero onboarding fee · FSSAI &amp; GST required
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
