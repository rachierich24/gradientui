'use client';
// Brand Portal hero: Central editorial design.
// "Gradient for Brands" with "Gradient" medium, "for" small, and "BRANDS" large typography
// on a clean white background.
import { useEffect, useRef } from 'react';
import { reduced } from './shared';
import FoldText from './FoldText';

export function BrandHero() {
  const film = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  // --p: how far the film has risen (0 = its top at the bottom of the screen, 1 = it fills the screen), and the intro
  useEffect(() => {
    const el = film.current, v = video.current;
    if (!el || !v) return;
    const still = reduced();
    let raf = 0;
    const set = () => {
      raf = 0;
      const top = el.getBoundingClientRect().top, h = window.innerHeight;
      el.style.setProperty('--p', String(Math.max(0, Math.min(1, 1 - top / h))));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(set); };
    set();
    if (!still) { window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onScroll); }

    // The intro: once BRANDS has folded in, the film rises over the title by itself, with scrolling held. When it
    // lands, the page is scrolled to where the film now sits (the band is sticky, so nothing moves) and scrolling
    // is handed back. Trying to scroll first just starts the rise sooner. Skipped for reduced motion, or when the
    // page doesn't open at the top.
    type Lenis = { stop: () => void; start: () => void; scrollTo: (t: number, o?: object) => void };
    const lenis = () => (window as unknown as { lenis?: Lenis }).lenis;
    let wait = 0, intro = 0, held = false;
    const keys = new Set([' ', 'PageDown', 'PageUp', 'ArrowDown', 'ArrowUp', 'Home', 'End']);
    const block = (e: Event) => {
      if (e instanceof KeyboardEvent && !keys.has(e.key)) return;
      e.preventDefault();
      e.stopPropagation();
      rise();
    };
    const hold = (on: boolean) => {
      held = on;
      for (const t of ['wheel', 'touchmove', 'keydown']) {
        if (on) window.addEventListener(t, block, { capture: true, passive: false }); else window.removeEventListener(t, block, { capture: true });
      }
      if (on) lenis()?.stop(); else lenis()?.start();
    };
    function rise() {
      if (intro || !held) return;
      clearTimeout(wait);
      const from = el!.getBoundingClientRect().top, t0 = performance.now(), T = 1400;
      const step = (now: number) => {
        const x = Math.min(1, (now - t0) / T), e = x < 0.5 ? 8 * x ** 4 : 1 - (-2 * x + 2) ** 4 / 2;
        el!.style.transform = `translate3d(0, ${(-from * e).toFixed(1)}px, 0)`;
        set();
        if (x < 1) { intro = requestAnimationFrame(step); return; }
        const top = from + window.scrollY;
        el!.style.transform = '';
        hold(false);
        const l = lenis();
        if (l) l.scrollTo(top, { immediate: true, force: true }); else window.scrollTo(0, top);
        set();
      };
      intro = requestAnimationFrame(step);
    }
    if (!still && window.scrollY < 4 && !location.hash) {
      hold(true);
      wait = window.setTimeout(rise, 1500);
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !still) v.play().catch(() => { }); else v.pause();
    }, { threshold: 0 });
    io.observe(el);
    return () => { clearTimeout(wait); cancelAnimationFrame(intro); if (held) hold(false); el.style.transform = ''; cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); io.disconnect(); };
  }, []);

  return (
    <section className="brd-hero" id="brd-top" aria-labelledby="brd-hero-title">
      <div className="brd-band">
        <div className="brd-wrap brd-band-center">
          {/* Centered "Gradient for Brands" Lockup in Brand Purple */}
          <h1 id="brd-hero-title" className="brd-hero-title-lockup">
            <div className="brd-title-top">
              <span className="brd-txt-grad">Gradient</span>
              <span className="brd-txt-for">for</span>
            </div>

            {/* The giant BRANDS with FoldText */}
            <div className="brd-brands-stage">
              <FoldText
                text="BRANDS"
                foldStyle="paper"
                splitBy="char"
                hinge="top"
                trigger="mount"
                foldAngle={92}
                duration={0.7}
                stagger={0.05}
                staggerFrom="start"
                ease="power3.out"
                hoverRefold={true}
                refoldRadius={160}
                refoldAngle={45}
                perspective={800}
                creaseShading={0.5}
                fontSize="clamp(84px, 22.5vw, 340px)"
                fontWeight={900}
                className="brd-txt-brands"
              />
            </div>
          </h1>
        </div>
      </div>

      {/* Video Film Container with Top Overlap over the word "BRANDS" */}
      <div className="brd-film" ref={film}>
        <video ref={video} muted loop playsInline preload="metadata" poster="/brand/hero-billboard-poster.jpg" aria-hidden="true" tabIndex={-1}>
          <source src="/brand/hero-billboard-portrait.mp4" type="video/mp4" media="(orientation: portrait)" />
          <source src="/brand/hero-billboard.mp4" type="video/mp4" />
        </video>
        <div className="brd-film-shade" aria-hidden="true" />
      </div>
    </section>
  );
}
