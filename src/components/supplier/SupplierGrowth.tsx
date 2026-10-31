'use client';
// Results: what selling through Gradient does to a supplier's month. One annotated chart per supplier:
// their actual line (grey before going live, green after), a dashed projection of the trend they were
// on before joining, and the hatched gap between the two, which is what Gradient added.
// The whole card follows one time cursor. When it scrolls into view the line is drawn month by month,
// holding at the go-live marker and at each numbered pin, while the tiles and the readout count along.
// After that, hovering scrubs the cursor (dragging on touch, arrow keys when focused): the four tiles
// show that month for every metric and the readout shows what Gradient had added by then. Dragging with
// a mouse measures the change between two months. "Without" morphs the line onto the old trend to show
// what they would have missed. Switching supplier or metric morphs the chart instead of redrawing it.
// Sample data, labelled as such. Styles: app/supplier/supplier-growth.css
import { useEffect, useId, useMemo, useReducer, useRef, useState, type RefObject } from 'react';
import { smooth, smoothY } from './chart-utils';

type MetricId = 'revenue' | 'orders' | 'cafes' | 'days';
type Note = { i: number; title: string; body: string };
type Supplier = { id: string; name: string; kind: string; series: Record<MetricId, number[]>; notes: Note[] };

const MONTHS = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
const LIVE = 6; // went live on Gradient in December
const LAST = MONTHS.length - 1;
const JAN = 7;
const full = (i: number) => `${MONTHS[i]} ’${i < JAN ? 25 : 26}`;
const span = (a: number, b: number) => (a === b ? full(b) : (a < JAN) === (b < JAN) ? `${MONTHS[a]} → ${full(b)}` : `${full(a)} → ${full(b)}`);

const SUPPLIERS: Supplier[] = [
  {
    id: 'roast', name: 'Roast Depot', kind: 'Coffee roaster',
    series: {
      revenue: [4.1, 4.4, 3.9, 4.5, 4.2, 4.6, 4.5, 5.3, 6.0, 6.9, 7.6, 8.4, 9.3, 10.2, 11.4],
      orders: [182, 196, 174, 205, 188, 210, 204, 248, 296, 342, 388, 431, 478, 522, 566],
      cafes: [39, 41, 40, 42, 41, 43, 41, 52, 63, 74, 84, 93, 101, 110, 118],
      days: [44, 47, 42, 49, 45, 46, 45, 6, 2, 1.4, 1.2, 1.1, 1, 1, 1],
    },
    notes: [
      { i: 8, title: '23 new cafés found them', body: 'Their catalogue went live to every café on Gradient.' },
      { i: 10, title: 'Reorders on autopilot', body: '41% of orders now repeat without a single call.' },
      { i: 13, title: 'Second van on the road', body: 'Route planning made a two-van run worth it.' },
    ],
  },
  {
    id: 'dairy', name: 'Milkwell', kind: 'Dairy',
    series: {
      revenue: [2.2, 2.4, 2.3, 2.1, 2.5, 2.4, 2.3, 2.9, 3.4, 3.8, 4.3, 4.7, 5.0, 5.6, 6.1],
      orders: [310, 335, 320, 298, 342, 330, 318, 402, 470, 528, 590, 646, 690, 748, 802],
      cafes: [28, 30, 29, 27, 31, 30, 29, 37, 46, 54, 61, 67, 72, 79, 86],
      days: [38, 41, 36, 40, 39, 42, 40, 5, 2, 1.3, 1.1, 1, 1, 1, 1],
    },
    notes: [
      { i: 8, title: 'Morning slots, less wastage', body: 'Cafés pick a 7–9 am window; returns fell by half.' },
      { i: 10, title: 'Standing orders for 30 cafés', body: 'Daily milk repeats itself until a café pauses it.' },
      { i: 12, title: 'Into Whitefield', body: 'Demand on the map showed where to open next.' },
    ],
  },
  {
    id: 'pack', name: 'Crate & Cup', kind: 'Packaging',
    series: {
      revenue: [1.6, 1.5, 1.8, 1.7, 1.6, 1.9, 1.8, 2.3, 2.7, 3.2, 3.5, 3.9, 4.4, 4.8, 5.3],
      orders: [64, 60, 71, 66, 63, 74, 70, 92, 111, 128, 141, 157, 173, 190, 206],
      cafes: [22, 21, 24, 23, 22, 25, 24, 31, 39, 47, 53, 58, 64, 70, 75],
      days: [52, 55, 49, 58, 53, 56, 54, 7, 3, 1.5, 1.2, 1, 1, 1, 1],
    },
    notes: [
      { i: 7, title: 'In front of 400+ cafés', body: 'One catalogue instead of forty WhatsApp price lists.' },
      { i: 10, title: 'Cups and lids as a bundle', body: 'Bundle pricing lifted the average order by 38%.' },
      { i: 13, title: 'Default supplier for two chains', body: 'Chain-wide pricing tiers, set once in the portal.' },
    ],
  },
];

const fmtN = (v: number) => Math.round(v).toLocaleString('en-IN');
const sign = (d: number) => (d < 0 ? '−' : '+');
const paidIn = (v: number) => (v < 1.5 ? 'T+1' : `${Math.round(v)} days`);

// flow metrics add up month by month (so the readout totals the gap); the others are read at a month
type Metric = {
  label: string; lower?: boolean; flow?: boolean;
  value: (v: number) => string; axis: (v: number) => string; delta: (d: number) => string;
  head: string; gap: (g: number) => string; sub: (v: number[], t: number[], m: number) => string;
  miss: (g: number) => string; missSub: (m: number) => string;
};
const METRICS: Record<MetricId, Metric> = {
  revenue: {
    label: 'Monthly revenue', flow: true,
    value: (v) => `₹${v.toFixed(1)}L`, axis: (v) => `₹${+v.toFixed(1)}L`, delta: (d) => `${sign(d)}₹${Math.abs(d).toFixed(1)}L`,
    head: 'Added by Gradient', gap: (g) => `+₹${g.toFixed(1)}L`, sub: (_v, _t, m) => `${span(LIVE + 1, m)}, above their old trend`,
    miss: (g) => `−₹${g.toFixed(1)}L`, missSub: (m) => `in sales they’d have missed by ${full(m)}`,
  },
  orders: {
    label: 'Orders a month', flow: true,
    value: fmtN, axis: fmtN, delta: (d) => `${sign(d)}${fmtN(Math.abs(d))}`,
    head: 'Extra orders from Gradient', gap: (g) => `+${fmtN(g)}`, sub: (_v, _t, m) => `${span(LIVE + 1, m)}, above their old trend`,
    miss: (g) => `−${fmtN(g)}`, missSub: (m) => `orders they’d have missed by ${full(m)}`,
  },
  cafes: {
    label: 'Cafés served',
    value: fmtN, axis: fmtN, delta: (d) => `${sign(d)}${fmtN(Math.abs(d))}`,
    head: 'More cafés than their old trend', gap: (g) => `+${fmtN(g)}`,
    sub: (v, t, m) => `${fmtN(v[m])} cafés in ${full(m)}, against ${fmtN(t[m])} on the old trend`,
    miss: (g) => `−${fmtN(g)}`, missSub: (m) => `cafés they’d never have reached by ${full(m)}`,
  },
  days: {
    label: 'Days to get paid', lower: true,
    value: paidIn, axis: (v) => `${Math.round(v)}d`, delta: (d) => `${sign(d)}${Math.round(Math.abs(d))} days`,
    head: 'Faster to get paid', gap: (g) => `${Math.round(g)} days`,
    sub: (v, t, m) => `Paid ${paidIn(v[m])} in ${full(m)}, not ${Math.round(t[m])} days`,
    miss: (g) => `+${Math.round(g)} days`, missSub: () => 'longer to get paid, on every order',
  },
};
const ORDER: MetricId[] = ['revenue', 'orders', 'cafes', 'days'];

const before = (v: number[]) => v.slice(0, LIVE + 1).reduce((a, b) => a + b, 0) / (LIVE + 1);
// least-squares line through the months before going live, carried on to the end. Flat for days to
// get paid, where the old trend is simply how long they used to wait.
function trendOf(v: number[], flat?: boolean) {
  if (flat) { const b = before(v); return v.map(() => b); }
  const xs = v.slice(0, LIVE + 1).map((_, i) => i), ys = v.slice(0, LIVE + 1), n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  const k = xs.reduce((a, x, i) => a + (x - mx) * (ys[i] - my), 0) / xs.reduce((a, x) => a + (x - mx) ** 2, 0);
  return v.map((_, i) => my + k * (i - mx));
}
// what Gradient had added by month m: the running total of the gap for flows, the gap itself otherwise
function gapAt(id: MetricId, v: number[], t: number[], m: number) {
  const M = METRICS[id];
  if (M.flow) { let s = 0; for (let i = LIVE + 1; i <= m; i++) s += v[i] - t[i]; return s; }
  return M.lower ? t[m] - v[m] : v[m] - t[m];
}
// round axis steps (1, 2, 2.5 or 5 × a power of ten), about four of them
function ticksFor(maxVal: number) {
  const raw = maxVal / 4, p = 10 ** Math.floor(Math.log10(raw)), f = raw / p;
  const step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
  const top = Math.ceil(maxVal / step) * step;
  return Array.from({ length: Math.round(top / step) + 1 }, (_, i) => +(i * step).toFixed(6));
}

type Read = { label: string; big: string; chip?: string; sub: string; tone: 'up' | 'flat' | 'miss' };
function readOut(id: MetricId, v: number[], t: number[], m: number, without: boolean, range: [number, number] | null): Read {
  const M = METRICS[id];
  if (range) {
    const s = without ? v.map((x, i) => (i > LIVE ? t[i] : x)) : v;
    const [i0, i1] = range, d = s[i1] - s[i0], pct = Math.round((d / s[i0]) * 100), n = i1 - i0;
    return { label: 'Change', big: M.delta(d), chip: `${sign(pct)}${Math.abs(pct)}%`, sub: `${span(i0, i1)} · ${n} month${n > 1 ? 's' : ''}`, tone: (M.lower ? d < 0 : d > 0) ? 'up' : 'flat' };
  }
  if (m < LIVE) return { label: 'Before Gradient', big: M.value(v[m]), sub: `${full(m)} · goes live on Gradient in Dec ’25`, tone: 'flat' };
  if (m === LIVE) return { label: 'Live on Gradient', big: M.value(v[m]), sub: 'Dec ’25, the month they joined', tone: 'flat' };
  const g = gapAt(id, v, t, m);
  return without
    ? { label: 'Without Gradient', big: M.miss(g), sub: M.missSub(m), tone: 'miss' }
    : { label: M.head, big: M.gap(g), sub: M.sub(v, t, m), tone: 'up' };
}

// figures roll digit by digit when they change; columns are keyed from the right so the units stay
// put when a number gains a digit
const DIGITS = Array.from({ length: 10 }, (_, d) => <span key={d}>{d}</span>);
function Roll({ text }: { text: string }) {
  const n = text.length;
  return (
    <span className="sgr-roll">
      <span className="sgr-sr">{text}</span>
      {text.split('').map((c, i) => (c >= '0' && c <= '9' ? (
        <span key={`d${n - i}`} className="sgr-roll-d" aria-hidden="true"><span style={{ transform: `translateY(${-+c * 10}%)` }}>{DIGITS}</span></span>
      ) : <span key={`c${n - i}`} aria-hidden="true">{c}</span>))}
    </span>
  );
}

// a highlight that slides to the selected item; measured, so it also works on the 2×2 phone grid
type Box = { x: number; y: number; w: number; h: number; ready: boolean };
function useIndicator(ref: RefObject<HTMLElement | null>, sel: string, dep: unknown) {
  const [box, setBox] = useState<Box | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const a = el.querySelector<HTMLElement>(sel);
      if (a) setBox((b) => ({ x: a.offsetLeft, y: a.offsetTop, w: a.offsetWidth, h: a.offsetHeight, ready: !!b }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, sel, dep]);
  return box;
}
function Ind({ box, className }: { box: Box | null; className: string }) {
  return (
    <span aria-hidden="true" className={`${className}${box?.ready ? ' is-ready' : ''}`}
      style={box ? { width: box.w, height: box.h, transform: `translate(${box.x}px, ${box.y}px)` } : { opacity: 0 }} />
  );
}

function Spark({ v, t, month, without }: { v: number[]; t: number[]; month: number; without: boolean }) {
  const W = 72, H = 26, lo = Math.min(...v, ...t), hi = Math.max(...v, ...t);
  const x = (i: number) => 3 + (i / LAST) * (W - 6), y = (val: number) => 3 + (1 - (val - lo) / (hi - lo || 1)) * (H - 6);
  const pts = v.map((val, i) => [x(i), y(val)] as [number, number]);
  const at = without && month > LIVE ? [x(month), y(t[month])] : pts[month];
  return (
    <svg className={`sgr-spark${without ? ' is-without' : ''}`} width={W} height={H} aria-hidden="true">
      <path d={smooth(pts.slice(0, LIVE + 1))} className="pre" />
      <path d={`M${pts[LIVE][0]},${pts[LIVE][1]}L${x(LIVE + 1)},${y(t[LIVE + 1])}L${x(LAST)},${y(t[LAST])}`} className="alt" />
      <path d={smooth(pts.slice(LIVE))} className="post" />
      <circle r="2.75" style={{ transform: `translate(${at[0]}px, ${at[1]}px)` }} className={month > LIVE && !without ? 'a' : 'b'} />
    </svg>
  );
}

function Tile({ id, s, on, month, without, pick }: { id: MetricId; s: Supplier; on: boolean; month: number; without: boolean; pick: () => void }) {
  const M = METRICS[id], v = s.series[id];
  const t = useMemo(() => trendOf(v, M.lower), [v, M.lower]);
  const after = month > LIVE, val = after && without ? t[month] : v[month], from = before(v), pct = Math.round((val / from - 1) * 100);
  const chip = !after ? 'Before Gradient' : M.lower ? (from - val < 0.5 ? 'No faster' : `${Math.round(from - val)} days faster`) : `${sign(pct)}${Math.abs(pct)}%`;
  return (
    <button type="button" role="tab" aria-selected={on} className={`sgr-tile${on ? ' is-on' : ''}`} onClick={pick}>
      <span className="sgr-tile-l">{M.label}</span>
      <span className="sgr-tile-v"><Roll text={M.value(val)} /></span>
      <span className="sgr-tile-d">
        <span className="from">{after ? `${M.value(from)} before` : full(month)}</span>
        <em className={after && !without ? 'is-up' : undefined}><Roll text={chip} /></em>
      </span>
      <Spark v={v} t={t} month={month} without={without} />
    </button>
  );
}

function Compare({ without, set }: { without: boolean; set: (b: boolean) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const ind = useIndicator(ref, '[aria-checked="true"]', without);
  return (
    <div className="sgr-seg" ref={ref} role="radiogroup" aria-label="Compare">
      <Ind box={ind} className="sgr-seg-ind" />
      <button type="button" role="radio" aria-checked={!without} onClick={() => set(false)}><i className="g" />With Gradient</button>
      <button type="button" role="radio" aria-checked={without} onClick={() => set(true)}><i />Without</button>
    </div>
  );
}

const P = { l: 58, r: 28, t: 46, b: 38 };
const MORPH = 650;
const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2);

type Data = { a: number[]; t: number[]; max: number; pins: number[] };
const mix = (p: number[], q: number[], k: number) => q.map((x, i) => (p[i] ?? x) + (x - (p[i] ?? x)) * k);
const mixData = (p: Data, q: Data, k: number): Data => ({ a: mix(p.a, q.a, k), t: mix(p.t, q.t, k), max: p.max + (q.max - p.max) * k, pins: mix(p.pins, q.pins, k) });

// the intro: draw up to go-live, hold a beat, then walk the after-period with a short stop at each pin
type Seg = { x0: number; x1: number; ms: number };
function plan(notes: Note[]): Seg[] {
  const segs: Seg[] = [{ x0: 0, x1: LIVE, ms: 850 }, { x0: LIVE, x1: LIVE, ms: 420 }];
  let x = LIVE;
  for (const i of [...notes.map((n) => n.i), LAST]) {
    if (i <= x) continue;
    segs.push({ x0: x, x1: i, ms: 100 + (i - x) * 130 });
    if (i < LAST) segs.push({ x0: i, x1: i, ms: 300 });
    x = i;
  }
  return segs;
}
function storyAt(segs: Seg[], e: number) {
  for (const g of segs) {
    if (e < g.ms) return g.x0 + (g.x1 - g.x0) * ease(e / g.ms);
    e -= g.ms;
  }
  return null;
}

function GrowthChart({ s, metric, without, setWithout, seen, onMonth }: {
  s: Supplier; metric: MetricId; without: boolean; setWithout: (b: boolean) => void; seen: boolean; onMonth: (m: number) => void;
}) {
  const uid = useId().replace(/:/g, '');
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 1000, h: 380 });
  const [, paint] = useReducer((n: number) => n + 1, 0);
  const [hover, setHover] = useState(false);
  const [peek, setPeek] = useState<number | null>(null);
  const [lock, setLock] = useState<number | null>(null);
  const [range, setRange] = useState<[number, number] | null>(null);

  const M = METRICS[metric], v = s.series[metric];
  const t = useMemo(() => trendOf(v, M.lower), [v, M.lower]);
  const ticks = useMemo(() => ticksFor(Math.max(...v, ...t) * 1.06), [v, t]);
  const target = useMemo<Data>(() => ({
    a: v.map((x, i) => (without && i > LIVE ? t[i] : x)), t, max: ticks[ticks.length - 1], pins: s.notes.map((n) => n.i),
  }), [v, t, ticks, without, s.notes]);

  // animation state lives in a ref and paint() renders a frame: the shown data (morphing towards the
  // target), the cursor x (gliding towards tx), how far the line is drawn (rv) and the intro, if running
  const A = useRef({ d: target, from: target, to: target, m0: -1, x: 0, tx: 0, rv: 0, story: null as null | { t0: number; segs: Seg[] }, raf: 0, last: 0, still: false });
  const loop = useRef<(now: number) => void>(null);
  if (!loop.current) loop.current = (now) => {
    const a = A.current, dt = a.last ? Math.min(64, now - a.last) : 16;
    a.last = now;
    let busy = false;
    if (a.m0 >= 0) {
      const k = a.still ? 1 : Math.min(1, (now - a.m0) / MORPH);
      a.d = mixData(a.from, a.to, ease(k));
      if (k < 1) busy = true; else a.m0 = -1;
    }
    if (a.story) {
      const x = storyAt(a.story.segs, now - a.story.t0);
      if (x === null) { a.story = null; a.x = a.tx = a.rv = LAST; } else { a.x = a.rv = x; busy = true; }
    } else if (!a.still && Math.abs(a.tx - a.x) > 0.002) {
      a.x += (a.tx - a.x) * (1 - Math.exp(-dt / 70));
      busy = true;
    } else a.x = a.tx;
    paint();
    a.raf = busy ? requestAnimationFrame(loop.current!) : 0;
  };
  const kick = () => { const a = A.current; if (!a.raf) { a.last = 0; a.raf = requestAnimationFrame(loop.current!); } };

  useEffect(() => {
    const a = A.current;
    a.still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    return () => { cancelAnimationFrame(a.raf); a.raf = 0; };
  }, []);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // switching supplier, metric or "without" morphs to the new data (and ends the intro if it's running)
  const shown = useRef(target);
  useEffect(() => {
    if (shown.current === target) return;
    shown.current = target;
    const a = A.current;
    if (a.story) { a.story = null; a.rv = a.x = a.tx = LAST; }
    a.from = a.d; a.to = target; a.m0 = performance.now();
    kick();
  });

  const notes = useRef(s.notes);
  notes.current = s.notes;
  const intro = () => {
    const a = A.current;
    if (a.still) { a.rv = a.x = a.tx = LAST; paint(); return; }
    a.rv = a.x = a.tx = 0;
    a.story = { t0: performance.now(), segs: plan(notes.current) };
    kick();
  };
  const introRef = useRef(intro);
  introRef.current = intro;
  useEffect(() => { if (seen) introRef.current(); }, [seen]);

  // axis labels: the new set fades in and the old one fades out, both riding the morphing scale
  const tickKey = `${metric}|${ticks.join()}`;
  const [axisOut, setAxisOut] = useState<{ key: string; ticks: number[]; id: MetricId } | null>(null);
  const axisNow = useRef({ key: tickKey, ticks, id: metric });
  useEffect(() => {
    const p = axisNow.current;
    if (p.key === tickKey) return;
    axisNow.current = { key: tickKey, ticks, id: metric };
    setAxisOut(p);
    const tm = setTimeout(() => setAxisOut(null), MORPH);
    return () => clearTimeout(tm);
  }, [tickKey, ticks, metric]);

  const a = A.current, d = a.d, { w, h } = size;
  const story = !!a.story;
  const live = !story && (hover || peek !== null || lock !== null);
  const month = live ? a.tx : Math.floor(a.rv + 1e-6);
  useEffect(() => { onMonth(month); }, [month, onMonth]);

  const aim = (i: number, jump: boolean) => {
    const a = A.current;
    if (a.story) { a.story = null; a.rv = LAST; }
    a.tx = i;
    if (jump || a.still) a.x = i;
    kick();
  };

  // pointer: hover scrubs; a mouse drag measures between two months; a click pins the cursor (or clears
  // a measurement); on touch, dragging scrubs and the cursor stays where the finger lifts
  const drag = useRef<{ i: number; touch: boolean; moved: boolean } | null>(null);
  const monthAt = (clientX: number) => {
    const r = box.current!.getBoundingClientRect();
    return Math.max(0, Math.min(LAST, Math.round(((clientX - r.left - P.l) / (r.width - P.l - P.r)) * LAST)));
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const g = drag.current;
    if (e.pointerType === 'touch' && !g) return;
    if (!g && story && !e.movementX && !e.movementY) return; // the page scrolling under a resting cursor isn't a hover
    const i = monthAt(e.clientX);
    if (g && i !== g.i) g.moved = true;
    if (g?.moved && !g.touch) setRange(i === g.i ? null : [Math.min(g.i, i), Math.max(g.i, i)]);
    if (!hover) setHover(true);
    if (i !== a.tx || !live) aim(i, !live);
  };
  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const i = monthAt(e.clientX), touch = e.pointerType === 'touch';
    drag.current = { i, touch, moved: false };
    if (touch) { setHover(true); aim(i, !live); } else e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const g = drag.current;
    drag.current = null;
    if (!g) return;
    const i = monthAt(e.clientX);
    if (g.touch) { setLock(i); setHover(false); return; }
    if (!g.moved) { if (range) setRange(null); else setLock(lock === i ? null : i); }
  };
  const onLeave = () => {
    if (drag.current) return;
    setHover(false);
    if (lock !== null) aim(lock, false);
  };
  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') { setRange(null); setLock(null); return; }
    const cur = live ? a.tx : LAST;
    const i = e.key === 'ArrowRight' ? Math.min(LAST, cur + 1) : e.key === 'ArrowLeft' ? Math.max(0, cur - 1) : e.key === 'Home' ? 0 : e.key === 'End' ? LAST : null;
    if (i === null) return;
    e.preventDefault();
    setLock(i);
    aim(i, !live);
  };
  const peekAt = (i: number) => { setPeek(i); aim(i, !live); };
  const unpeek = () => { setPeek(null); if (lock !== null) aim(lock, false); };
  const pinAt = (i: number) => { const next = lock === i ? null : i; setLock(next); if (next !== null) aim(next, !live); };
  const replay = () => { setLock(null); setRange(null); setPeek(null); setWithout(false); intro(); };

  // geometry for this frame
  const X = (i: number) => P.l + (i / LAST) * (w - P.l - P.r);
  const Y = (val: number) => P.t + (1 - val / d.max) * (h - P.t - P.b);
  const pts = d.a.map((val, i) => [X(i), Y(val)] as [number, number]);
  const tp = d.t.map((val, i) => [X(i), Y(val)] as [number, number]);
  const prePts = pts.slice(0, LIVE + 1), postPts = pts.slice(LIVE);
  const pre = smooth(prePts), post = smooth(postPts);
  const gapD = `${post}L${tp[LAST][0]},${tp[LAST][1]}L${tp[LIVE][0]},${tp[LIVE][1]}Z`;
  const ghost = smooth(v.slice(LIVE).map((val, k) => [X(LIVE + k), Y(val)] as [number, number]));
  const lineAt = (x: number) => smoothY(x <= LIVE ? prePts : postPts, X(x));
  const trendAt = (x: number) => { const i = Math.min(LAST - 1, Math.floor(x)), f = x - i; return Y(d.t[i] + (d.t[i + 1] - d.t[i]) * f); };
  const rx = X(a.rv), px = X(a.x), py = lineAt(a.x);
  const idle = !story && !live && a.rv >= LAST;
  const tm = a.tx, after = tm > LIVE;
  const hiGap = live && after && !without && M.flow;
  const focusK = live || story ? s.notes.findIndex((n) => n.i === month) : -1;
  const tipNote = s.notes.findIndex((n) => n.i === tm);
  const read = readOut(metric, v, t, month, without, range);
  const shownAt = (i: number) => (without && i > LIVE ? t[i] : v[i]);
  const tipLine = tm < LIVE ? 'Before Gradient' : tm === LIVE ? 'Went live on Gradient' : without ? `${M.value(v[tm])} with Gradient`
    : M.lower ? `${Math.round(t[tm] - v[tm])} days faster` : `${M.delta(v[tm] - t[tm])} vs old trend`;
  const step = w < 560 ? 4 : 2;
  const r0 = range?.[0] ?? 0, r1 = range?.[1] ?? 0;
  const rangePct = range ? read.chip : '';

  const tickRow = (list: number[], id: MetricId) => list.map((tk) => (
    <g key={tk}>
      <path d={`M${P.l},${Y(tk)}H${w - P.r}`} className="sgr-grid" />
      <text x={P.l - 12} y={Y(tk) + 4} textAnchor="end" className="sgr-axis">{METRICS[id].axis(tk)}</text>
    </g>
  ));

  return (
    <>
      <div className="sgr-head">
        <div className={`sgr-read is-${read.tone}`}>
          <span className="sgr-read-l">{read.label}</span>
          <span className="sgr-read-v"><Roll text={read.big} />{read.chip && <em><Roll text={read.chip} /></em>}</span>
          <span className="sgr-read-s">{read.sub}</span>
        </div>
        <div className="sgr-ctrl">
          <Compare without={without} set={(b) => { setRange(null); setWithout(b); }} />
          <button type="button" className="sgr-replay" onClick={replay} aria-label="Replay the story" title="Replay">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2.75 8a5.25 5.25 0 1 0 1.6-3.77" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M2.5 2.25v2.5H5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <div
        className={`sgr-chart${without ? ' is-without' : ''}${live ? ' is-live' : ''}`} ref={box} tabIndex={0} role="slider"
        aria-label={`${s.name}, ${M.label.toLowerCase()} by month. Arrow keys move through the months.`}
        aria-valuemin={0} aria-valuemax={LAST} aria-valuenow={month} aria-valuetext={`${full(month)}: ${M.value(shownAt(month))}. ${read.label}: ${read.big}`}
        onPointerMove={onMove} onPointerDown={onDown} onPointerUp={onUp} onPointerLeave={onLeave} onPointerCancel={() => { drag.current = null; setHover(false); }} onKeyDown={onKey}
      >
        <svg width={w} height={h} aria-hidden="true">
          <defs>
            <pattern id={`${uid}-hatch`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="7" height="7" fill="rgba(31, 169, 82, 0.08)" />
              <line x1="0" y1="0" x2="0" y2="7" stroke="rgba(21, 147, 74, 0.24)" strokeWidth="1.4" />
            </pattern>
            <pattern id={`${uid}-hatch-hi`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="7" height="7" fill="rgba(31, 169, 82, 0.16)" />
              <line x1="0" y1="0" x2="0" y2="7" stroke="rgba(21, 147, 74, 0.5)" strokeWidth="1.6" />
            </pattern>
            <clipPath id={`${uid}-reveal`}><rect x="0" y="0" width={Math.max(0, rx)} height={h} /></clipPath>
            <clipPath id={`${uid}-upto`}><rect x={X(LIVE)} y="0" width={Math.max(0, px - X(LIVE))} height={h} /></clipPath>
            <clipPath id={`${uid}-plot`}><rect x="0" y={P.t - 12} width={w} height={h - P.b - P.t + 18} /></clipPath>
          </defs>

          <g clipPath={`url(#${uid}-plot)`}>
            {axisOut && <g className="sgr-ticks is-out" key={axisOut.key}>{tickRow(axisOut.ticks, axisOut.id)}</g>}
            <g className="sgr-ticks" key={tickKey}>{tickRow(ticks, metric)}</g>
          </g>
          {MONTHS.map((mo, i) => (i % step === 0 ? (
            <text key={i} x={X(i)} y={h - 12} textAnchor={i === 0 ? 'start' : i === LAST ? 'end' : 'middle'} className="sgr-axis">
              {i === 0 || (i >= JAN && i - step < JAN) ? full(i) : mo}
            </text>
          ) : null))}

          {range && (
            <g className="sgr-band">
              <rect x={X(r0)} y={P.t} width={X(r1) - X(r0)} height={h - P.t - P.b} />
              <path d={`M${X(r0)},${P.t}V${h - P.b}M${X(r1)},${P.t}V${h - P.b}`} />
            </g>
          )}

          <g clipPath={`url(#${uid}-reveal)`}>
            <path d={gapD} fill={`url(#${uid}-hatch)`} className="sgr-gap" />
            {hiGap && <path d={gapD} fill={`url(#${uid}-hatch-hi)`} clipPath={`url(#${uid}-upto)`} className="sgr-gap" />}
            <path d={smooth(tp)} className="sgr-trend" />
            <path d={ghost} className="sgr-ghost" />
            <path d={pre} className="sgr-before" />
            <path d={post} className="sgr-after" />
          </g>

          {/* go-live marker */}
          <g className={`sgr-live${a.rv >= LIVE ? ' is-on' : ''}`}>
            <path d={`M${X(LIVE)},${P.t - 8}V${h - P.b}`} />
            <circle cx={pts[LIVE][0]} cy={pts[LIVE][1]} r="5" />
            <foreignObject x={X(LIVE) - 90} y={P.t - 40} width="180" height="30">
              <div className="sgr-live-pill">Live on Gradient · Dec ’25</div>
            </foreignObject>
          </g>

          {range && [r0, r1].map((i) => <circle key={i} cx={X(i)} cy={Y(shownAt(i))} r="4.5" className="sgr-band-dot" />)}

          {live && (
            <g className="sgr-ph">
              <path d={`M${px},${P.t}V${h - P.b}`} />
              {after && <path d={`M${px},${trendAt(a.x)}V${py}`} className={`gap${without ? ' is-off' : ''}`} />}
              <circle cx={px} cy={trendAt(a.x)} r="3.5" className="t" />
              <circle cx={px} cy={py} r="11" className="halo" />
              <circle cx={px} cy={py} r="5" className={after && !without ? 'a' : 'b'} />
            </g>
          )}
          {story && (
            <g className="sgr-pen">
              <circle cx={px} cy={py} r="10" className="halo" />
              <circle cx={px} cy={py} r="4.5" className={a.x > LIVE ? 'a' : 'b'} />
            </g>
          )}
          {/* what changed, pinned to the line (drawn over the cursor so a pin stays readable under it) */}
          {s.notes.map((n, k) => {
            const pi = d.pins[k] ?? n.i;
            return (
              <g key={k} className={`sgr-pin${!without && pi <= a.rv + 0.01 ? ' is-on' : ''}${focusK === k ? ' is-focus' : ''}`} transform={`translate(${X(pi)} ${lineAt(pi)})`}>
                <g className="sgr-pin-b"><circle r="11" /><text y="4" textAnchor="middle">{k + 1}</text></g>
              </g>
            );
          })}

          {idle && (
            <g className={`sgr-end${without ? ' is-without' : ''}`} transform={`translate(${pts[LAST][0]} ${pts[LAST][1]})`}>
              <circle r="5" className="ring" />
              <circle r="4.5" className="dot" />
            </g>
          )}
        </svg>

        {live && (
          <div className={`sgr-tip${py < 96 ? ' is-below' : ''}`} style={{ left: Math.min(w - 74, Math.max(74, px)), top: py }}>
            <small>{full(tm)}</small>
            <b>{M.value(shownAt(tm))}</b>
            <span className={after && !without ? 'is-up' : undefined}>{tipLine}</span>
            {tipNote >= 0 && !without && <span className="note"><i>{tipNote + 1}</i>{s.notes[tipNote].title}</span>}
          </div>
        )}
        {range && (
          <div className="sgr-range-pill" style={{ left: (X(r0) + X(r1)) / 2, top: P.t + 8 }}>
            {MONTHS[r0]} → {MONTHS[r1]} · {rangePct}
          </div>
        )}
      </div>

      <div className="sgr-legend">
        <span><i className="before" />Before Gradient</span>
        <span><i className="after" />With Gradient</span>
        <span><i className="trend" />Their old trend</span>
        <span><i className="gap" />{metric === 'days' ? 'Time saved' : 'Added by Gradient'}</span>
        <span className="sgr-hint">
          {range ? 'Click the chart or press Esc to clear' : (
            <><span className="fine">Hover to scrub · drag to compare two months</span><span className="coarse">Drag along the chart to scrub</span></>
          )}
        </span>
      </div>

      <ol className="sgr-notes" key={s.id}>
        {s.notes.map((n, k) => (
          <li key={k} className={`${!without && n.i <= a.rv + 0.01 ? 'is-on' : ''}${focusK === k ? ' is-focus' : ''}`} style={{ animationDelay: `${k * 60}ms` }}>
            <button type="button" onPointerEnter={() => peekAt(n.i)} onPointerLeave={unpeek} onClick={() => pinAt(n.i)} aria-pressed={lock === n.i}>
              <i>{k + 1}</i>
              <span><b>{n.title}</b><small>{MONTHS[n.i]} · {n.body}</small></span>
            </button>
          </li>
        ))}
      </ol>
    </>
  );
}

export function SupplierGrowth() {
  const [sid, setSid] = useState(SUPPLIERS[0].id);
  const [metric, setMetric] = useState<MetricId>('revenue');
  const [without, setWithout] = useState(false);
  const [month, setMonth] = useState(0);
  const [seen, setSeen] = useState(false);
  const ref = useRef<HTMLDivElement>(null), who = useRef<HTMLDivElement>(null), tiles = useRef<HTMLDivElement>(null);
  const whoInd = useIndicator(who, '[aria-selected="true"]', sid);
  const tileInd = useIndicator(tiles, '.sgr-tile.is-on', metric);
  const s = SUPPLIERS.find((x) => x.id === sid)!;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="sup-section-shell sgr" id="results" aria-labelledby="sgr-title">
      <div className="sup-container">
        <div className="sup-section-header">
          <div className="sup-section-eyebrow"><span className="dot" /><span>RESULTS</span></div>
          <h2 className="sup-section-title" id="sgr-title">Suppliers sell more from their first month on Gradient.</h2>
          <p className="sup-section-desc">Each line is a supplier’s own month. The dashed line is where they were heading before joining; the hatched gap is what Gradient added.</p>
        </div>

        <div className="sgr-bar">
          <div className="sgr-who" ref={who} role="tablist" aria-label="Supplier">
            <Ind box={whoInd} className="sgr-who-ind" />
            {SUPPLIERS.map((x) => (
              <button key={x.id} type="button" role="tab" aria-selected={x.id === sid} onClick={() => setSid(x.id)}>
                <b>{x.name}</b><span>{x.kind}</span>
              </button>
            ))}
          </div>
          <span className="sgr-sample">Illustrative · sample data</span>
        </div>

        <div className="sgr-card" ref={ref}>
          <div className="sgr-tiles" ref={tiles} role="tablist" aria-label="Metric">
            <Ind box={tileInd} className="sgr-tile-ind" />
            {ORDER.map((id) => <Tile key={id} id={id} s={s} on={metric === id} month={month} without={without} pick={() => setMetric(id)} />)}
          </div>
          <div className="sgr-body">
            <GrowthChart s={s} metric={metric} without={without} setWithout={setWithout} seen={seen} onMonth={setMonth} />
          </div>
        </div>

        <p className="sgr-foot">
          Sample data for illustration. With live data, each supplier’s months after joining are compared with the trend of their own six months before.
        </p>
      </div>
    </section>
  );
}
