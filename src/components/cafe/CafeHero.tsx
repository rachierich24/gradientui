'use client';
// Café portal hero — the same choreography as umanodesign.studio's hero, with its timings and curves read from
// that site's source (IntroAnimation + hero section), on white:
//
//   0 ms     soft grey (#e7e8e6). The phone waits invisible, zoomed 2.5× onto its notification card.
//   400 ms  the card fades up 8 px (0.45 s).
//   1800 ms  the grey turns white (1.3 s ease). The phone zooms back out to 1× around that card (1.3 s,
//            cubic-bezier(.25,.46,.45,.94)) while the hand fades in (0.9 s, after 0.25 s) and the status bar
//            (0.7 s, after 0.4 s): a pull-back from the notification to a hand holding the phone.
//   3200 ms  the card opens down into the app (0.6 s, cubic-bezier(.34,1.56,.64,1), a little overshoot). The nav
//            drops in (0.5 s). The headline's words rise out of their masks (0.85 s, cubic-bezier(.76,0,.24,1),
//            staggered 0 / 100 / 220 / 320 ms).
//   3800 ms  the subhead fades up 16 px (0.6 s), and its word starts changing every 1.5 s (0.25 s out, swap,
//            0.25 s in; the box eases to the new word's width in 0.35 s).
//   5400 ms  done; the page scrolls again (it's held at the top while the intro plays).
//
// Scrolling then lifts the hero into an inset card (10 px sides, 42 px lower corners, over the first 150 px), and
// the phone falls back: it tilts away (0.018° per px, up to 7°) and lags the page (0.28× the scroll; on phones
// 0.1×, with no tilt).
//
// The hand is a real photograph: "Female Hand Holding Smartphone With Blank Screen" by personalgraphic.official,
// CC0 1.0 (public domain dedication), https://www.flickr.com/photos/198895458@N04/53097224746 — cut out of its
// white backdrop and saved as /public/cafe/hand-phone.webp. Its own blank screen and notch show through; the status
// bar and the card are laid over the screen (.ch-glass), placed and tilted to match it.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const WORDS = ['Oat Milk', 'Coffee Beans', 'Takeaway Cups', 'Croissants', 'Syrups', 'Matcha', 'Napkins', 'Cold Brew'];
const SCREEN_MS = 2600;   // the app inside the card moves on by itself, like a looping recording
// public/ images are cached for a day without revalidating (next.config.ts), so bump ?v= whenever the photo changes;
// v2 is the transparent cut-out (v1, still in some browsers' caches, had the photo's white backdrop).
const HAND_SRC = '/cafe/hand-phone.webp?v=2';

// Runs during HTML parse, before first paint: the hero starts in its intro state (unless the visitor prefers
// reduced motion) with the page held at the top, and a failsafe that releases everything if the bundle never runs.
// (The page is held at the top by CSS while the hero has .is-intro: html:has(#cafe-hero.is-intro).)
const BOOT = `(function(){var h=document.getElementById("cafe-hero");if(!h||matchMedia("(prefers-reduced-motion: reduce)").matches)return;var w=innerWidth;h.style.setProperty("--intro-scale",w<=768?Math.max(1,(w-32)/211):2.5);h.classList.add("is-intro");window.scrollTo(0,0);setTimeout(function(){h.classList.remove("is-intro","p1","p2","p3","p4")},9000)})();`;

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
type LenisLike = { stop?: () => void; start?: () => void };

// the app's tab bar, one tab per screen
const TABS: [string, string][] = [
  ['Shop', 'M4 7h16l-1.5 12.5a1 1 0 0 1-1 .9H6.5a1 1 0 0 1-1-.9L4 7Zm4 0V6a4 4 0 0 1 8 0v1'],
  ['Cart', 'M3 4h2l2.4 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2M10 20h.01M17 20h.01'],
  ['Restock', 'M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7'],
  ['Track', 'M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z'],
];

export function CafeHero() {
  const heroRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [appOn, setAppOn] = useState(false);       // the card has opened: the app starts cycling
  const [wordsOn, setWordsOn] = useState(false);   // the subhead is in: its word starts changing
  const [screen, setScreen] = useState(0);

  // the intro
  useIsoLayoutEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    if (!hero.classList.contains('is-intro')) { setAppOn(true); setWordsOn(true); return; }
    const lenis = () => (window as unknown as { lenis?: LenisLike }).lenis;
    const raf = requestAnimationFrame(() => lenis()?.stop?.());   // Lenis is created after this effect runs
    const at = (ms: number, fn: () => void) => window.setTimeout(fn, ms);
    const timers = [
      at(400, () => hero.classList.add('p1')),
      at(1800, () => hero.classList.add('p2')),
      at(3200, () => { hero.classList.add('p3'); setAppOn(true); }),
      at(3800, () => { hero.classList.add('p4'); setWordsOn(true); }),
      at(5400, () => {
        hero.classList.remove('is-intro', 'p1', 'p2', 'p3', 'p4');
        lenis()?.start?.();
      }),
    ];
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      lenis()?.start?.();
    };
  }, []);

  // the app inside the card loops through its screens
  useEffect(() => {
    if (!appOn) return;
    const id = window.setInterval(() => setScreen((i) => (i + 1) % 4), SCREEN_MS);
    return () => clearInterval(id);
  }, [appOn]);

  // scrolling: the hero becomes an inset card, the phone tilts back and lags the page
  useEffect(() => {
    const hero = heroRef.current, stage = stageRef.current;
    if (!hero || !stage) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY, r = Math.min(1, y / 150), phone = window.innerWidth <= 768;
      hero.style.marginLeft = hero.style.marginRight = `${r * 10}px`;
      hero.style.borderBottomLeftRadius = hero.style.borderBottomRightRadius = `${r * 42}px`;
      stage.style.transformOrigin = phone ? '50% 100%' : '50% 40%';
      stage.style.transform = `perspective(1100px) rotateX(${phone ? 0 : Math.min(7, y * 0.018)}deg) translateY(${phone ? y * 0.1 : y * 0.28}px)`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <section id="cafe-hero" className="cafe-hero" ref={heroRef} aria-label="Gradient café portal" suppressHydrationWarning>
      <script dangerouslySetInnerHTML={{ __html: BOOT }} />

      <div className="ch-copy">
        <h1 className="ch-title">
          <span className="ch-row">{mask('Stop', 0)} {mask('chasing,', 100)}</span>
          <span className="ch-row">{mask('Start', 220)} {mask('brewing.', 320)}</span>
        </h1>
        <p className="ch-sub">
          Order your <RotatingWord on={wordsOn} /> from every supplier, in one tap.
        </p>
      </div>

      <div className="ch-stage" ref={stageRef}>
        <div className="ch-device">
          <img className="ch-hand" src={HAND_SRC} width={1024} height={1024} alt="" fetchPriority="high" decoding="async" />
          <div className="ch-glass">
            <div className="ch-status" aria-hidden="true">
              <span className="ch-time">9:41</span>
              <span className="ch-icons">
                <i className="ch-signal"><b /><b /><b /><b /></i>
                <svg className="ch-wifi" viewBox="0 0 16 12"><path d="M8 11.2 5.6 8.6a3.4 3.4 0 0 1 4.8 0L8 11.2Zm-4.3-4.6L2.3 5.1a8 8 0 0 1 11.4 0l-1.4 1.5a6 6 0 0 0-8.6 0ZM.8 3.6-.6 2.1a12 12 0 0 1 17.2 0l-1.4 1.5a10 10 0 0 0-14.4 0Z" /></svg>
                <i className="ch-battery"><b /></i>
              </span>
            </div>

            {/* the card: a notification first, then it opens down into the app */}
            <div className="ch-card">
              <div className="ch-notif">
                <span className="ch-notif-icon" aria-hidden="true">
                  <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
                    <path d="M 7.68 8.31 A 8.5 8.5 0 0 1 20.32 8.31" />
                    <path d="M 22.08 11.37 A 8.5 8.5 0 0 1 15.77 22.31" />
                    <path d="M 12.23 22.31 A 8.5 8.5 0 0 1 5.92 11.37" />
                    <circle cx="14" cy="14" r="2.6" fill="currentColor" stroke="none" />
                  </svg>
                </span>
                <span className="ch-notif-text">
                  <small>Stop chasing, start brewing</small>
                  <b>Your restock has been delivered</b>
                </span>
              </div>
              <div className="ch-app" aria-hidden="true">
                <ScreenCatalogue on={screen === 0} />
                <ScreenCart on={screen === 1} />
                <ScreenRestock on={screen === 2} />
                <ScreenTrack on={screen === 3} />
                <div className="ca-tabbar">
                  {TABS.map(([label, d], i) => (
                    <span key={label} className={i === screen ? 'on' : ''}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// one headline word inside its mask, rising in after `delay` ms
function mask(word: string, delay: number) {
  return (
    <span className="ch-mask">
      <span className="ch-w" style={{ transitionDelay: `${delay}ms` }}>{word}</span>
    </span>
  );
}

// the subhead's changing word: every 1.5 s it fades out (dropping 6 px), changes, and fades back in, while its box
// eases to the new word's width
function RotatingWord({ on }: { on: boolean }) {
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(true);
  const [width, setWidth] = useState<number | undefined>(undefined);
  const wordRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!on) return;
    let t = 0;
    const id = window.setInterval(() => {
      setShown(false);
      t = window.setTimeout(() => { setI((n) => (n + 1) % WORDS.length); setShown(true); }, 250);
    }, 1500);
    return () => { clearInterval(id); clearTimeout(t); };
  }, [on]);

  useEffect(() => {
    const measure = () => { if (wordRef.current) setWidth(wordRef.current.offsetWidth); };
    measure();
    if (document.fonts?.ready) document.fonts.ready.then(measure).catch(() => {});
  }, [i]);

  return (
    <span className="ch-word" style={width ? { width } : undefined}>
      <strong ref={wordRef} className={shown ? '' : 'is-out'}>{WORDS[i]}</strong>
    </span>
  );
}

/* ─── the café app, four screens ─── */

function ScreenCatalogue({ on }: { on: boolean }) {
  return (
    <div className={`ca-scr ${on ? 'on' : ''}`}>
      <div className="ca-head"><b>Catalogue</b><span className="ca-avatar">BR</span></div>
      <div className="ca-search">Search 2,400 products</div>
      <div className="ca-chips"><span className="on">Dairy</span><span>Coffee</span><span>Bakery</span></div>
      <div className="ca-product">
        <span className="ca-thumb ca-thumb-milk" />
        <span className="ca-pinfo"><b>Oat Milk Barista · 1 L</b><small>3 suppliers · from ₹198</small></span>
      </div>
      <div className="ca-list">
        <div className="ca-row best"><span><b>Freshway Dairy</b><small>Tomorrow, 7:00 AM</small></span><em>₹198</em><i>Add</i></div>
        <div className="ca-row"><span><b>Milk Mantra Pro</b><small>Tomorrow, 9:30 AM</small></span><em>₹205</em><i>Add</i></div>
        <div className="ca-row"><span><b>Daily Farms</b><small>Thursday</small></span><em>₹212</em><i>Add</i></div>
      </div>
      <div className="ca-subhead">Ordered often</div>
      <div className="ca-tiles">
        <span><i className="ca-thumb ca-thumb-bean" /><b>House Blend</b><small>₹1,380 / kg</small></span>
        <span><i className="ca-thumb ca-thumb-cup" /><b>12 oz cups</b><small>₹6.50 each</small></span>
      </div>
    </div>
  );
}

function ScreenCart({ on }: { on: boolean }) {
  return (
    <div className={`ca-scr ${on ? 'on' : ''}`}>
      <div className="ca-head"><b>Your cart</b><span className="ca-pill">3 suppliers</span></div>
      <div className="ca-group"><small>Blue Tokai Roasters</small><div className="ca-line"><span className="ca-thumb ca-thumb-bean" /><b>Coffee beans · 1 kg</b><em>×2</em><strong>₹2,760</strong></div></div>
      <div className="ca-group"><small>Freshway Dairy</small><div className="ca-line"><span className="ca-thumb ca-thumb-milk" /><b>Oat milk · 1 L</b><em>×12</em><strong>₹2,376</strong></div></div>
      <div className="ca-group"><small>PackRight</small><div className="ca-line"><span className="ca-thumb ca-thumb-cup" /><b>12 oz cups</b><em>×500</em><strong>₹3,250</strong></div></div>
      <div className="ca-meta"><span>Delivery</span><b>Tomorrow, 7–8 AM</b></div>
      <div className="ca-meta"><span>Pay with</span><b>UPI · Razorpay</b></div>
      <div className="ca-total"><span>Total, one bill</span><b>₹8,386</b></div>
      <div className="ca-cta">Place one order</div>
    </div>
  );
}

function ScreenRestock({ on }: { on: boolean }) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  return (
    <div className={`ca-scr ${on ? 'on' : ''}`}>
      <div className="ca-head"><b>Restocks</b><span className="ca-pill">This week</span></div>
      <div className="ca-week">{days.map((d, i) => <span key={i} className={i === 0 || i === 3 ? 'on' : ''}>{d}</span>)}</div>
      <div className="ca-sched"><span className="ca-thumb ca-thumb-cup" /><span><b>Takeaway cups · ×500</b><small>Every Monday · PackRight</small></span></div>
      <div className="ca-sched"><span className="ca-thumb ca-thumb-bean" /><span><b>Coffee beans · 2 kg</b><small>Every Thursday · Blue Tokai</small></span></div>
      <div className="ca-sched"><span className="ca-thumb ca-thumb-milk" /><span><b>Oat milk · 12 L</b><small>Mon &amp; Thu · Freshway</small></span></div>
      <div className="ca-alert"><span><b>Lids 8 oz running low</b><small>About 2 days left</small></span><i>Reorder</i></div>
    </div>
  );
}

function ScreenTrack({ on }: { on: boolean }) {
  const steps: [string, string, string][] = [['Confirmed', '6:02 AM', 'done'], ['Packed', '6:40 AM', 'done'], ['Out for delivery', '7:05 AM', 'now'], ['Delivered', 'by 7:30', '']];
  return (
    <div className={`ca-scr ${on ? 'on' : ''}`}>
      <div className="ca-head"><b>Delivery</b><span className="ca-pill live">Live</span></div>
      <div className="ca-eta"><small>Arriving</small><b>7:30 AM</b><span>Baker&apos;s Basket · #4832</span></div>
      <div className="ca-steps">
        {steps.map(([t, time, s]) => <div key={t} className={`ca-step ${s}`}><i /><b>{t}</b><small>{time}</small></div>)}
      </div>
      <div className="ca-items"><span className="ca-thumb ca-thumb-bake" /><span><b>Fresh pastries</b><small>Croissants ×24 · Muffins ×12</small></span></div>
      <div className="ca-driver"><span className="ca-avatar">RK</span><span><b>Rohit K.</b><small>Delivery partner</small></span><i>Call</i></div>
    </div>
  );
}
