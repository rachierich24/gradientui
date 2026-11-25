'use client';
// The centre card, after Shopify's command centre ("Control everything in one place"): six supply categories sit
// in orbit around a glowing sphere of rings, and the middle shows that category's view. Shopify gives each label
// its own panel (an order receipt, an inventory table, a shipping box); here each category gets its own way of
// finding the best price: a supplier comparison, a price trend, a placed order, a best-price table, bulk tiers and
// a head-to-head.
// The panels sit in a React Bits <Carousel /> (components/ui/Carousel.tsx) with its 3D "tilt" turn, so one panel
// always swings into the next and the middle is never empty. On hover the carousel plays (every 3 s, its bars
// filling with the timer) and the orbit swings the matching category to the top; dragging or swiping the panels
// turns the orbit too. When another card is hovered this one gives up its double width (Shopify's row); narrow,
// it hides the carousel and shows the Gradient mark floating in the sphere, as Shopify's shows its bag.
import { useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Check, GradientMark, inr } from '@/components/supplier/bento/shared';
import Carousel from '@/components/ui/Carousel';
import { Rings } from './Rings';
import type { FilmState } from '../CafeBento';

const IMG = '/landing/spotlight/';
const LABELS = ['Dairy', 'Coffee', 'Bakery', 'Syrups', 'Packaging', 'Chocolate'];
const STEP = 360 / LABELS.length;

function Head({ img, title, sub, chip }: { img: string; title: string; sub: string; chip: string }) {
  return (
    <div className="cbx-pc-head">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={IMG + img} alt="" draggable={false} />
      <span><b>{title}</b><small>{sub}</small></span>
      <em>{chip}</em>
    </div>
  );
}

// Dairy — every supplier's price for one product, best first
const Compare = () => (
  <div className="cbx-pc">
    <Head img="barista-oat-carton.jpg" title="Barista oat milk" sub="1 L · 3 suppliers" chip="Compare" />
    <ul className="cbx-pc-rows">
      {([['FD', 'Freshway Dairy', 'Tomorrow, 7 AM', 198], ['MM', 'Milk Mantra Pro', 'Tomorrow, 9 AM', 205], ['DF', 'Daily Farms', 'Thursday', 212]] as const).map(([av, who, when, p], i) => (
        <li key={who} className={i === 0 ? 'is-best' : undefined}>
          <span className="cbx-pc-av">{av}</span>
          <span className="cbx-pc-who"><b>{who}</b><small>{when}</small></span>
          {i === 0 && <i>Best</i>}
          <strong>{inr(p)}</strong>
        </li>
      ))}
    </ul>
    <span className="cbx-pc-btn">Add the best to cart · {inr(198)}</span>
  </div>
);

// Coffee — the price over six months, and where it's cheapest now
const TREND = [1310, 1336, 1298, 1291, 1262, 1240];
const Trend = () => {
  const W = 254, H = 58, lo = 1220, hi = 1350;
  const pts = TREND.map((v, i) => [(i / (TREND.length - 1)) * W, H - ((v - lo) / (hi - lo)) * H] as const);
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  return (
    <div className="cbx-pc">
      <Head img="arabica-coffee-bag.jpg" title="Arabica AA beans" sub="1 kg · 6 suppliers tracked" chip="Trend" />
      <div className="cbx-pc-price"><strong>{inr(1240)}</strong><span>▼ 4% this month</span></div>
      <svg className="cbx-pc-spark" viewBox={`0 -4 ${W} ${H + 8}`} preserveAspectRatio="none" aria-hidden="true">
        <path className="cbx-pc-area" d={`${line} L${W} ${H + 4} L0 ${H + 4} Z`} />
        <path className="cbx-pc-line" d={line} />
        <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3.5" />
      </svg>
      <div className="cbx-pc-months">{['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'].map((m) => <span key={m}>{m}</span>)}</div>
      <p className="cbx-pc-foot">Best now at <b>Hill Estate Roasters</b></p>
    </div>
  );
};

// Bakery — the order, placed with the cheapest bakery (Shopify's "Thank you, Jordan!")
const Receipt = () => (
  <div className="cbx-pc is-receipt">
    <div className="cbx-pc-thanks"><span><Check /></span><b>Order placed, Raydee!</b></div>
    <small className="cbx-pc-label">Order details</small>
    <div className="cbx-pc-line">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={IMG + 'croissant-bakery.jpg'} alt="" draggable={false} />
      <span><b>Butter croissants</b><small>24 pc · Baker’s Basket</small></span>
      <strong>{inr(864)}</strong>
    </div>
    <div className="cbx-pc-total"><span>Total</span><strong>{inr(864)}</strong></div>
    <span className="cbx-pc-btn is-ghost">Cheapest of 3 bakeries · {inr(48)} saved</span>
  </div>
);

// Syrups — the best price on each flavour (Shopify's inventory table)
const Table = () => (
  <div className="cbx-pc">
    <div className="cbx-pc-th"><span>Syrup · 1 L</span><span>Best at</span><span>Price</span></div>
    {([['monin-vanilla-syrup.png', 'Vanilla', 'Barista Depot', 640], ['monin-caramel-syrup.png', 'Caramel', 'Café Mart', 655], ['monin-hazelnut-syrup.png', 'Hazelnut', 'Barista Depot', 690], ['monin-strawberry-syrup.png', 'Strawberry', 'Sweet Supply', 705]] as const).map(([img, name, at, p]) => (
      <div className="cbx-pc-tr" key={name}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <span className="cbx-pc-prod"><img src={IMG + img} alt="" draggable={false} /><b>{name}</b></span>
        <span className="cbx-pc-at">{at}</span>
        <strong>{inr(p)}</strong>
      </div>
    ))}
    <p className="cbx-pc-foot">Best price on every flavour, from <b>4 suppliers</b></p>
  </div>
);

// Packaging — what each bulk tier costs per cup
const Tiers = () => (
  <div className="cbx-pc">
    <Head img="ripple-paper-cups.jpg" title="12 oz ripple cups" sub="PackRight · price per cup" chip="Bulk" />
    <ul className="cbx-pc-tiers">
      {([['500 pc', 6.5, 100], ['1,000 pc', 6.1, 94], ['2,000 pc', 5.8, 89]] as const).map(([q, p, w], i) => (
        <li key={q} className={i === 1 ? 'is-best' : undefined}>
          <span>{q}</span>
          <i><b style={{ width: `${w}%` } as CSSProperties} /></i>
          <strong>₹{p.toFixed(2)}</strong>
        </li>
      ))}
    </ul>
    <p className="cbx-pc-foot"><b>1,000 a month</b> fits your use · {inr(400)} saved</p>
  </div>
);

// Chocolate — the two cheapest, side by side
const HeadToHead = () => (
  <div className="cbx-pc">
    <Head img="callebaut-811-dark-chocolate.png" title="Dark couverture" sub="70% cocoa · 2.5 kg" chip="Head to head" />
    <div className="cbx-pc-vs">
      <div className="is-win"><small>Chef’s Pantry</small><strong>{inr(2890)}</strong><span>Tomorrow</span><span>Min. 1 pack</span><i>Winner</i></div>
      <em>vs</em>
      <div><small>Cocoa House</small><strong>{inr(2990)}</strong><span>Thursday</span><span>Min. 2 packs</span></div>
    </div>
    <span className="cbx-pc-btn">Order from Chef’s Pantry</span>
  </div>
);

const PANELS: ReactNode[] = [<Compare key="c" />, <Trend key="t" />, <Receipt key="r" />, <Table key="tb" />, <Tiers key="ti" />, <HeadToHead key="h" />];

export function PriceSphere({ run, still, wide = true }: FilmState) {
  const orbitRef = useRef<HTMLDivElement>(null);
  const spin = useRef(0);
  const [idx, setIdx] = useState(0);
  // swing the orbit the short way round so category i comes to the top
  const turnTo = (i: number) => {
    const n = LABELS.length;
    const cur = ((Math.round(-spin.current / STEP) % n) + n) % n;
    let d = i - cur;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    spin.current -= d * STEP;
    orbitRef.current?.style.setProperty('--spin', `${spin.current}deg`);
    setIdx(i);
  };
  return (
    <div className={`cbx-sphere${wide ? '' : ' is-narrow'}`}>
      <Rings />
      <span className="cbx-orb" aria-hidden="true" />
      <div className="cbx-orbit" ref={orbitRef} aria-hidden="true">
        {LABELS.map((k, i) => (
          <span key={k} className="cbx-orb-slot" style={{ '--a': `${i * STEP}deg` } as CSSProperties}>
            <span className={`cbx-orb-label${idx === i ? ' is-on' : ''}`}>{k}</span>
          </span>
        ))}
      </div>
      <span className="cbx-mark" aria-hidden="true"><GradientMark size={34} /></span>
      <div className="cbx-carousel">
        <Carousel items={PANELS} baseWidth={300} aspectRatio={1.18} radius={14} gap={16} effect="tilt" indicator="bars" frame theme="light" loop
          autoplay={run && !still && wide} autoplayDelay={3000} onChange={turnTo} ariaLabel="Best prices by category"
          style={{
            '--carousel-frame': 'rgba(255, 255, 255, .55)', '--carousel-frame-edge': 'rgba(224, 62, 62, .14)',
            '--carousel-frame-shadow': '0 30px 60px -30px rgba(120, 20, 10, .4), 0 6px 16px -10px rgba(120, 20, 10, .2)',
            '--carousel-tile': '#FFFFFF', '--carousel-tile-edge': 'rgba(20, 9, 6, .07)',
            '--carousel-ink': '#E03E3E', '--carousel-faint': 'rgba(224, 62, 62, .16)', '--carousel-soft': 'rgba(224, 62, 62, .32)',
          } as CSSProperties} />
      </div>
    </div>
  );
}
