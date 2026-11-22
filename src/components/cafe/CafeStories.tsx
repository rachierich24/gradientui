'use client';
// Section 04 — "Stories of cafés", after umanodesign.studio's "Stories of our clients" (layout, timings and curves
// read from that site's source and recorded frame by frame), on a warm white. The page arrives here by zooming into
// the little mark on the bento's last card (CafeBento.tsx), as umano arrives by zooming into its logo card; that
// mark fades while these stories rise.
//
//  1. The stories (a pinned 100vh panel over 260vh of scroll, at least 2000px). "Stories of cafés." in the middle,
//     fading to half as you scroll, and a line whose number counts up (1.2 s) when it comes into view. Four tilted
//     cards (280 × 370, a little smaller on short screens) fly in from alternate sides at 0, 17, 34 and 51% of the
//     scroll, each over 20% of it (cubic ease-out), rising from below the panel and untilting from 25°; the last 29% is
//     a pause with all four in. At rest a card is the café's storefront, its name
//     and place, and its button; hovering it straightens and lifts it (spring), darkens it to show the headline, and
//     pops three chips out to its right. Clicking grows the card into its story (0.78 s): the card's frame straightens
//     and sweeps out to the sheet's place, its photo pinned at the top and recropping into the banner, while the
//     section settles back; the sheet takes over underneath and its words rise in. Closing runs it back into the card.
//  2. The story: umano's use-case sheet — a rounded sheet with the storefront as a banner under the title, a sticky
//     sidebar (contents, the café, the ask), the sections, a product panel, the numbers, and a closing ask.
//  Motion is transforms only, driven from one frame loop that runs while the section is on screen, with the scroll
//  lightly smoothed. On phones and with reduced motion the stories lay out still, as a list.
//
// The cafés are real (The Raydee Café, The Hims Café, Cookie Pookie, The Naked Bowl), with their photos from their
// Grabbit listings, cropped into public/cafe/stories/ (*-card portrait, *-wide banner). Their stories are MOCK copy
// for now (as asked), to be replaced with the real ones.
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Check } from '@/components/supplier/bento/shared';
import { openContactSalesModal } from '@/components/ContactSalesModal';

type Panel =
  | { kind: 'items'; title: string; rows: [string, string, string, string, string][] }   // img, item, qty, supplier, tag
  | { kind: 'launch'; title: string; rows: string[] }
  | { kind: 'gst'; title: string; rows: [string, string][] };
type Story = {
  slug: string; name: string; mark: string; place: string;
  img: string; banner: string; logo?: string;   // card (portrait), the story's banner (wide), the café's own logo
  title: string; months: number; orders: string; impact: string;
  sections: { h: string; p: string }[]; results: [string, string][]; quote: string; panel: Panel;
};

const IMG = '/landing/spotlight/';
const PHOTO = '/cafe/stories/';
// Four cafés on Grabbit; names, places, hours and photos are from their Grabbit listings (api.grabit365.com/api/grabit/cafes).
// MOCK: the stories, numbers and quotes are placeholders until the real ones are written.
const STORIES: Story[] = [
  {
    slug: 'raydee', name: 'The Raydee Café', mark: 'The Raydee Café', place: 'By the OAT · DTU, Delhi',
    img: PHOTO + 'raydee-card.webp', banner: PHOTO + 'raydee-wide.webp', logo: PHOTO + 'raydee-logo.webp',
    title: 'From five WhatsApp suppliers to one cart', months: 12, orders: '1,260',
    impact: 'No stock-outs in fest week, and supply costs down 14%',
    sections: [
      { h: 'The café', p: 'The Raydee Café is a kiosk café by the open-air theatre at DTU, open from nine in the morning until ten at night, and it was the first café on Gradient. The queue between lectures goes through milk, beans and bakes fast, and fest weeks are busier still.' },
      { h: 'The problem', p: 'Every morning started with five supplier chats on WhatsApp and a notebook of who owed what. Orders got lost in long threads, prices changed without anyone noticing, and the busiest days were the ones most likely to run dry.' },
      { h: 'What changed', p: 'Raydee moved every supplier onto Gradient. Milk and croissants now restock on a schedule, low stock is flagged a day early, and when the usual dairy can’t deliver, a verified supplier nearby can. Every price sits side by side in one cart.' },
    ],
    results: [['0', 'stock-outs in the last fest week'], ['14%', 'lower supply costs'], ['6 hrs', 'a week no longer spent chasing orders']],
    quote: 'We stopped being the café that runs out of milk before the evening rush. That alone paid for it.',
    panel: { kind: 'items', title: 'This week’s restock', rows: [
      ['barista-oat-carton.jpg', 'Barista oat milk', '12 L', 'Freshway Dairy', 'Mon & Thu'],
      ['croissant-bakery.jpg', 'Butter croissants', '48 pc', 'Baker’s Basket', 'Daily, 7 AM'],
      ['arabica-coffee-bag.jpg', 'Arabica AA beans', '4 kg', 'Hill Estate Roasters', 'Fridays'],
    ] },
  },
  {
    slug: 'the-hims-cafe', name: 'The Hims Café', mark: 'The Hims', place: 'Academic Building 4 · DTU, Delhi',
    img: PHOTO + 'the-hims-cafe-card.webp', banner: PHOTO + 'the-hims-cafe-wide.webp',
    title: 'A matcha menu, built with the brand’s own chef', months: 5, orders: '310',
    impact: 'A new matcha menu in three weeks, and weekday sales up 22%',
    sections: [
      { h: 'The café', p: 'The Hims Café serves from a café truck outside Academic Building 4 at DTU, from breakfast until the evening. Students stop by between classes, so the menu has to be quick, and it has to keep changing.' },
      { h: 'The problem', p: 'Trying something new meant buying it in bulk first. Recipes came from videos, costs were a guess, and a truck has no room for a case of something nobody orders.' },
      { h: 'What changed', p: 'Through Gradient, The Hims booked trial kits from three matcha brands and a tasting with one brand’s chef, who worked through the recipes with the team, costed them, and helped train the counter for the launch.' },
    ],
    results: [['3 wks', 'from first trial to the new menu'], ['22%', 'more weekday sales'], ['3', 'brands tried before choosing one']],
    quote: 'We tasted before we bought, and we launched with a chef in our corner instead of a guess.',
    panel: { kind: 'launch', title: 'Matcha launch plan', rows: ['Trial kits from three brands', 'Tasting with the brand’s chef', 'Recipes costed for the menu', 'Live on the menu'] },
  },
  {
    slug: 'cookiepookie', name: 'Cookie Pookie', mark: 'Cookie Pookie', place: 'Four outlets · Delhi',
    img: PHOTO + 'cookiepookie-card.webp', banner: PHOTO + 'cookiepookie-wide.webp',
    title: 'One price list for four kitchens', months: 7, orders: '1,480',
    impact: 'Ingredient costs down 11% across all four outlets',
    sections: [
      { h: 'The café', p: 'Cookie Pookie bakes cookies and waffles and pours coffee and shakes at four outlets across Delhi, in Ashok Vihar, Old Rajinder Nagar, Pitampura and Shalimar Bagh, from noon until half past eleven at night. All four go through chocolate, butter and cream by the kilo.' },
      { h: 'The problem', p: 'Each outlet ordered on its own, from its own suppliers, at its own prices. The same chocolate cost four different amounts across town, and nobody could be sure which distributor was actually authorised by the brand.' },
      { h: 'What changed', p: 'All four outlets now order through one Gradient account. Every product shows the best price from verified, brand-authorised distributors side by side, and each outlet’s share is delivered to its own kitchen, with its own bill.' },
    ],
    results: [['11%', 'lower ingredient costs'], ['4', 'outlets ordering from one account'], ['100%', 'of chocolate from authorised distributors']],
    quote: 'We used to pay four prices for the same chocolate. Now there’s one, and it’s the best one.',
    panel: { kind: 'items', title: 'Best prices this week', rows: [
      ['callebaut-811-dark-chocolate.png', 'Callebaut 811 dark', '10 kg', 'Brand-authorised distributor', '−11%'],
      ['nutella-hazelnut-spread.png', 'Nutella', '6 × 3 kg', 'Brand-authorised distributor', '−7%'],
      ['amul-butter-500g.png', 'Amul butter', '20 kg', 'Verified supplier', '−6%'],
    ] },
  },
  {
    slug: 'the-naked-bowl', name: 'The Naked Bowl', mark: 'The Naked Bowl', place: 'Model Town · Delhi',
    img: PHOTO + 'the-naked-bowl-card.webp', banner: PHOTO + 'the-naked-bowl-wide.webp',
    title: 'GST bills that reconcile themselves', months: 6, orders: '820',
    impact: '₹1.4 lakh of input credit recovered in six months',
    sections: [
      { h: 'The café', p: 'The Naked Bowl is an everyday kitchen in Model Town: grain bowls, fresh salads, wraps and smoothies, from eleven in the morning until late. Fresh produce comes in every day, from more than a dozen suppliers.' },
      { h: 'The problem', p: 'Month-end meant a folder of paper invoices and a long call with their CA. Bills went missing, some suppliers billed late, and input credit was quietly lost because the bills never matched what had been filed.' },
      { h: 'What changed', p: 'Every order on Gradient now arrives with its GST invoice from a verified supplier. Bills are matched against GSTR-2B automatically, and the month goes to Tally in one export.' },
    ],
    results: [['₹1.4L', 'input credit recovered in six months'], ['96 / 97', 'bills matched last month'], ['1 day', 'month-end close, down from a week']],
    quote: 'Our CA used to chase us for bills. Now we just send the export.',
    panel: { kind: 'gst', title: 'GST · October', rows: [['Bills matched to GSTR-2B', '96 of 97'], ['Input tax credit', '₹23,180'], ['Export to Tally', 'Sent']] },
  },
];
// where each card lands, its tilt, the side it comes in from, and when it starts: umano's pattern, spread over four and
// gathered close around the headline (two high, two low and further in). x is % of the panel's width; y is % of the
// height left below the nav once a card is in (CARD_TOP).
// Each flies over FLY of the scroll; the last lands at 0.71, leaving the rest as a pause to look and hover before the
// section lets go.
const LAYOUT = [
  { x: 10, y: 6, rot: -12, from: -1, at: 0 },
  { x: 64, y: 4, rot: 9, from: 1, at: 0.17 },   // far enough in that its chips (to its right) fit from 1280px up
  { x: 20, y: 87, rot: 6, from: -1, at: 0.34 },
  { x: 56, y: 83, rot: -7, from: 1, at: 0.51 },
];
const FLY = 0.2;
const NAV_H = 56, CARD_H = 370;
const CARD_TOP = (ph: number, y: number) => NAV_H + (ph - NAV_H - CARD_H) * y / 100;   // = the CSS top of .cst-card
const COUNT_TO = 120;   // MOCK

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOut3 = (t: number) => 1 - (1 - t) ** 3;

const MARK = (
  <svg viewBox="0 0 28 28" aria-hidden="true">
    <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <path d="M7.68 8.31A8.5 8.5 0 0 1 20.32 8.31" /><path d="M22.08 11.37A8.5 8.5 0 0 1 15.77 22.31" /><path d="M12.23 22.31A8.5 8.5 0 0 1 5.92 11.37" />
    </g>
    <circle cx="14" cy="14" r="3" fill="currentColor" />
  </svg>
);
const ARROW = <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>;

/* ─── the card ⇄ story morph: a shared element, like the App Store's cards ───
   A fixed copy of the card (the "ghost") is laid exactly over it and animated (Web Animations) to the story sheet's
   place: its box straightens and grows into the sheet, the photo stays pinned at the top and recrops into the banner
   (crossfading to the wide photo on wide screens), the card's words fade out and the banner's shade comes in, while
   the section behind settles back. The real sheet then takes over underneath (same place, same pixels) and the ghost
   goes. Closing runs it back into the card. */
type Box = { x: number; y: number; w: number; h: number; r: number; rot: number };
const OPEN_MS = 780, OPEN_EASE = 'cubic-bezier(.7, 0, .18, 1)';     // a slow start, then it sweeps in
const CLOSE_MS = 640, CLOSE_EASE = 'cubic-bezier(.5, 0, .16, 1)';
const CARD_SHADOW = '0 0 0 1px rgba(20, 9, 6, 0), 0 26px 60px -22px rgba(60, 20, 10, .42)';
const SHEET_SHADOW = '0 0 0 1px rgba(20, 9, 6, .08), 0 40px 90px -40px rgba(60, 20, 10, .45)';
// the sheet at rest (cafe-stories.css): 32px in from every side with 32px corners, or the whole screen up to 860px;
// its banner is clamp(300px, 52vh, 460px) tall, and up to 860px it shows the card's own portrait photo
const sheetBox = (): Box => {
  const vw = window.innerWidth, vh = window.innerHeight, p = vw <= 860 ? 0 : 32;
  return { x: p, y: p, w: vw - 2 * p, h: vh - 2 * p, r: p, rot: 0 };
};
const bannerH = () => Math.min(460, Math.max(300, window.innerHeight * 0.52));
const wideBanner = () => window.innerWidth > 860;
// an element's own rotation and scale, from its computed transform
const turnOf = (el: Element) => {
  const t = getComputedStyle(el).transform;
  if (!t || t === 'none') return { a: 0, s: 1 };
  const m = new DOMMatrixReadOnly(t);
  return { a: Math.atan2(m.b, m.a) * 180 / Math.PI, s: Math.hypot(m.a, m.b) };
};
// where a card's face is drawn right now: its centre, its size at its current scale, and its net tilt (the card's
// own, plus its inner layer's, which straightens it on hover)
const faceBox = (card: HTMLElement): Box => {
  const tilt = card.querySelector('.cst-card-tilt')!, face = card.querySelector<HTMLElement>('.cst-card-face')!;
  const c = turnOf(card), t = turnOf(tilt), s = c.s * t.s, b = face.getBoundingClientRect();
  const w = face.offsetWidth * s, h = face.offsetHeight * s;
  return { x: b.left + b.width / 2 - w / 2, y: b.top + b.height / 2 - h / 2, w, h, r: 16 * s, rot: c.a + t.a };
};
const boxFrame = (b: Box): Keyframe => ({
  left: `${b.x}px`, top: `${b.y}px`, width: `${b.w}px`, height: `${b.h}px`, borderRadius: `${b.r}px`, transform: `rotate(${b.rot}deg)`,
});
type Ghost = { root: HTMLElement; back: HTMLElement; media: HTMLElement; imgs: HTMLImageElement[]; wide: HTMLImageElement | null;
  shade: HTMLElement; dark: HTMLElement; words: HTMLElement; remove: () => void };
// the ghost: the photo (and the wide one), the banner's shade, the card's darkening and its words as drawn now
function makeGhost(s: Story, card: HTMLElement, at: Box, cardAt: Box): Ghost {
  const make = <T extends HTMLElement>(tag: string, cls: string) => { const e = document.createElement(tag) as T; e.className = cls; return e; };
  const face = card.querySelector<HTMLElement>('.cst-card-face')!;
  const back = make('div', 'cst-morph-back'), root = make('div', 'cst-morph'), media = make('div', 'cst-morph-media');
  const photo = make<HTMLImageElement>('img', 'is-card');
  photo.src = s.img; photo.alt = '';
  const wide = wideBanner() ? make<HTMLImageElement>('img', 'is-wide') : null;
  if (wide) { wide.src = s.banner; wide.alt = ''; }
  const shade = make('span', 'cst-morph-shade'), dark = make('span', 'cst-morph-dark'), words = make('div', 'cst-morph-words');
  media.append(photo, ...(wide ? [wide] : []), shade);
  // the card's words, at the card's size and scale, anchored to the ghost's top left
  words.style.width = `${face.offsetWidth}px`;
  words.style.height = `${face.offsetHeight}px`;
  words.style.transform = `scale(${cardAt.w / face.offsetWidth})`;
  face.querySelectorAll<HTMLElement>('.cst-card-foot, .cst-card-over, .cst-card-btn').forEach((src) => {
    const c = src.cloneNode(true) as HTMLElement, op = +getComputedStyle(src).opacity;
    c.style.opacity = String(op);
    c.style.transition = 'none';
    // the darkening goes on its own layer, which spans the ghost however big it gets
    if (src.classList.contains('cst-card-over')) { c.style.background = 'none'; dark.style.opacity = String(op * 0.88); }
    words.append(c);
  });
  root.append(media, dark, words);
  Object.assign(root.style, boxFrame(at));
  media.style.height = `${at.h}px`;
  const host = document.querySelector('.cafe-portal-root') ?? document.body;
  host.append(back, root);
  return { root, back, media, imgs: wide ? [photo, wide] : [photo], wide, shade, dark, words, remove: () => { root.remove(); back.remove(); } };
}
// once the real sheet (and its banner) is drawn underneath, take the ghost away
function handOff(g: Ghost, then: () => void) {
  let tries = 0;
  const look = () => {
    const img = document.querySelector<HTMLImageElement>('.cst-sheet-hero img');
    if (!img && ++tries < 40) { requestAnimationFrame(look); return; }
    const done = () => requestAnimationFrame(() => requestAnimationFrame(() => { g.remove(); then(); }));
    if (img) img.decode().then(done, done); else done();
  };
  requestAnimationFrame(look);
}
// the wide photos are fetched as soon as a card is pointed at, so the morph can crossfade to them
const fetched = new Set<string>();
const prefetch = (src: string) => { if (fetched.has(src)) return; fetched.add(src); const im = new Image(); im.src = src; };

function StoryCard({ s, i, away, onOpen }: { s: Story; i: number; away: boolean; onOpen: (i: number, el: HTMLElement) => void }) {
  const [hover, setHover] = useState(false);
  const L = LAYOUT[i];
  // while its story is out the card is hidden (the ghost stands in for it), and it comes back unhovered
  useEffect(() => { if (away) setHover(false); }, [away]);
  return (
    <div className={`cst-card${hover ? ' is-hover' : ''}${away ? ' is-away' : ''}`} data-card={i} style={{ '--x': L.x, '--y': L.y, zIndex: 10 + i } as CSSProperties}>
      <button type="button" className="cst-card-tilt" aria-label={`Read ${s.name}’s story: ${s.title}`}
        onMouseEnter={() => { setHover(true); prefetch(s.banner); }} onMouseLeave={() => setHover(false)}
        onFocus={() => { setHover(true); prefetch(s.banner); }} onBlur={() => setHover(false)}
        onClick={(e) => onOpen(i, e.currentTarget)}>
        <span className="cst-card-face">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.img} alt="" draggable={false} />
          {/* the photo carries the café's own sign at the top, so the name sits low, above the button */}
          <span className="cst-card-foot"><b className={`cst-wordmark is-${s.slug}`}>{s.mark}</b><small>{s.place}</small></span>
          <span className="cst-card-over"><b className={`cst-wordmark is-${s.slug}`}>{s.mark}</b><span>{s.title}</span></span>
          <span className="cst-card-btn">Read their story {ARROW}</span>
        </span>
        {/* umano's three chips, out to the right */}
        <span className="cst-chips" aria-hidden="true">
          <span className="cst-chip" style={{ '--r': '-5deg', '--i': 0 } as CSSProperties}><b>{s.months}</b><small>Months on Gradient</small></span>
          <span className="cst-chip" style={{ '--r': '3deg', '--i': 1 } as CSSProperties}><b>{s.orders}</b><small>Orders placed</small></span>
          <span className="cst-chip is-impact" style={{ '--r': '-2deg', '--i': 2 } as CSSProperties}><i /><span>{s.impact}</span></span>
        </span>
      </button>
    </div>
  );
}

function PanelCard({ p }: { p: Panel }) {
  return (
    <div className="cst-mock">
      <div className="cst-mock-head"><span className="cst-mock-app">{MARK}</span><b>{p.title}</b></div>
      {p.kind === 'items' && (
        <ul>{p.rows.map(([img, item, qty, who, when]) => (
          <li key={item}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMG + img} alt="" />
            <span><b>{item} · {qty}</b><small>{who}</small></span>
            <em>{when}</em>
          </li>
        ))}</ul>
      )}
      {p.kind === 'launch' && (
        <ul>{p.rows.map((r) => <li key={r} className="is-check"><span className="cst-mock-tick"><Check /></span><span><b>{r}</b></span></li>)}</ul>
      )}
      {p.kind === 'gst' && (
        <ul>{p.rows.map(([k, v]) => <li key={k} className="is-kv"><span><b>{k}</b></span><em>{v}</em></li>)}</ul>
      )}
    </div>
  );
}

// umano's use-case sheet. `morphed`: it arrived by morphing out of its card, so it's already in place and only its
// words rise in. `folding`: its words fade before it morphs back into the card.
function StorySheet({ s, closing, morphed, folding, onClose }: { s: Story; closing: boolean; morphed: boolean; folding: boolean; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const toc = [...s.sections.map((x) => x.h), 'The result'];
  useEffect(() => {
    // the page is held still under the sheet. On <html>, not <body>: Lenis clips <html> while it's stopped, so a
    // body overflow would no longer pass up to the viewport and would make <body> its own scroll container, which
    // unpins the stories panel (position: sticky) behind the sheet and moves the card the sheet closes back into.
    const lenis = (window as unknown as { lenis?: { stop: () => void; start: () => void } }).lenis;
    const root = document.documentElement, prev = root.style.overflow;
    root.style.overflow = 'hidden';
    lenis?.stop();
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    addEventListener('keydown', onKey);
    return () => { root.style.overflow = prev; lenis?.start(); removeEventListener('keydown', onKey); };
  }, [onClose]);
  // the contents follow the reading position
  useEffect(() => {
    const sc = scrollRef.current;
    if (!sc) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const line = sc.getBoundingClientRect().top + sc.clientHeight * 0.35;
        let a = 0;
        sc.querySelectorAll<HTMLElement>('[data-sec]').forEach((el, i) => { if (el.getBoundingClientRect().top <= line) a = i; });
        setActive(a);
      });
    };
    sc.addEventListener('scroll', onScroll, { passive: true });
    return () => { sc.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);
  const go = (i: number) => {
    const sc = scrollRef.current, el = sc?.querySelector<HTMLElement>(`[data-sec="${i}"]`);
    if (sc && el) sc.scrollTo({ top: sc.scrollTop + el.getBoundingClientRect().top - sc.getBoundingClientRect().top - 32, behavior: 'smooth' });
  };
  const start = () => { onClose(); openContactSalesModal(); };
  return (
    <div className={`cst-sheet-wrap${closing ? ' is-closing' : ''}${morphed ? ' is-morphed' : ''}${folding ? ' is-folding' : ''}`} onClick={onClose}>
      <div className="cst-sheet" role="dialog" aria-modal="true" aria-label={`${s.name}: ${s.title}`} onClick={(e) => e.stopPropagation()}>
        <button ref={closeRef} type="button" className="cst-sheet-close" onClick={onClose} aria-label="Close story">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
        <div className="cst-sheet-scroll" ref={scrollRef} data-lenis-prevent>
          <header className="cst-sheet-hero">
            {/* the wide storefront, or the card's portrait crop on narrow screens */}
            <picture>
              <source media="(max-width: 860px)" srcSet={s.img} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.banner} alt={`${s.name}, ${s.place.split(' · ').pop()}`} />
            </picture>
            <div className="cst-sheet-hero-tx">
              <small>Gradient × {s.name}</small>
              <h2>{s.title}</h2>
            </div>
          </header>
          <div className="cst-sheet-body">
            <aside className="cst-sheet-side">
              <small className="cst-sheet-label">Contents</small>
              <nav aria-label="Story contents">
                {toc.map((h, i) => <button key={h} type="button" className={active === i ? 'is-on' : undefined} onClick={() => go(i)}>{h}</button>)}
              </nav>
              <hr />
              <small className="cst-sheet-label">The café</small>
              <div className="cst-sheet-cafe">
                <span className={`cst-sheet-av is-${s.slug}${s.logo ? ' has-logo' : ''}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {s.logo ? <img src={s.logo} alt="" /> : s.mark.replace(/^The /, '').slice(0, 1).toUpperCase()}
                </span>
                <span><b>{s.name}</b><small>{s.place.replace(' · ', ', ')}</small></span>
              </div>
              <hr />
              <small className="cst-sheet-label">Running a café?</small>
              <button type="button" className="cst-sheet-btn" onClick={start}>Start ordering</button>
            </aside>
            <article className="cst-sheet-main">
              {s.sections.map((sec, i) => (
                <section key={sec.h} data-sec={i}>
                  <h3>{sec.h}</h3>
                  <p>{sec.p}</p>
                  {i === s.sections.length - 1 && <div className="cst-sheet-media"><PanelCard p={s.panel} /></div>}
                </section>
              ))}
              <section data-sec={s.sections.length}>
                <h3>The result</h3>
                <ul className="cst-sheet-results">{s.results.map(([v, l]) => <li key={l}><b>{v}</b><span>{l}</span></li>)}</ul>
                <blockquote>“{s.quote}”<cite>The owners, {s.name}</cite></blockquote>
              </section>
              <div className="cst-sheet-stats">
                <span><b>{s.months} months</b><small>On Gradient</small></span>
                <span><b>{s.orders} orders</b><small>Placed</small></span>
                <span className="is-impact"><b>Impact</b><small>{s.impact}</small></span>
              </div>
              <p className="cst-sheet-mock">Sample story, for illustration.</p>
            </article>
          </div>
          <div className="cst-sheet-end">
            <small>Ready to start?</small>
            <h3>Every supplier, one cart. Starting today.</h3>
            <p>Verified distributors, the best price on everything, and bills that reconcile themselves.</p>
            <button type="button" onClick={start}>Start ordering</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CafeStories() {
  const storiesRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLParagraphElement>(null);
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const [closing, setClosing] = useState(false);   // the plain fade out (reduced motion, or the card's out of sight)
  const [morphed, setMorphed] = useState(false);   // the open sheet arrived by morphing out of its card
  const [folding, setFolding] = useState(false);   // the sheet's words are fading before it morphs back
  const [away, setAway] = useState<number | null>(null);   // the card standing in for the open story (hidden)
  const [mounted, setMounted] = useState(false);
  const busy = useRef(false);   // a morph is running
  const openRef = useRef<number | null>(null);
  openRef.current = open;

  // a story linked by its address (#raydee-cafe) opens on arrival, as umano's do
  useEffect(() => {
    setMounted(true);
    const i = STORIES.findIndex((s) => `#${s.slug}` === window.location.hash);
    if (i >= 0) { setOpen(i); document.documentElement.classList.add('cst-story-open'); }
  }, []);

  // the number counts up when its line comes into view (straight to the total with reduced motion)
  useEffect(() => {
    const line = lineRef.current;
    if (!line) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setCount(COUNT_TO); return; }
      const t0 = performance.now();
      const tick = (t: number) => { const k = Math.min(1, (t - t0) / 1200); setCount(Math.round(easeOut3(k) * COUNT_TO)); if (k < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }, { rootMargin: '0px 0px -15% 0px' });
    io.observe(line);
    return () => io.disconnect();
  }, []);

  // the cards' flight: one frame loop, running only while the section is on screen
  useEffect(() => {
    const st = storiesRef.current, panel = panelRef.current;
    if (!st || !panel) return;
    const still = window.matchMedia('(max-width: 768px), (prefers-reduced-motion: reduce)');
    const cards = [...panel.querySelectorAll<HTMLElement>('.cst-card')];
    let raf = 0, last = 0, seen = false, sP = -1;
    const frame = (t: number) => {
      raf = 0;
      if (!seen) return;
      raf = requestAnimationFrame(frame);
      const dt = last ? Math.min(64, t - last) : 16.7;
      last = t;
      if (still.matches) return;
      // read everything first
      const vh = window.innerHeight, sTop = st.getBoundingClientRect().top, sH = st.offsetHeight, pw = panel.clientWidth, ph = panel.clientHeight;
      // a light smoothing on top of the scroll
      const sT = clamp(-sTop / Math.max(1, sH - vh));
      sP = sP < 0 ? sT : sP + (sT - sP) * (1 - Math.pow(0.8, dt / 16.7));
      // then write
      if (headRef.current) headRef.current.style.opacity = Math.max(0.5, 1 - sP * 2).toFixed(3);
      // on short screens the cards come down a little (to 80% at 720px tall) so the two rows don't bury each other
      const k = clamp(ph / 900, 0.8, 1);
      cards.forEach((el, i) => {
        const L = LAYOUT[i], l = clamp((sP - L.at) / FLY), u = easeOut3(l);
        const rot = 25 + (L.rot - 25) * u;
        // it starts 20% of the panel below the panel's bottom, as umano's do
        el.style.transform = `translate3d(${((1 - u) * 0.15 * pw * L.from).toFixed(1)}px, ${((1 - u) * (1.2 * ph - CARD_TOP(ph, L.y))).toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg) scale(${k.toFixed(3)})`;
        el.style.setProperty('--rot', `${rot.toFixed(2)}deg`);
        el.style.opacity = Math.min(1, l * 3).toFixed(3);
        el.style.visibility = l > 0 ? 'visible' : 'hidden';
      });
    };
    const io = new IntersectionObserver(([e]) => {
      seen = e.isIntersecting;
      if (seen && !raf) { last = 0; raf = requestAnimationFrame(frame); }
    }, { rootMargin: '50% 0px 50% 0px' });
    io.observe(st);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, []);

  // the card grows into its story (see makeGhost): the ghost takes the card's place, the card hides, and the section
  // settles back while the ghost sweeps out to the sheet's place; then the sheet takes over underneath it
  const openStory = useCallback((i: number, el: HTMLElement) => {
    if (busy.current || openRef.current !== null) return;
    const s = STORIES[i], card = el.closest<HTMLElement>('.cst-card');
    document.documentElement.classList.add('cst-story-open');
    const show = (viaMorph: boolean) => { setMorphed(viaMorph); setOpen(i); window.history.replaceState(null, '', `#${s.slug}`); };
    if (!card || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { show(false); return; }
    busy.current = true;
    const from = faceBox(card), to = sheetBox(), g = makeGhost(s, card, from, from);
    setAway(i);
    const o: KeyframeAnimationOptions = { duration: OPEN_MS, easing: OPEN_EASE, fill: 'forwards' };
    const run = g.root.animate([boxFrame(from), boxFrame(to)], o);
    g.root.animate([{ boxShadow: CARD_SHADOW }, { boxShadow: SHEET_SHADOW }], o);
    g.media.animate([{ height: `${from.h}px` }, { height: `${bannerH()}px` }], o);
    g.imgs.forEach((im) => im.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.04)' }], o));   // the banner sits at 1.04
    g.wide?.animate([{ opacity: 0 }, { opacity: 0, offset: 0.2 }, { opacity: 1, offset: 0.72 }, { opacity: 1 }], { ...o, easing: 'linear' });
    // the card's darkening turns into the banner's shade, and its words go before it has grown much
    g.dark.animate([{ opacity: g.dark.style.opacity || '0' }, { opacity: 0, offset: 0.6 }, { opacity: 0 }], { ...o, easing: 'linear' });
    g.shade.animate([{ opacity: 0 }, { opacity: 1, offset: 0.6 }, { opacity: 1 }], { ...o, easing: 'linear' });
    g.words.animate([{ opacity: 1 }, { opacity: 0, offset: 0.16 }, { opacity: 0 }], { ...o, easing: 'linear' });
    g.back.animate([{ opacity: 0 }, { opacity: 1 }], { duration: OPEN_MS * 0.7, easing: 'ease', fill: 'forwards' });
    requestAnimationFrame(() => panelRef.current?.classList.add('is-away'));
    run.finished.then(() => {
      show(true);
      handOff(g, () => { busy.current = false; });
    }, () => { g.remove(); busy.current = false; });
  }, []);

  const close = useCallback(() => {
    if (busy.current) return;
    const i = openRef.current, panel = panelRef.current;
    const finish = () => {
      setOpen(null); setClosing(false); setFolding(false); setMorphed(false); setAway(null);
      panel?.classList.remove('is-away');
      document.documentElement.classList.remove('cst-story-open');
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    };
    const sc = document.querySelector<HTMLElement>('.cst-sheet-scroll');
    const card = i !== null ? panel?.querySelector<HTMLElement>(`.cst-card[data-card="${i}"]`) : null;
    const r = card?.getBoundingClientRect();
    const inSight = !!r && card!.style.visibility !== 'hidden' && r.bottom > 60 && r.top < window.innerHeight - 60 && r.right > 0 && r.left < window.innerWidth;    // it morphs back only with the banner still in view and the card on the page; otherwise it simply fades
    if (i === null || !panel || !sc || !card || !inSight || sc.scrollTop > bannerH() * 0.6 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setClosing(true);
      window.setTimeout(finish, 320);
      return;
    }
    busy.current = true;
    setAway(i);
    setFolding(true);   // the sheet's words fade first
    window.setTimeout(() => {
      // where the card will be once the section has settled forward again (measured with it there, then put back)
      panel.style.transition = 'none';
      panel.classList.remove('is-away');
      const to = faceBox(card), from = sheetBox(), top = sc.scrollTop;
      panel.classList.add('is-away');
      void panel.offsetWidth;
      panel.style.transition = '';
      const g = makeGhost(STORIES[i], card, from, to);
      g.media.style.height = `${bannerH()}px`;
      g.media.style.top = `${-top}px`;
      g.imgs.forEach((im) => { im.style.transform = 'scale(1.04)'; });
      if (g.wide) g.wide.style.opacity = '1';
      g.shade.style.opacity = '1';
      g.dark.style.opacity = '0';
      g.words.style.opacity = '0';
      g.back.style.opacity = '1';
      g.root.style.boxShadow = SHEET_SHADOW;
      // the ghost now covers the sheet exactly: take the sheet away and let the section come forward
      setOpen(null); setFolding(false); setMorphed(false);
      document.documentElement.classList.remove('cst-story-open');
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      panel.classList.remove('is-away');
      const o: KeyframeAnimationOptions = { duration: CLOSE_MS, easing: CLOSE_EASE, fill: 'forwards' };
      const run = g.root.animate([boxFrame(from), boxFrame(to)], o);
      g.root.animate([{ boxShadow: SHEET_SHADOW }, { boxShadow: CARD_SHADOW }], o);
      g.media.animate([{ height: `${bannerH()}px`, top: `${-top}px` }, { height: `${to.h}px`, top: '0px' }], o);
      g.imgs.forEach((im) => im.animate([{ transform: 'scale(1.04)' }, { transform: 'scale(1)' }], o));
      g.wide?.animate([{ opacity: 1 }, { opacity: 1, offset: 0.25 }, { opacity: 0, offset: 0.75 }, { opacity: 0 }], { ...o, easing: 'linear' });
      g.shade.animate([{ opacity: 1 }, { opacity: 0, offset: 0.7 }, { opacity: 0 }], { ...o, easing: 'linear' });
      g.words.animate([{ opacity: 0 }, { opacity: 0, offset: 0.6 }, { opacity: 1 }], { ...o, easing: 'linear' });
      g.back.animate([{ opacity: 1 }, { opacity: 0 }], { duration: CLOSE_MS * 0.8, easing: 'ease', fill: 'forwards' });
      run.finished.then(() => {
        setAway(null);   // the card is back, exactly under the ghost
        requestAnimationFrame(() => requestAnimationFrame(() => { g.remove(); busy.current = false; }));
      }, () => { g.remove(); setAway(null); busy.current = false; });
    }, 180);
  }, []);

  return (
    <>
      {/* the stories (the page zooms in here from the bento's last card) */}
      <section className="cst-stories" id="stories" ref={storiesRef} aria-labelledby="cst-h">
        {/* .is-away (set directly, so a morph can measure around it) while a story is out: the section settles back */}
        <div className="cst-panel" ref={panelRef}>
          <div className="cst-head" ref={headRef}>
            <h2 id="cst-h">Stories of<br />cafés.</h2>
            <p ref={lineRef}>We’ve already helped <b>{count >= COUNT_TO ? `${COUNT_TO}+` : count}</b> cafés stop chasing suppliers, run out less, and keep their books straight.</p>
          </div>
          <div className="cst-cards">
            {STORIES.map((s, i) => <StoryCard key={s.slug} s={s} i={i} away={away === i} onOpen={openStory} />)}
          </div>
        </div>
      </section>

      {mounted && open !== null && createPortal(
        <StorySheet s={STORIES[open]} closing={closing} morphed={morphed} folding={folding} onClose={close} />,
        document.querySelector('.cafe-portal-root') ?? document.body,
      )}
    </>
  );
}
