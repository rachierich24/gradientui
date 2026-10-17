'use client';

import React, { useState } from 'react';

export function SupplierInventory() {
  const [selectedTier, setSelectedTier] = useState<'public' | 'tierA' | 'tierB'>('tierA');
  const [lotPushed, setLotPushed] = useState(false);

  const skus = [
    {
      sku: 'COF-ARA-AA',
      name: 'Arabica AA Estate (Washed)',
      stock: '420 KG',
      status: 'optimal',
      publicPrice: '₹1,150',
      tierAPrice: '₹820',
      tierBPrice: '₹890',
      moq: '5 KG',
    },
    {
      sku: 'COF-MON-MAL',
      name: 'Monsoon Malabar AA (Sun-Dried)',
      stock: '180 KG',
      status: 'optimal',
      publicPrice: '₹1,050',
      tierAPrice: '₹790',
      tierBPrice: '₹850',
      moq: '10 KG',
    },
    {
      sku: 'PKG-VLV-1KG',
      name: 'Matte Black 1KG Pouches (Valve)',
      stock: '45 Pcs',
      status: 'low',
      publicPrice: '₹28 / pc',
      tierAPrice: '₹18 / pc',
      tierBPrice: '₹22 / pc',
      moq: '100 Pcs',
    },
    {
      sku: 'SEA-ETH-YIRG',
      name: 'Seasonal: Ethiopia Yirgacheffe G1',
      stock: '60 KG',
      status: 'optimal',
      publicPrice: '₹1,950',
      tierAPrice: '₹1,450',
      tierBPrice: '₹1,600',
      moq: '2 KG',
    },
  ];

  return (
    <section className="sup-section-shell" id="inventory" aria-label="Inventory & Catalogue">
      <div className="sup-container">
        <div className="sup-section-header">
          <div className="sup-section-eyebrow">
            <span className="dot" />
            <span>INVENTORY &amp; CATALOGUE</span>
          </div>
          <h2 className="sup-section-title">
            Private pricing, live MOQ controls, and batch expiry tracking.
          </h2>
          <p className="sup-section-desc">
            Maintain complete control over who sees your wholesale catalogue, isolate negotiated volume discounts behind private walls, and prevent stock-outs.
          </p>
        </div>

        <div className="sup-inv-cockpit">
          <div className="sup-inv-tabs">
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--sup-forest)', marginRight: '8px' }}>
              ACTIVE PRICING WALL:
            </span>
            <button
              type="button"
              className={`sup-inv-tab ${selectedTier === 'tierA' ? 'active' : ''}`}
              onClick={() => setSelectedTier('tierA')}
            >
              🔒 Tier A (10+ Outlets · Negotiated ₹820)
            </button>
            <button
              type="button"
              className={`sup-inv-tab ${selectedTier === 'tierB' ? 'active' : ''}`}
              onClick={() => setSelectedTier('tierB')}
            >
              🔒 Tier B (Indie Coffee Bars · ₹890)
            </button>
            <button
              type="button"
              className={`sup-inv-tab ${selectedTier === 'public' ? 'active' : ''}`}
              onClick={() => setSelectedTier('public')}
            >
              🌐 Public Directory Rate
            </button>
          </div>

          <div className="sup-inv-grid">
            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table className="sup-inv-table">
                <thead>
                  <tr>
                    <th>SKU / Product</th>
                    <th>Available Stock</th>
                    <th>Active Wholesale Rate</th>
                    <th>Min Order</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {skus.map((item) => (
                    <tr key={item.sku}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--sup-text-secondary)', fontFamily: 'monospace' }}>
                          {item.sku}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{item.stock}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--sup-forest)' }}>
                          {selectedTier === 'public'
                            ? item.publicPrice
                            : selectedTier === 'tierA'
                            ? item.tierAPrice
                            : item.tierBPrice}
                        </span>
                        {selectedTier !== 'public' && (
                          <span style={{ fontSize: '10px', color: 'var(--sup-primary)', marginLeft: '4px' }}>
                            (Walled)
                          </span>
                        )}
                      </td>
                      <td style={{ color: 'var(--sup-text-secondary)' }}>{item.moq}</td>
                      <td>
                        <span className={`sup-inv-stock-badge ${item.status}`}>
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: item.status === 'optimal' ? '#166534' : '#991B1B',
                            }}
                          />
                          {item.status === 'optimal' ? 'In Stock' : 'Low Stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Side Card */}
            <div className="sup-inv-sidecard">
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--sup-primary)', letterSpacing: '0.08em', marginBottom: '4px' }}>
                  PAR-STOCK REORDER ALERTS
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--sup-text-primary)' }}>
                  Automated Depletion Signals
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--sup-text-secondary)', marginTop: '4px' }}>
                  Matte Black 1KG Pouches dipped below your 100-pc safety buffer. Supplier purchase requisition generated.
                </p>
              </div>

              <div style={{ padding: '12px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600 }}>
                  <span>Pouch Inventory</span>
                  <span style={{ color: '#DC2626' }}>45 / 250 units (18%)</span>
                </div>
                <div style={{ height: '6px', background: '#FEE2E2', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
                  <div style={{ width: '18%', height: '100%', background: '#DC2626', borderRadius: '3px' }} />
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--sup-forest)', marginBottom: '8px' }}>
                  SEASONAL HARVEST BROADCAST
                </div>
                <button
                  type="button"
                  onClick={() => setLotPushed(true)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    background: lotPushed ? 'var(--sup-pale)' : 'var(--sup-primary)',
                    color: lotPushed ? 'var(--sup-forest)' : '#FFFFFF',
                    border: '1px solid rgba(21, 128, 61, 0.3)',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {lotPushed ? '✓ Published to 48 Partner Cafés' : '⚡ Push Ethiopia Micro-Lot to 48 Cafés'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
