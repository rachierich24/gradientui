'use client';
// The four pictures in the features section (BrandFeatures.tsx). Each is drawn on a board 640 × 640 (400 × 640
// on a phone) out of pieces that fly in from around the canvas and settle into place as you scroll. The section
// sets --k on each scene (0 → 1, how far it has assembled) and --u (how far you are through its chapter); every
// piece starts at its own --d, from --dx/--dy, turned --r degrees, and sits at --x/--y (--mx/--my on a phone).
// 1. Demand: a bento grid of its own (./demand-bento.tsx).
// 2. Reach: café tags settle into an audience list, an ad lands in an owner's app, the campaign goes live and the
//    kits go out down the list, café by café.
// 3. Kits: the kit rides from the supplier to the café while its steps tick off (the next one pulsing), then the
//    barista's rating; the weekly order lands as the payoff.
// 4. Network: Gradient in the middle, lines running out to everything it carries for you. Point at one and its
//    line lights up and Gradient says what it does there.
// Café, supplier and product names are made up and every figure is a sample. Styles: app/brand/brand-features.css
import { useState, type CSSProperties, type ReactNode } from 'react';

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

const AUDIENCE = [
  ['Little Brew Room', 'Hauz Khas', 'Specialty'],
  ['Morning Ritual', 'Saket', 'All-day café'],
  ['Second Crack', 'Kamla Nagar', 'Roastery bar'],
  ['Steam Theory', 'Connaught Place', 'Specialty'],
  ['Copper Kettle', 'Lajpat Nagar', 'Bakery café'],
];
const COLS = [20, 196, 336, 462];
const MCOLS = [14, 160, 0, 272];

export function ReachScene() {
  let n = 0;
  const tag = (row: number, col: number, text: ReactNode, kind: string) => {
    const i = n++, a = scatter(i), b = scatter(i + 40), c = scatter(i + 80);
    return (
      <span
        key={`${row}-${col}`}
        className={`bfx-p bfx-tag ${kind}${col === 2 ? ' bfx-desk' : ''}`}
        style={{ ...put(COLS[col], 114 + row * 50, undefined, [MCOLS[col], 110 + row * 54]), ...fly((a - 0.5) * 560, (b - 0.5) * 600, (c - 0.5) * 26, 0.05 + a * 0.32), '--row': row } as Vars}
      >
        {text}
      </span>
    );
  };
  return (
    <>
      <span className="bfx-p bfx-tag t-l bfx-nocall" style={{ ...put(24, 34, undefined, [12, 18]), ...fly(-60, -50, -8, 0.04) }}>
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.2 2.8c.4-.4 1-.4 1.4 0l1.6 1.7c.4.4.4 1 0 1.4l-.8.8a8 8 0 0 0 3.9 3.9l.8-.8c.4-.4 1-.4 1.4 0l1.7 1.6c.4.4.4 1 0 1.4l-.9.9c-.8.8-2 1-3 .5A13 13 0 0 1 2.3 7c-.5-1-.3-2.2.5-3zM2 2l12 12" /></svg>
        0 cold calls
      </span>

      <div className="bfx-p bfx-card bfx-note" style={{ ...put(356, 6, 260, [150, 6, 238]), ...fly(130, -60, 6, 0.5) }}>
        <small><i>G</i>Gradient · now</small>
        <b>New from Your Brand</b>
        <p>Barista Oat Milk is free to try. Claim a trial kit for your café.</p>
      </div>

      <div className="bfx-p bfx-card bfx-aud" style={{ ...put(24, 124, 592, [12, 138, 376]), ...fly(0, 70, 0, 0) }}>
        <div className="bfx-aud-head">
          <div><small>Audience</small><b>Specialty cafés · Delhi NCR</b></div>
          <span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.4l3 3 6-6.6" /></svg>120 verified</span>
        </div>
        <div className="bfx-aud-cols" aria-hidden="true">
          <span style={put(COLS[0], 0, undefined, [MCOLS[0], 0])}>Café</span>
          <span style={put(COLS[1], 0, undefined, [MCOLS[1], 0])}>Area</span>
          <span className="bfx-desk" style={put(COLS[2], 0)}>Type</span>
          <span style={put(COLS[3], 0, undefined, [MCOLS[3], 0])}>Status</span>
        </div>
        {AUDIENCE.map((r, i) => (
          <div key={r[0]} className="bfx-aud-row" style={{ ...put(0, 108 + i * 50, undefined, [0, 104 + i * 54]), '--row': i } as Vars} aria-hidden="true" />
        ))}
        {AUDIENCE.flatMap((r, i) => [
          tag(i, 0, <><i aria-hidden="true">{r[0][0]}</i>{r[0]}</>, 't-w'),
          tag(i, 1, r[1], 't-l'),
          tag(i, 2, r[2], 't-s'),
          tag(i, 3, <><em className="is-a">✓ Verified</em><em className="is-b">Kit sent</em></>, 't-d'),
        ])}
        <span className="bfx-aud-more"><span aria-hidden="true"><i /><i /><i /><i /></span>+ 115 more cafés that fit</span>
      </div>

      <div className="bfx-p bfx-launch" style={{ ...put(24, 538, 592, [12, 570, 376]), ...fly(0, 100, 0, 0.42) }}>
        <div><small>Campaign</small><b>Barista Oat Milk · free trial kit</b></div>
        <span className="bfx-launch-btn">
          <em className="is-a">Send to 120 cafés →</em>
          <em className="is-b">✓ Live in 120 cafés</em>
        </span>
      </div>
    </>
  );
}

/* ───────────────────────────── 3. Kits ───────────────────────────── */

const STEPS = [
  ['Packed at your warehouse', 'Day 1'],
  ['Riding with Sharma Dairy', 'Day 1'],
  ['Delivered to Little Brew Room', 'Day 2'],
  ['Tried · rated 4.8 ★', 'Day 3'],
  ['Orders weekly · 24 L', 'Day 11'],
];

export function KitScene() {
  return (
    <>
      <div className="bfx-p bfx-card bfx-route" style={{ ...put(24, 30, 592, [12, 12, 376]), ...fly(0, -80, 0, 0) }}>
        <div className="bfx-node">
          <i><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1.5 4.5h8v6h-8zM9.5 7h3l2 2v1.5h-5zM4 12.5a1.2 1.2 0 1 0 0-.1M12 12.5a1.2 1.2 0 1 0 0-.1" /></svg></i>
          <div><b>Sharma Dairy</b><small>Supplier · Hauz Khas</small></div>
        </div>
        <div className="bfx-road" aria-hidden="true">
          <span className="bfx-road-done" /><span className="bfx-road-kit" />
          <span className="bfx-road-say bfx-desk"><em className="is-a">On today’s milk run</em><em className="is-b">Delivered · Day 2</em></span>
        </div>
        <div className="bfx-node is-end">
          <div><b>Little Brew Room</b><small>Café · Hauz Khas</small></div>
          <i><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 5.5h9v4a3.5 3.5 0 0 1-3.5 3.5h-2A3.5 3.5 0 0 1 2.5 9.5zM11.5 6.5h1a1.8 1.8 0 0 1 0 3.6h-1.2M5 2v1.5M7.5 1.5V3" /></svg></i>
        </div>
      </div>

      <div className="bfx-p bfx-kit" style={{ ...put(28, 170, 210, [10, 150, 140]), ...fly(-110, 60, -12, 0.06) }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/carton_3d_cutout.png" alt="A sample trial kit: a 1 litre carton of barista oat milk" width={560} height={924} loading="lazy" />
      </div>
      <span className="bfx-p bfx-tag t-d bfx-kit-tag" style={{ ...put(46, 506, undefined, [16, 384]), ...fly(-70, 90, -8, 0.3) }}>Trial kit · 1 L</span>

      <div className="bfx-p bfx-card bfx-steps" style={{ ...put(268, 156, 348, [160, 140, 228]), ...fly(120, 30, 6, 0.12) }}>
        <div className="bfx-steps-head">
          <div><small>Kit A-1042</small><b>Little Brew Room</b></div>
          <span className="bfx-steps-live bfx-desk"><em className="is-a">Tracking live</em><em className="is-b">✓ Reordering</em></span>
        </div>
        <ol>
          {STEPS.map(([what, when], i) => (
            <li key={what} style={{ '--at': 0.2 + i * 0.13 } as Vars}><i /><span>{what}</span><em>{when}</em></li>
          ))}
        </ol>
      </div>

      <div className="bfx-p bfx-card bfx-rating" style={{ ...put(268, 486, 348, [12, 486, 376]), ...fly(100, 110, -5, 0.42) }}>
        <div className="bfx-stars" aria-label="Rated 4.8 out of 5"><b>4.8</b>★★★★★</div>
        <p>“Holds a rosetta better than the oat milk we use now.”</p>
        <small><i aria-hidden="true">A</i>Head barista · Little Brew Room</small>
      </div>
    </>
  );
}

/* ───────────────────────────── 4. Network ───────────────────────────── */

// each node: what it is, a sample figure, what Gradient does there, its icon, where it sits (desktop, phone), and
// the line from Gradient to it
const NODES: { label: string; sub: string; does: string; icon: string; at: [number, number]; m: [number, number]; path: string; mpath: string }[] = [
  { label: 'Payments', sub: 'Settled weekly', does: 'One invoice, settled weekly', icon: 'M2 4.5h12v7H2zM2 7h12M4.5 9.5h2', at: [320, 64], m: [200, 58], path: 'M320 250V64', mpath: 'M200 262V58' },
  { label: 'Suppliers', sub: '9 in Delhi NCR', does: 'Your kits ride their routes', icon: 'M1.5 4.5h8v6h-8zM9.5 7h3l2 2v1.5h-5zM4 12.5a1.2 1.2 0 1 0 0-.1M12 12.5a1.2 1.2 0 1 0 0-.1', at: [116, 112], m: [86, 132], path: 'M262 250V112H116', mpath: 'M150 262V132H86' },
  { label: 'Cafés', sub: '720 verified', does: 'Owners who order every day', icon: 'M2.5 5.5h9v4a3.5 3.5 0 0 1-3.5 3.5h-2A3.5 3.5 0 0 1 2.5 9.5zM11.5 6.5h1a1.8 1.8 0 0 1 0 3.6h-1.2M5 2v1.5M7.5 1.5V3', at: [520, 112], m: [316, 132], path: 'M378 250V112H520', mpath: 'M250 262V132H316' },
  { label: 'Trial kits', sub: '120 out this month', does: 'Tracked to the cup', icon: 'M2.5 5L8 2.5 13.5 5v6L8 13.5 2.5 11zM2.5 5L8 7.5l5.5-2.5M8 7.5v6', at: [94, 320], m: [72, 236], path: 'M230 320H94', mpath: 'M130 300H72V236' },
  { label: 'Ads to cafés', sub: 'In the owner’s app', does: 'Straight to the owner', icon: 'M4 11V7a4 4 0 0 1 8 0v4l1 1.5H3zM6.5 14h3', at: [546, 320], m: [324, 236], path: 'M410 320H546', mpath: 'M270 300H324V236' },
  { label: 'Reorders', sub: 'Every week', does: 'Weekly orders, on autopilot', icon: 'M3 7a5 5 0 0 1 9-2.5M13 9a5 5 0 0 1-9 2.5M12 2v2.5H9.5M4 14v-2.5h2.5', at: [116, 528], m: [86, 470], path: 'M262 390V528H116', mpath: 'M150 340V470H86' },
  { label: 'Feedback', sub: 'Rated 4.7 on average', does: 'Word from the baristas', icon: 'M8 2l1.8 3.8 4.2.5-3.1 2.9.8 4.1L8 11.3l-3.7 2 .8-4.1L2 6.3l4.2-.5z', at: [520, 528], m: [316, 470], path: 'M378 390V528H520', mpath: 'M250 340V470H316' },
  { label: 'Forecasts', sub: '4 weeks ahead', does: 'Make just enough', icon: 'M2 13h12M3 10l3-3 2.5 2L13 4.5', at: [320, 590], m: [200, 560], path: 'M320 390V590', mpath: 'M200 340V560' },
];

export function NetworkScene() {
  const [on, setOn] = useState<number | null>(null);
  const lines = (key: 'path' | 'mpath', cls: string) => (
    <svg className={`bfx-wires ${cls}${on === null ? '' : ' has-on'}`} viewBox={key === 'path' ? '0 0 640 640' : '0 0 400 640'} aria-hidden="true">
      {NODES.map((n, i) => <path key={i} className="bfx-wire-bg" d={n[key]} />)}
      {NODES.map((n, i) => <path key={i} className={`bfx-wire${on === i ? ' is-on' : ''}`} d={n[key]} pathLength={1} style={{ '--d': 0.1 + i * 0.05 } as Vars} />)}
      {NODES.map((n, i) => (i % 2 === 0 || on === i) && (
        <circle key={i} className={`bfx-spark${on === i ? ' is-on' : ''}`} r="3.2">
          <animateMotion dur={on === i ? '1.6s' : '2.8s'} begin={`${(i / 2) * 0.7}s`} repeatCount="indefinite" path={n[key]} />
        </circle>
      ))}
    </svg>
  );
  return (
    <>
      {lines('path', 'bfx-desk')}
      {lines('mpath', 'bfx-mob')}
      <div className="bfx-p bfx-card bfx-hub" style={{ ...put(230, 250, 180, [120, 262, 160]), ...fly(0, 60, 0, 0) }}>
        <span className="bfx-hub-mark">G</span>
        <b>Gradient</b>
        <small key={on ?? -1}>{on === null ? 'Your brand, connected' : NODES[on].does}</small>
      </div>
      {NODES.map((n, i) => (
        <span key={n.label} className="bfx-at" style={put(n.at[0], n.at[1], undefined, [n.m[0], n.m[1]])}>
          <span
            className={`bfx-p bfx-tag bfx-pill${on === i ? ' is-on' : ''}`} style={fly(0, 18, 0, 0.28 + i * 0.04)} tabIndex={0}
            onPointerEnter={() => setOn(i)} onPointerLeave={() => setOn(null)} onFocus={() => setOn(i)} onBlur={() => setOn(null)}
          >
            <i aria-hidden="true"><svg viewBox="0 0 16 16"><path d={n.icon} /></svg></i>
            <span><b>{n.label}</b><small>{n.sub}</small></span>
          </span>
        </span>
      ))}
    </>
  );
}
