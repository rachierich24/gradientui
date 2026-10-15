const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/landing/ProductSections.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Find BrandSection's <main ...
const brandSectionIdx = content.indexOf('function BrandSection(');
if (brandSectionIdx === -1) {
  console.error('Could not find function BrandSection');
  process.exit(1);
}

const mainTagStart = content.indexOf('<main', brandSectionIdx);
const mainTagEnd = content.indexOf('</main>', mainTagStart);

if (mainTagStart === -1 || mainTagEnd === -1) {
  console.error('Could not find main tag for BrandSection', { mainTagStart, mainTagEnd });
  process.exit(1);
}

const replacement = `<main
                  ref={mainScrollRef}
                  className="dashboard-main"
                  tabIndex={0}
                  aria-label="Brand growth and telemetry workspace"
                >
                  {/* Top Navigation */}
                  <div className="dashboard-top-nav">
                    <div className="dashboard-heading-group">
                      <div className="dashboard-title-row">
                        <h3 className="dashboard-page-title">Brand OS Telemetry</h3>
                        <span className="dash-date-indicator">Q3 · Active Distribution</span>
                      </div>
                      <span className="dashboard-page-subtitle">Origins Beverage &amp; Oat Co. · Specialty Café Distribution</span>
                    </div>

                    <div className="dashboard-top-nav-right">
                      <span className="status-pill" style={{ background: '#F5F3FF', color: '#6D28D9', borderColor: '#DDD6FE' }}>
                        <span className="status-dot" style={{ background: '#7C3AED' }} aria-hidden="true" />
                        312 Cafés Reached
                      </span>
                      <button
                        type="button"
                        className="dash-btn-primary"
                        style={{ background: '#7C3AED' }}
                        onClick={() => setShowNewCampaignModal(true)}
                      >
                        <span>+</span>
                        <span>Deploy Sampling Flight</span>
                      </button>
                    </div>
                  </div>

                  {/* Linear Core Journey Pipeline */}
                  <div className="linear-core-pipeline" role="region" aria-label="Brand Distribution Lifecycle Pipeline">
                    <div className="pipeline-stage">
                      <span className="pipeline-step-badge" style={{ color: '#7C3AED', background: '#F5F3FF' }}>01 Seed</span>
                      <span className="pipeline-step-title">Sampling Flights</span>
                      <span className="pipeline-step-proof">312 Cafés</span>
                    </div>
                    <span className="pipeline-arrow-separator">➔</span>
                    <div className="pipeline-stage">
                      <span className="pipeline-step-badge" style={{ color: '#7C3AED', background: '#F5F3FF' }}>02 Cupping</span>
                      <span className="pipeline-step-title">Barista Feedback</span>
                      <span className="pipeline-step-proof">94.2% Approval</span>
                    </div>
                    <span className="pipeline-arrow-separator">➔</span>
                    <div className="pipeline-stage">
                      <span className="pipeline-step-badge" style={{ color: '#7C3AED', background: '#F5F3FF' }}>03 Convert</span>
                      <span className="pipeline-step-title">Standing POs</span>
                      <span className="pipeline-step-proof">78% Reorder Rate</span>
                    </div>
                    <span className="pipeline-arrow-separator">➔</span>
                    <div className="pipeline-stage">
                      <span className="pipeline-step-badge" style={{ color: '#7C3AED', background: '#F5F3FF' }}>04 Velocity</span>
                      <span className="pipeline-step-title">Direct Telemetry</span>
                      <span className="pipeline-step-proof">₹4.82L/mo MRR</span>
                    </div>
                  </div>

                  {/* Three High-Signal Metrics */}
                  <div className="dashboard-overview-row">
                    <div className="dashboard-stat">
                      <span className="stat-label">Active Specialty Cafés</span>
                      <div className="stat-value" style={{ color: '#6D28D9' }}>312</div>
                      <div className="stat-trend positive">
                        <span>↑ 28 New this month</span>
                        <span className="stat-context">Bangalore, Mumbai, Delhi</span>
                      </div>
                    </div>

                    <div className="dashboard-stat">
                      <span className="stat-label">Barista Sensory Approval</span>
                      <div className="stat-value">94.2%</div>
                      <div className="stat-trend positive">
                        <span>★ 4.9 / 5.0 (SCA scale)</span>
                        <span className="stat-context">141 Cupping reviews logged</span>
                      </div>
                    </div>

                    <div className="dashboard-stat">
                      <span className="stat-label">Recurring Wholesale GMV</span>
                      <div className="stat-value" style={{ color: '#15803D' }}>₹4.82L</div>
                      <div className="stat-trend positive">
                        <span>✓ 78% Trial Reorder</span>
                        <span className="stat-context">Standing weekly Net-15 POs</span>
                      </div>
                    </div>
                  </div>

                  {/* Clean 2-Column Bento Workspace */}
                  <div className="dashboard-bento">
                    {/* Left: Active Sampling Flights */}
                    <div className="dashboard-card" style={{ padding: '10px 12px' }}>
                      <div className="card-header">
                        <div>
                          <span className="card-title">Active Sampling Flights</span>
                          <span className="card-subtitle">Direct seeding to verified barista stations</span>
                        </div>
                        <button
                          type="button"
                          className="table-action-btn"
                          style={{ background: '#F5F3FF', color: '#6D28D9', borderColor: '#DDD6FE' }}
                          onClick={() => setShowNewCampaignModal(true)}
                        >
                          + New Flight
                        </button>
                      </div>

                      <div className="simple-flight-list">
                        {campaigns.slice(0, 4).map((c) => (
                          <div
                            key={c.title}
                            className="simple-flight-card"
                            onClick={() => showToast(\`Telemetry view opened for \${c.title} (\${c.approval})\`)}
                          >
                            <div className="simple-card-header">
                              <span className="simple-card-title">{c.title}</span>
                              <span className="status-pill" style={{ background: '#F5F3FF', color: '#6D28D9' }}>
                                <span className="status-dot" style={{ background: '#7C3AED' }} aria-hidden="true" />
                                {c.status}
                              </span>
                            </div>
                            <div className="simple-card-meta">{c.metro} · {c.cafes} · {c.period}</div>
                            <div className="simple-card-body">{c.product} — seeded directly to espresso stations</div>
                            <div className="simple-card-footer">
                              <span style={{ color: '#6D28D9', fontWeight: 600 }}>★ {c.approval} ({c.reorderRate} reorder)</span>
                              <span style={{ fontWeight: 800, color: '#0F172A', fontFamily: 'var(--font-mono, monospace)' }}>{c.revenue} GMV</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: Barista Scorecard & Wholesale Conversion Engine */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {/* Barista Sensory Scorecard */}
                      <div className="dashboard-card" style={{ padding: '10px 12px' }}>
                        <div className="card-header">
                          <span className="card-title">☕ Barista Cupping Scorecard</span>
                          <span style={{ fontSize: '9.5px', color: '#7C3AED', fontWeight: 700 }}>94.2% (SCA Standard)</span>
                        </div>
                        <div style={{ fontSize: '9.5px', color: '#64748B', marginBottom: '8px' }}>
                          Aggregated from 141 blind cupping trials across 3 metros
                        </div>

                        {/* Attribute progress bars */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: '#334155', marginBottom: '2px' }}>
                              <span>Microfoam Gloss &amp; Texture</span>
                              <strong>9.8 / 10</strong>
                            </div>
                            <div style={{ height: '4px', borderRadius: '99px', background: '#F1F5F9', overflow: 'hidden' }}>
                              <div style={{ width: '98%', height: '100%', background: '#7C3AED', borderRadius: '99px' }} />
                            </div>
                          </div>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: '#334155', marginBottom: '2px' }}>
                              <span>Steam Stability (Past 65°C)</span>
                              <strong>9.6 / 10</strong>
                            </div>
                            <div style={{ height: '4px', borderRadius: '99px', background: '#F1F5F9', overflow: 'hidden' }}>
                              <div style={{ width: '96%', height: '100%', background: '#7C3AED', borderRadius: '99px' }} />
                            </div>
                          </div>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: '#334155', marginBottom: '2px' }}>
                              <span>Acidity Balance in Light Roasts</span>
                              <strong>9.4 / 10</strong>
                            </div>
                            <div style={{ height: '4px', borderRadius: '99px', background: '#F1F5F9', overflow: 'hidden' }}>
                              <div style={{ width: '94%', height: '100%', background: '#7C3AED', borderRadius: '99px' }} />
                            </div>
                          </div>
                        </div>

                        {/* Recent Barista quote */}
                        <div style={{ padding: '6px 8px', borderRadius: '6px', background: '#F8FAFC', border: '1px solid rgba(23, 23, 23, 0.05)', fontSize: '9px', color: '#475569', fontStyle: 'italic', lineHeight: 1.35 }}>
                          &ldquo;Microfoam holds glossy latte art past 65°C with zero curdling in high-acidity roasts.&rdquo;
                          <div style={{ fontStyle: 'normal', fontWeight: 600, color: '#1E293B', marginTop: '3px' }}>
                            — Head Barista Vikram, Third Wave Coffee
                          </div>
                        </div>
                      </div>

                      {/* Standing Wholesale Reorder Engine */}
                      <div className="dashboard-card" style={{ padding: '10px 12px', background: '#FAF5FF', borderColor: '#E9D5FF' }}>
                        <div className="card-header" style={{ marginBottom: '2px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#581C87' }}>Wholesale Conversion Engine</span>
                          <span style={{ fontSize: '9px', color: '#7C3AED', fontWeight: 600 }}>Net-15 Auto-Debit</span>
                        </div>
                        <div style={{ fontSize: '9.5px', color: '#6B21A8', lineHeight: 1.4 }}>
                          <strong>78% of approved tastings</strong> automatically convert to weekly recurring wholesale orders.
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #F3E8FF' }}>
                          <span style={{ fontSize: '9px', color: '#7C3AED', fontWeight: 700 }}>₹4.82L Active Monthly GMV</span>
                          <button
                            type="button"
                            className="table-action-btn"
                            style={{ fontSize: '9px', padding: '2px 6px' }}
                            onClick={() => showToast('Dispatched 20 additional barista tasting flights')}
                          >
                            + Seed 20 Cafés
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Accessible New Campaign Modal */}
                  {showNewCampaignModal && (
                    <div className="dash-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-brand-campaign-title">
                      <div className="dash-modal-card">
                        <div className="dash-modal-header">
                          <h4 className="dash-modal-title" id="modal-brand-campaign-title">Deploy Barista Sampling Flight</h4>
                          <button
                            type="button"
                            className="dash-modal-close"
                            onClick={() => setShowNewCampaignModal(false)}
                            aria-label="Close modal"
                          >
                            ✕
                          </button>
                        </div>
                        <form onSubmit={handleCreateCampaign}>
                          <div className="dash-form-row">
                            <label className="dash-form-label" htmlFor="brand-campaign-title">Campaign Title</label>
                            <input
                              type="text"
                              id="brand-campaign-title"
                              className="dash-form-input"
                              placeholder="e.g. Nitro Cold Brew Autumn Launch"
                              value={newCampaignTitle}
                              onChange={(e) => setNewCampaignTitle(e.target.value)}
                              required
                            />
                          </div>
                          <div className="dash-form-row" style={{ marginTop: '8px' }}>
                            <label className="dash-form-label" htmlFor="brand-product-select">Target Product SKU</label>
                            <select
                              className="dash-form-select"
                              id="brand-product-select"
                              value={newCampaignProduct}
                              onChange={(e) => setNewCampaignProduct(e.target.value)}
                            >
                              <option>Barista Oat Milk (Steam-Stable)</option>
                              <option>Nitro Cold Brew Single-Origin Canisters</option>
                              <option>Kyoto Ceremonial Uji Matcha</option>
                              <option>Madagascar Vanilla &amp; Cascara Syrups</option>
                            </select>
                          </div>
                          <div className="dash-form-row" style={{ marginTop: '8px' }}>
                            <label className="dash-form-label" htmlFor="brand-metro-select">Target Metro Hub</label>
                            <select
                              className="dash-form-select"
                              id="brand-metro-select"
                              value={newCampaignMetro}
                              onChange={(e) => setNewCampaignMetro(e.target.value as any)}
                            >
                              <option value="Bangalore">Bangalore (148 Specialty Cafés)</option>
                              <option value="Mumbai">Mumbai (98 Specialty Cafés)</option>
                              <option value="Delhi-NCR">Delhi NCR (66 Specialty Cafés)</option>
                            </select>
                          </div>
                          <div className="dash-modal-actions" style={{ marginTop: '12px' }}>
                            <button type="button" className="dash-btn-ghost" onClick={() => setShowNewCampaignModal(false)}>Cancel</button>
                            <button type="submit" className="dash-btn-primary" style={{ background: '#7C3AED' }}>
                              Deploy Sampling Flight
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </main>`;

const endMarker = '</main>';
const endIdx = content.indexOf(endMarker, mainTagStart) + endMarker.length;

const newContent = content.substring(0, mainTagStart) + replacement + content.substring(endIdx);
fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Successfully simplified BrandSection!');
