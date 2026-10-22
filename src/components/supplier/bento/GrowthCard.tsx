'use client';
// Sales growth: a supplier's year on one curve. Flat and grey before joining Gradient, green and climbing after,
// with the moment they joined marked on the chart. Sales / Cafés / Orders switch on their own (the curve morphs
// from one to the next) until the visitor picks one; hovering the chart reads any month.
import { useEffect, useId, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { EASE, GradientMark, Window, monotone, useCountUp, useScript } from './shared';

const MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
const JOIN = 3; // joined Gradient in July
const METRICS = {
  sales: {
    tab: 'Sales', label: 'Monthly sales', series: [2.1, 2.3, 2.2, 2.4, 3.1, 3.8, 4.6, 5.4, 6.2, 7.1, 8.0, 8.9],
    fmt: (v: number) => `₹${v.toFixed(1)}L`,
  },
  cafes: {
    tab: 'Cafés', label: 'Cafés served', series: [38, 40, 39, 42, 61, 83, 104, 122, 141, 158, 173, 186],
    fmt: (v: number) => `${Math.round(v)}`,
  },
  orders: {
    tab: 'Orders', label: 'Orders a month', series: [210, 224, 218, 236, 318, 402, 486, 571, 650, 742, 821, 904],
    fmt: (v: number) => Math.round(v).toLocaleString('en-IN'),
  },
} as const;
type Metric = keyof typeof METRICS;
const ORDER: Metric[] = ['sales', 'cafes', 'orders'];
const GROWTH_SCRIPT = [['scrub', 2900], ['rest', 1700], ['next', 900]] as const;
const before = (s: readonly number[]) => s.slice(0, JOIN + 1).reduce((a, b) => a + b, 0) / (JOIN + 1);

export function GrowthCard({ run, still }: { run: boolean; still: boolean }) {
  const uid = useId().replace(/:/g, '');
  const { phase } = useScript(GROWTH_SCRIPT, run);
  const [metric, setMetric] = useState<Metric>('sales');
  const [picked, setPicked] = useState(false);
  const [hoverF, setHoverF] = useState<number | null>(null);
  const [scrubF, setScrubF] = useState(1);
  const m = METRICS[metric];
  const last = m.series[m.series.length - 1];
  const shown = useCountUp(last, run);
  const drawn = run || still;

  useEffect(() => {
    if (phase === 'next' && !picked) setMetric((k) => ORDER[(ORDER.indexOf(k) + 1) % ORDER.length]);
  }, [phase, picked]);

  // after the curve settles, a marker reads along it from the month they joined to today
  useEffect(() => {
    if (phase !== 'scrub') { setScrubF(1); return; }
    let raf = 0;
    const t0 = performance.now(), D = 2500, f0 = JOIN / (MONTHS.length - 1);
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / D), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      setScrubF(f0 + (1 - f0) * e);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  const W = 600, H = 170;
  const { curve, pts, joinX } = useMemo(() => {
    const hi = Math.max(...m.series) * 1.14;
    const p = m.series.map((v, i) => [(i / (m.series.length - 1)) * W, H - (v / hi) * H] as [number, number]);
    return { curve: monotone(p), pts: p, joinX: p[JOIN][0] };
  }, [m]);
  const f = hoverF ?? (phase === 'scrub' ? scrubF : 1);
  const tip = hoverF !== null || phase === 'scrub';
  const idx = Math.round(f * (MONTHS.length - 1));
  const mx = hoverF !== null ? pts[idx][0] : f * W, my = curve.at(mx);
  const ratio = m.series[idx] / before(m.series);
  const growth = last / before(m.series);

  return (
    <Window title="Gradient · Insights">
      <div className="sbx-body">
        <div className="sbx-gr">
          <div className="sbx-gr-top">
            <div>
              <small>{m.label} · March</small>
              <div className="sbx-gr-big">{m.fmt(shown)}</div>
              <div className="sbx-gr-delta"><b>{growth.toFixed(1)}×</b> since joining Gradient</div>
            </div>
            <div className="sbx-seg" role="tablist" aria-label="Metric">
              {ORDER.map((k) => (
                <button key={k} type="button" role="tab" aria-selected={k === metric} className={k === metric ? 'is-on' : ''} onClick={() => { setMetric(k); setPicked(true); }}>
                  {k === metric && <motion.span layoutId={`${uid}-thumb`} className="sbx-seg-thumb" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
                  <span>{METRICS[k].tab}</span>
                </button>
              ))}
            </div>
          </div>

          <div
            className="sbx-gr-plot"
            onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setHoverF(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))); }}
            onPointerLeave={() => setHoverF(null)}
          >
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id={`${uid}-area`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#1FA952" stopOpacity="0.2" />
                  <stop offset="1" stopColor="#1FA952" stopOpacity="0" />
                </linearGradient>
                <clipPath id={`${uid}-reveal`}><motion.rect x="0" y="-20" height={H + 40} initial={{ width: still ? W : 0 }} animate={{ width: drawn ? W : 0 }} transition={{ duration: still ? 0 : 1.5, ease: EASE }} /></clipPath>
                <clipPath id={`${uid}-pre`}><rect x="0" y="-20" width={joinX} height={H + 40} /></clipPath>
                <clipPath id={`${uid}-post`}><rect x={joinX} y="-20" width={W - joinX} height={H + 40} /></clipPath>
              </defs>
              {[0.25, 0.5, 0.75].map((g) => <line key={g} x1="0" x2={W} y1={H * g} y2={H * g} className="sbx-gridline" />)}
              <g clipPath={`url(#${uid}-reveal)`}>
                <g clipPath={`url(#${uid}-post)`}>
                  <motion.path initial={false} animate={{ d: `${curve.d} L${W} ${H} L0 ${H} Z` }} transition={{ duration: 0.8, ease: EASE }} fill={`url(#${uid}-area)`} />
                  <motion.path initial={false} animate={{ d: curve.d }} transition={{ duration: 0.8, ease: EASE }} className="sbx-gr-line" />
                </g>
                <g clipPath={`url(#${uid}-pre)`}>
                  <motion.path initial={false} animate={{ d: curve.d }} transition={{ duration: 0.8, ease: EASE }} className="sbx-gr-pre" />
                </g>
              </g>
              <line x1={joinX} x2={joinX} y1="0" y2={H} className="sbx-gr-join" />
              {tip && <line className="sbx-hair" x1={mx} x2={mx} y1="0" y2={H} />}
            </svg>
            <motion.span
              className="sbx-gr-pin"
              style={{ left: `${(joinX / W) * 100}%` }}
              initial={{ opacity: 0, y: 6 }}
              animate={drawn ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
              transition={{ duration: 0.45, delay: still ? 0 : 0.55 }}
            >
              <GradientMark size={11} /> Joined Gradient
            </motion.span>
            <span className="sbx-gr-dot is-join" style={{ left: `${(joinX / W) * 100}%`, top: `${(curve.at(joinX) / H) * 100}%`, opacity: drawn ? 1 : 0 }} />
            <span className={`sbx-mk${tip ? '' : ' is-rest'}`} style={{ left: `${(mx / W) * 100}%`, top: `${(my / H) * 100}%`, opacity: drawn ? 1 : 0 }} />
            {tip && (
              <span className={`sbx-tt${mx / W > 0.62 ? ' is-left' : ''}`} style={{ left: `${(mx / W) * 100}%`, top: `${(my / H) * 100}%` }}>
                <small>{MONTHS[idx]}</small>
                <b>{m.fmt(m.series[idx])}</b>
                <em>{idx <= JOIN ? 'before Gradient' : `${ratio.toFixed(1)}× vs before Gradient`}</em>
              </span>
            )}
          </div>
          <div className="sbx-gr-axis" aria-hidden="true">
            {MONTHS.map((mo, i) => <span key={mo} className={i === JOIN ? 'is-join' : ''}>{i % 3 === 0 || i === MONTHS.length - 1 ? mo : ''}</span>)}
          </div>

          <div className="sbx-gr-tiles">
            <div><small>Repeat orders</small><b>78%</b><em>reorder every month</em></div>
            <div><small>New cafés</small><b>+144</b><em>found you on Gradient</em></div>
            <div><small>Payouts</small><b>T+7</b><em>settled to your bank</em></div>
          </div>
        </div>
      </div>
    </Window>
  );
}
