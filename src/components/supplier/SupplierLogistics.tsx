'use client';

import React, { useState } from 'react';

export function SupplierLogistics() {
  const [selectedRoute, setSelectedRoute] = useState<'koramangala' | 'indiranagar' | 'whitefield'>('koramangala');

  return (
    <section className="sup-section-shell alt-bg" id="dispatch" aria-label="Logistics & Dispatch">
      <div className="sup-container">
        <div className="sup-section-header">
          <div className="sup-section-eyebrow">
            <span className="dot" />
            <span>LOGISTICS &amp; DISPATCH</span>
          </div>
          <h2 className="sup-section-title">
            Clustered morning delivery runs with live carrier tracking.
          </h2>
          <p className="sup-section-desc">
            Cut transit overhead, optimize van payloads, and trace every reusable crate across your city hub with automated reverse logistics.
          </p>
        </div>

        <div className="sup-logistics-grid">
          {/* Map & Route Clustering Card */}
          <div className="sup-logistics-map-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sup-fresh)' }}>
                  DISPATCH CLUSTERING ENGINE
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: 800, marginTop: '2px' }}>
                  City Hub Delivery Loops
                </h3>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedRoute('koramangala')}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: selectedRoute === 'koramangala' ? 'var(--sup-fresh)' : 'rgba(255,255,255,0.1)',
                    color: selectedRoute === 'koramangala' ? '#064E3B' : '#FFFFFF',
                    border: 'none',
                  }}
                >
                  Koramangala
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRoute('indiranagar')}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: selectedRoute === 'indiranagar' ? 'var(--sup-fresh)' : 'rgba(255,255,255,0.1)',
                    color: selectedRoute === 'indiranagar' ? '#064E3B' : '#FFFFFF',
                    border: 'none',
                  }}
                >
                  Indiranagar
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRoute('whitefield')}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: selectedRoute === 'whitefield' ? 'var(--sup-fresh)' : 'rgba(255,255,255,0.1)',
                    color: selectedRoute === 'whitefield' ? '#064E3B' : '#FFFFFF',
                    border: 'none',
                  }}
                >
                  Whitefield
                </button>
              </div>
            </div>

            {/* Live Route Radar Preview */}
            <div style={{ background: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px', padding: '20px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '16px' }}>
                <span>Route: {selectedRoute === 'koramangala' ? 'South-East Ring (6 Drops)' : selectedRoute === 'indiranagar' ? '100ft Road Loop (4 Drops)' : 'Outer Ring Road (5 Drops)'}</span>
                <span style={{ color: 'var(--sup-fresh)', fontWeight: 700 }}>Van 04 (EV Cargo)</span>
              </div>

              {/* Waypoints */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--sup-fresh)', boxShadow: '0 0 8px var(--sup-fresh)' }} />
                  <div style={{ fontSize: '13px' }}>
                    <span style={{ fontWeight: 700 }}>Depot Hub</span>
                    <span style={{ color: 'rgba(255,255,255,0.6)', marginLeft: '8px' }}>Departed 09:15 AM</span>
                  </div>
                </div>

                <div style={{ height: '16px', borderLeft: '2px dashed rgba(255,255,255,0.3)', marginLeft: '4px' }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }} />
                  <div style={{ fontSize: '13px' }}>
                    <span style={{ fontWeight: 700 }}>Stop 01: Blue Tokai Koramangala</span>
                    <span style={{ color: 'var(--sup-fresh)', marginLeft: '8px', fontWeight: 600 }}>● Active Unload</span>
                  </div>
                </div>

                <div style={{ height: '16px', borderLeft: '2px dashed rgba(255,255,255,0.3)', marginLeft: '4px' }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }} />
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                    <span>Stop 02: Maverick &amp; Farmer (80ft Rd)</span>
                    <span style={{ marginLeft: '8px', fontSize: '11px' }}>ETA 12:40 PM</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Payload</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>92 KG</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Mileage Saved</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--sup-fresh)' }}>-32.4%</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Fleet Type</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>100% Electric</div>
                </div>
              </div>
            </div>
          </div>

          {/* Returnable Crate Tracking Card */}
          <div className="sup-logistics-crate-card">
            <div className="sup-crate-badge">
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--sup-primary)' }} />
              <span>RETURNABLE ASSET TRACKING</span>
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--sup-text-primary)' }}>
              Crate #C-88 Lifecycle
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--sup-text-secondary)', marginTop: '4px' }}>
              Heavy-duty forest green crates with RFID &amp; QR tracking reduce corrugated carton waste while preventing plastic loss.
            </p>

            <div className="sup-crate-visual">
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--sup-forest)' }}>
                DISPATCH POD · CRATE #C-88
              </div>
              <div style={{ fontSize: '12px', color: 'var(--sup-text-secondary)', marginTop: '2px' }}>
                Ventilated Polypropylene · 45L Capacity
              </div>
              <div style={{ margin: '10px 0', display: 'flex', justifyContent: 'center' }}>
                <span style={{ background: '#DCFCE7', color: '#166534', fontSize: '11.5px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px' }}>
                  ● AT CAFÉ (Blue Tokai Koramangala)
                </span>
              </div>
            </div>

            <div className="sup-crate-timeline">
              <div className="sup-crate-step">
                <div className="sup-crate-dot" />
                <div>
                  <div style={{ fontWeight: 600 }}>09:15 AM · Depot Dispatch Scan</div>
                  <div style={{ fontSize: '11px', color: 'var(--sup-text-secondary)' }}>Scanned out by Roastery Logistics team</div>
                </div>
              </div>

              <div className="sup-crate-step">
                <div className="sup-crate-dot active" />
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--sup-forest)' }}>10:45 AM · Barista Handover</div>
                  <div style={{ fontSize: '11px', color: 'var(--sup-text-secondary)' }}>Received by Head Barista Priya · Koramangala</div>
                </div>
              </div>

              <div className="sup-crate-step">
                <div className="sup-crate-dot" style={{ background: '#CBD5E1' }} />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--sup-text-muted)' }}>04:00 PM · Scheduled Collection</div>
                  <div style={{ fontSize: '11px', color: 'var(--sup-text-secondary)' }}>Driver Ramesh collects empty crate on return run</div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--sup-border)', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: 'var(--sup-text-secondary)' }}>Crate Loss Rate</span>
              <span style={{ fontWeight: 700, color: 'var(--sup-primary)' }}>&lt; 0.02% across 1,200 runs</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
