'use client';
// "The Gradient intersystem": cafés, suppliers and brands, each on a track into one core.
// Studio-lit 3D carts (public/g365/js/carts.js) roll along the tracks; each delivery ticks the
// core's counter and posts to its ticker. Tracks are routed from the live layout, so the grid
// stays pure CSS. Styles: app/intersystem.css
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { loadG365, G365_LIBS } from './g365-scripts';

type Side = 'cafe' | 'supply' | 'brand';
type Edge = 'l' | 'r' | 't';

const COLOR: Record<Side, string> = { cafe: '#E5483B', supply: '#1F9D57', brand: '#7C4DDB' };
const TRACKS: { side: Side; from: { el: string; s: Edge }; to: { el: string; s: 'l' | 'r' | 'b' } }[] = [
  { side: 'cafe', from: { el: 'cafes', s: 'r' }, to: { el: 'core', s: 'l' } },
  { side: 'supply', from: { el: 'suppliers', s: 'l' }, to: { el: 'core', s: 'r' } },
  { side: 'brand', from: { el: 'brands', s: 't' }, to: { el: 'core', s: 'b' } },
];
const CART_PX = 38, SPEED = 52;

// Illustrative events for the core's ticker
const EVENTS: Record<Side, string[]> = {
  cafe: ['Grabbit · pickup order #4821, Café Lune', 'Omega · oat milk low, reorder drafted', 'Grabbit · 38 guests ordered ahead this hour'],
  supply: ['Catalogue · 12 SKUs published', 'Inventory · warehouse stock synced', 'Invoices · INV-2207 settled'],
  brand: ['Field App · visit logged at Third Wave', 'Brand Portal · stock-out risk in Indiranagar', 'Field App · trial converted to first PO'],
};

// Signals that come and go in the bar above the core
const SIGNALS = ['Orders', 'Stock levels', 'Invoices', 'Visits', 'Demand', 'Payments', 'Reorders', 'Trials', 'Pickups', 'Routes'];
const SLOTS_START: (string | null)[] = [null, 'Orders', 'Stock levels', null, 'Visits', 'Demand'];

// A label that flips to the next value every few seconds (keyed, so each new value plays the flip-in)
function Flip({ values, every = 2800, delay = 0 }: { values: string[]; every?: number; delay?: number }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (values.length < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let iv: ReturnType<typeof setInterval>;
    const t = setTimeout(() => { iv = setInterval(() => setI((n) => (n + 1) % values.length), every); }, delay);
    return () => { clearTimeout(t); clearInterval(iv); };
  }, [values, every, delay]);
  return <span className="isx-flip"><span key={i}>{values[i]}</span></span>;
}

// Slots fill, flip to another signal, or empty out again
function SignalBar({ innerRef }: { innerRef: (n: HTMLElement | null) => void }) {
  const [slots, setSlots] = useState(SLOTS_START);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const iv = setInterval(() => setSlots((cur) => {
      const next = cur.slice(), k = (Math.random() * next.length) | 0;
      const free = SIGNALS.filter((x) => !next.includes(x));
      const filled = next.filter(Boolean).length;
      if (next[k] && filled > 3 && Math.random() < 0.4) next[k] = null;              // go
      else next[k] = free[(Math.random() * free.length) | 0] ?? next[k];             // come, or flip
      return next;
    }), 1600);
    return () => clearInterval(iv);
  }, []);
  return (
    <div className="isx-signals" ref={innerRef} aria-hidden="true">
      {slots.map((x, i) => (
        <span key={i} className={`isx-slot${x ? ' is-on' : ''}`}>{x && <span key={x}>{x}</span>}</span>
      ))}
    </div>
  );
}

function route(x1: number, y1: number, x2: number, y2: number, horizontal: boolean) {
  const R = 18;
  if (horizontal ? Math.abs(y2 - y1) < 2 : Math.abs(x2 - x1) < 2) return horizontal ? `M${x1} ${y1}H${x2}` : `M${x1} ${y1}V${y2}`;
  if (horizontal) {
    const mx = (x1 + x2) / 2, sx = Math.sign(x2 - x1), sy = Math.sign(y2 - y1), r = Math.min(R, Math.abs(y2 - y1) / 2, Math.abs(x2 - x1) / 4);
    return `M${x1} ${y1}H${mx - sx * r}Q${mx} ${y1} ${mx} ${y1 + sy * r}V${y2 - sy * r}Q${mx} ${y2} ${mx + sx * r} ${y2}H${x2}`;
  }
  const my = (y1 + y2) / 2, sx = Math.sign(x2 - x1), sy = Math.sign(y2 - y1), r = Math.min(R, Math.abs(x2 - x1) / 2, Math.abs(y2 - y1) / 4);
  return `M${x1} ${y1}V${my - sy * r}Q${x1} ${my} ${x1 + sx * r} ${my}H${x2 - sx * r}Q${x2} ${my} ${x2} ${my + sy * r}V${y2}`;
}

const I = {
  cup: <path d="M4 8h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8zM16 10h1.5a2.5 2.5 0 0 1 0 5H16M4 21h13" />,
  omega: <path d="M5 19h4v-2.2A7 7 0 1 1 15 16.8V19h4" />,
  book: <path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h10" />,
  box: <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9" />,
  receipt: <path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6M9 16h3" />,
  chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  pin: <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />,
};

let rowN = 0;
function Row({ icon, name, desc, meta }: { icon: ReactNode; name: string; desc: string; meta: string[] }) {
  const [delay] = useState(() => (rowN++ % 7) * 380);
  return (
    <div className="isx-row">
      <span className="isx-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icon}</svg></span>
      <div><strong>{name}</strong><small>{desc}</small></div>
      <em><Flip values={meta} delay={delay} /></em>
    </div>
  );
}

type Carts = { resize: () => void; render: (items: object[]) => void };

export function Intersystem() {
  const stageRef = useRef<HTMLDivElement>(null);
  const els = useRef<Record<string, HTMLElement | null>>({});
  const reg = useCallback((k: string) => (n: HTMLElement | null) => { els.current[k] = n; }, []);
  const [tracks, setTracks] = useState<{ side: Side; d: string }[]>([]);
  const [feed, setFeed] = useState('');
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [focus, setFocus] = useState<Side | null>(null);
  const [inView, setInView] = useState(false);
  const pathEls = useRef<(SVGPathElement | null)[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const cartsRef = useRef<Carts | null>(null);
  const [cartsReady, setCartsReady] = useState(false);

  /* ---------- lay the tracks from the live layout ---------- */
  const layout = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const sr = stage.getBoundingClientRect();
    setSize({ w: sr.width, h: sr.height });
    if (!matchMedia('(min-width: 1000px)').matches) { setTracks([]); return; }
    const rect = (k: string) => {
      const b = els.current[k]?.getBoundingClientRect();
      return b && { l: b.left - sr.left, r: b.right - sr.left, t: b.top - sr.top, b: b.bottom - sr.top, cx: b.left - sr.left + b.width / 2, cy: b.top - sr.top + b.height / 2 };
    };
    const out: { side: Side; d: string }[] = [];
    for (const T of TRACKS) {
      const a = rect(T.from.el), z = rect(T.to.el);
      if (!a || !z) continue;
      const x1 = T.from.s === 'r' ? a.r : T.from.s === 'l' ? a.l : a.cx, y1 = T.from.s === 't' ? a.t : a.cy;
      const x2 = T.to.s === 'l' ? z.l : T.to.s === 'r' ? z.r : z.cx, y2 = T.to.s === 'b' ? z.b : z.cy;
      out.push({ side: T.side, d: route(x1, y1, x2, y2, T.from.s !== 't') });
    }
    setTracks(out);
    const bar = rect('signals'), core = rect('core');
    setFeed(bar && core ? `M${core.cx} ${bar.b}V${core.t}` : '');
  }, []);

  useLayoutEffect(() => {
    layout();
    const ro = new ResizeObserver(() => layout());
    if (stageRef.current) ro.observe(stageRef.current);
    document.fonts?.ready.then(layout).catch(() => {});
    return () => ro.disconnect();
  }, [layout]);

  useEffect(() => {
    const n = stageRef.current; if (!n) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: '160px' });
    io.observe(n);
    return () => io.disconnect();
  }, []);

  /* ---------- carts ---------- */
  useEffect(() => {
    if (!inView || cartsRef.current || !canvasRef.current) return;
    let alive = true;
    loadG365([...G365_LIBS, 'carts.js']).then(() => {
      const G = (window as unknown as { G365?: { createCarts?: (c: HTMLCanvasElement) => Carts | null } }).G365;
      if (!alive || !canvasRef.current || !G?.createCarts) return;
      cartsRef.current = G.createCarts(canvasRef.current);
      if (cartsRef.current) setCartsReady(true);
    }).catch(() => {});
    return () => { alive = false; };
  }, [inView]);

  useEffect(() => { cartsRef.current?.resize(); }, [size, cartsReady]);

  useEffect(() => {
    const carts = cartsRef.current;
    if (!inView || !carts || tracks.length === 0) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lens = pathEls.current.map((p) => (p ? p.getTotalLength() : 0));
    // one cart per track, staggered so deliveries alternate between sides
    const state = tracks.map((_, i) => ({ d: (lens[i] || 1) * (reduce ? 0.5 : i / tracks.length) }));
    let raf = 0, last = performance.now();
    const deliver = (side: Side) => {
      const c = coreRef.current;
      if (c) {
        c.style.setProperty('--isx-hit', COLOR[side]);
        c.classList.remove('is-hit');
        void c.offsetWidth;
        c.classList.add('is-hit');
      }
    };
    const draw = (now: number, dt: number) => {
      const items: object[] = [];
      tracks.forEach((t, i) => {
        const p = pathEls.current[i], len = lens[i], s = state[i];
        if (!p || !len) return;
        if (!reduce) {
          s.d += SPEED * dt;
          if (s.d >= len) { s.d = 0; deliver(t.side); }
        }
        const a = p.getPointAtLength(s.d), b = p.getPointAtLength(Math.min(len, s.d + 2));
        const ease = Math.min(1, s.d / 22, (len - s.d) / 22);       // roll out of the card, into the core
        items.push({ id: t.side, color: COLOR[t.side], x: a.x, y: a.y, yaw: Math.atan2(-(b.y - a.y), b.x - a.x),
          dist: s.d, size: CART_PX, scale: Math.max(0, ease) });
      });
      carts.render(items);
    };
    if (reduce) { draw(performance.now(), 0); return; }
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      draw(now, dt);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [inView, tracks, cartsReady]);

  const side = (s: Side) => ({
    onPointerEnter: () => setFocus(s), onPointerLeave: () => setFocus(null),
    className: `isx-card isx-${s}${focus && focus !== s ? ' is-dim' : ''}`,
  });

  return (
    <section className={`isx${inView ? ' is-live' : ''}`} id="intersystem" aria-labelledby="isx-title">
      <div className="isx-head">
        <span className="isx-eyebrow">The Gradient intersystem</span>
        <h2 id="isx-title">Three sides of the counter. <span>One system in the middle.</span></h2>
        <p>Cafés, suppliers and brands each run their own products. Gradient carries what moves between them, so every order, stock level and visit reaches the side that needs it.</p>
      </div>

      <div className="isx-stage" ref={stageRef}>
        <svg className="isx-tracks" width={size.w} height={size.h} viewBox={`0 0 ${size.w || 1} ${size.h || 1}`} aria-hidden="true">
          {feed && <path className="isx-feed" d={feed} />}
          {tracks.map((t, i) => (
            <g key={t.side} className={`isx-track${focus && focus !== t.side ? ' is-dim' : ''}`}>
              <path className="isx-sleepers" d={t.d} />
              <path className="isx-rails" d={t.d} />
              <path className="isx-rails-gap" d={t.d} ref={(n) => { pathEls.current[i] = n; }} />
            </g>
          ))}
        </svg>
        <canvas className="isx-carts" ref={canvasRef} aria-hidden="true" />

        <SignalBar innerRef={reg('signals')} />

        <article {...side('cafe')} ref={reg('cafes')} aria-label="For cafés">
          <header><span className="isx-tag"><i />Cafés</span><h3>Where every order starts</h3></header>
          <Row icon={I.cup} name="Grabbit" desc="Order-ahead and pickup for guests" meta={['Order-ahead', 'Pickup', 'Guest demand']} />
          <Row icon={I.omega} name="Omega" desc="Menu, stock and reorders on the floor" meta={['Menu', 'Stock', 'Auto-reorder']} />
        </article>

        <div className="isx-core" ref={(n) => { coreRef.current = n; els.current.core = n; }}>
          <svg className="isx-mark" viewBox="0 0 26 26" aria-hidden="true">
            <defs><linearGradient id="isxRing" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7F00FF" /><stop offset=".5" stopColor="#FF0000" /><stop offset="1" stopColor="#22C55E" /></linearGradient></defs>
            <circle cx="13" cy="13" r="9.5" fill="none" stroke="url(#isxRing)" strokeWidth="3" strokeLinecap="round" strokeDasharray="44.8 60" />
            <circle cx="13" cy="13" r="2.6" fill="#142B63" />
          </svg>
          <strong>gradient</strong>
        </div>


        <article {...side('supply')} ref={reg('suppliers')} aria-label="For suppliers">
          <header><span className="isx-tag"><i />Suppliers</span><h3>Supplier Portal</h3></header>
          <Row icon={I.book} name="Catalogue" desc="Publish once, sell to every café" meta={['1,240 SKUs', 'Price lists', 'New launches']} />
          <Row icon={I.box} name="Inventory" desc="Live stock across warehouses" meta={['Synced', 'Low-stock alerts', 'Batches']} />
          <Row icon={I.receipt} name="Invoices" desc="GST-ready, settled in 7 days" meta={['T+7', 'GST-ready', 'Auto-reconciled']} />
        </article>

        <article {...side('brand')} ref={reg('brands')} aria-label="For brands">
          <header><span className="isx-tag"><i />Brands</span><h3>Know where stock is going, and who&apos;s selling it</h3></header>
          <div className="isx-pair">
            <Row icon={I.chart} name="Brand Portal" desc="Stock prediction and sell-through" meta={['Forecast', 'Sell-through', 'Trials']} />
            <Row icon={I.pin} name="Field App" desc="Visits, conversions and routes for reps" meta={['Visits', 'Conversions', 'Routes']} />
          </div>
        </article>
      </div>
    </section>
  );
}
