'use client';
// Supplier's growth in the past 30 days — Bento Grid card.
// Relevant to Gradient Wholesale Supplier Portal: café order volume, wholesale dispatch revenue,
// capacity fulfillment meter, and 28-day daily dispatches bar chart styled in Gradient green.
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface GrowthCardProps {
  run: boolean;
  still: boolean;
}

// 28-day dispatches matching real café reorder rhythms in Indian wholesale coffee supply
const BARS_DATA = [
  { pct: 18, val: 18400, orders: 4, label: 'Day 1' },
  { pct: 24, val: 24500, orders: 6, label: 'Day 2' },
  { pct: 20, val: 21000, orders: 5, label: 'Day 3' },
  { pct: 32, val: 33800, orders: 8, label: 'Day 4' },
  { pct: 38, val: 40200, orders: 9, label: 'Day 5' },
  { pct: 54, val: 56900, orders: 14, label: 'Day 6' },
  { pct: 44, val: 46200, orders: 11, label: 'Day 7' },
  { pct: 30, val: 31500, orders: 7, label: 'Day 8' },
  { pct: 36, val: 38000, orders: 9, label: 'Day 9' },
  { pct: 28, val: 29400, orders: 7, label: 'Day 10' },
  { pct: 45, val: 47800, orders: 12, label: 'Day 11' },
  { pct: 40, val: 42100, orders: 10, label: 'Day 12' },
  { pct: 52, val: 54600, orders: 13, label: 'Day 13' },
  { pct: 60, val: 63200, orders: 15, label: 'Day 14' },
  { pct: 68, val: 71500, orders: 17, label: 'Day 15' },
  { pct: 82, val: 86400, orders: 21, label: 'Day 16' },
  { pct: 100, val: 104800, orders: 26, label: 'Day 17 (Peak)' },
  { pct: 58, val: 61200, orders: 15, label: 'Day 18' },
  { pct: 46, val: 48900, orders: 12, label: 'Day 19' },
  { pct: 52, val: 55100, orders: 14, label: 'Day 20' },
  { pct: 48, val: 51200, orders: 13, label: 'Day 21' },
  { pct: 56, val: 59400, orders: 15, label: 'Day 22' },
  { pct: 72, val: 76200, orders: 19, label: 'Day 23' },
  { pct: 84, val: 88900, orders: 22, label: 'Day 24' },
  { pct: 94, val: 99400, orders: 25, label: 'Day 25' },
  { pct: 78, val: 82600, orders: 20, label: 'Day 26' },
  { pct: 64, val: 67800, orders: 17, label: 'Day 27' },
  { pct: 80, val: 84500, orders: 21, label: 'Day 28' },
];

const TARGET_REVENUE = 1842850;

function formatINR(v: number): string {
  return '₹' + v.toLocaleString('en-IN');
}

export function GrowthCard({ run, still }: GrowthCardProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [hasEntered, setHasEntered] = useState(still);
  const [revenue, setRevenue] = useState<number>(still ? TARGET_REVENUE : 0);

  // Trigger bar, meter, and count-up playback when card enters the viewport
  useEffect(() => {
    if (still) {
      setHasEntered(true);
      setRevenue(TARGET_REVENUE);
      return;
    }
    if (run && !hasEntered) {
      setHasEntered(true);
    }
  }, [run, still, hasEntered]);

  // Animated count-up synchronized with entrance
  useEffect(() => {
    if (still) {
      setRevenue(TARGET_REVENUE);
      return;
    }
    if (!hasEntered) return;

    let raf = 0;
    const startTime = performance.now();
    const duration = 1400;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3);
      setRevenue(Math.round(TARGET_REVENUE * ease));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [hasEntered, still]);

  const activeBar = hoverIdx !== null ? BARS_DATA[hoverIdx] : null;
  const tooltipLeftPct = hoverIdx !== null
    ? Math.max(14, Math.min(86, (hoverIdx / (BARS_DATA.length - 1)) * 100))
    : 50;

  return (
    <div className="sup-growth-stage">
      {/* ─── Top Floating Card: Roastery Tier & Capacity Meter ─── */}
      <motion.div
        className="sup-tier-card"
        initial={still ? false : { opacity: 0, y: 12 }}
        animate={hasEntered || still ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="sup-tier-top">
          <div className="sup-tier-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="5" strokeWidth="1.8" stroke="url(#supGreenGrad)" />
              <path d="M7.5 12h9M12 7.5v9" strokeWidth="2" strokeLinecap="round" stroke="#1FA952" />
              <defs>
                <linearGradient id="supGreenGrad" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#1FA952" />
                  <stop offset="1" stopColor="#34D399" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="sup-tier-meta">
            <div className="sup-tier-title">Roastery Wholesale Tier</div>
            <div className="sup-tier-sub">Weekly T+1 escrow settlement</div>
          </div>
          <div className="sup-tier-pill">Active</div>
        </div>

        <div className="sup-tier-metric">
          <span className="sup-metric-label">Monthly café dispatch target</span>
          <span className="sup-metric-rate">₹22,00,000 quota · 48 partner cafés</span>
        </div>

        <div className="sup-meter-wrap">
          <div className="sup-meter-head">
            <div className="sup-meter-tag">
              <svg className="sup-meter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path d="M12 4a8 8 0 100 16 8 8 0 000-16z" strokeWidth="1.8" />
                <path d="M12 12l3.2-3.2" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              </svg>
              <span>Capacity & fulfillment meter</span>
            </div>
            <span className="sup-meter-pct">84% achieved</span>
          </div>
          <div className="sup-meter-track" role="progressbar" aria-valuenow={84} aria-valuemin={0} aria-valuemax={100}>
            <motion.div
              className={`sup-meter-bar${run && !still ? ' is-live' : ''}`}
              initial={{ width: still ? '84%' : 0 }}
              animate={{ width: hasEntered || still ? '84%' : 0 }}
              transition={{ duration: still ? 0 : 1.05, delay: still ? 0 : 0.14, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      </motion.div>

      {/* ─── Bottom Floating Card: 30-Day Growth & Green Bar Chart ─── */}
      <motion.div
        className="sup-graph-card"
        initial={still ? false : { opacity: 0, y: 16 }}
        animate={hasEntered || still ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.52, delay: still ? 0 : 0.08, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="sup-graph-header">
          <div className="sup-graph-sub">Supplier&apos;s growth in the past 30 days</div>
          <div className="sup-graph-row">
            <div className="sup-graph-big" aria-label="Rupees 18 lakh 42 thousand 850">
              {formatINR(revenue)}
            </div>
            <div className="sup-delta-badge">
              <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" aria-hidden="true">
                <path d="M2.5 8.5L9.5 1.5M9.5 1.5H4.5M9.5 1.5V6.5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>+4.7× vs before Gradient</span>
            </div>
          </div>
        </div>

        <div className="sup-chart-wrap" aria-label="30-day dispatches bar chart">
          <div className="sup-bars-row">
            {BARS_DATA.map((bar, i) => {
              const isActive = hoverIdx === i;
              const isDim = hoverIdx !== null && !isActive;
              return (
                <div
                  key={i}
                  className={`sup-bar-col ${isActive ? 'is-active' : ''} ${isDim ? 'is-dim' : ''}`}
                  onPointerEnter={() => setHoverIdx(i)}
                  onPointerLeave={() => setHoverIdx(null)}
                  role="presentation"
                >
                  <motion.div
                    className="sup-bar-fill"
                    initial={{ height: still ? `${bar.pct}%` : 0 }}
                    animate={{ height: hasEntered || still ? `${bar.pct}%` : 0 }}
                    transition={{
                      duration: still ? 0 : 0.62,
                      delay: still ? 0 : 0.08 + i * 0.016,
                      ease: [0.34, 1.35, 0.64, 1],
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Interactive Tooltip on Bar Hover */}
          {activeBar && hoverIdx !== null && (
            <div
              className="sup-tooltip"
              style={{ left: `${tooltipLeftPct}%` }}
              role="tooltip"
            >
              <span className="sup-tt-date">{activeBar.label}</span>
              <span className="sup-tt-val">{formatINR(activeBar.val)}</span>
              <span className="sup-tt-sub">{activeBar.orders} café orders</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
