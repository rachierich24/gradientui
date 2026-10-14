'use client';
// The Gradient intersystem — a system diagram in the manner of Stripe's. Café systems feed Gradient's
// products, which route through one core chip out to suppliers, brands and fulfilment. Dotted connectors
// carry comets of light in the order a real order moves; tray slots and tiles quietly come and go.
// Monochrome at rest: hovering a side (or the core) brings its colour in and quiets the rest.
// Everything is drawn on one fixed 1120×576 canvas and scaled to fit, so lines and boxes always meet.
// Styles: app/intersystem.css
import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';

type Side = 'cafe' | 'supply' | 'brand';
type Hover = Side | 'core' | null;
const W = 1120, H = 576;

/* ---------- line icons (24×24, stroked) ---------- */
const ICON: Record<string, { label: string; d: ReactNode }> = {
  beans: { label: 'Coffee', d: <><ellipse cx="12" cy="12" rx="5.6" ry="8" transform="rotate(30 12 12)" /><path d="M14.6 5.6c-2.6 2-3.6 4.4-2.6 6.6s.2 4.6-2.6 6.2" /></> },
  milk: { label: 'Dairy', d: <><path d="M8 3h8v3l2 3v12H6V9l2-3z" /><path d="M6 9h12M8 6h8" /></> },
  cups: { label: 'Cups', d: <><path d="M6.5 8h11l-1.4 12.5H7.9z" /><path d="M5.5 8h13M7.5 4.5h9L17.5 8h-11z" /></> },
  syrup: { label: 'Syrups', d: <><path d="M10 2.5h4v3l2 3V21H8V8.5l2-3z" /><path d="M8 13h8" /></> },
  box: { label: 'Packaging', d: <><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" /><path d="M4 7.5l8 4.5 8-4.5M12 12v9" /></> },
  leaf: { label: 'Tea', d: <><path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14z" /><path d="M5 19l8-8" /></> },
  chart: { label: 'Forecasts', d: <path d="M4 20V10M10 20V4M16 20v-7M21 20H3" /> },
  pin: { label: 'Field visits', d: <><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></> },
  tag: { label: 'Trials', d: <><path d="M3 12.4V4h8.4L21 13.6 13.6 21z" /><circle cx="7.6" cy="7.6" r="1.4" /></> },
  megaphone: { label: 'Campaigns', d: <><path d="M3 10v4h3l7 4V6L6 10z" /><path d="M16 9a4 4 0 0 1 0 6M19 7a7 7 0 0 1 0 10" /></> },
  target: { label: 'Sell-through', d: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r=".8" /></> },
  users: { label: 'Reps', d: <><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19c.6-3.3 2.8-5 5.5-5s4.9 1.7 5.5 5" /><circle cx="17" cy="9" r="2.4" /><path d="M15.5 14.2c2.4-.5 4.4.9 5 3.8" /></> },
};

/* ---------- the diagram, in canvas coordinates ---------- */
// connectors, each written in the direction the work flows; `delay` places its comet in the 6.4s story
const PATHS: { d: string; side: Side; delay: number; ghost?: boolean }[] = [
  { d: 'M434 72V122', side: 'cafe', delay: 0 },
  { d: 'M434 160V214Q434 226 446 226H524Q536 226 536 238V248', side: 'cafe', delay: 0.9 },
  { d: 'M686 72V122', side: 'cafe', delay: 0.45 },
  { d: 'M686 160V214Q686 226 674 226H596Q584 226 584 238V248', side: 'cafe', delay: 1.35 },
  { d: 'M492 340H426', side: 'supply', delay: 2.3 },
  { d: 'M274 340H232', side: 'supply', delay: 3.2 },
  { d: 'M560 384V434', side: 'supply', delay: 2.3 },
  { d: 'M560 472V486Q560 498 548 498H400Q388 498 388 510V524', side: 'supply', delay: 0, ghost: true },
  { d: 'M560 472V486Q560 498 572 498H720Q732 498 732 510V524', side: 'supply', delay: 0, ghost: true },
  { d: 'M560 472V486Q560 498 548 498H516Q504 498 504 510V524', side: 'supply', delay: 3.2 },
  { d: 'M560 472V486Q560 498 572 498H604Q616 498 616 510V524', side: 'supply', delay: 3.2 },
  { d: 'M628 340H694', side: 'brand', delay: 2.7 },
  { d: 'M846 340H888', side: 'brand', delay: 3.6 },
];

const PILLS: { t: string; side: Side; left: number; top: number; w: number }[] = [
  { t: 'Grabbit', side: 'cafe', left: 380, top: 122, w: 108 },
  { t: 'Omega', side: 'cafe', left: 636, top: 122, w: 100 },
  { t: 'Supplier Portal', side: 'supply', left: 274, top: 321, w: 152 },
  { t: 'Brand Portal', side: 'brand', left: 694, top: 321, w: 152 },
  { t: 'Fulfilment', side: 'supply', left: 498, top: 434, w: 124 },
];

const TRAY_W = [84, 124, 116, 124, 84];
const ENDS: { t: string | null; left: number; w: number }[] = [
  { t: null, left: 340, w: 96 },
  { t: 'Dispatch', left: 452, w: 104 },
  { t: 'Invoices', left: 564, w: 104 },
  { t: null, left: 684, w: 96 },
];

const STACK: { side: Side; label: string; pills: string[]; body: string }[] = [
  { side: 'cafe', label: 'CAFÉS', pills: ['Grabbit', 'Omega'], body: 'Order-ahead and the café floor send every order and stock level in.' },
  { side: 'supply', label: 'SUPPLIERS', pills: ['Supplier Portal', 'Fulfilment'], body: 'Orders route to the right supplier, then out for dispatch and invoicing.' },
  { side: 'brand', label: 'BRANDS', pills: ['Brand Portal'], body: 'Demand reaches brands as it happens, café by café.' },
];

function Mark({ size = 30 }: { size?: number }) {
  return (
    <svg className="isx-mark" viewBox="0 0 28 28" width={size} height={size} aria-hidden="true">
      <path className="isx-arc is-cafe" d="M 7.68 8.31 A 8.5 8.5 0 0 1 20.32 8.31" />
      <path className="isx-arc is-brand" d="M 22.08 11.37 A 8.5 8.5 0 0 1 15.77 22.31" />
      <path className="isx-arc is-supply" d="M 12.23 22.31 A 8.5 8.5 0 0 1 5.92 11.37" />
      <circle cx="14" cy="14" r="2.6" fill="#F5F6F7" />
    </svg>
  );
}

function Tiles({ items, side, left }: { items: (string | null)[]; side: Side; left: number }) {
  return (
    <div className="isx-block" data-side={side} data-hit={side} style={{ left, top: 267 }}>
      {items.map((it, i) => (
        <div key={i} className={`isx-tile${it ? '' : ' is-ghost'}`} title={it ? ICON[it].label : undefined}>
          {it && (
            <svg key={it} viewBox="0 0 24 24" aria-label={ICON[it].label} role="img">{ICON[it].d}</svg>
          )}
        </div>
      ))}
    </div>
  );
}

export function Intersystem() {
  const secRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<SVGSVGElement>(null);
  const [s, setS] = useState(1);
  const [hover, setHover] = useState<Hover>(null);
  const [tray, setTray] = useState<(string | null)[]>([null, 'Order-ahead', 'Menu', 'Stock room', null]);
  const [sup, setSup] = useState<(string | null)[]>([null, 'beans', 'milk', null, 'cups', 'syrup']);
  const [brd, setBrd] = useState<(string | null)[]>(['chart', 'pin', null, 'tag', 'megaphone', null]);

  // scale the canvas to the width available, and down a little on short screens so the
  // heading and the whole diagram share one frame
  useLayoutEffect(() => {
    const fit = () => {
      const sec = secRef.current;
      if (!sec) return;
      const cs = getComputedStyle(sec);
      const w = sec.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const room = window.innerHeight - 74 - (headRef.current?.offsetHeight ?? 0) - 130;
      setS(Math.min(1, w / W, Math.max(0.72, room / H)));
    };
    fit();
    const ro = new ResizeObserver(fit);
    if (secRef.current) ro.observe(secRef.current);
    addEventListener('resize', fit);
    return () => { ro.disconnect(); removeEventListener('resize', fit); };
  }, []);

  useEffect(() => {
    linesRef.current?.querySelectorAll<SVGPathElement>('.isx-comet').forEach((p) => {
      p.style.setProperty('--len', String(Math.round(p.getTotalLength())));
    });
  }, []);

  // slots and tiles come and go, a little at a time
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const MID = ['Menu', 'Loyalty', 'Pickup', 'Kitchen', 'Table QR', 'Reorders'];
    const END = ['Prep', 'Waste', 'Shifts', 'Tabs'];
    const SUP = ['beans', 'milk', 'cups', 'syrup', 'box', 'leaf'];
    const BRD = ['chart', 'pin', 'tag', 'megaphone', 'target', 'users'];
    const pick = <T,>(a: T[]) => a[(Math.random() * a.length) | 0];
    let n = 0;
    const iv = setInterval(() => {
      const k = n++ % 4;
      if (k === 0) setTray((t) => { const u = t.slice(); u[2] = pick(MID.filter((x) => x !== t[2])); return u; });
      if (k === 1) setSup((t) => { const u = t.slice(); u[pick([1, 2, 4, 5])] = pick(SUP.filter((x) => !t.includes(x))); return u; });
      if (k === 2) setTray((t) => { const u = t.slice(); const i = Math.random() < 0.5 ? 0 : 4; u[i] = u[i] ? null : pick(END.filter((x) => !t.includes(x))); return u; });
      if (k === 3) setBrd((t) => { const u = t.slice(); u[pick([0, 1, 3, 4])] = pick(BRD.filter((x) => !t.includes(x))); return u; });
    }, 1700);
    return () => clearInterval(iv);
  }, []);

  const onOver = (e: MouseEvent) => {
    const hit = (e.target as HTMLElement).closest('[data-hit]')?.getAttribute('data-hit') as Hover | undefined;
    setHover(hit ?? null);
  };

  return (
    <section className="isx" id="intersystem" aria-labelledby="isx-title" ref={secRef} data-hover={hover ?? undefined}>
      <div className="isx-head" ref={headRef}>
        <div>
          <span className="isx-eyebrow"><i /><i /><i />The Gradient intersystem</span>
          <h2 id="isx-title">One core between every café, supplier and brand.</h2>
        </div>
        <p>Orders leave the café floor, route to the right supplier and surface as demand for brands — in real time, through a single connected core.</p>
      </div>

      <div className="isx-diagram" style={{ width: W * s, height: H * s }}>
        <div className="isx-canvas" style={{ transform: `scale(${s})` }} onMouseOver={onOver} onMouseLeave={() => setHover(null)}>
          <div className="isx-glow is-core" />
          <div className="isx-glow is-cafe" />
          <div className="isx-glow is-supply" />
          <div className="isx-glow is-brand" />

          <svg className="isx-lines" ref={linesRef} width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
            {PATHS.map((p, i) => (
              <path key={i} d={p.d} data-side={p.side} className={`isx-line${p.ghost ? ' is-ghost' : ''}`} />
            ))}
            {PATHS.filter((p) => !p.ghost).map((p, i) => (
              <path key={`c${i}`} d={p.d} data-side={p.side} className="isx-comet" style={{ ['--d' as string]: `${p.delay}s` }} />
            ))}
          </svg>

          <span className="isx-label" data-side="cafe" style={{ left: 274, top: 2 }}>CAFÉS</span>
          <span className="isx-label" data-side="supply" style={{ left: 20, top: 245 }}>SUPPLIERS</span>
          <span className="isx-label" data-side="brand" style={{ left: 888, top: 245 }}>BRANDS</span>

          <div className="isx-tray" data-side="cafe" data-hit="cafe" style={{ left: 274, top: 24 }}>
            {tray.map((t, i) => (
              <div key={i} className={`isx-slot${t ? '' : ' is-ghost'}`} style={{ width: TRAY_W[i] }}>
                {t && <span key={t}>{t}</span>}
              </div>
            ))}
          </div>

          {PILLS.map((p) => (
            <div key={p.t} className="isx-pill" data-side={p.side} data-hit={p.side} style={{ left: p.left, top: p.top, width: p.w }}>
              {p.t}
            </div>
          ))}

          <Tiles items={sup} side="supply" left={20} />
          <Tiles items={brd} side="brand" left={888} />

          {ENDS.map((e) => (
            <div key={e.left} className={`isx-slot is-end${e.t ? '' : ' is-ghost'}`} data-side="supply" data-hit="supply" style={{ left: e.left, top: 524, width: e.w }}>
              {e.t && <span>{e.t}</span>}
            </div>
          ))}

          <div
            className="isx-core"
            data-hit="core"
            onMouseMove={(e) => {
              const el = e.currentTarget, r = el.getBoundingClientRect();
              const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
              el.style.setProperty('--rx', `${(-y * 16).toFixed(2)}deg`);
              el.style.setProperty('--ry', `${(x * 16).toFixed(2)}deg`);
              el.style.setProperty('--mx', `${((x + 0.5) * 100).toFixed(1)}%`);
              el.style.setProperty('--my', `${((y + 0.5) * 100).toFixed(1)}%`);
            }}
            onMouseLeave={(e) => { e.currentTarget.style.setProperty('--rx', '0deg'); e.currentTarget.style.setProperty('--ry', '0deg'); }}
          >
            <span className="isx-core-pulse" aria-hidden="true" />
            <span className="isx-pads is-h" aria-hidden="true" />
            <span className="isx-pads is-v" aria-hidden="true" />
            <div className="isx-die">
              <span className="isx-sheen" aria-hidden="true" />
              <Mark />
              <strong>gradient</strong>
              <small>365 PRO</small>
            </div>
          </div>
        </div>
      </div>

      {/* small screens: the same story, stacked */}
      <div className="isx-stack">
        <div className="isx-stack-core"><Mark size={26} /><strong>gradient</strong></div>
        {STACK.map((g) => (
          <div key={g.side} className="isx-stack-group" data-side={g.side}>
            <span className="isx-label">{g.label}</span>
            <div className="isx-stack-pills">{g.pills.map((p) => <span key={p} className="isx-pill">{p}</span>)}</div>
            <p>{g.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
