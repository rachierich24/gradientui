'use client';

import React from 'react';

export function SupplierAnalytics() {
  const accounts = [
    {
      name: 'Third Wave Coffee (Indiranagar)',
      volume: '22.0 KG / week',
      velocity: 'High Velocity',
      predicted: 'Tomorrow 09:00 AM',
      buffer: '1.2 days left',
      urgency: 'urgent',
    },
    {
      name: 'Blue Tokai Coffee (Koramangala)',
      volume: '14.2 KG / week',
      velocity: 'Consistent',
      predicted: 'Friday 08:30 AM',
      buffer: '3.4 days left',
      urgency: 'normal',
    },
    {
      name: 'Subko Specialty Coffee (Bandra)',
      volume: '18.5 KG / week',
      velocity: 'Expanding',
      predicted: 'Saturday 07:45 AM',
      buffer: '4.1 days left',
      urgency: 'normal',
    },
  ];

  return (
    <section className="sup-section-shell" id="analytics" aria-label="Supplier Analytics">
      <div className="sup-container">
        <div className="sup-section-header">
          <div className="sup-section-eyebrow">
            <span className="dot" />
            <span>PERFORMANCE TELEMETRY</span>
          </div>
          <h2 className="sup-section-title">
            Understand café demand trends before orders are placed.
          </h2>
          <p className="sup-section-desc">
            Actionable intelligence on consumption frequency, barista preferences, and predictive reorder warnings so you roast with confidence.
          </p>
        </div>

        <div className="sup-analytics-dashboard">
          {/* KPI Strip */}
          <div className="sup-analytics-kpi-row">
            <div className="sup-kpi-card">
              <div className="sup-kpi-label">Monthly Wholesale Volume</div>
              <div className="sup-kpi-value">
                <span>₹34.8L</span>
                <span className="sup-kpi-delta">↑ 18.4%</span>
              </div>
            </div>

            <div className="sup-kpi-card">
              <div className="sup-kpi-label">On-Time Fulfillment SLA</div>
              <div className="sup-kpi-value">
                <span>99.4%</span>
                <span className="sup-kpi-delta">Top Tier</span>
              </div>
            </div>

            <div className="sup-kpi-card">
              <div className="sup-kpi-label">Average Reorder Velocity</div>
              <div className="sup-kpi-value">
                <span>3.2d</span>
                <span className="sup-kpi-delta">Steady</span>
              </div>
            </div>

            <div className="sup-kpi-card">
              <div className="sup-kpi-label">Active Café Outlets</div>
              <div className="sup-kpi-value">
                <span>48</span>
                <span className="sup-kpi-delta">+6 MoM</span>
              </div>
            </div>
          </div>

          {/* Predictive Accounts & SLA breakdown */}
          <div className="sup-analytics-chart-row">
            {/* Predictive Accounts */}
            <div className="sup-chart-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--sup-text-primary)' }}>
                  Predictive Bean Reorder Signals
                </h4>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--sup-primary)', background: 'var(--sup-pale)', padding: '2px 8px', borderRadius: '4px' }}>
                  AI Burn-Rate Forecast
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {accounts.map((acc, i) => (
                  <div
                    key={i}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '10px',
                      padding: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '10px',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--sup-text-primary)' }}>
                        {acc.name}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--sup-text-secondary)', marginTop: '2px' }}>
                        Avg Consumption: {acc.volume} · {acc.velocity}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12.5px', fontWeight: 700, color: acc.urgency === 'urgent' ? '#DC2626' : 'var(--sup-forest)' }}>
                        Next PO: {acc.predicted}
                      </div>
                      <div style={{ fontSize: '11px', color: acc.urgency === 'urgent' ? '#DC2626' : 'var(--sup-text-secondary)' }}>
                        Buffer: {acc.buffer}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quality & SLA Dial */}
            <div className="sup-chart-box" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--sup-text-primary)', marginBottom: '8px' }}>
                  Quality &amp; SLA Compliance
                </h4>
                <p style={{ fontSize: '12.5px', color: 'var(--sup-text-secondary)', marginBottom: '18px' }}>
                  Audited weekly against barista check-in receipts and tamper seal verifications.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600 }}>
                      <span>Order Fulfillment Accuracy</span>
                      <span style={{ color: 'var(--sup-primary)' }}>99.8%</span>
                    </div>
                    <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '3px', marginTop: '4px', overflow: 'hidden' }}>
                      <div style={{ width: '99.8%', height: '100%', background: 'var(--sup-primary)' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600 }}>
                      <span>Degassing Valve Integrity</span>
                      <span style={{ color: 'var(--sup-primary)' }}>100.0%</span>
                    </div>
                    <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '3px', marginTop: '4px', overflow: 'hidden' }}>
                      <div style={{ width: '100%', height: '100%', background: 'var(--sup-primary)' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600 }}>
                      <span>Driver On-Time Arrival</span>
                      <span style={{ color: 'var(--sup-primary)' }}>99.1%</span>
                    </div>
                    <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '3px', marginTop: '4px', overflow: 'hidden' }}>
                      <div style={{ width: '99.1%', height: '100%', background: 'var(--sup-primary)' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ padding: '12px', background: 'var(--sup-pale)', borderRadius: '10px', fontSize: '11.5px', color: 'var(--sup-forest)', fontWeight: 600, marginTop: '20px' }}>
                ⭐ Premier Supplier Badge Active · Eligible for 0% Commission Tiers
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
