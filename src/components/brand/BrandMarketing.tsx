'use client';
// How we market for you, the section after the brand dashboard. Dark and quiet: a still grid of squares
// with the headline on it and eight tiles, the eight ways Gradient sells a brand into cafés, scattered
// across it in two staggered rows. Scrolling on, the tiles drop one after another, left to right, and land
// in a single row under the payoff line. Once they've landed, one tile is lit; pointing at another moves
// the light, and the line under the row says what that move is. The squares under the pointer glow and
// fade. The tiles live in the row in the page's flow; the drop is only a transform pulling each one back
// up to its spot on the grid, so with reduced motion (or before the script runs) they simply sit in the
// row. Styles: app/brand/brand-marketing.css
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { openContactSalesModal } from '@/components/ContactSalesModal';
import { reduced } from './shared';

const MOVES = [
  { title: 'Demand Index', word: 'Index', body: 'A live demand score for every area and product, read like AQI. Launch where cafés are already asking.' },
  { title: 'Right-sized batches', word: 'Batch', body: 'Make what cafés will order. Nothing overproduced, nothing short, less food wasted.' },
  { title: 'No cold calls', word: 'Calls', body: 'Owners ask for a trial inside the app they already order supplies from.' },
  { title: 'Ads to cafés', word: 'Ads', body: 'Your ad reaches the people who place orders, and nobody else. Pay for trials, not views.' },
  { title: 'Trial packs', word: 'Trial', body: 'Free packs reach owners with their supplier’s next delivery. No couriers.' },
  { title: 'Field sales', word: 'Field', body: 'Gradient’s team visits cafés for you, with samples and your pitch. No sales hires.' },
  { title: 'Tracking', word: 'Track', body: 'Follow every unit from your warehouse, through suppliers, to the café and its reorder.' },
  { title: 'New brands', word: 'New', body: 'New brands get featured from day one, so a small team can launch like a big one.' },
];

type Field = { c: number; cols: number; rows: number; gx: number; gw: number; narrow: boolean; top: number };

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (x: number) => { const k = clamp(x); return k * k * (3 - 2 * k); };

export function BrandMarketing() {
  const secRef = useRef<HTMLElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const lift = useRef<{ x: number; y: number }[]>([]); // how far each tile sits from its spot on the grid
  const still = useRef(false);
  const [field, setField] = useState<Field | null>(null);
  const [landed, setLanded] = useState(false);
  const [active, setActive] = useState(0);
  const m = MOVES[active];

  // the grid: square cells across the content width, tall enough for the headline and both rows of tiles
  useLayoutEffect(() => {
    const sec = secRef.current, head = headRef.current;
    if (!sec || !head) return;
    still.current = reduced();
    const fit = () => {
      const W = sec.clientWidth, narrow = W < 760;
      const side = narrow ? 16 : Math.max(28, (W - 1360) / 2 + 28), gw = W - side * 2;
      const cols = narrow ? 6 : 18, c = gw / cols;
      const tile = tileRefs.current[0], th = tile ? tile.offsetHeight : c * 2;
      const top = Math.ceil((head.offsetTop + head.offsetHeight + c * 0.4) / c); // first row of tiles, in cells
      const rows = narrow ? top + 10 : top + 3 + Math.ceil(th / c) + 1;
      setField((f) => (f && f.c === c && f.rows === rows && f.top === top && f.gx === side ? f : { c, cols, rows, gx: side, gw, narrow, top }));
    };
    const ro = new ResizeObserver(fit);
    ro.observe(sec);
    ro.observe(head);
    fit();
    return () => ro.disconnect();
  }, []);

  // where each tile starts: two staggered rows on the grid (a zigzag of two columns on phones)
  useLayoutEffect(() => {
    if (!field) return;
    const { c, cols, gx, top, narrow } = field;
    lift.current = tileRefs.current.map((t, i) => {
      if (!t) return { x: 0, y: 0 };
      const col = narrow ? (i % 2 ? cols - 3 : 0) : i < 4 ? i * 3 : cols - 12 + (i - 4) * 3;
      const row = narrow ? top + i + (i % 2) * 0.5 : i < 4 ? top : top + 3;
      const x = narrow && i % 2 ? gx + field.gw - t.offsetWidth : gx + col * c;
      return { x: x - t.offsetLeft, y: row * c - t.offsetTop };
    });
    place();
  }, [field]); // eslint-disable-line react-hooks/exhaustive-deps

  // the drop: each tile lets go a moment after the one before it
  const place = () => {
    const sec = secRef.current, fieldEl = fieldRef.current;
    if (!sec || !fieldEl) return;
    const p = still.current ? 1 : clamp((window.innerHeight * 0.12 - sec.getBoundingClientRect().top) / (fieldEl.offsetHeight * 0.9));
    tileRefs.current.forEach((t, i) => {
      if (!t) return;
      const k = smooth((p - i * 0.06) / 0.58), l = lift.current[i] ?? { x: 0, y: 0 };
      t.style.transform = k >= 1 ? '' : `translate3d(${(l.x * (1 - k)).toFixed(1)}px, ${(l.y * (1 - k)).toFixed(1)}px, 0)`;
    });
    setLanded(p >= 0.999);
  };
  useEffect(() => {
    let raf = 0;
    const on = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; place(); }); };
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    on();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', on); window.removeEventListener('resize', on); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // a fixed, quiet pattern of lighter and darker squares
  const cells = useMemo(() => {
    if (!field) return [];
    let seed = 20261029;
    return Array.from({ length: field.cols * field.rows }, () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const v = seed / 4294967296;
      return v < 0.16 ? 's2' : v < 0.34 ? 's1' : '';
    });
  }, [field]);

  return (
    <section
      ref={secRef}
      className={`bmk${field ? ' is-ready' : ''}${landed ? ' is-landed' : ''}`}
      id="journey"
      aria-labelledby="bmk-title"
      style={field ? ({ '--c': `${field.c}px`, '--cols': field.cols, '--gx': `${field.gx}px`, '--gw': `${field.gw}px` } as CSSProperties) : undefined}
    >
      <div ref={fieldRef} className="bmk-field" style={field ? { height: field.rows * field.c } : undefined}>
        <div className="bmk-cells" aria-hidden="true">
          {cells.map((s, i) => <i key={i} className={s || undefined} />)}
        </div>
        <div ref={headRef} className="brd-wrap bmk-head">
          <span className="bmk-eyebrow"><i aria-hidden="true"><s /><s /><s /></i>How we market for you</span>
          <h2 id="bmk-title">Eight ways we sell your brand<br /> into India’s best cafés.</h2>
        </div>
      </div>

      <div className="brd-wrap bmk-land">
        <p className="bmk-big">Real marketing.<br /><span>Measured in orders.</span></p>
        <p className="bmk-sub">No cold calls, no guesswork, no stock left to expire.</p>

        <div className="bmk-row">
          {MOVES.map((mv, i) => (
            <button
              key={mv.title}
              ref={(el) => { tileRefs.current[i] = el; }}
              type="button"
              className={`bmk-tile${i === active ? ' is-on' : ''}`}
              aria-pressed={i === active}
              onPointerEnter={(e) => { if (e.pointerType === 'mouse') setActive(i); }}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
            >
              <b>{mv.title}</b>
              <span className="bmk-sr">: {mv.body}</span>
              <span className="bmk-tile-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <span className="bmk-tile-word" aria-hidden="true">{mv.word}</span>
            </button>
          ))}
        </div>

        <div className="bmk-foot">
          <p key={active} className="bmk-say">
            <span>{String(active + 1).padStart(2, '0')}</span>
            <b>{m.title}.</b> {m.body}
          </p>
          <button type="button" className="brd-btn brd-btn-accent" onClick={openContactSalesModal}>
            Launch a trial
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        </div>
      </div>
    </section>
  );
}
