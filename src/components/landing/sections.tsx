'use client';
// Landing page sections ported from Figma Make export 0006.js
import { useState, useEffect, useLayoutEffect, useRef, type CSSProperties } from 'react';
import { motion, useScroll, useTransform, useMotionValue, animate, useMotionValueEvent } from 'framer-motion';
import { Icon } from './icons';
import { HeroDashboard, ShowcaseSourcing, ShowcaseInventory, ShowcaseInsights } from './mocks';

// Logos/static assets served from CloudFront (S3) in prod via NEXT_PUBLIC_ASSET_BASE_URL.
// Unset (local dev) -> falls back to /public.
const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_BASE_URL ?? '';

function Avatar({ initials, bg, size = 24 }: { initials: string; bg: string; size?: number }) {
  return (
    <span style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, ${bg}, ${bg}cc)`,
      color: '#fff',
      display: 'inline-grid', placeItems: 'center',
      fontWeight: 700, fontSize: size * 0.4,
      letterSpacing: '-.01em',
      fontFamily: 'var(--font-sans)',
      flexShrink: 0,
      objectFit: 'cover',
    }}>{initials}</span>
  );
}

export function LNav() {
  const [open, setOpen] = useState<'product' | 'resources' | null>(null);
  // Mega-menu open/close intent: a short grace delay keeps the panel open while
  // the pointer crosses the gap between trigger and panel, so it doesn't flicker shut.
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelClose = () => { if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; } };
  const openMenu = (m: 'product' | 'resources') => { cancelClose(); setOpen(m); };
  const scheduleClose = () => { cancelClose(); closeTimer.current = setTimeout(() => setOpen(null), 140); };
  useEffect(() => cancelClose, []);
  // In-page anchors scroll smoothly (via Lenis if present); external links navigate normally.
  const handleNav = (e: { preventDefault: () => void }, href: string) => {
    setOpen(null);
    if (href.startsWith('#')) {
      const el = document.querySelector(href);
      if (el) {
        e.preventDefault();
        const lenis = (window as unknown as { lenis?: { scrollTo: (t: Element, o?: object) => void } }).lenis;
        if (lenis?.scrollTo) lenis.scrollTo(el, { offset: -90 });
        else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };
  const productLinks = [
    { t: 'For cafés', d: 'Source from every supplier in one cart', href: '#for-cafes' },
    { t: 'For suppliers', d: 'Orders, stock, dispatch in one place', href: '#for-suppliers' },
    { t: 'For brands', d: 'Verified café adoption & trials', href: 'https://brand.gradient365.com' },
  ];
  const resourceLinks = [
    { t: 'Contact sales', d: 'Get a plan that fits your operation', href: '#pricing' },
    { t: 'Customers', d: 'Proof from the floor', href: '#proof' },
    { t: 'Security', d: 'Privacy walls by design', href: '#chapters' },
  ];

  return (
    <nav className="nav" onMouseLeave={scheduleClose} onMouseEnter={cancelClose}>
      <a className="nav-brand" href="/">
        <div className="mark">G</div>
        <span>Gradient</span>
      </a>
      <div className="nav-sep"></div>
      <div className="nav-links">
        <button type="button" className={`nav-link ${open === 'product' ? 'is-open' : ''}`} onMouseEnter={() => openMenu('product')} onFocus={() => openMenu('product')} onClick={() => setOpen(open === 'product' ? null : 'product')} aria-expanded={open === 'product'}>
          Product <Icon.ChevronDown size={12} className="chev"/>
        </button>
        <button type="button" className={`nav-link ${open === 'resources' ? 'is-open' : ''}`} onMouseEnter={() => openMenu('resources')} onFocus={() => openMenu('resources')} onClick={() => setOpen(open === 'resources' ? null : 'resources')} aria-expanded={open === 'resources'}>
          Resources <Icon.ChevronDown size={12} className="chev"/>
        </button>
        <a className="nav-link" href="/team">Team</a>
        <a className="nav-link" href="#pricing">Contact sales</a>
      </div>
      <div className="nav-spacer"></div>
      <a className="nav-cta" href="/contact">Start free <span><Icon.Arrow size={12}/></span></a>

      {open && (
        <div className="nav-mega" onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
          <div className="nav-mega-grid">
            {(open === 'product' ? productLinks : resourceLinks).map((item) => {
              const ext = item.href.startsWith('http');
              return (
                <a
                  href={item.href}
                  className="nav-mega-item"
                  key={item.t}
                  onClick={(e) => handleNav(e, item.href)}
                  {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  <span className="nav-mega-ic"><Icon.Arrow size={12}/></span>
                  <span>
                    <strong>{item.t}</strong>
                    <small>{item.d}</small>
                  </span>
                </a>
              );
            })}
          </div>
          <div className="nav-mega-proof">
            <span>Live network</span>
            <strong>1,240 cafes, 340 suppliers, 47 brand trials</strong>
          </div>
        </div>
      )}
    </nav>
  );
}

export function LHero() {
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const [eyeDim, setEyeDim] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = eyebrowRef.current;
    if (!el) return;
    const measure = () => setEyeDim({ w: el.offsetWidth, h: el.offsetHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Fluidly scale the desktop product dashboard to fit narrow screens, instead
  // of letting it bleed off-screen / horizontal-scroll. Renders as a true-to-life
  // miniature of the real product. transform can't read parent width in CSS, so JS.
  const peekRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const peek = peekRef.current;
    const frame = frameRef.current;
    if (!peek || !frame) return;
    const DESIGN_W = 980; // width at which the 2-column dashboard looks right
    const fit = () => {
      const avail = peek.clientWidth;
      if (avail >= DESIGN_W) {
        frame.style.width = '';
        frame.style.transform = '';
        peek.style.height = '';
        return;
      }
      const scale = avail / DESIGN_W;
      frame.style.width = `${DESIGN_W}px`;
      frame.style.transformOrigin = 'top left';
      frame.style.transform = `scale(${scale})`;
      peek.style.height = `${frame.offsetHeight * scale}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(peek);
    return () => ro.disconnect();
  }, []);

  const sw = 1.2;
  const rx = eyeDim.h ? eyeDim.h / 2 : 14;
  return (
    <section className="hero-l" data-snap>
      <div className="l-wrap">
        <div className="eyebrow" ref={eyebrowRef}>
          {eyeDim.w > 0 && (
            <svg
              className="eyebrow-ray"
              width={eyeDim.w}
              height={eyeDim.h}
              viewBox={`0 0 ${eyeDim.w} ${eyeDim.h}`}
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="eyebrowRayGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6E5091" />
                  <stop offset="50%" stopColor="#2F7D80" />
                  <stop offset="100%" stopColor="#BC5A2C" />
                </linearGradient>
              </defs>
              <rect
                className="eyebrow-ray-path"
                x="0"
                y="0"
                width={eyeDim.w}
                height={eyeDim.h}
                rx={rx}
                ry={rx}
                fill="none"
                stroke="url(#eyebrowRayGrad)"
                strokeWidth={sw}
                pathLength={100}
                strokeDasharray="10 90"
              />
            </svg>
          )}
          <span className="tag">New</span>
          <span>Gradient Insights · live across both portals</span>
          <span className="arr">→</span>
        </div>
        <h1 className="hero-h1">
          One portal for the <em>entire</em> café supply chain.
        </h1>
        <p className="hero-sub">
          Gradient connects independent cafés with the suppliers, roasters, and brands they
          buy from and gives both sides one place to source, order, fulfil, invoice, and grow.
        </p>
        <div className="hero-ctas">
          <a className="btn-l dark" href="/contact">Start free <Icon.Arrow size={15}/></a>
          <a className="btn-l ghost" href="/contact">Book a walkthrough</a>
        </div>
        <div className="hero-trust">
          <span className="av-stack">
            <Avatar initials="AK" bg="#F57515"/>
            <Avatar initials="RM" bg="#7B3DFA"/>
            <Avatar initials="PR" bg="#16A34A"/>
            <Avatar initials="SN" bg="#2563EB"/>
          </span>
          <span>Trusted by 1,240 cafés &amp; 340 suppliers</span>
          <span style={{ opacity: .4 }}>·</span>
          <span className="stars">★★★★★</span>
          <span>4.9 on G2</span>
        </div>
      </div>

      <div className="l-wrap hero-peek-wrap">
        <div className="hero-peek" ref={peekRef}>
          <div className="float-chip a">
            <div className="ic" style={{ background: 'var(--c-green-bg)', color: 'var(--c-green)' }}><Icon.Check size={16}/></div>
            <div>
              <div className="t1">PO #2841 confirmed</div>
              <div className="t2">Blue Tokai · ₹38,400 · 12 SKUs</div>
            </div>
          </div>
          <div className="float-chip b">
            <div className="ic" style={{ background: 'var(--c-orange-bg)', color: 'var(--c-orange)' }}><Icon.Sparkle size={16}/></div>
            <div>
              <div className="t1">Oat milk running low</div>
              <div className="t2">Auto-reorder scheduled · 2 cafés</div>
            </div>
          </div>
          <div className="float-chip c">
            <div className="ic" style={{ background: 'var(--c-purple-bg)', color: 'var(--c-purple)' }}><Icon.Truck size={16}/></div>
            <div>
              <div className="t1">3 trucks dispatched</div>
              <div className="t2">ETA 4:20pm · live tracking on</div>
            </div>
          </div>

          <div className="hero-peek-frame" ref={frameRef}>
            <HeroDashboard />
          </div>
          <div className="hero-peek-fade"></div>
        </div>
      </div>
    </section>
  );
}

export function LProofStrip() {
  const proof = [
    { k: 'Order ops', v: '38 open POs', d: 'Cafe demand grouped by supplier before 11am.' },
    { k: 'Trial ROI', v: '47 live kits', d: 'Brands see only their own conversion signals.' },
    { k: 'Fulfilment', v: '94.2% on-time', d: 'Supplier dispatch risk updates every 12 minutes.' },
  ];
  const gridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('is-in'); io.disconnect(); } },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <section className="proof-strip" id="proof">
      <div className="l-wrap proof-grid" ref={gridRef}>
        <div className="proof-kicker" style={{ '--i': 0 } as CSSProperties}>
          <span>Built around the actual trade</span>
          <strong>No direct brand-to-cafe leakage. No spreadsheet reconciliation.</strong>
        </div>
        {proof.map((item, i) => (
          <div className="proof-item" key={item.k} style={{ '--i': i + 1 } as CSSProperties}>
            <span>{item.k}</span>
            <strong>{item.v}</strong>
            <p>{item.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function LogoMark({ nm, img, co, imgClass }: { nm: string; img?: string; co: string; imgClass?: string }) {
  // Real logo images already contain the wordmark, so show the image alone.
  // Brands without an asset yet fall back to the lettermark badge + name.
  // Grayscale by default, colour on hover (CSS on .lg).
  const [err, setErr] = useState(false);
  return (
    <span className="lg">
      {img && !err ? (
        <img className={`lg-img ${imgClass ?? ''}`} src={`${ASSET_BASE}${img}`} alt={nm} loading="lazy" onError={() => setErr(true)} />
      ) : (
        <>
          <span className="mk" style={{ background: co }}>{nm[0]}</span>
          <span className="lg-nm">{nm}</span>
        </>
      )}
    </span>
  );
}

export function LLogos() {
  const logos: { nm: string; img?: string; co: string; imgClass?: string }[] = [
    { nm: 'The Raydee Cafe', img: '/logos/raydee.jpeg', co: 'var(--ink)', imgClass: 'lg-img--round' },
    { nm: 'Blue Tokai', img: '/logos/blue-tokai.png', co: 'var(--ink)' },
    { nm: 'Subko', img: '/logos/subko.png', co: 'var(--c-orange)' },
    { nm: 'Araku', img: '/logos/araku.png', co: 'var(--c-green)' },
    { nm: 'Third Wave', img: '/logos/third-wave.png', co: 'var(--c-purple)' },
    { nm: 'Sleepy Owl', img: '/logos/sleepy-owl.png', co: 'var(--c-blue)' },
    { nm: 'Rage Coffee', img: '/logos/rage-coffee.jpeg', co: 'var(--c-pink)' },
    { nm: 'Country Bean', img: '/logos/country-bean.png', co: 'var(--ink-2)' },
    { nm: "Narasu's", img: '/logos/narasus.png', co: 'var(--c-blue)' },
    { nm: 'Cothas', img: '/logos/cothas.png', co: 'var(--c-pink)' },
  ];
  return (
    <section className="l-sec tight logos">
      <div className="l-wrap">
        <div className="label">Powering supply for the cafés you already love</div>
      </div>
      <div className="logos-row">
        <div className="logos-track">
          {logos.map((l) => (
            <LogoMark key={l.nm} nm={l.nm} img={l.img} co={l.co} imgClass={l.imgClass} />
          ))}
          <span aria-hidden="true" style={{ display: 'contents' }}>
            {logos.map((l) => (
              <LogoMark key={`dup-${l.nm}`} nm={l.nm} img={l.img} co={l.co} imgClass={l.imgClass} />
            ))}
          </span>
        </div>
      </div>
    </section>
  );
}

function DualCafeVisual() {
  return (
    <div style={{ position: 'absolute', inset: 0, padding: '0 0 0 0', display: 'flex', alignItems: 'flex-end', gap: 8, overflow: 'hidden' }}>
      {[
        { nm: 'Blue Tokai · Attikan', q: '5kg', co: 'orange' },
        { nm: 'Araku · Monsoon', q: '10kg', co: 'green' },
        { nm: 'Subko · Ratnagiri', q: '5kg', co: 'purple' },
      ].map((r, i) => (
        <div key={i} className="mini-ui" style={{ flex: 1, minWidth: 0, transform: `translateY(${i * -8}px) rotate(${(i - 1) * 1.5}deg)` }}>
          <div className="mini-row" style={{ background: `var(--c-${r.co}-bg)` }}>
            <div className="ic" style={{ background: `var(--c-${r.co})`, opacity: .3 }}></div>
            <div style={{ minWidth: 0 }}>
              <div className="t1" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.nm}</div>
              <div className="t2">{r.q}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function DualSupVisual() {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div className="mini-ui" style={{ width: '92%', padding: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 12, fontWeight: 700 }}>Today&apos;s queue</div>
          <span className="mini-pill" style={{ background: 'var(--c-green-bg)', color: 'var(--c-green)' }}>12 packed</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
          {[
            { c: 'Third Wave, Indiranagar', v: '₹38,400', st: 'active', stLab: 'Packing' },
            { c: 'Subko, BKC', v: '₹71,920', st: 'info', stLab: 'Dispatch' },
            { c: 'Roastery, HYD', v: '₹14,260', st: 'pending', stLab: 'New' },
          ].map((o, i) => (
            <div key={i} className="mini-row">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="t1" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.c}</div>
                <div className="t2">{o.v}</div>
              </div>
              <span className={`pill ${o.st}`} style={{ fontSize: 10, padding: '1px 7px' }}>{o.stLab}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DualBrandVisual() {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div className="mini-ui" style={{ width: '92%', padding: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 12, fontWeight: 700 }}>Trial · Monsoon Blend</div>
          <span className="mini-pill" style={{ background: 'var(--c-purple-bg)', color: 'var(--c-purple)' }}>34% converted</span>
        </div>
        <div className="mini-bars" style={{ marginTop: 10, height: 56 }}>
          {[42, 68, 30, 84, 55, 72, 48].map((h, i) => (
            <div key={i} className="b" style={{ height: `${h}%`, background: i === 3 ? 'var(--c-purple)' : 'var(--c-purple-bg)' }} />
          ))}
        </div>
        <div className="t2" style={{ marginTop: 6 }}>City penetration · 7 metros</div>
      </div>
    </div>
  );
}

export function LDual() {
  return (
    <section className="l-sec l-sec--pull-up">
      <div className="l-wrap">
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div className="sec-eyebrow sec-eyebrow--plain" style={{ justifyContent: 'center' }}>Built for all three</div>
          <h2 className="sec-h" style={{ margin: '0 auto' }}>Three roles. <em>One</em> portal.</h2>
          <p className="sec-lead" style={{ margin: '18px auto 0' }}>
            Cafés get a sourcing layer they never had. Suppliers get a sales channel that runs
            itself. Brands get a measurable line to verified buyers. Everything moves through Gradient.
          </p>
        </div>

        <div className="dual">
          <div className="dual-card cafe" id="for-cafes">
            <span className="role">For cafés</span>
            <h3>Source from <em>every</em> supplier in one cart.</h3>
            <p>Browse a catalog of 12,000+ SKUs, place orders across multiple suppliers,
              and get one invoice. Auto-replenish keeps your bar stocked.</p>
            <ul>
              <li>Multi-supplier basket · single checkout</li>
              <li>Live inventory across all your outlets</li>
              <li>Auto-replenish with AI demand sensing</li>
              <li>Net-15 credit, fully digital invoicing</li>
            </ul>
            <a className="link" href="/features#cafe">Explore the café portal <Icon.Arrow size={14}/></a>
            <div className="visual"><DualCafeVisual /></div>
          </div>

          <div className="dual-card sup" id="for-suppliers">
            <span className="role">For suppliers</span>
            <h3>A sales channel that <em>runs</em> itself.</h3>
            <p>Publish your catalog once, take orders from cafés across the country,
              dispatch with route-optimised logistics, and get paid in 7 days.</p>
            <ul>
              <li>Storefront on the Gradient marketplace</li>
              <li>Order, pick &amp; pack queues built-in</li>
              <li>WhatsApp orders auto-parsed into POs</li>
              <li>T+7 settlements, GST-ready invoicing</li>
            </ul>
            <a className="link" href="/features#supplier">Explore the supplier portal <Icon.Arrow size={14}/></a>
            <div className="visual"><DualSupVisual /></div>
          </div>

          <div className="dual-card brand">
            <span className="role">For brands</span>
            <h3>Reach verified cafés, <em>measure</em> every rupee.</h3>
            <p>Launch trial campaigns to targeted cafés, watch real conversions, and track
              city-level demand. Every liked trial is a named, located, ready-to-buy lead.</p>
            <ul>
              <li>Targeted trial campaigns by city &amp; type</li>
              <li>Live consumption &amp; conversion funnel</li>
              <li>City-wise demand intelligence</li>
              <li>Competitor-blind privacy walls</li>
            </ul>
            <a className="link" href="/features#brand">Explore the brand portal <Icon.Arrow size={14}/></a>
            <div className="visual"><DualBrandVisual /></div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LShowcase() {
  const [tab, setTab] = useState(0);
  const tabs = [
    { lab: 'Sourcing',  hint: 'One cart across every supplier you trust.',          ic: <Icon.Search size={14}/> },
    { lab: 'Inventory', hint: 'Stock, par, and auto-replenish on one shelf.',       ic: <Icon.Box size={14}/> },
    { lab: 'Insights',  hint: 'GMV trend with a benchmark, not a vibe.',           ic: <Icon.Chart size={14}/> },
  ];

  const outerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ['start start', 'end end'],
  });

  // Outer = 200vh, sticky = 100vh → pinned phase ends at progress 0.5.
  // Split that pinned window into 3 equal tab segments (~0.167 each).
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const next = p < 0.167 ? 0 : p < 0.333 ? 1 : 2;
    setTab((cur) => (cur === next ? cur : next));
  });

  // Scale the desktop-width product mocks to fit narrow stages, instead of
  // cramming/clipping them. Same technique as the hero peek: render at a fixed
  // design width and scale to the available width, collapsing the card height
  // to match. transform can't read parent width in CSS, so JS.
  const stageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const DESIGN_W = 620;
    const fits = Array.from(stage.querySelectorAll<HTMLElement>('.stage-fit'));
    const fit = () => {
      const avail = stage.clientWidth;
      if (avail >= DESIGN_W) {
        stage.style.height = '';
        fits.forEach((f) => { f.style.width = ''; f.style.height = ''; f.style.transform = ''; });
        return;
      }
      const scale = avail / DESIGN_W;
      // Measure each pane's natural height at the design width, fit the card to the tallest.
      let maxH = 0;
      fits.forEach((f) => {
        f.style.width = `${DESIGN_W}px`;
        f.style.height = 'auto';
        f.style.transform = 'none';
        maxH = Math.max(maxH, f.scrollHeight);
      });
      maxH += 24; // headroom: flex children settle a touch taller than scrollHeight reports
      fits.forEach((f) => { f.style.height = `${maxH}px`; f.style.transform = `scale(${scale})`; });
      stage.style.height = `${maxH * scale}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  const scrollToTab = (i: number) => {
    const el = outerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const top = window.scrollY + rect.top;
    // Anchor each tab at the middle of its 0.167-progress slice.
    const targetProgress = 0.083 + i * 0.167;
    const totalScroll = rect.height - window.innerHeight;
    window.scrollTo({ top: top + targetProgress * totalScroll, behavior: 'smooth' });
  };

  return (
    <section ref={outerRef} className="l-sec-pin" id="product">
      <div className="showcase-sticky">
        <div className="l-wrap">
          <div className="showcase">
            <div className="showcase-grid">
              <div className="showcase-text">
                <div className="sec-eyebrow">The product</div>
                <h2 className="sec-h">Made for the way coffee actually <em>moves</em>.</h2>
                <p className="sec-lead">From the first PO to the last invoice every workflow lives in one place, tuned for the rhythm of cafés and the dispatch rhythm of suppliers.</p>

                <ol className="tab-col" role="tablist" aria-label="Product workflows">
                  {tabs.map((t, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={tab === i}
                        className={`tab-pill ${tab === i ? 'on' : ''}`}
                        onClick={() => scrollToTab(i)}
                      >
                        <span className="tab-pill-ic">{t.ic}</span>
                        <span className="tab-pill-body">
                          <span className="tab-pill-lab">{t.lab}</span>
                          <span className="tab-pill-hint">{t.hint}</span>
                        </span>
                        <span className="tab-pill-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                      </button>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="showcase-preview">
                <div className="showcase-stage" ref={stageRef}>
                  <div className={`stage-pane ${tab === 0 ? 'on' : ''}`}><div className="stage-fit"><ShowcaseSourcing/></div></div>
                  <div className={`stage-pane ${tab === 1 ? 'on' : ''}`}><div className="stage-fit"><ShowcaseInventory/></div></div>
                  <div className={`stage-pane ${tab === 2 ? 'on' : ''}`}><div className="stage-fit"><ShowcaseInsights/></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BentoMultiCart() {
  const cards = [
    { nm: 'Blue Tokai · Attikan', q: '5 kg', pr: '₹4,100', co: 'orange' },
    { nm: 'Araku · Monsoon Malabar', q: '10 kg', pr: '₹7,400', co: 'green' },
    { nm: 'Subko · Ratnagiri PB', q: '5 kg', pr: '₹4,800', co: 'purple' },
    { nm: 'Third Wave · Kelagur', q: '15 kg', pr: '₹10,200', co: 'blue' },
  ];
  return (
    <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 8 }}>
      {cards.map((c, i) => (
        <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 11, padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: `var(--c-${c.co}-bg)`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <div style={{ width: 12, height: 12, borderRadius: 99, background: `var(--c-${c.co})`, opacity: .5 }}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.nm}</div>
            <div style={{ fontSize: 10.5, color: 'var(--ink-soft)', marginTop: 1 }}>{c.q}</div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{c.pr}</div>
        </div>
      ))}
      <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--ink)', color: '#fff', borderRadius: 11 }}>
        <div style={{ fontSize: 11, fontWeight: 600, opacity: .7 }}>Total · 4 suppliers · 1 invoice</div>
        <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-.02em', fontVariantNumeric: 'tabular-nums' }}>₹26,500</div>
      </div>
    </div>
  );
}

function BentoAutoReplenish() {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[
        { nm: 'Oat milk', cur: 12, par: 20, st: 'low' },
        { nm: 'Whole milk', cur: 24, par: 40, st: 'low' },
        { nm: 'Espresso beans', cur: 34, par: 30, st: 'ok' },
      ].map((r, i) => (
        <div key={i} style={{ background: 'rgba(255,255,255,.7)', borderRadius: 10, padding: '8px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, fontWeight: 600 }}>
            <span>{r.nm}</span>
            <span style={{ fontVariantNumeric: 'tabular-nums', color: r.st === 'low' ? 'var(--c-orange)' : 'var(--c-green)' }}>
              {r.cur} / {r.par}
            </span>
          </div>
          <div style={{ height: 5, background: 'rgba(0,0,0,.06)', borderRadius: 99, marginTop: 6, overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, (r.cur / r.par) * 100)}%`, height: '100%', background: r.st === 'low' ? 'var(--c-orange)' : 'var(--c-green)', borderRadius: 99 }} />
          </div>
        </div>
      ))}
      <div style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: 6, fontSize: 11.5, padding: '4px 10px', background: 'var(--ink)', color: '#fff', borderRadius: 99, fontWeight: 600 }}>
        <Icon.Sparkle size={11}/> Reorder scheduled · 2pm
      </div>
    </div>
  );
}

function BentoWhatsapp() {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
      <div style={{ maxWidth: '92%', background: 'var(--c-green-bg)', color: 'var(--ink)', padding: '8px 12px', borderRadius: '12px 12px 12px 4px', fontSize: 12, lineHeight: 1.4 }}>
        Bhaiya 5kg attikan beans + 10kg monsoon malabar bhej do kal subah tak
      </div>
      <div style={{ alignSelf: 'flex-end', fontSize: 11, color: 'var(--ink-soft)', fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>parsed in 1.2s</div>
      <div style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 10, padding: 10, fontSize: 11 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, marginBottom: 4 }}>
          <span>PO #2841 · DRAFT</span>
          <span style={{ color: 'var(--c-green)' }}>● ready</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ink-soft)' }}>
          <span>Attikan beans</span><span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--ink)' }}>5kg</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ink-soft)' }}>
          <span>Monsoon Malabar</span><span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--ink)' }}>10kg</span>
        </div>
      </div>
    </div>
  );
}

function BentoSettlement() {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-.03em' }}>₹14.2L</span>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>settling Fri</span>
      </div>
      <div style={{ height: 8, borderRadius: 99, background: 'rgba(255,255,255,.1)', overflow: 'hidden' }}>
        <div style={{ width: '72%', height: '100%', background: 'linear-gradient(90deg, var(--c-orange), var(--c-yellow))', borderRadius: 99 }}/>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,.6)' }}>
        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span style={{ color: '#fff', fontWeight: 700 }}>Fri →</span>
      </div>
    </div>
  );
}

function BentoCatalog() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, width: '100%' }}>
      {[
        { c: 'orange' }, { c: 'green' }, { c: 'purple' },
        { c: 'blue' }, { c: 'pink' }, { c: 'cyan' },
      ].map((p, i) => (
        <div key={i} style={{ aspectRatio: '1', background: `var(--c-${p.c}-bg)`, borderRadius: 10, display: 'grid', placeItems: 'center', border: '1px solid var(--border-soft)' }}>
          <div style={{ width: '40%', height: '40%', borderRadius: '50%', background: `var(--c-${p.c})`, opacity: .35 }}/>
        </div>
      ))}
    </div>
  );
}

function BentoInsights() {
  const vals = [40, 55, 38, 70, 60, 80, 95, 72, 88, 110];
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--ink-soft)', fontWeight: 600 }}>GMV (12w)</div>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.025em' }}>₹84.2L</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--ink-soft)', fontWeight: 600 }}>Repeat</div>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.025em' }}>72<span style={{ fontSize: 16, color: 'var(--ink-soft)' }}>%</span></div>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: 'var(--c-green)', alignSelf: 'flex-end', padding: '3px 8px', background: 'var(--c-green-bg)', borderRadius: 99 }}>↑ 18.4%</div>
      </div>
      <div className="mini-bars">
        {vals.map((v, i) => (
          <div key={i} className="b" style={{ height: `${v}%`, background: i >= vals.length - 3 ? 'var(--ink)' : 'var(--border)' }} />
        ))}
      </div>
    </div>
  );
}

function BentoLogistics() {
  return (
    <div style={{ width: '100%', position: 'relative', height: '100%', minHeight: 140 }}>
      <svg viewBox="0 0 400 140" style={{ width: '100%', height: '100%' }}>
        <defs>
          <pattern id="dots-l" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="rgba(10,10,11,.12)"/>
          </pattern>
        </defs>
        <rect width="400" height="140" fill="url(#dots-l)" rx="12"/>
        <path d="M 30 100 Q 110 30, 200 70 T 370 40" fill="none" stroke="var(--ink)" strokeWidth="2" strokeDasharray="4 6" strokeLinecap="round"/>
        {[
          { x: 30, y: 100, l: 'Whitefield' },
          { x: 130, y: 55, l: 'Indiranagar' },
          { x: 240, y: 78, l: 'Koramangala' },
          { x: 370, y: 40, l: 'Jayanagar' },
        ].map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="14" fill="var(--surface)" stroke="var(--ink)" strokeWidth="1.5"/>
            <circle cx={p.x} cy={p.y} r="5" fill="var(--ink)"/>
            <text x={p.x} y={p.y + 32} textAnchor="middle" fontSize="10" fill="var(--ink-soft)" fontFamily="var(--font-sans)">{p.l}</text>
          </g>
        ))}
        <g transform="translate(200 70)">
          <circle r="22" fill="var(--c-orange)" opacity="0.18">
            <animate attributeName="r" from="14" to="28" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" from=".25" to="0" dur="2s" repeatCount="indefinite"/>
          </circle>
        </g>
      </svg>
    </div>
  );
}

const CHAPTERS = [
  {
    key: 'cafe',
    role: 'For cafés',
    values: 'Nourish · Support · Reliability',
    title: 'Order by ingredient. Gradient routes by supplier.',
    body: 'Every basket splits across distributors. One checkout, negotiated prices kept private, one monthly invoice.',
    meta: ['Multi-supplier checkout', 'Prices stay private', 'Net-15 credit'],
    visual: <BentoMultiCart />,
  },
  {
    key: 'supplier',
    role: 'For suppliers',
    values: 'Flow · Efficiency · Control',
    title: 'The work queue, not a pile of messages.',
    body: 'Orders, stock risk, dispatch and settlements converge into one control surface you can actually run.',
    meta: ['Auto-replenish', 'WhatsApp parsing', 'T+7 settlements'],
    visual: <BentoAutoReplenish />,
  },
  {
    key: 'brand',
    role: 'For brands',
    values: 'Reach · Intelligence · Growth',
    title: 'Verified adoption, not impressions.',
    body: 'Trial kits move through your suppliers to named, ready-to-buy cafés. Your funnel, your city demand, never a competitor’s.',
    meta: ['Own-product analytics', 'City demand', 'No competitor data'],
    visual: <BentoInsights />,
  },
];

export function LBento() {
  return (
    <section className="l-sec chapters" id="chapters" data-snap>
      <div className="l-wrap">
        <div className="chapters-head">
          <div>
            <div className="sec-eyebrow sec-eyebrow--plain">Product chapters</div>
            <h2 className="sec-h">A supply network, explained through the product.</h2>
          </div>
          <p className="sec-lead">Cafés source, suppliers fulfil, brands measure. Each side gets the interface it needs, and privacy walls hold the network together.</p>
        </div>

        <div className="chapter-stack">
          {CHAPTERS.map((c) => (
            <article className="chapter-card" data-role={c.key} key={c.key}>
              <div className="chapter-copy">
                <div className="chapter-label">
                  <span className="chapter-role">{c.role}</span>
                  <span className="chapter-values">{c.values}</span>
                </div>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
                <div className="chapter-meta">
                  {c.meta.map((m) => <span key={m}>{m}</span>)}
                </div>
              </div>
              <div className="chapter-visual">{c.visual}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LInlineCTA() {
  return (
    <section className="inline-cta">
      <div className="l-wrap inline-cta-grid">
        <div>
          <span>From pilot to operating layer</span>
          <h2>Start with one city, one supplier network, and one category that hurts every morning.</h2>
        </div>
        <div className="inline-cta-actions">
          <a className="btn-l dark" href="/contact">Book a founder walkthrough <span><Icon.Arrow size={13}/></span></a>
          <a className="inline-link" href="#pricing">Contact sales</a>
        </div>
      </div>
    </section>
  );
}

export function LSteps() {
  const steps = [
    { t: 'Onboard', d: 'Sign up as a café or supplier. Verification in under an hour. KYC, GST, FSSAI all digital.' },
    { t: 'Connect', d: 'Pair your POS (Petpooja, urbanPiper), accounting (Tally, Zoho), and WhatsApp. Zero re-keying.' },
    { t: 'Operate', d: 'Sourcing, fulfilment, inventory, and dispatch all from one portal, on every device.' },
    { t: 'Grow', d: 'Insights tell you what to stock, when to reorder, and which café or SKU to double down on.' },
  ];
  return (
    <section className="l-sec tight">
      <div className="l-wrap">
        <div className="sec-head-row">
          <div>
            <div className="sec-eyebrow sec-eyebrow--plain">How it works</div>
            <h2 className="sec-h">Live in a <em>week</em>. Not a quarter.</h2>
          </div>
          <p className="sec-lead">No implementation team. No annual contract. Connect what you already use and Gradient takes it from there.</p>
        </div>
        <div className="steps">
          {steps.map((s, i) => (
            <div className="step" key={i}>
              <h5>{s.t}</h5>
              <p>{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function IntegLogo({ nm, img, box, co }: { nm: string; img?: string; box?: string; co: string }) {
  const [err, setErr] = useState(false);
  if (!img || err) return <div className="logo" style={{ background: co }}>{nm[0]}</div>;
  return (
    <div className={`logo logo-img logo-${box}`}>
      <img src={`${ASSET_BASE}${img}`} alt={nm} loading="lazy" onError={() => setErr(true)} />
    </div>
  );
}

export function LInteg() {
  // box: 'cover' = square app-icon fills the tile; 'pad' = transparent mark on light;
  // 'dark' = light/white mark on a dark tile so it stays visible.
  const integ = [
    { nm: 'Petpooja', ct: 'POS', img: '/logos/integrations/petpooja.jpeg', box: 'cover', co: 'var(--c-orange)' },
    { nm: 'urbanPiper', ct: 'POS', img: '/logos/integrations/urbanpiper.jpeg', box: 'cover', co: 'var(--c-blue)' },
    { nm: 'Tally', ct: 'Accounting', img: '/logos/integrations/tally.jpeg', box: 'cover', co: 'var(--c-green)' },
    { nm: 'Zoho Books', ct: 'Accounting', img: '/logos/integrations/zoho-books.jpeg', box: 'cover', co: 'var(--c-purple)' },
    { nm: 'WhatsApp', ct: 'Messaging', img: '/logos/integrations/whatsapp.svg', box: 'pad', co: '#25D366' },
    { nm: 'Shopify', ct: 'Storefront', img: '/logos/integrations/shopify.svg', box: 'pad', co: '#7AB55C' },
    { nm: 'Razorpay', ct: 'Payments', img: '/logos/integrations/razorpay.jpeg', box: 'cover', co: 'var(--c-blue)' },
    { nm: 'GST Portal', ct: 'Compliance', img: '/logos/integrations/gst.svg', box: 'dark', co: 'var(--ink)' },
    { nm: 'Slack', ct: 'Comms', img: '/logos/integrations/slack.svg', box: 'pad', co: '#611f69' },
    { nm: 'Google Sheets', ct: 'Reports', img: '/logos/integrations/google-sheets.png', box: 'pad', co: '#0F9D58' },
    { nm: 'Stripe', ct: 'Payments', img: '/logos/integrations/stripe.jpeg', box: 'cover', co: '#635BFF' },
    { nm: 'FSSAI', ct: 'Compliance', img: '/logos/integrations/fssai.jpeg', box: 'cover', co: 'var(--c-cyan)' },
  ];
  const gridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('is-in'); io.disconnect(); } },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <section className="l-sec l-sec--pull-up">
      <div className="l-wrap">
        <div className="sec-head-row">
          <div>
            <div className="sec-eyebrow sec-eyebrow--plain">Integrations</div>
            <h2 className="sec-h">Plays nicely with the stack you <em>already</em> run.</h2>
          </div>
          <p className="sec-lead">Two-way sync with the tools cafés and suppliers actually use. Set it once, forget it forever.</p>
        </div>
        <div className="integ" ref={gridRef}>
          {integ.map((g, i) => (
            <div className="ig" key={i} style={{ '--i': i } as CSSProperties}>
              <IntegLogo nm={g.nm} img={g.img} box={g.box} co={g.co} />
              <div>
                <div className="nm">{g.nm}</div>
                <div className="ct">{g.ct}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CountUp({ to, inView, prefix = '', format = false }: { to: number; inView: boolean; prefix?: string; format?: boolean }) {
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState('0');
  useEffect(() => {
    if (!inView) return;
    const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const render = (n: number) => setDisplay(format ? n.toLocaleString('en-IN') : String(n));
    if (reduced) { render(to); return; }
    const controls = animate(mv, to, { duration: 1.7, ease: [0.22, 0.61, 0.36, 1] });
    const unsub = mv.on('change', (v) => render(Math.round(v)));
    return () => { controls.stop(); unsub(); };
  }, [inView, to, format, mv]);
  return <>{prefix}{display}</>;
}

export function LStats() {
  const items = [
    { pre: '', num: 1240, fmt: true, sub: '', l: 'cafés actively running on Gradient' },
    { pre: '', num: 340, fmt: false, sub: '+', l: 'suppliers, roasters &amp; brands' },
    { pre: '₹', num: 84, fmt: false, sub: 'Cr', l: 'monthly GMV moving through the platform' },
    { pre: '', num: 94, fmt: false, sub: '%', l: 'on-time fulfilment, week over week' },
  ];
  // Layout scaffold kept identical to the prior scroll-pin version (outer 100vh + sticky inner 100vh).
  // Animation is now time-driven on first viewport entry. Body scroll is locked while it plays,
  // then released so the user can scroll past normally.
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const hasPlayedRef = useRef(false);
  const pathLength = useMotionValue(0);
  const areaOpacity = useMotionValue(0);
  const gridOpacity = useMotionValue(0);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || hasPlayedRef.current) return;
    hasPlayedRef.current = true;

    const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      pathLength.set(1); areaOpacity.set(1); gridOpacity.set(1);
      return;
    }

    // Freeze scroll while the graph plays (count-up + curve draw reaching top-right),
    // then release. Lenis runs a virtual scroll loop, so body{overflow:hidden} alone
    // does NOT stop it — must call lenis.stop()/start(). Keep the native blockers as a
    // fallback for when Lenis isn't present.
    // No cleanup return: React 18 strict-mode double-invoke would release immediately;
    // the timeout below auto-releases.
    const lenis = (window as unknown as { lenis?: { stop: () => void; start: () => void } }).lenis;
    lenis?.stop();
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    const prevent = (e: Event) => { e.preventDefault(); };
    const blockKeys = (e: KeyboardEvent) => {
      const keys = ['PageDown', 'PageUp', 'ArrowDown', 'ArrowUp', ' ', 'Home', 'End'];
      if (keys.includes(e.key)) e.preventDefault();
    };
    window.addEventListener('wheel', prevent, { passive: false });
    window.addEventListener('touchmove', prevent, { passive: false });
    window.addEventListener('keydown', blockKeys);

    animate(pathLength, 1, { duration: 1.8, ease: [0.22, 0.61, 0.36, 1] });
    animate(areaOpacity, 1, { duration: 0.9, delay: 1.4, ease: 'easeOut' });
    animate(gridOpacity, 1, { duration: 0.7, delay: 1.6, ease: 'easeOut' });

    const LOCK_MS = 2400;
    window.setTimeout(() => {
      lenis?.start();
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
      window.removeEventListener('wheel', prevent);
      window.removeEventListener('touchmove', prevent);
      window.removeEventListener('keydown', blockKeys);
    }, LOCK_MS);
  }, [inView, pathLength, areaOpacity, gridOpacity]);
  return (
    <div ref={outerRef} className="stats-pin-outer">
      <section
        ref={innerRef}
        className={`l-sec stats-sec stats-pin-inner ${inView ? 'is-in' : ''}`}
      >
        <div className="stats-frame" aria-hidden="true">
        <svg
          className="stats-curve"
          viewBox="0 0 1200 600"
          preserveAspectRatio="none"
          overflow="visible"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="statsAreaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(220 25% 70%)" stopOpacity="0" />
              <stop offset="100%" stopColor="hsl(220 22% 55%)" stopOpacity="0.14" />
            </linearGradient>
            <clipPath id="statsUnderCurve" clipPathUnits="userSpaceOnUse">
              <path d="M 0 510 C 470 500, 900 300, 1200 0 L 1200 600 L 0 600 Z" />
            </clipPath>
          </defs>

          <motion.path
            className="stats-area-scroll"
            d="M 0 510 C 470 500, 900 300, 1200 0 L 1200 600 L 0 600 Z"
            fill="url(#statsAreaFill)"
            stroke="none"
            style={{ opacity: areaOpacity }}
          />

          <motion.g className="stats-grid-lines-scroll" clipPath="url(#statsUnderCurve)" style={{ opacity: gridOpacity }}>
            {Array.from({ length: 16 }).map((_, i) => {
              const x = ((i + 1) * 1200) / 17;
              return (
                <line
                  key={i}
                  x1={x} y1={0} x2={x} y2={600}
                  stroke="rgba(10,10,11,0.12)"
                  strokeWidth="1"
                  strokeDasharray="3 5"
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </motion.g>

          <motion.path
            className="curve-line-scroll"
            d="M 0 510 C 470 500, 900 300, 1200 0"
            fill="none"
            stroke="#3B82F6"
            strokeWidth="1.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            style={{ pathLength }}
          />
        </svg>
        </div>
        <div className="l-wrap stats-wrap">
          <h2 className="stats-intro">
            <span className="lead">Built for the pace of cafe supply.</span>{' '}
            <span className="rest">
              Gradient connects every café, supplier, and brand on one live network
              daily procurement, real-time stock, and trial conversion you can actually trace.
            </span>
          </h2>
          <div className="stats-grid">
            {items.map((it, i) => (
              <div className="it" key={i} style={{ '--d': `${i * 110}ms` } as React.CSSProperties}>
                <div className="v">
                  <span className="v-inner">
                    <CountUp to={it.num} inView={inView} prefix={it.pre} format={it.fmt} />{it.sub && <sub>{it.sub}</sub>}
                  </span>
                </div>
                <div className="l" dangerouslySetInnerHTML={{ __html: it.l }} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export function LQuotes() {
  return (
    <section className="l-sec l-sec--pull-up">
      <div className="l-wrap">
        <div className="sec-head-row">
          <div>
            <div className="sec-eyebrow sec-eyebrow--plain">Word on the floor</div>
            <h2 className="sec-h">Loved by both <em>sides</em> of the counter.</h2>
          </div>
        </div>

        <div className="quotes">
          <div className="quote feat">
            <p className="mark">&quot;</p>
            <p className="q">
              We replaced six WhatsApp groups, two Excel sheets and a printed PO book with Gradient.
              On day three our supplier called to ask what changed orders had doubled.
            </p>
            <div className="who">
              <Avatar initials="AK" bg="#F57515" size={40}/>
              <div>
                <div className="nm">Ananya Kapoor</div>
                <div className="ro">Founder, Third Wave Coffee Roasters</div>
              </div>
            </div>
          </div>

          <div className="quote">
            <p className="mark">&quot;</p>
            <p className="q">
              The auto-replenish is uncanny. We haven&apos;t 86&apos;d oat milk in four months.
            </p>
            <div className="who">
              <Avatar initials="RM" bg="#7B3DFA" size={40}/>
              <div>
                <div className="nm">Rohan Mehta</div>
                <div className="ro">Operations, Subko · 14 outlets</div>
              </div>
            </div>
          </div>

          <div className="quote">
            <p className="mark">&quot;</p>
            <p className="q">
              T+7 settlements changed how we run the roastery. Cash flow is finally a plan, not a prayer.
            </p>
            <div className="who">
              <Avatar initials="PR" bg="#16A34A" size={40}/>
              <div>
                <div className="nm">Priya Rangan</div>
                <div className="ro">Head Roaster, Araku Coffee</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LPricing() {
  return (
    <section className="l-sec l-sec--pull-up" id="pricing" data-snap>
      <div className="l-wrap">
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
          <div className="sec-eyebrow sec-eyebrow--plain" style={{ justifyContent: 'center' }}>Pricing</div>
          <h2 className="sec-h" style={{ margin: '0 auto' }}>Pricing built around the way you <em>actually</em> trade.</h2>
          <p className="sec-lead" style={{ margin: '18px auto 32px' }}>
            Every café and supply chain runs differently. Tell us your order volume and outlets, and our team will put together a plan that fits.
          </p>
          <div className="hero-ctas" style={{ justifyContent: 'center' }}>
            <a className="btn-l dark" href="mailto:gradient365.team@gmail.com">Contact sales <span><Icon.Arrow size={13}/></span></a>
            <a className="btn-l ghost" href="/contact">Contact form</a>
          </div>
          <p className="sec-lead" style={{ margin: '20px auto 0', fontSize: 15 }}>
            Or email us at{' '}
            <a href="mailto:gradient365.team@gmail.com" style={{ color: 'var(--ink)', fontWeight: 600, textUnderlineOffset: 3 }}>gradient365.team@gmail.com</a>
          </p>
        </div>
      </div>
    </section>
  );
}

export function LFinalCTA() {
  return (
    <section className="l-sec l-sec--pull-up" data-snap>
      <div className="l-wrap">
        <div className="cta-final">
          <div className="cta-final-grid">
            <div>
              <div className="sec-eyebrow sec-eyebrow--plain" style={{ color: 'rgba(255,255,255,.62)' }}>Ready when you are</div>
              <h2>Bring the daily cafe buying loop online.</h2>
              <p>Launch with cafe ordering, supplier fulfilment, and brand trial tracking in one network. Start narrow, then let the graph compound.</p>
            </div>
            <div className="cta-final-card">
              <span>Suggested pilot</span>
              <div className="cta-pilot-stats">
                <div><strong>25</strong><em>cafés</em></div>
                <div><strong>6</strong><em>suppliers</em></div>
                <div><strong>3</strong><em>trial brands</em></div>
              </div>
              <p>Enough density to prove repeat orders, delivery reliability, and trial-to-order conversion without boiling the ocean.</p>
              <div className="hero-ctas">
                <a className="btn-l dark" href="/contact">Start the pilot <span><Icon.Arrow size={13}/></span></a>
                <a className="btn-l ghost" href="/pricing">Contact sales</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LFooter() {
  return (
    <footer className="footer">
      <div className="l-wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="nav-brand">
              <div className="mark">G</div>
              <span>Gradient</span>
            </div>
            <p>The operating system for the café supply chain. Built in Delhi, shipping nationwide.</p>
            <p style={{ fontSize: 13, color: 'var(--ink-2)' }}>Gradient 365 is a product of <strong>Unified Nexgrade Private Limited</strong>.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              {['G2', 'TW', 'IN', 'YT'].map(s => (
                <span key={s} style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border-soft)', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700, color: 'var(--ink-2)' }}>{s}</span>
              ))}
            </div>
          </div>
          <div className="footer-col">
            <h6>Product</h6>
            <ul>
              <li><a href="/features#cafe">Café Portal</a></li>
              <li><a href="/features#supplier">Supplier Portal</a></li>
              <li><a href="/features#insights">Insights</a></li>
              <li><a href="/features#integrations">Integrations</a></li>
              <li><a href="/features">Changelog</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h6>Company</h6>
            <ul>
              <li><a href="/about">About</a></li>
              <li><a href="/#proof">Customers</a></li>
              <li><a href="/careers">Careers <span style={{ color: 'var(--c-orange)', fontWeight: 600 }}>· 6</span></a></li>
              <li><a href="/about">Press</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h6>Resources</h6>
            <ul>
              <li><a href="/features">Documentation</a></li>
              <li><a href="/features">API reference</a></li>
              <li><a href="/features#cafe">Café guide</a></li>
              <li><a href="/features#supplier">Supplier guide</a></li>
              <li><a href="/contact">Community</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h6>Legal</h6>
            <ul>
              <li><a href="/terms">Terms</a></li>
              <li><a href="/privacy">Privacy</a></li>
              <li><a href="/privacy#security">Security</a></li>
              <li><a href="/privacy#soc2">SOC-2</a></li>
              <li><a href="/privacy#dpa">DPA</a></li>
            </ul>
          </div>
        </div>

        <div className="wordmark-huge">gradient</div>

        <div className="footer-bot">
          <span>© 2026 Unified Nexgrade Private Limited · Delhi NCR</span>
          <span className="mono">v 4.12.0 · all systems normal ●</span>
        </div>
      </div>
    </footer>
  );
}
