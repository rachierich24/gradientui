'use client';
// Section 02 — everything a café orders. Kept as simple as zomato.com's "Better food for more people": three goods
// and one small garnish around the headline (Zomato: burger, momos, pizza at up to 240 px, plus 48 px leaf and tomato
// slices), thin curved lines, and a card. Nothing reacts to hover. Where the motion differs:
//
//  • The section starts inside the hero: it is pulled up over the hero's lower part (--ov), so the croissant and the
//    bean heap land beside the hand. They arrive once the hero's intro is on its last beat (p4), never during it.
//  • Arrival: Zomato slides each dish straight in (0.6–0.8 s ease-out). Here each one comes in from out of focus and
//    tilted, and settles with a slight spring (1.2 s), as if set down.
//  • Afterwards each floats very slowly and drifts a little with the scroll (near things more).
//  • Zomato's pink curves are one flat image. Here they are supply routes: they draw themselves in, run into the
//    card, and a small dot travels along each, like an order on its way.
//  • The headline, the card and the strawberry arrive when the headline scrolls into view.
//
// Photos (all CC0 1.0, cut out of their white backdrops into /public/cafe/goods/):
//   croissant: "Croissant Isolated On White Background", personalgraphic.official — flickr.com/photos/198895458@N04/53097224506
//   beans: "Coffee Beans", megforce1 — flickr.com/photos/35608308@N05/22247100615
//   strawberry: rawpixel.com/image/6031439 · leaf: rawpixel.com/image/5965570
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

type Good = {
  key: string; src: string; w: number; h: number;
  d: number;                        // depth: how far it drifts with the scroll (near things move more)
  r: number;                        // resting tilt, deg
  from: [number, number, number];   // where it arrives from: x px, y px, tilt deg
  delay: number;                    // ms after its group starts
  group: 'top' | 'copy';            // 'top' arrives in the hero; 'copy' with the headline
};

// three goods and a garnish, placed like Zomato's: one on the left, one high on the right, one low on the right
const GOODS: Good[] = [
  { key: 'croissant', src: '/cafe/goods/croissant.webp', w: 720, h: 520, d: .6, r: 8, from: [-320, -80, -22], delay: 0, group: 'top' },
  { key: 'beans', src: '/cafe/goods/beans.webp', w: 720, h: 652, d: .5, r: -6, from: [240, -140, 26], delay: 180, group: 'top' },
  { key: 'leaf', src: '/cafe/goods/leaf.webp', w: 420, h: 319, d: .25, r: -32, from: [-140, -100, -60], delay: 0, group: 'copy' },
  { key: 'straw', src: '/cafe/goods/strawberry.webp', w: 558, h: 600, d: .45, r: 12, from: [220, 110, 28], delay: 120, group: 'copy' },
];

const icon = (d: ReactNode) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);
// the four things the portal does, in the card (Zomato's stats card holds its numbers here)
const POINTS = [
  { t: 'One cart', d: 'for every supplier', i: icon(<path d="M3 4h2l2.4 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2M10 20h.01M17 20h.01" />) },
  { t: 'On repeat', d: 'scheduled restocks', i: icon(<path d="M17 2.5 20.5 6 17 9.5M20.5 6H8a4.5 4.5 0 0 0-4.5 4.5V12M7 21.5 3.5 18 7 14.5M3.5 18H16a4.5 4.5 0 0 0 4.5-4.5V12" />) },
  { t: 'GST-ready', d: 'bills in one place', i: icon(<path d="M7 3h10a1 1 0 0 1 1 1v17l-3-2-3 2-3-2-3 2V4a1 1 0 0 1 1-1Zm2 5h6M9 12h6M9 16h3" />) },
  { t: 'In hours', d: 'urgent sourcing', i: icon(<path d="M13 3 4 14h7l-1 7 9-11h-7l1-7Z" />) },
];

type Box = { w: number; h: number; routes: string[] };

// The two routes, in the section's own pixels: each starts off the edge inside the hero, loops once beside the
// goods, and runs into the card's side.
function buildRoutes(w: number, ov: number, card: { l: number; r: number; y: number }, small: boolean): string[] {
  const f = (n: number) => Math.round(n);
  if (small) {
    return [
      `M -20 ${f(ov - 60)} C ${f(w * .3)} ${f(ov - 90)} ${f(w * .42)} ${f(ov + 40)} ${f(w * .2)} ${f(ov + 110)} S ${f(w * .02)} ${f(card.y - 60)} ${f(card.l)} ${f(card.y)}`,
    ];
  }
  const L = [
    `M -30 ${f(ov - 250)}`,
    `C ${f(w * .1)} ${f(ov - 290)} ${f(w * .27)} ${f(ov - 170)} ${f(w * .23)} ${f(ov - 20)}`,
    `C ${f(w * .2)} ${f(ov + 80)} ${f(w * .07)} ${f(ov + 50)} ${f(w * .1)} ${f(ov - 30)}`,
    `C ${f(w * .13)} ${f(ov - 110)} ${f(w * .3)} ${f(ov + 40)} ${f(w * .2)} ${f(ov + 260)}`,
    `C ${f(w * .13)} ${f(ov + 420)} ${f(card.l - w * .12)} ${f(card.y)} ${f(card.l)} ${f(card.y)}`,
  ].join(' ');
  const R = [
    `M ${f(w + 30)} ${f(ov - 330)}`,
    `C ${f(w * .9)} ${f(ov - 300)} ${f(w * .7)} ${f(ov - 210)} ${f(w * .76)} ${f(ov - 60)}`,
    `C ${f(w * .8)} ${f(ov + 50)} ${f(w * .94)} ${f(ov + 20)} ${f(w * .9)} ${f(ov - 60)}`,
    `C ${f(w * .86)} ${f(ov - 140)} ${f(w * .68)} ${f(ov + 90)} ${f(w * .8)} ${f(ov + 300)}`,
    `C ${f(w * .87)} ${f(ov + 430)} ${f(card.r + w * .12)} ${f(card.y)} ${f(card.r)} ${f(card.y)}`,
  ].join(' ');
  return [L, R];
}

export function CafeFeatures() {
  const secRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [inTop, setInTop] = useState(false);
  const [inCopy, setInCopy] = useState(false);
  const [box, setBox] = useState<Box>({ w: 0, h: 0, routes: [] });

  // arrivals: the top goods once the section shows and the hero's intro is on its last beat; the rest with the headline
  useEffect(() => {
    const sec = secRef.current, copy = copyRef.current;
    if (!sec || !copy) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setInTop(true); setInCopy(true); return; }
    const hero = document.getElementById('cafe-hero');
    const heroReady = () => !hero || !hero.classList.contains('is-intro') || hero.classList.contains('p4');
    let secSeen = false, timer = 0;
    const tryTop = () => {
      if (secSeen && heroReady() && !timer) timer = window.setTimeout(() => setInTop(true), hero?.classList.contains('is-intro') ? 500 : 0);
    };
    const mo = hero ? new MutationObserver(tryTop) : null;
    mo?.observe(hero!, { attributes: true, attributeFilter: ['class'] });
    const ioTop = new IntersectionObserver(([e]) => { if (e.isIntersecting) { secSeen = true; tryTop(); } });
    const ioCopy = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInCopy(true); setInTop(true); ioCopy.disconnect(); } }, { rootMargin: '0px 0px -18% 0px' });
    ioTop.observe(sec); ioCopy.observe(copy);
    return () => { mo?.disconnect(); ioTop.disconnect(); ioCopy.disconnect(); clearTimeout(timer); };
  }, []);

  // depth: a gentle drift with the scroll (--sp)
  useEffect(() => {
    const sec = secRef.current;
    if (!sec || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const top = sec.getBoundingClientRect().top, vh = window.innerHeight;
      sec.style.setProperty('--sp', Math.max(-1.5, Math.min(1, (top - vh * .75) / vh)).toFixed(4));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);

  // the routes are drawn in the section's own pixels, so they meet the card exactly at any width
  useEffect(() => {
    const sec = secRef.current, card = cardRef.current;
    if (!sec || !card) return;
    const measure = () => {
      const w = sec.clientWidth, h = sec.clientHeight;
      const ov = parseFloat(getComputedStyle(sec).getPropertyValue('--ov')) || 0;
      const c = { l: card.offsetLeft, r: card.offsetLeft + card.offsetWidth, y: card.offsetTop + card.offsetHeight / 2 };
      setBox({ w, h, routes: buildRoutes(w, ov, c, w <= 768) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(sec);
    return () => ro.disconnect();
  }, []);

  return (
    <section ref={secRef} className={`cafe-goods${inTop ? ' in-top' : ''}${inCopy ? ' in-copy' : ''}`} id="features" aria-labelledby="cafe-goods-h">
      {/* supply routes */}
      {box.w > 0 && (
        <svg className="cg-routes" width={box.w} height={box.h} viewBox={`0 0 ${box.w} ${box.h}`} aria-hidden="true">
          {box.routes.map((d, i) => (
            <g key={i}>
              <path id={`cg-route-${i}`} className="cg-line" d={d} pathLength={1} />
              {/* the wrapper fades the dot in once the route is drawn; the dot's own animation fades it per trip */}
              <g className="cg-dot-wrap">
                <g className="cg-dot">
                  <circle r="9" className="cg-dot-glow" />
                  <circle r="3.5" />
                  <animateMotion dur="7s" begin={`${i * 3.4}s`} repeatCount="indefinite" calcMode="spline"
                    keyPoints="0;1;1" keyTimes="0;.8;1" keySplines=".45 0 .25 1;0 0 1 1">
                    <mpath href={`#cg-route-${i}`} />
                  </animateMotion>
                  <animate attributeName="opacity" dur="7s" begin={`${i * 3.4}s`} repeatCount="indefinite"
                    values="0;1;1;0;0" keyTimes="0;.06;.74;.8;1" />
                </g>
              </g>
            </g>
          ))}
        </svg>
      )}

      {/* the goods */}
      <div className="cg-goods" aria-hidden="true">
        {GOODS.map((g, i) => (
          <div key={g.key} className={`cg-item cg-${g.key}`} data-group={g.group}
            style={{
              '--d': g.d, '--r': `${g.r}deg`, '--fx': `${g.from[0]}px`, '--fy': `${g.from[1]}px`, '--fr': `${g.from[2]}deg`,
              '--delay': `${g.delay}ms`, '--fd': `${6.4 + i * .9}s`, '--fdl': `${-i * 1.7}s`,
            } as CSSProperties}>
            <div className="cg-par">
              <img className="cg-img" src={g.src} width={g.w} height={g.h} alt="" decoding="async" draggable={false} />
            </div>
          </div>
        ))}
      </div>

      <div className="cg-copy" ref={copyRef}>
        <h2 className="cg-h" id="cafe-goods-h">
          <span className="cg-mask"><span>Everything your café</span></span>{' '}
          <span className="cg-mask"><span>orders, in one place.</span></span>
        </h2>
        <p className="cg-sub">Beans from your roaster, bakes from your baker, produce from the market: ordered from one cart, billed in one place.</p>
      </div>

      <div className="cg-card" ref={cardRef}>
        {POINTS.map((p, i) => (
          <div className="cg-point" key={p.t} style={{ '--i': i } as CSSProperties}>
            <div className="cg-point-text">
              <b>{p.t}</b>
              <span>{p.d}</span>
            </div>
            <span className="cg-point-icon" aria-hidden="true">{p.i}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
