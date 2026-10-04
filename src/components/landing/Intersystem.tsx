'use client';
// "The Gradient intersystem": cafés, suppliers and brands wired into one core.
// Connector lines are routed from the live DOM positions of each product, so the layout
// stays pure CSS; data packets run along them and every arrival pulses the core and posts
// an event to its ticker. Hovering a side focuses it. Styles: app/intersystem.css
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

type Side = 'cafe' | 'supply' | 'brand' | 'core';
type Edge = 'l' | 'r' | 't' | 'b';

const COLOR: Record<Side, string> = { cafe: '#FF5A4E', supply: '#2BD46A', brand: '#A36BFF', core: '#8FA8FF' };

// from → to. `edge` takes the perpendicular coordinate from a container (e.g. the card's
// outer edge) so lines leave the card cleanly; `off` spreads several lines along the core's side;
// `mid` sets where the elbow turns, chosen so neighbouring lines never cross or run behind a card.
interface Link {
  id: string; side: Side; dashed?: boolean; mid?: number;
  from: { el: string; s: Edge; edge?: string };
  to: { el: string; s: Edge; off?: number };
}
const LINKS: Link[] = [
  { id: 'grabbit', side: 'cafe', mid: 0.45, from: { el: 'grabbit', s: 'r', edge: 'cafes' }, to: { el: 'core', s: 'l', off: -24 } },
  { id: 'omega', side: 'cafe', mid: 0.55, from: { el: 'omega', s: 'r', edge: 'cafes' }, to: { el: 'core', s: 'l', off: 24 } },
  { id: 'catalogue', side: 'supply', mid: 0.5, from: { el: 'catalogue', s: 'l', edge: 'suppliers' }, to: { el: 'core', s: 'r', off: -30 } },
  { id: 'inventory', side: 'supply', mid: 0.3, from: { el: 'inventory', s: 'l', edge: 'suppliers' }, to: { el: 'core', s: 'r', off: 0 } },
  { id: 'invoices', side: 'supply', mid: 0.7, from: { el: 'invoices', s: 'l', edge: 'suppliers' }, to: { el: 'core', s: 'r', off: 30 } },
  { id: 'bportal', side: 'brand', from: { el: 'bportal', s: 't', edge: 'brands' }, to: { el: 'core', s: 'b', off: -30 } },
  { id: 'field', side: 'brand', from: { el: 'field', s: 't', edge: 'brands' }, to: { el: 'core', s: 'b', off: 30 } },
  { id: 'graph', side: 'core', mid: 0.3, from: { el: 'graph', s: 'b' }, to: { el: 'core', s: 't', off: -40 } },
  { id: 'demand', side: 'core', mid: 0.3, from: { el: 'demand', s: 'b' }, to: { el: 'core', s: 't', off: 40 } },
  { id: 'sig-orders', side: 'core', dashed: true, from: { el: 'sig-orders', s: 'b' }, to: { el: 'graph', s: 't' } },
  { id: 'sig-demand', side: 'core', dashed: true, from: { el: 'sig-demand', s: 'b' }, to: { el: 'demand', s: 't' } },
];
const PER_LINK = 2;
const TO_CORE = new Set(LINKS.filter((L) => L.to.el === 'core').map((L) => L.id));

// Illustrative events for the core's live ticker
const EVENTS: Record<Side, string[]> = {
  cafe: ['Grabbit · pickup order #4821 at Café Lune', 'Omega · oat milk low, reorder drafted', 'Grabbit · 38 guests ordered ahead this hour', 'Omega · menu stock synced across 3 outlets'],
  supply: ['Catalogue · 12 SKUs published to every café', 'Inventory · warehouse stock synced', 'Invoices · INV-2207 settled T+7', 'Catalogue · new price list live'],
  brand: ['Field App · visit logged at Third Wave', 'Brand Portal · stock-out risk in Indiranagar', 'Field App · trial converted to first PO', 'Brand Portal · demand forecast refreshed'],
  core: ['Gradient · order split across 3 suppliers', 'Gradient · demand signal routed to brands'],
};

function elbow(x1: number, y1: number, x2: number, y2: number, horizontal: boolean, mid = 0.5) {
  const R = 16;
  if (horizontal) {
    if (Math.abs(y2 - y1) < 1) return `M${x1} ${y1}H${x2}`;
    const mx = x1 + (x2 - x1) * mid, sx = Math.sign(x2 - x1), sy = Math.sign(y2 - y1);
    const r = Math.min(R, Math.abs(y2 - y1) / 2, Math.abs(mx - x1), Math.abs(x2 - mx));
    return `M${x1} ${y1}H${mx - sx * r}Q${mx} ${y1} ${mx} ${y1 + sy * r}V${y2 - sy * r}Q${mx} ${y2} ${mx + sx * r} ${y2}H${x2}`;
  }
  if (Math.abs(x2 - x1) < 1) return `M${x1} ${y1}V${y2}`;
  const my = y1 + (y2 - y1) * mid, sx = Math.sign(x2 - x1), sy = Math.sign(y2 - y1);
  const r = Math.min(R, Math.abs(x2 - x1) / 2, Math.abs(my - y1), Math.abs(y2 - my));
  return `M${x1} ${y1}V${my - sy * r}Q${x1} ${my} ${x1 + sx * r} ${my}H${x2 - sx * r}Q${x2} ${my} ${x2} ${my + sy * r}V${y2}`;
}

/* ---------- small icons ---------- */
const I = {
  cup: <path d="M4 8h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8zM16 10h1.5a2.5 2.5 0 0 1 0 5H16M4 21h13" />,
  omega: <path d="M5 19h4v-2.2A7 7 0 1 1 15 16.8V19h4" />,
  book: <path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h10" />,
  box: <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9" />,
  receipt: <path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6M9 16h3" />,
  chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  pin: <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />,
};
function Ico({ d }: { d: ReactNode }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>;
}

export function Intersystem() {
  const stageRef = useRef<HTMLDivElement>(null);
  const els = useRef<Record<string, HTMLElement | null>>({});
  const reg = useCallback((k: string) => (n: HTMLElement | null) => { els.current[k] = n; }, []);
  const [paths, setPaths] = useState<{ id: string; d: string; side: Side; dashed?: boolean; dot: [number, number] }[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [focus, setFocus] = useState<Side | null>(null);
  const focusRef = useRef<Side | null>(null);
  focusRef.current = focus;

  const pathEls = useRef<(SVGPathElement | null)[]>([]);
  const packetEls = useRef<(SVGGElement | null)[]>([]);
  const coreRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const tickRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  /* ---------- route the connectors from the live layout ---------- */
  const route = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const sr = stage.getBoundingClientRect();
    setSize({ w: sr.width, h: sr.height });
    if (!matchMedia('(min-width: 1000px)').matches) { setPaths([]); return; }
    const rect = (k: string) => {
      const n = els.current[k]; if (!n) return null;
      const b = n.getBoundingClientRect();
      return { l: b.left - sr.left, r: b.right - sr.left, t: b.top - sr.top, b: b.bottom - sr.top, cx: b.left - sr.left + b.width / 2, cy: b.top - sr.top + b.height / 2 };
    };
    const out: typeof paths = [];
    for (const L of LINKS) {
      const a = rect(L.from.el), z = rect(L.to.el), e = L.from.edge ? rect(L.from.edge) : a;
      if (!a || !z || !e) continue;
      const fx = L.from.s === 'r' ? e.r : L.from.s === 'l' ? e.l : a.cx;
      const fy = L.from.s === 't' ? e.t : L.from.s === 'b' ? e.b : a.cy;
      const off = L.to.off ?? 0;
      const tx = L.to.s === 'r' ? z.r : L.to.s === 'l' ? z.l : z.cx + off;
      const ty = L.to.s === 't' ? z.t : L.to.s === 'b' ? z.b : z.cy + off;
      out.push({ id: L.id, side: L.side, dashed: L.dashed, dot: [fx, fy], d: elbow(fx, fy, tx, ty, L.from.s === 'l' || L.from.s === 'r', L.mid) });
    }
    setPaths(out);
  }, []);

  useLayoutEffect(() => {
    route();
    const ro = new ResizeObserver(() => route());
    if (stageRef.current) ro.observe(stageRef.current);
    document.fonts?.ready.then(route).catch(() => {});
    return () => ro.disconnect();
  }, [route]);

  useEffect(() => {
    const n = stageRef.current; if (!n) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: '120px' });
    io.observe(n);
    return () => io.disconnect();
  }, []);

  /* ---------- packets ---------- */
  useEffect(() => {
    if (!inView || paths.length === 0) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lens = pathEls.current.map((p) => (p ? p.getTotalLength() : 0));
    const pk = paths.flatMap((_, li) => Array.from({ length: PER_LINK }, (_, k) => ({
      li, dir: k % 2 === 0 ? 1 : -1, t: Math.random(), speed: 95 + Math.random() * 55,
    })));
    let count = 2481, lastEvt = 0, raf = 0, last = performance.now();
    const pulse = (side: Side) => {
      const c = coreRef.current; if (!c) return;
      c.style.setProperty('--isx-hit', COLOR[side]);
      c.classList.remove('is-hit'); void c.offsetWidth; c.classList.add('is-hit');
    };
    const post = (side: Side, now: number) => {
      count += 1;
      if (countRef.current) countRef.current.textContent = count.toLocaleString('en-IN');
      if (now - lastEvt < 1500 || !tickRef.current) return;
      lastEvt = now;
      const list = EVENTS[side], el = tickRef.current;
      el.style.setProperty('--isx-dot', COLOR[side]);
      el.classList.remove('is-in'); void el.offsetWidth;
      el.querySelector('span')!.textContent = list[(Math.random() * list.length) | 0];
      el.classList.add('is-in');
    };
    const place = (g: SVGGElement, p: SVGPathElement, len: number, t: number, dir: number) => {
      const nodes = g.children;
      for (let k = 0; k < nodes.length; k++) {
        const tt = Math.min(1, Math.max(0, t - dir * k * (14 / len)));
        const pt = p.getPointAtLength(tt * len);
        nodes[k].setAttribute('cx', pt.x.toFixed(1)); nodes[k].setAttribute('cy', pt.y.toFixed(1));
      }
    };
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const f = focusRef.current;
      pk.forEach((q, i) => {
        const g = packetEls.current[i], p = pathEls.current[q.li], len = lens[q.li];
        if (!g || !p || !len) return;
        const side = paths[q.li].side, boost = f && f === side ? 1.9 : 1;
        q.t += (q.speed * boost * dt / len) * q.dir;
        if (q.t >= 1 || q.t <= 0) {
          // inbound packets that reach the core light it up and post an event
          if (q.dir > 0 && TO_CORE.has(paths[q.li].id)) { pulse(side); post(side, now); }
          q.t = q.dir > 0 ? 0 : 1;
        }
        g.style.opacity = f && f !== side && side !== 'core' ? '0.12' : '1';
        place(g, p, len, q.t, q.dir);
      });
      raf = requestAnimationFrame(frame);
    };
    if (reduce) {
      pk.forEach((q, i) => { const g = packetEls.current[i], p = pathEls.current[q.li]; if (g && p) place(g, p, lens[q.li], 0.5, q.dir); });
      return;
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [inView, paths]);

  // subtle 3D tilt toward the pointer
  const tilt = (e: React.PointerEvent<HTMLElement>) => {
    const n = e.currentTarget, b = n.getBoundingClientRect();
    n.style.setProperty('--rx', `${((e.clientY - b.top) / b.height - 0.5) * -5}deg`);
    n.style.setProperty('--ry', `${((e.clientX - b.left) / b.width - 0.5) * 6}deg`);
  };
  const untilt = (e: React.PointerEvent<HTMLElement>) => { e.currentTarget.style.setProperty('--rx', '0deg'); e.currentTarget.style.setProperty('--ry', '0deg'); };
  const card = (side: Side) => ({
    onPointerEnter: () => setFocus(side), onPointerLeave: (e: React.PointerEvent<HTMLElement>) => { setFocus(null); untilt(e); }, onPointerMove: tilt,
    className: `isx-card isx-${side}${focus && focus !== side ? ' is-dim' : ''}${focus === side ? ' is-focus' : ''}`,
  });

  return (
    <section className={`isx${inView ? ' is-live' : ''}`} id="intersystem" aria-labelledby="isx-title">
      <div className="isx-glow isx-glow-a" aria-hidden="true" />
      <div className="isx-glow isx-glow-b" aria-hidden="true" />
      <div className="isx-glow isx-glow-c" aria-hidden="true" />

      <div className="isx-head">
        <span className="isx-eyebrow"><i aria-hidden="true" />The Gradient intersystem</span>
        <h2 id="isx-title">Three sides of the counter.<br /><em>One system</em> in the middle.</h2>
        <p>Cafés, suppliers and brands each run their own products. Gradient sits between them, so every order, stock level and visit becomes a signal the other two can act on.</p>
        <div className="isx-legend" role="group" aria-label="Focus a side">
          {(['cafe', 'supply', 'brand'] as const).map((s) => (
            <button key={s} type="button" className={`isx-key isx-${s}${focus === s ? ' is-on' : ''}`} aria-pressed={focus === s}
              onClick={() => setFocus(focus === s ? null : s)}>
              <i aria-hidden="true" />{s === 'cafe' ? 'Cafés' : s === 'supply' ? 'Suppliers' : 'Brands'}
            </button>
          ))}
        </div>
      </div>

      <div className="isx-stage" ref={stageRef}>
        <svg className="isx-wires" width={size.w} height={size.h} viewBox={`0 0 ${size.w || 1} ${size.h || 1}`} aria-hidden="true">
          {paths.map((p, i) => (
            <g key={p.id} className={`isx-wire isx-${p.side}${focus && focus !== p.side && p.side !== 'core' ? ' is-dim' : ''}${focus === p.side ? ' is-focus' : ''}`}>
              <path className="isx-wire-glow" d={p.d} />
              <path ref={(n) => { pathEls.current[i] = n; }} className={`isx-wire-line${p.dashed ? ' is-dashed' : ''}`} d={p.d} />
              <circle className="isx-wire-dot" cx={p.dot[0]} cy={p.dot[1]} r="3.5" />
            </g>
          ))}
          {paths.flatMap((p, li) => Array.from({ length: PER_LINK }, (_, k) => (
            <g key={`${p.id}-${k}`} ref={(n) => { packetEls.current[li * PER_LINK + k] = n; }} className="isx-packet" style={{ color: COLOR[p.side] }}>
              <circle r="1.6" opacity=".25" /><circle r="2.1" opacity=".5" /><circle r="2.8" opacity=".85" /><circle r="3.4" className="isx-packet-head" />
            </g>
          )).reverse())}
        </svg>

        {/* signals bar */}
        <div className="isx-signals" aria-label="Signals Gradient listens to">
          <span className="isx-slot" aria-hidden="true" />
          <span className="isx-sig" ref={reg('sig-orders')}>Orders</span>
          <span className="isx-sig">Stock levels</span>
          <span className="isx-slot isx-slot-wide" aria-hidden="true" />
          <span className="isx-sig">Payments</span>
          <span className="isx-sig" ref={reg('sig-demand')}>Demand</span>
          <span className="isx-slot" aria-hidden="true" />
        </div>

        <div className="isx-node isx-node-graph" ref={reg('graph')}>Order graph</div>
        <div className="isx-node isx-node-demand" ref={reg('demand')}>Demand engine</div>

        {/* cafés */}
        <article {...card('cafe')} ref={reg('cafes')} aria-label="For cafés">
          <header><span className="isx-tag">Cafés</span><h3>Where every order starts.</h3></header>
          <div className="isx-prod" ref={reg('grabbit')}>
            <span className="isx-ic"><Ico d={I.cup} /></span>
            <div><strong>Grabbit</strong><small>Order-ahead and pickup for café guests</small>
              <ul><li>Order-ahead</li><li>Pickup</li><li>Guest demand</li></ul></div>
            <em className="isx-live"><b />412 pickups today</em>
          </div>
          <div className="isx-prod" ref={reg('omega')}>
            <span className="isx-ic"><Ico d={I.omega} /></span>
            <div><strong>Omega</strong><small>Runs the café floor: menu, stock and reorders</small>
              <ul><li>Menu</li><li>Stock</li><li>Auto-reorder</li></ul></div>
            <em className="isx-live"><b />3 outlets synced</em>
          </div>
        </article>

        {/* core */}
        <div className="isx-core-wrap">
          <div className="isx-core" ref={(n) => { coreRef.current = n; els.current.core = n; }}>
            <div className="isx-core-in">
              <svg className="isx-core-mark" viewBox="0 0 26 26" aria-hidden="true">
                <defs><linearGradient id="isxRing" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#A36BFF" /><stop offset=".5" stopColor="#FF5A4E" /><stop offset="1" stopColor="#2BD46A" /></linearGradient></defs>
                <circle cx="13" cy="13" r="9.5" fill="none" stroke="url(#isxRing)" strokeWidth="3" strokeLinecap="round" strokeDasharray="44.8 60" />
                <circle cx="13" cy="13" r="2.6" fill="#fff" />
              </svg>
              <strong className="isx-core-name">gradient</strong>
              <span className="isx-core-count"><span ref={countRef}>2,481</span> signals routed today</span>
              <div className="isx-tick" ref={tickRef} aria-live="off"><i aria-hidden="true" /><span>Gradient · order split across 3 suppliers</span></div>
            </div>
          </div>
        </div>

        {/* suppliers */}
        <article {...card('supply')} ref={reg('suppliers')} aria-label="For suppliers">
          <header><span className="isx-tag">Suppliers</span><h3>Supplier Portal</h3></header>
          <div className="isx-mod" ref={reg('catalogue')}>
            <span className="isx-ic"><Ico d={I.book} /></span>
            <div><strong>Catalogue</strong><small>Publish once, sell to every café</small></div>
            <em className="isx-stat">1,240<small>SKUs live</small></em>
          </div>
          <div className="isx-mod" ref={reg('inventory')}>
            <span className="isx-ic"><Ico d={I.box} /></span>
            <div><strong>Inventory</strong><small>Live stock across warehouses</small></div>
            <span className="isx-bars" aria-hidden="true">{[38, 62, 46, 80, 58, 92, 70].map((h, i) => <i key={i} style={{ height: `${h}%` }} />)}</span>
          </div>
          <div className="isx-mod" ref={reg('invoices')}>
            <span className="isx-ic"><Ico d={I.receipt} /></span>
            <div><strong>Invoices</strong><small>GST-ready, settled in 7 days</small></div>
            <em className="isx-stat">₹4.2L<small>settling</small></em>
          </div>
        </article>

        {/* brands */}
        <article {...card('brand')} ref={reg('brands')} aria-label="For brands">
          <div className="isx-brand-grid">
            <div className="isx-prod isx-prod-col" ref={reg('bportal')}>
              <div className="isx-prod-top"><span className="isx-ic"><Ico d={I.chart} /></span>
                <div><strong>Brand Portal</strong><small>See demand before it hits the shelf</small></div></div>
              <svg className="isx-forecast" viewBox="0 0 220 64" aria-hidden="true">
                <path className="isx-fc-area" d="M0 50 L30 44 L60 47 L90 36 L120 38 L140 28 L140 64 L0 64Z" />
                <path className="isx-fc-line" d="M0 50 L30 44 L60 47 L90 36 L120 38 L140 28" />
                <path className="isx-fc-pred" d="M140 28 L170 22 L195 15 L220 9" />
                <circle cx="140" cy="28" r="3" />
              </svg>
              <ul><li>Stock prediction</li><li>Sell-through</li><li>Trials</li></ul>
            </div>
            <header className="isx-brand-head"><span className="isx-tag">Brands</span><h3>Know where your stock is going, and who&apos;s selling it.</h3></header>
            <div className="isx-prod isx-prod-col" ref={reg('field')}>
              <div className="isx-prod-top"><span className="isx-ic"><Ico d={I.pin} /></span>
                <div><strong>Field App</strong><small>For your sales team on the road</small></div></div>
              <div className="isx-field">
                <span><b>18</b>visits today</span><span><b>34%</b>conversion</span><span><b>6</b>routes live</span>
              </div>
              <ul><li>Visits</li><li>Conversions</li><li>Routes</li></ul>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
