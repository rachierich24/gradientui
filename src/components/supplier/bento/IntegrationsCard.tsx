'use client';
// Integrations: the tools a supplier already runs on, lighting up one at a time as they sync.
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEvery } from './shared';

/* ═════════════════════════ 5. INTEGRATIONS ═════════════════════════ */
const TOOLS = [
  { n: 'Tally', m: 'T', c: '#1F4E9D' }, { n: 'Zoho Books', m: 'Z', c: '#D63B2F' }, { n: 'QuickBooks', m: 'qb', c: '#2CA01C' },
  { n: 'Razorpay', m: 'R', c: '#2B6FE8' }, { n: 'WhatsApp', m: 'W', c: '#25A55F' }, { n: 'Gmail', m: 'M', c: '#D44638' },
  { n: 'Google Sheets', m: 'S', c: '#1E8E4E' }, { n: 'Excel', m: 'X', c: '#1D6F42' }, { n: 'Shiprocket', m: 'Sr', c: '#6C3FC7' },
  { n: 'Delhivery', m: 'D', c: '#222222' }, { n: 'Petpooja', m: 'P', c: '#E2501F' }, { n: 'PhonePe', m: 'Pe', c: '#5F259F' },
  { n: 'Paytm', m: 'Pt', c: '#0B5FB3' }, { n: 'Shopify', m: 'Sh', c: '#5E8E3E' }, { n: 'Slack', m: '#', c: '#4A154B' },
  { n: 'Xero', m: 'x', c: '#13B5EA' }, { n: 'Odoo', m: 'O', c: '#714B67' }, { n: 'SAP', m: 'SAP', c: '#0A6ED1' },
  { n: 'Busy', m: 'B', c: '#C2410C' }, { n: 'Marg ERP', m: 'Mg', c: '#B91C1C' },
];

export function IntegrationsCard({ run }: { run: boolean }) {
  const [ping, setPing] = useState(4);
  const [hover, setHover] = useState<number | null>(null);
  useEvery(1300, run && hover === null, () => setPing((p) => (p + 7) % TOOLS.length));
  const active = hover ?? ping;
  return (
    <div className="sbx-int">
      <div className="sbx-int-grid">
        {TOOLS.map((t, i) => (
          <button
            key={t.n}
            type="button"
            className={`sbx-tool ${i === active ? 'is-on' : ''}`}
            style={{ ['--tc' as string]: t.c }}
            onPointerEnter={() => setHover(i)}
            onPointerLeave={() => setHover(null)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            aria-label={t.n}
          >
            <span className="sbx-mark">{t.m}</span>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={active} className="sbx-sync" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }}>
          <i style={{ background: TOOLS[active].c }} /> {hover !== null ? TOOLS[active].n : `Synced with ${TOOLS[active].n} · just now`}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
