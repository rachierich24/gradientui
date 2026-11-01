'use client';
// The four pictures in the features section (BrandFeatures.tsx). Each is drawn on a board 640 × 640 (400 × 640
// on a phone) out of pieces that fly in from around the canvas and settle into place as you scroll. The section
// sets --k on each scene (0 → 1, how far it has assembled) and --u (how far you are through its chapter); every
// piece starts at its own --d, from --dx/--dy, turned --r degrees, and sits at --x/--y (--mx/--my on a phone).
// 1. Demand: a bento grid of its own (./demand-bento.tsx).
// 2. Reach: loose tags, red for cafés, green for suppliers, purple for the brand, drift into an audience table row
//    by row, then the campaign goes live and every kit turns to sent.
// 3. Kits: a cartoon kit box opens and unpacks into a numbered sheet, each product, in its own colours, dropping
//    into its cell.
// 4. Network: Gradient's bot in a box in the middle of a hand-drawn wiring diagram, a line out to everything it
//    runs for you. It tours the lines on its own; point at a tag and the bot looks at it and says what it does.
// Café, supplier and product names are made up and every figure is a sample. Styles: app/brand/brand-features.css
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react';

export type Vars = CSSProperties & Record<`--${string}`, string | number>;

/**
 * Where a piece sits (and, as a list, where it sits on a phone). Every piece sets all of these, since custom
 * properties inherit and a tag inside a card would otherwise take on the card's width or place.
 */
const put = (x: number, y: number, w?: number, m?: [number, number, number?]): Vars => ({
  '--x': x, '--y': y, '--w': w ?? 'auto',
  '--mx': m ? m[0] : x, '--my': m ? m[1] : y, '--mw': m?.[2] ?? w ?? 'auto',
});
const fly = (dx: number, dy: number, r = 0, d = 0): Vars => ({ '--dx': Math.round(dx), '--dy': Math.round(dy), '--r': Math.round(r), '--d': Math.round(d * 1000) / 1000 });
// a fixed scatter from integer maths, so the server and every browser agree on it
const scatter = (i: number) => {
  let t = Math.imul(i + 1, 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/* ───────────────────────────── 2. Reach ───────────────────────────── */

// The audience: each café, its area, the supplier it already buys from and the brand's kit start as loose tags
// scattered over the canvas (and off its edges) in the three sides' colours, cafés red, suppliers green, the brand
// purple. As you scroll they drift into their row, top row first, losing their colour as they land. Once the list
// is full the campaign goes live and every kit turns to sent.
const AUDIENCE = [
  ['Little Brew Room', 'Hauz Khas', 'Sharma Dairy'],
  ['Morning Ritual', 'Saket', 'Bean Street Co'],
  ['Second Crack', 'Kamla Nagar', 'Kaapi Traders'],
  ['Steam Theory', 'Connaught Place', 'Sharma Dairy'],
  ['Copper Kettle', 'Lajpat Nagar', 'Fresh Churn'],
];
const COLS = [42, 176, 304, 426];
const MCOLS = [8, 0, 132, 260];
const TONES = ['is-cafe', 'is-area', 'is-sup', 'is-brand'];
const TOP = 150, MTOP = 150, ROW = 42; // five rows, each 30 tall with a clear gap between, small tags and lots of air
const LABEL = (r: string[], col: number) => (col < 3 ? r[col] : 'Trial kit');

// Where each tag lies before it flies: spread loosely over the canvas and past its edges, no two touching. Picked
// from a fixed scatter, so the server and every browser agree.
const lay = (box: [number, number, number, number], ch: number, pad: number, skip?: number) => {
  const placed: [number, number, number][] = [];
  return AUDIENCE.flatMap((r, row) => [0, 1, 2, 3].map(col => {
    if (col === skip) return [0, 0];
    const w = LABEL(r, col).length * ch + pad, i = row * 4 + col;
    let best: [number, number] = [0, 0], room = -1;
    for (let t = 0; t < 80; t++) {
      const x = box[0] + scatter(i * 53 + t) * (box[2] - box[0] - w), y = box[1] + scatter(i * 53 + t + 900) * (box[3] - box[1]);
      // how far this spot keeps from every tag already laid; the first spot that's clear of them all wins
      const gap = Math.min(999, ...placed.map(([px, py, pw]) => Math.max(px - (x + w), x - (px + pw), (Math.abs(py - y) - 30) * 2.4)));
      if (gap > room) { room = gap; best = [x, y]; }
      if (gap > 44) break;
    }
    placed.push([best[0], best[1], w]);
    return best.map(Math.round);
  }));
};
const SPOTS = lay([-90, -100, 730, 650], 6.4, 18);
const MSPOTS = lay([-12, -24, 412, 650], 5.8, 14, 1);

export function ReachScene() {
  return (
    <div className="bfx-p brx" style={{ ...put(0, 0, 640, [0, 0, 400]), ...fly(0, 0, 0, 0) }}>
      <div className="brx-frame" style={put(60, TOP, 520, [12, MTOP, 376])}>
        <div className="brx-head">
          <span>Specialty cafés · Delhi NCR</span>
          <span className="brx-key"><i className="is-cafe" />Café<i className="is-sup" />Supplier<i className="is-brand" />Brand</span>
        </div>
        {AUDIENCE.map((r, i) => (
          <div key={r[0]} className="brx-row" style={{ top: 52 + i * ROW, '--at': ((i * 4 + 3) * 0.018).toFixed(3), '--row': i } as Vars} aria-hidden="true" />
        ))}
      </div>
      {AUDIENCE.flatMap((r, row) => [0, 1, 2, 3].map(col => {
        const i = row * 4 + col;
        return (
          <span
            key={i}
            className={`brx-c ${TONES[col]}${col === 1 ? ' bfx-desk' : ''}${col === 3 ? ' is-st' : ''}`}
            style={{
              ...put(40 + COLS[col], TOP + 54 + row * ROW, undefined, [22 + MCOLS[col], MTOP + 54 + row * ROW]),
              '--sx': SPOTS[i][0], '--sy': SPOTS[i][1], '--msx': MSPOTS[i][0], '--msy': MSPOTS[i][1],
              '--at': (i * 0.018).toFixed(3), '--row': row,
            } as Vars}
          >
            {col < 3 ? r[col] : <><em className="is-a">Trial kit</em><em className="is-b">Kit sent ✓</em></>}
          </span>
        );
      }))}
      <div className="brx-go" style={put(60, TOP + 288, 520, [12, MTOP + 288, 376])}>
        <span>Barista Oat Milk · 120 cafés matched</span>
        <b><em className="is-a">Send trial kits →</em><em className="is-b">Live in 120 cafés ✓</em></b>
      </div>
    </div>
  );
}

/* ───────────────────────────── 3. Kits ───────────────────────────── */

// What's in a sample kit, drawn as cartoons in the products' own colours (the brand and its products are made up).
// The box opens and unpacks into a numbered sheet: each product pops out at its own point in the chapter (--at),
// arcs up, wobbling up to --rt degrees, and drops into its cell. A cell's square says whose it is: the brand's
// products, the café's tasting card, the supplier's reorder.
const INK = '#15111D';
const ln = { stroke: INK, strokeWidth: 2.5, strokeLinejoin: 'round', strokeLinecap: 'round' } as const;
const mono = { fontFamily: 'var(--mono)' };
// the cells' centres from the box's mouth, by column and row (on a phone, MCX/MCY)
const CX = [-193, 0, 193], CY = [-334, -177], MCX = [-124, 0, 124], MCY = [-342, -208];
// the shipping label's barcode, from fixed sums so the server and every browser agree
const BARS: [number, number][] = [];
for (let x = 60, k = 0; x < 182; k++) { const w = 1 + ((k * 7) % 3); BARS.push([x, w]); x += w + 1 + ((k * 5) % 2); }
const KIT: { name: string; role: 'brand' | 'cafe' | 'sup'; at: number; rt: number; art: ReactNode }[] = [
  {
    name: 'Oat milk · 1 L', role: 'brand', at: 0.18, rt: -8,
    art: (
      <svg viewBox="0 0 100 140">
        <path d="M62 40 86 30v94l-24 10z" fill="#E6D9BD" {...ln} />
        <path d="M14 40h48v94H14z" fill="#FBF5E8" {...ln} />
        <path d="M14 40 38 24l24 16zM38 24l26-12 22 18-24 10z" fill="#EFE4CC" {...ln} />
        <circle cx="66" cy="21" r="6" fill="#4F8A5B" {...ln} />
        <path d="M14 96h48v24H14z" fill="#E7B65A" {...ln} />
        <path d="M38 88V62M38 70l-6-5M38 76l6-5M38 82l-6-5" fill="none" stroke="#A8743A" strokeWidth={2.5} strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: 'Beans · 250 g', role: 'brand', at: 0.26, rt: 5,
    art: (
      <svg viewBox="0 0 100 140">
        <path d="M18 42h64l7 86q-39 8-78 0z" fill="#C99A66" {...ln} />
        <path d="M22 18h56v24H22z" fill="#B3844F" {...ln} />
        <path d="M30 18v24M40 18v24M50 18v24M60 18v24M70 18v24" stroke="#8E6438" strokeWidth={1.5} />
        <rect x="29" y="62" width="42" height="44" rx="5" fill="#FFF8EC" {...ln} />
        <ellipse cx="50" cy="84" rx="9" ry="12" fill="#6B4226" {...ln} />
        <path d="M50 73c-4 6 4 16 0 22" fill="none" stroke="#FFF8EC" strokeWidth={2} strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: 'Caramel syrup', role: 'brand', at: 0.34, rt: -5,
    art: (
      <svg viewBox="0 0 100 140">
        <path d="M44 6h12v14H44zM56 8h18v6H56z" fill={INK} />
        <path d="M38 20h24v10H38z" fill="#3A3633" {...ln} />
        <path d="M36 30h28v8q14 6 14 22v62q0 8-8 8H30q-8 0-8-8V60q0-16 14-22z" fill="#D9822B" {...ln} />
        <path d="M29 62v46" stroke="#F4B970" strokeWidth={5} strokeLinecap="round" />
        <rect x="32" y="74" width="40" height="32" rx="4" fill="#FFF6E6" {...ln} />
        <path d="M52 81q-7 9-7 14a7 7 0 0 0 14 0q0-5-7-14z" fill="#B8641A" {...ln} />
      </svg>
    ),
  },
  {
    name: 'Cold brew', role: 'brand', at: 0.42, rt: 8,
    art: (
      <svg viewBox="0 0 100 140">
        <path d="M38 8h24v12H38z" fill="#1F1A17" {...ln} />
        <path d="M36 20h28v14q12 8 12 24v66q0 8-8 8H32q-8 0-8-8V58q0-16 12-24z" fill="#3B2618" {...ln} />
        <path d="M31 60v52" stroke="#6E4A33" strokeWidth={5} strokeLinecap="round" />
        <rect x="30" y="72" width="40" height="36" rx="4" fill="#ECDFC7" {...ln} />
        <rect x="41" y="80" width="18" height="18" rx="4" fill="#BFE3F2" {...ln} transform="rotate(-10 50 89)" />
      </svg>
    ),
  },
  {
    name: 'Tasting card', role: 'cafe', at: 0.5, rt: -9,
    art: (
      <svg viewBox="0 0 100 140">
        <rect x="8" y="22" width="84" height="100" rx="7" fill="#FFFFFF" {...ln} />
        <path d="M8 46h84" {...ln} />
        <path d="M22 34h40" stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <path d="M20 60h8v8h-8zM20 78h8v8h-8z" fill="none" {...ln} />
        <path d="M21.5 64l2.5 2.5 5-6M21.5 82l2.5 2.5 5-6" fill="none" stroke="#2F9E5B" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M36 64h42M36 82h34" stroke="#D8CFC2" strokeWidth={3} strokeLinecap="round" />
        {[0, 1, 2, 3, 4].map((k) => (
          <path key={k} transform={`translate(${22 + k * 14} 104)`} d="M0-6l1.8 3.7 4 .6-2.9 2.8.7 4L0 3.2l-3.6 1.9.7-4-2.9-2.8 4-.6z" fill="#F5B82E" stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
        ))}
      </svg>
    ),
  },
  {
    name: 'Scan to reorder', role: 'sup', at: 0.58, rt: 9,
    art: (
      <svg viewBox="0 0 100 140">
        <rect x="8" y="22" width="84" height="100" rx="7" fill="#FFFFFF" {...ln} />
        <g fill={INK}>
          <path d="M22 36h20v20H22zM58 36h20v20H58zM22 72h20v20H22z" fill="none" {...ln} />
          <path d="M28 42h8v8h-8zM64 42h8v8h-8zM28 78h8v8h-8zM50 36h4v4h-4zM50 46h4v8h-4zM58 64h6v6h-6zM70 62h8v4h-8zM50 62h4v12h-4zM60 76h4v4h-4zM68 72h10v6H68zM50 82h8v10h-8zM66 84h4v8h-4zM74 86h4v6h-4z" />
        </g>
        <path d="M22 108h56" stroke="#D8CFC2" strokeWidth={3} strokeLinecap="round" />
      </svg>
    ),
  },
];

export function KitScene() {
  return (
    <>
      <div className="bfx-p bkx-sheet" style={{ ...put(28, 16, 584, [12, 12, 376]), ...fly(0, -60, 0, 0) }}>
        <div className="bkx-head">
          <span><b>Kit A-1042</b> · contents</span>
          <span><span className="bfx-desk">via <i className="is-sup" />Sharma Dairy </span>→ <i className="is-cafe" />Little Brew Room</span>
        </div>
        <ol className="bkx-cells">
          {KIT.map((it, i) => (
            <li key={it.name} className="bkx-cell" style={{ '--at': it.at } as Vars}>
              <span className="bkx-no">{`0${i + 1}`}<i className={`is-${it.role}`} /></span>
              <b>{it.name}</b>
            </li>
          ))}
        </ol>
      </div>

      <div className="bfx-p bkx" style={{ ...put(0, 0, 640, [0, 0, 400]), ...fly(0, 120, 0, 0) }}>
        <div className="bkx-box">
          <svg className="bkx-back" viewBox="0 0 260 220" aria-hidden="true">
            <path d="M18 62 34 40h192l16 22z" fill="#8F6538" {...ln} />
            <path className="bkx-flap is-l" d="M15 60h115l-6-22H30z" fill="#E2B57B" {...ln} />
            <path className="bkx-flap is-r" d="M130 60h115l-15-22H136z" fill="#D6A66A" {...ln} />
          </svg>
          {KIT.map((it, i) => (
            <div key={it.name} className="bkx-it" aria-hidden="true" style={{ '--at': it.at, '--tx': CX[i % 3], '--ty': CY[Math.floor(i / 3)], '--rt': it.rt, '--mtx': MCX[i % 3], '--mty': MCY[Math.floor(i / 3)] } as Vars}>
              {it.art}
            </div>
          ))}
          <svg className="bkx-front" viewBox="0 0 260 220" aria-hidden="true">
            <path d="M23 68h230v150H23z" fill="rgba(21, 17, 29, 0.12)" />
            <path d="M15 60h230v150H15z" fill="#D9A86C" />
            <path d="M206 62h37v146h-37z" fill="#C8955A" />
            <path d="M15 60h230v150H15z" fill="none" {...ln} />
            <path d="M112 60h36v34h-36z" fill="#EAD3A6" opacity="0.9" />
            {/* the shipping label: the kit's number, a barcode and where it's going */}
            <rect x="50" y="102" width="144" height="80" fill="#FFFFFF" {...ln} />
            <path d="M50 122h144" {...ln} />
            <rect x="50" y="102" width="22" height="20" fill={INK} />
            <text x="61" y="116.5" textAnchor="middle" fontSize="12" fontWeight="800" fill="#FFFFFF">G</text>
            <text x="80" y="115.5" style={mono} fontSize="8.5" fontWeight="600" letterSpacing="0.8" fill={INK}>TRIAL KIT · A-1042</text>
            {BARS.map(([x, w]) => <rect key={x} x={x} y="129" width={w} height="30" fill={INK} />)}
            <text x="60" y="173" style={mono} fontSize="7.5" letterSpacing="0.6" fill={INK}>TO LITTLE BREW ROOM</text>
            <path d="M28 198v-14m-4 4 4-4 4 4M40 198v-14m-4 4 4-4 4 4" fill="none" stroke="#8F6538" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </>
  );
}

/* ───────────────────────────── 4. Network ───────────────────────────── */

// Gradient's bot sits in a box in the middle of a wiring diagram, one hand-drawn line out to everything it runs
// for you, each ending in a stamped tag. Little packets run in along the lines; the lines boil gently like a
// doodle. The board tours itself: a line lights, the bot turns its eyes to the tag and says what it does there.
// Point at a tag (or focus it) to take over; the bot's eyes follow the pointer, and clicking the bot moves it on.
// Each node: its tag, its tone, a sample figure, what Gradient does there, where the tag sits (desktop, phone),
// and its line from the box out past the tag to the edge of the board (desktop, phone).
type Node = { label: string; tone: string; sub: string; does: string; at: [number, number]; m: [number, number]; path: string; mpath: string };
const NODES: Node[] = [
  { label: 'Payments', tone: 'is-ora', sub: 'Settled weekly', does: 'One invoice a week, settled for you.', at: [476, 84], m: [300, 70], path: 'M380 236V84H660', mpath: 'M250 250V70H420' },
  { label: 'Cafés', tone: 'is-lim', sub: '720 verified', does: 'Owners who order every day.', at: [150, 120], m: [96, 130], path: 'M260 236V120H-20', mpath: 'M150 250V130H-20' },
  { label: 'Suppliers', tone: 'is-pur', sub: '9 in Delhi NCR', does: 'Your kits ride their routes.', at: [560, 280], m: [340, 150], path: 'M420 280H660', mpath: 'M290 290H340V-20' },
  { label: 'Ads to cafés', tone: 'is-lim', sub: 'In the owner’s app', does: 'Straight to the owner, no cold calls.', at: [540, 362], m: [340, 470], path: 'M420 362H660', mpath: 'M290 360H340V660' },
  { label: 'Feedback', tone: 'is-pur', sub: 'Rated 4.7 on average', does: 'Word from the baristas, every cup.', at: [476, 520], m: [320, 560], path: 'M380 396V520H660', mpath: 'M250 400V560H420' },
  { label: 'Forecasts', tone: 'is-lim', sub: '4 weeks ahead', does: 'Make just enough, waste less.', at: [320, 580], m: [200, 610], path: 'M320 396V660', mpath: 'M200 400V660' },
  { label: 'Reorders', tone: 'is-ora', sub: 'Every week', does: 'Weekly orders, on autopilot.', at: [140, 470], m: [80, 480], path: 'M260 396V470H-20', mpath: 'M150 400V480H-20' },
  { label: 'Trial kits', tone: 'is-pur', sub: '120 out this month', does: 'Tracked from the box to the cup.', at: [96, 316], m: [60, 210], path: 'M220 316H-20', mpath: 'M110 320H60V-20' },
];
// lines that only carry the diagram on past the edges
const DECOR = ['M40 -20V660', 'M-20 400H40', 'M180 -20V40H300V-20', 'M-20 600H200V560', 'M600 660V450H660'];
const MDECOR = ['M24 -20V660', 'M-20 560H24', 'M380 -20V110H420'];
const BOT = { x: 220, y: 236, w: 200, h: 160 }, MBOT = { x: 110, y: 250, w: 180, h: 150 };

export function NetworkScene({ active = true }: { active?: boolean }) {
  const [on, setOn] = useState<number | null>(null);
  const [tour, setTour] = useState<number | null>(null);
  const bot = useRef<HTMLDivElement>(null);
  const noise = useRef<SVGFETurbulenceElement[]>([]);
  const lit = on ?? tour;

  // the tour: once the board is up, a new line every few seconds, until you take over
  useEffect(() => {
    if (!active || on !== null) return;
    const id = window.setInterval(() => setTour((t) => ((t ?? -1) + 1) % NODES.length), 2600);
    return () => window.clearInterval(id);
  }, [active, on]);

  // the lines boil like a doodle: a new wobble a few times a second
  useEffect(() => {
    if (!active || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let s = 0;
    const id = window.setInterval(() => { s = (s + 1) % 4; noise.current.forEach((n) => n?.setAttribute('seed', String(s + 2))); }, 160);
    return () => window.clearInterval(id);
  }, [active]);

  // the bot's eyes: on the lit tag, or on the pointer while it's over the board
  const look = (bx: number, by: number) => {
    const el = bot.current;
    if (!el) return;
    const phone = matchMedia('(max-width: 980px)').matches, b = phone ? MBOT : BOT;
    const dx = bx - (b.x + b.w / 2), dy = by - (b.y + b.h * 0.48), d = Math.max(1, Math.hypot(dx, dy));
    el.style.setProperty('--lx', (dx / d).toFixed(3));
    el.style.setProperty('--ly', (dy / d).toFixed(3));
  };
  useEffect(() => {
    if (lit === null) return;
    const phone = matchMedia('(max-width: 980px)').matches, n = NODES[lit];
    look(...(phone ? n.m : n.at));
  }, [lit]);
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || on !== null) return;
    const r = e.currentTarget.getBoundingClientRect(), W = matchMedia('(max-width: 980px)').matches ? 400 : 640;
    look(((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.width) * W);
  };

  const wires = (key: 'path' | 'mpath', decor: string[], cls: string, k: number) => (
    <svg className={`bnw-wires ${cls}${lit === null ? '' : ' has-on'}`} viewBox={key === 'path' ? '0 0 640 640' : '0 0 400 640'} aria-hidden="true">
      <defs>
        <filter id={`bnw-doodle-${key}`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence ref={(n) => { if (n) noise.current[k] = n; }} type="fractalNoise" baseFrequency="0.03" numOctaves={2} seed={2} />
          <feDisplacementMap in="SourceGraphic" scale={2.6} />
        </filter>
      </defs>
      <g filter={`url(#bnw-doodle-${key})`}>
        {decor.map((d, i) => <path key={d} className="bnw-wire is-decor" d={d} pathLength={1} style={{ '--d': 0.05 + i * 0.04 } as Vars} />)}
        {NODES.map((n, i) => <path key={n.label} className={`bnw-wire${lit === i ? ' is-on' : ''}`} d={n[key]} pathLength={1} style={{ '--d': 0.12 + i * 0.04 } as Vars} />)}
      </g>
      {/* packets run in from the edge, through the tag, to the bot; the lit line runs fast */}
      {NODES.map((n, i) => (
        <rect key={n.label} className={`bnw-packet${lit === i ? ' is-on' : ''}`} x="-4" y="-4" width="8" height="8" rx="1.5">
          <animateMotion dur={lit === i ? '1.4s' : '4.2s'} begin={`${i * 0.45}s`} repeatCount="indefinite" path={n[key]} keyPoints="1;0" keyTimes="0;1" calcMode="linear" />
        </rect>
      ))}
    </svg>
  );

  const said = lit === null ? null : NODES[lit];
  return (
    <div className="bnw" onPointerMove={onMove}>
      {wires('path', DECOR, 'bfx-desk', 0)}
      {wires('mpath', MDECOR, 'bfx-mob', 1)}

      <div ref={bot} className={`bfx-p bnw-bot${lit === null ? '' : ' is-talking'}`} style={{ ...put(BOT.x, BOT.y, BOT.w, [MBOT.x, MBOT.y, MBOT.w]), ...fly(0, 70, -4, 0) }}>
        <button type="button" className="bnw-me" aria-label="Gradient’s bot: show the next thing it runs for you" onClick={() => { setOn(null); setTour((t) => ((t ?? -1) + 1) % NODES.length); }}>
          <svg viewBox="0 0 200 160" aria-hidden="true">
            <g className="bnw-steam"><path d="M84 30c-7-7 7-11 0-19" /><path d="M100 26c-7-7 7-11 0-19" /><path d="M116 30c-7-7 7-11 0-19" /></g>
            <g className="bnw-body">
              <path className="bnw-handle" d="M150 62h7a17 17 0 0 1 0 34h-7" />
              <path className="bnw-mug" d="M48 44h104v62a32 32 0 0 1-32 32H80a32 32 0 0 1-32-32z" />
              <rect className="bnw-screen" x="60" y="56" width="80" height="44" rx="13" />
              <g className="bnw-eyes"><circle cx="84" cy="74" r="6.5" /><circle cx="116" cy="74" r="6.5" /><circle className="bnw-glint" cx="86" cy="72" r="1.8" /><circle className="bnw-glint" cx="118" cy="72" r="1.8" /></g>
              <ellipse className="bnw-cheek" cx="70" cy="88" rx="5" ry="3" /><ellipse className="bnw-cheek" cx="130" cy="88" rx="5" ry="3" />
              <path className="bnw-smile" d="M93 87q7 6 14 0" />
              <path key={lit ?? -1} className="bnw-talk" d="M94 86q6 9 12 0z" />
            </g>
            <rect className="bnw-saucer" x="30" y="140" width="140" height="11" rx="5.5" />
          </svg>
        </button>
        <span className="bnw-name">Gradient</span>
      </div>

      <div className="bfx-p bnw-say" style={{ ...put(432, 148, 196, [150, 168, 230]), ...fly(30, -20, 3, 0.4) }} aria-live="polite">
        <span key={lit ?? -1}>
          <small>{said ? `${said.label} · ${said.sub}` : 'Hi, I’m your field team'}</small>
          <b>{said ? said.does : 'Point at anything I run for you.'}</b>
        </span>
      </div>

      {NODES.map((n, i) => (
        <span key={n.label} className="bfx-at" style={put(n.at[0], n.at[1], undefined, [n.m[0], n.m[1]])}>
          <button
            type="button" className={`bfx-p bnw-tag ${n.tone}${lit === i ? ' is-on' : ''}`} style={fly(0, -40, (i % 2 ? 6 : -6), 0.3 + i * 0.04)}
            aria-pressed={lit === i} onPointerEnter={() => setOn(i)} onPointerLeave={() => setOn(null)} onFocus={() => setOn(i)} onBlur={() => setOn(null)} onClick={() => setOn(i)}
          >
            {n.label}
          </button>
        </span>
      ))}
    </div>
  );
}
