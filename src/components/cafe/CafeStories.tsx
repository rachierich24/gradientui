'use client';
// Section 04 — "Stories of cafés", after umanodesign.studio's "Stories of our clients" (layout, timings and curves
// read from that site's source and recorded frame by frame), on a warm white. The page arrives here by zooming into
// the little mark on the bento's last card (CafeBento.tsx), as umano arrives by zooming into its logo card; that
// mark fades while these stories rise.
//
//  1. The stories (280vh, a pinned 100vh panel). "Stories of cafés." in the middle, fading to half as you scroll,
//     and a line whose number counts up (1.2 s) when it comes into view. Four tilted cards (280 × 370) fly in from
//     alternate sides at 0, 22, 44 and 66% of the scroll (umano spaces its three by 30%), each over 18% of it (cubic
//     ease-out), rising from below the panel and untilting from 25°. At rest a card is the café's storefront, its name
//     and place, and its button; hovering it straightens and lifts it (spring), darkens it to show the headline, and
//     pops three chips out to its right. Clicking zooms the panel 12× into it (0.7 s) and opens the story.
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
// where each card lands (% of the panel), its tilt, the side it comes in from, and when it starts: umano's pattern, spread over four
const LAYOUT = [
  { x: 10, y: 16, rot: -12, from: -1, at: 0 },
  { x: 62, y: 12, rot: 9, from: 1, at: 0.22 },
  { x: 26, y: 46, rot: 5, from: -1, at: 0.44 },
  { x: 52, y: 42, rot: -7, from: 1, at: 0.66 },
];
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

function StoryCard({ s, i, onOpen }: { s: Story; i: number; onOpen: (i: number, el: HTMLElement) => void }) {
  const [hover, setHover] = useState(false);
  const L = LAYOUT[i];
  return (
    <div className={`cst-card${hover ? ' is-hover' : ''}`} data-card={i} style={{ '--x': L.x, '--y': L.y, zIndex: 10 + i } as CSSProperties}>
      <button type="button" className="cst-card-tilt" aria-label={`Read ${s.name}’s story: ${s.title}`}
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onFocus={() => setHover(true)} onBlur={() => setHover(false)}
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

// umano's use-case sheet
function StorySheet({ s, closing, onClose }: { s: Story; closing: boolean; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const toc = [...s.sections.map((x) => x.h), 'The result'];
  useEffect(() => {
    const lenis = (window as unknown as { lenis?: { stop: () => void; start: () => void } }).lenis;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    lenis?.stop();
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; lenis?.start(); removeEventListener('keydown', onKey); };
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
    <div className={`cst-sheet-wrap${closing ? ' is-closing' : ''}`} onClick={onClose}>
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
  const [closing, setClosing] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'zooming' | 'done'>('idle');   // the panel's zoom into a card
  const [origin, setOrigin] = useState('50% 50%');
  const [mounted, setMounted] = useState(false);

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
      cards.forEach((el, i) => {
        const L = LAYOUT[i], l = clamp((sP - L.at) / 0.18), u = easeOut3(l);
        const rot = 25 + (L.rot - 25) * u;
        el.style.transform = `translate3d(${((1 - u) * 0.15 * pw * L.from).toFixed(1)}px, ${((1 - u) * (1.2 - L.y / 100) * ph).toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg)`;
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

  // umano: the panel zooms 12× into the card, then the story opens over it
  const openStory = useCallback((i: number, el: HTMLElement) => {
    const panel = panelRef.current;
    document.documentElement.classList.add('cst-story-open');
    const show = () => { setOpen(i); window.history.replaceState(null, '', `#${STORIES[i].slug}`); };
    if (!panel || window.matchMedia('(max-width: 768px), (prefers-reduced-motion: reduce)').matches) { show(); return; }
    const a = el.getBoundingClientRect(), b = panel.getBoundingClientRect();
    setOrigin(`${(a.left + a.width / 2 - b.left).toFixed(1)}px ${(a.top + a.height / 2 - b.top).toFixed(1)}px`);
    requestAnimationFrame(() => setPhase('zooming'));
    window.setTimeout(() => { show(); setPhase('done'); }, 500);
  }, []);
  const close = useCallback(() => {
    setClosing(true);
    window.setTimeout(() => {
      setOpen(null); setClosing(false); setPhase('idle');
      document.documentElement.classList.remove('cst-story-open');
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }, 320);
  }, []);

  return (
    <>
      {/* the stories (the page zooms in here from the bento's last card) */}
      <section className="cst-stories" id="stories" ref={storiesRef} aria-labelledby="cst-h">
        <div className={`cst-panel is-${phase}`} ref={panelRef} style={phase !== 'idle' ? { transformOrigin: origin } : undefined}>
          <div className="cst-head" ref={headRef}>
            <h2 id="cst-h">Stories of<br />cafés.</h2>
            <p ref={lineRef}>We’ve already helped <b>{count >= COUNT_TO ? `${COUNT_TO}+` : count}</b> cafés stop chasing suppliers, run out less, and keep their books straight.</p>
          </div>
          <div className="cst-cards">
            {STORIES.map((s, i) => <StoryCard key={s.slug} s={s} i={i} onOpen={openStory} />)}
          </div>
        </div>
      </section>

      {mounted && open !== null && createPortal(<StorySheet s={STORIES[open]} closing={closing} onClose={close} />, document.querySelector('.cafe-portal-root') ?? document.body)}
    </>
  );
}
