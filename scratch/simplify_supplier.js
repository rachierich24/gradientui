const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/landing/ProductSections.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const startMarker = '<main\n                  ref={mainScrollRef}\n                  className={`dashboard-main ${activeFeature !== null ? \'has-active-feature\' : \'\'}`}\n                  onScroll={() => setHasScrolled(true)}\n                  tabIndex={0}\n                  aria-label="Scrollable supplier operational workspace"\n                >';

// In case CRLF
const startMarkerCRLF = '<main\r\n                  ref={mainScrollRef}\r\n                  className={`dashboard-main ${activeFeature !== null ? \'has-active-feature\' : \'\'}`}\r\n                  onScroll={() => setHasScrolled(true)}\r\n                  tabIndex={0}\r\n                  aria-label="Scrollable supplier operational workspace"\r\n                >';

const endMarker = '</main>\n              </div>\n            </motion.div>\n          </div>\n\n          {/* Right: Minimal, Typographic Editorial */}';
const endMarkerCRLF = '</main>\r\n              </div>\r\n            </motion.div>\r\n          </div>\r\n\r\n          {/* Right: Minimal, Typographic Editorial */}';

let startIdx = content.indexOf(startMarker);
if (startIdx === -1) startIdx = content.indexOf(startMarkerCRLF);

let endIdx = content.indexOf(endMarker);
if (endIdx === -1) endIdx = content.indexOf(endMarkerCRLF);

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not find markers for supplier', { startIdx, endIdx });
  process.exit(1);
}

const replacement = `<main
                  ref={mainScrollRef}
                  className="dashboard-main"
                  tabIndex={0}
                  aria-label="Supplier operational workspace"
                >
                  {/* Top Navigation Bar */}
                  <div className="dashboard-top-nav">
                    <div className="dashboard-heading-group">
                      <div className="dashboard-title-row">
                        <h3 className="dashboard-page-title">Wholesale Operations</h3>
                        <span className="dash-date-indicator">Today · 27 Sep 2026</span>
                      </div>
                      <span className="dashboard-page-subtitle">RoastSupply & Dairy Co. · Bangalore Indiranagar Hub</span>
                    </div>

                    <div className="dashboard-top-nav-right">
                      <span className="status-pill status-available">
                        <span className="status-dot" aria-hidden="true" />
                        34 Orders Synced
                      </span>
                      <button
                        type="button"
                        className="dash-btn-primary"
                        onClick={handleSimulateWhatsAppPO}
                      >
                        <span>+</span>
                        <span>Simulate WhatsApp PO</span>
                      </button>
                    </div>
                  </div>

                  {/* Linear Core Journey Pipeline (Clean & Minimal) */}
                  <div className="linear-core-pipeline" role="region" aria-label="Wholesale Lifecycle Pipeline">
                    <div className="pipeline-stage">
                      <span className="pipeline-step-badge">01 Ingest</span>
                      <span className="pipeline-step-title">WhatsApp POs</span>
                      <span className="pipeline-step-proof">34 Auto-Parsed</span>
                    </div>
                    <span className="pipeline-arrow-separator">➔</span>
                    <div className="pipeline-stage">
                      <span className="pipeline-step-badge">02 Production</span>
                      <span className="pipeline-step-title">Roast Batching</span>
                      <span className="pipeline-step-proof">180kg Scheduled</span>
                    </div>
                    <span className="pipeline-arrow-separator">➔</span>
                    <div className="pipeline-stage">
                      <span className="pipeline-step-badge">03 Dispatch</span>
                      <span className="pipeline-step-title">Morning Routes</span>
                      <span className="pipeline-step-proof">3 Vans · 07:30 Cutoff</span>
                    </div>
                    <span className="pipeline-arrow-separator">➔</span>
                    <div className="pipeline-stage">
                      <span className="pipeline-step-badge">04 Settlement</span>
                      <span className="pipeline-step-title">T+1 Bank Payout</span>
                      <span className="pipeline-step-proof">₹1.84L HDFC</span>
                    </div>
                  </div>

                  {/* Three High-Signal Metrics */}
                  <div className="dashboard-overview-row">
                    <div className="dashboard-stat">
                      <span className="stat-label">Today's Demand (34 Cafés)</span>
                      <div className="stat-value">₹1.84L</div>
                      <div className="stat-trend positive">
                        <span>↑ 18.4% volume</span>
                        <span className="stat-context">100% WhatsApp auto-parsed</span>
                      </div>
                    </div>

                    <div className="dashboard-stat">
                      <span className="stat-label">Batch Roast #4 Scheduled</span>
                      <div className="stat-value">180 kg</div>
                      <div className="stat-trend positive">
                        <span>● 06:00 AM Roaster 1</span>
                        <span className="stat-context">Arabica Medium Roast</span>
                      </div>
                    </div>

                    <div className="dashboard-stat">
                      <span className="stat-label">T+1 Automated Settlement</span>
                      <div className="stat-value" style={{ color: '#15803D' }}>₹1.84L</div>
                      <div className="stat-trend positive">
                        <span>✓ HDFC Disbursed</span>
                        <span className="stat-context">Zero bad debt guarantee</span>
                      </div>
                    </div>
                  </div>

                  {/* Clean 2-Column Bento Workspace */}
                  <div className="dashboard-bento">
                    {/* Left: Live WhatsApp PO Stream */}
                    <div className="dashboard-card" style={{ padding: '10px 12px' }}>
                      <div className="card-header">
                        <div>
                          <span className="card-title">Live WhatsApp PO Stream</span>
                          <span className="card-subtitle">AI converts voice & text orders into verified POs</span>
                        </div>
                        <button
                          type="button"
                          className="table-action-btn"
                          style={{ background: '#DCFCE7', color: '#166534', borderColor: '#BBF7D0' }}
                          onClick={handleSimulateWhatsAppPO}
                        >
                          + Simulate Incoming PO
                        </button>
                      </div>

                      <div className="simple-order-list">
                        {whatsappPOs.slice(0, 4).map((po) => (
                          <div
                            key={po.id}
                            className="simple-order-card"
                            onClick={() => showToast(\`Order manifest opened for \${po.cafe} (\${po.amount})\`)}
                          >
                            <div className="simple-card-header">
                              <span className="simple-card-title">{po.cafe}</span>
                              <span className={\`status-pill status-\${po.status === 'Picked' ? 'processing' : po.status === 'In Van #1' ? 'transit' : 'available'}\`}>
                                <span className="status-dot" aria-hidden="true" />
                                {po.status}
                              </span>
                            </div>
                            <div className="simple-card-meta">{po.location} · {po.time}</div>
                            <div className="simple-card-body">{po.rawText}</div>
                            <div className="simple-card-footer">
                              <span style={{ color: '#166534', fontWeight: 600 }}>➔ {po.parsedSummary}</span>
                              <span style={{ fontWeight: 800, color: '#0F172A', fontFamily: 'var(--font-mono, monospace)' }}>{po.amount}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: Production Roasting & Van Route Dispatch */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {/* Batch Roasting Card */}
                      <div className="dashboard-card" style={{ padding: '10px 12px' }}>
                        <div className="card-header">
                          <span className="card-title">⚡ Batch Roast #4</span>
                          <span style={{ fontSize: '9.5px', color: '#166534', fontWeight: 700 }}>180 kg Arabica</span>
                        </div>
                        <div style={{ fontSize: '9.5px', color: '#64748B', marginBottom: '6px' }}>
                          Consolidated across 34 café POs · Scheduled 05:00 AM
                        </div>
                        <div style={{ height: '5px', borderRadius: '99px', background: '#F1F5F9', overflow: 'hidden', marginBottom: '8px' }}>
                          <div style={{ width: '82%', height: '100%', background: '#16A34A', borderRadius: '99px' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: '#334155' }}>
                          <span>Roasted: <strong>148 kg</strong></span>
                          <span>Finishing: <strong>32 kg</strong></span>
                        </div>
                      </div>

                      {/* Morning Route Dispatch */}
                      <div className="dashboard-card" style={{ padding: '10px 12px' }}>
                        <div className="card-header">
                          <span className="card-title">🚚 Morning Fleet Clusters</span>
                          <span className="status-pill status-transit">07:30 Cutoff</span>
                        </div>
                        <div className="simple-route-strip">
                          <div className="simple-route-row">
                            <span><strong>Van #1</strong> (Driver: Ramesh)</span>
                            <span style={{ color: '#166534', fontWeight: 600 }}>14 Drops · Indiranagar</span>
                          </div>
                          <div className="simple-route-row">
                            <span><strong>Van #2</strong> (Driver: Suresh)</span>
                            <span style={{ color: '#166534', fontWeight: 600 }}>11 Drops · Koramangala</span>
                          </div>
                          <div className="simple-route-row">
                            <span><strong>Van #3</strong> (Driver: Imran)</span>
                            <span style={{ color: '#166534', fontWeight: 600 }}>9 Drops · CBD & Lavelle</span>
                          </div>
                        </div>
                      </div>

                      {/* Stripe Automated Bank Settlement Card */}
                      <div className="dashboard-card" style={{ padding: '10px 12px', background: '#F0FDF4', borderColor: '#BBF7D0' }}>
                        <div className="card-header" style={{ marginBottom: '2px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#14532D' }}>T+1 Automated Bank Settlement</span>
                          <span style={{ fontSize: '9px', color: '#166534', fontWeight: 600 }}>UTR: HDFC-99281048</span>
                        </div>
                        <div style={{ fontSize: '9.5px', color: '#166534', lineHeight: 1.4 }}>
                          <strong>₹1,84,200.00</strong> auto-disbursed at 06:00 AM IST directly to HDFC Bank account.
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #DCFCE7' }}>
                          <span style={{ fontSize: '9px', color: '#15803D', fontWeight: 700 }}>✓ Zero Bad Debt Escrow</span>
                          <button
                            type="button"
                            className="table-action-btn"
                            style={{ fontSize: '9px', padding: '2px 6px' }}
                            onClick={() => showToast('GST reconciliation ledger exported to Tally')}
                          >
                            Tally GST Sync
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                `;

const newContent = content.substring(0, startIdx) + replacement + content.substring(endIdx);
fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Successfully simplified SupplierSection!');
