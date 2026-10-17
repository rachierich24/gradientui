'use client';

import React, { useState } from 'react';

export function SupplierIntegrations() {
  const [activeEvent, setActiveEvent] = useState<'po.created' | 'order.dispatched' | 'escrow.settled'>('po.created');

  const payloads = {
    'po.created': `{
  "event": "po.created",
  "timestamp": "2026-10-16T08:42:10Z",
  "order_id": "GRB-1048",
  "buyer": {
    "brand": "Blue Tokai Coffee",
    "outlet_id": "blr_krm_01",
    "contact": "Priya Sharma (Head Barista)"
  },
  "items": [
    { "sku": "COF-ARA-AA", "name": "Arabica AA", "qty_kg": 10, "unit_rate": 820.00 }
  ],
  "escrow_authorized": true,
  "escrow_amount_inr": 8200.00
}`,
    'order.dispatched': `{
  "event": "order.dispatched",
  "timestamp": "2026-10-16T11:20:00Z",
  "order_id": "GRB-1048",
  "fleet": {
    "carrier": "Grabbit Fleet EV Van 04",
    "driver": "Ramesh Kumar (+91 98450 11234)",
    "crate_rfid": "CRATE-C88"
  },
  "route": {
    "origin_depot": "blr_roastery_hub",
    "destination": "Blue Tokai Koramangala 80ft Rd",
    "eta": "12:05 PM"
  }
}`,
    'escrow.settled': `{
  "event": "escrow.settled",
  "timestamp": "2026-10-16T12:04:18Z",
  "order_id": "GRB-1048",
  "epod": {
    "signer": "Priya Sharma",
    "gps_coordinates": "12.9352° N, 77.6245° E",
    "tamper_seal_intact": true
  },
  "settlement": {
    "disbursed_to": "HDFC Current A/c #9940",
    "schedule": "T+1 09:00 AM",
    "status": "QUEUED_FOR_NEFT"
  }
}`,
  };

  return (
    <section className="sup-section-shell alt-bg" id="integrations" aria-label="Integrations & API">
      <div className="sup-container">
        <div className="sup-section-header">
          <div className="sup-section-eyebrow">
            <span className="dot" />
            <span>INTEGRATIONS &amp; CONNECTIVITY</span>
          </div>
          <h2 className="sup-section-title">
            Direct two-way sync with the software your business uses.
          </h2>
          <p className="sup-section-desc">
            No duplicate data entry. Seamless connectivity with your accounting software, ERP databases, and café communications.
          </p>
        </div>

        <div className="sup-integrations-grid">
          {/* Card 1 */}
          <div className="sup-integration-card">
            <div className="sup-integration-top">
              <div className="sup-integration-icon">₹</div>
              <span className="sup-integration-status">Certified Sync</span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--sup-text-primary)', marginBottom: '8px' }}>
              Tally &amp; Zoho Books Sync
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--sup-text-secondary)', lineHeight: 1.55 }}>
              Push completed purchase orders straight into your general ledger. Automated GST-compliant e-invoicing with IRN and QR codes generated without manual paperwork.
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', gap: '8px', fontSize: '11.5px', fontWeight: 600, color: 'var(--sup-forest)' }}>
              <span>✓ Tally Prime</span>
              <span>✓ Zoho Books</span>
              <span>✓ QuickBooks</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="sup-integration-card">
            <div className="sup-integration-top">
              <div className="sup-integration-icon" style={{ background: '#DCF8C6', color: '#075E54' }}>
                WA
              </div>
              <span className="sup-integration-status">Automated Signals</span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--sup-text-primary)', marginBottom: '8px' }}>
              WhatsApp Business Engine
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--sup-text-secondary)', lineHeight: 1.55 }}>
              Café store managers and roastery dispatchers get automated WhatsApp pings with live van tracking URLs, driver contact cards, and digital delivery confirmations.
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', gap: '8px', fontSize: '11.5px', fontWeight: 600, color: 'var(--sup-forest)' }}>
              <span>✓ Instant Push</span>
              <span>✓ Driver Cards</span>
              <span>✓ PDF Receipts</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="sup-integration-card">
            <div className="sup-integration-top">
              <div className="sup-integration-icon" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
                {'{ }'}
              </div>
              <span className="sup-integration-status">99.98% SLA</span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--sup-text-primary)', marginBottom: '8px' }}>
              Warehouse ERP &amp; REST APIs
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--sup-text-secondary)', lineHeight: 1.55 }}>
              Real-time webhooks dispatch instant JSON events for warehouse inventory management, bar-coding systems, and custom roast-scheduling pipelines.
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', gap: '8px', fontSize: '11.5px', fontWeight: 600, color: 'var(--sup-forest)' }}>
              <span>✓ Sub-100ms Webhooks</span>
              <span>✓ HMAC Signatures</span>
            </div>
          </div>
        </div>

        {/* Live Webhook Simulator */}
        <div className="sup-webhook-simulator">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
              <span style={{ marginLeft: '8px', color: '#94A3B8', fontSize: '12px' }}>
                POST /api/v1/webhooks/supplier-events
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setActiveEvent('po.created')}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  background: activeEvent === 'po.created' ? 'var(--sup-primary)' : 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                po.created
              </button>
              <button
                type="button"
                onClick={() => setActiveEvent('order.dispatched')}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  background: activeEvent === 'order.dispatched' ? 'var(--sup-primary)' : 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                order.dispatched
              </button>
              <button
                type="button"
                onClick={() => setActiveEvent('escrow.settled')}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  background: activeEvent === 'escrow.settled' ? 'var(--sup-primary)' : 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                escrow.settled
              </button>
            </div>
          </div>

          <pre style={{ margin: 0, overflowX: 'auto', color: '#A7F3D0', lineHeight: 1.45 }}>
            {payloads[activeEvent]}
          </pre>
        </div>
      </div>
    </section>
  );
}
