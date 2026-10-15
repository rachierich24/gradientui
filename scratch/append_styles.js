const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../src/app/product-sections.css');
let css = fs.readFileSync(cssPath, 'utf8');

const addition = `
/* ── Attio / Linear Pixel-Perfect Compact Dashboard Fit ── */
.dashboard-main {
  padding: 8px 12px 10px 12px !important;
  gap: 6px !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  scrollbar-width: thin;
}

.dashboard-top-nav {
  padding-bottom: 4px !important;
}

.dashboard-page-title {
  font-size: 13px !important;
  font-weight: 700 !important;
  letter-spacing: -0.015em;
  color: #0F172A;
}

.dashboard-page-subtitle {
  font-size: 9px !important;
  color: #64748B;
}

.dash-date-indicator {
  font-size: 9px !important;
  padding: 2px 6px !important;
}

.dash-btn-primary {
  height: 24px !important;
  font-size: 9.5px !important;
  font-weight: 600 !important;
  padding: 0 8px !important;
  border-radius: 5px !important;
}

.linear-core-pipeline {
  padding: 3px 6px !important;
  gap: 4px !important;
  border-radius: 7px !important;
  background: #F8FAFC !important;
}

.pipeline-stage {
  padding: 3px 6px !important;
  gap: 5px !important;
}

.pipeline-step-badge {
  font-size: 8.5px !important;
  padding: 1px 4px !important;
}

.pipeline-step-title {
  font-size: 9.5px !important;
  font-weight: 700 !important;
}

.pipeline-step-proof {
  font-size: 8px !important;
  font-weight: 600 !important;
  color: #64748B;
}

.pipeline-arrow-separator {
  font-size: 9px !important;
  color: #94A3B8 !important;
}

.dashboard-overview-row {
  gap: 6px !important;
}

.dashboard-stat {
  padding: 5px 8px !important;
  gap: 1px !important;
  border-radius: 6px !important;
}

.stat-label {
  font-size: 8px !important;
  letter-spacing: 0.05em;
  color: #64748B !important;
}

.stat-value {
  font-size: 15px !important;
  font-weight: 800 !important;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

.stat-trend {
  font-size: 8px !important;
  gap: 3px !important;
}

.stat-context {
  font-size: 8px !important;
  color: #64748B !important;
}

.dashboard-bento {
  gap: 6px !important;
}

.simple-order-card,
.simple-flight-card {
  padding: 5px 8px !important;
  border-radius: 5px !important;
  gap: 2px !important;
}

.simple-card-title {
  font-size: 10px !important;
  font-weight: 700 !important;
}

.simple-card-meta {
  font-size: 8.5px !important;
}

.simple-card-body {
  font-size: 9px !important;
  line-height: 1.3 !important;
}

.simple-card-footer {
  font-size: 8.5px !important;
  margin-top: 1px !important;
  padding-top: 2px !important;
}

.simple-route-strip {
  padding: 5px 8px !important;
  gap: 3px !important;
}

.simple-route-row {
  font-size: 9px !important;
}
`;

css += addition;
fs.writeFileSync(cssPath, css, 'utf8');
console.log('Appended compact styles to product-sections.css');
