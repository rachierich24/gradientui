'use client';
// Brand Portal hero: Central editorial design.
// "Gradient for Brands" with "Gradient" medium, "for" small, and "BRANDS" large typography
// on a clean white background with interactive <CrystalizedBall /> in the brand purple.
import { useEffect, useRef } from 'react';
import { reduced } from './shared';
import CrystalizedBall from './CrystalizedBall';

export function BrandHero() {
  const film = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  // --p: how far the film has risen (0 = its top at the bottom of the screen, 1 = it fills the screen)
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
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !still) v.play().catch(() => { }); else v.pause();
    }, { threshold: 0 });
    io.observe(el);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); io.disconnect(); };
  }, []);

  return (
    <section className="brd-hero" id="brd-top" aria-labelledby="brd-hero-title">
      <div className="brd-band">
        <div className="brd-wrap brd-band-center">
          {/* Centered Eyebrow: Social Proof Monospace in Brand Purple */}
          <div className="brd-hero-eyebrow">
            TRUSTED BY 500+ VERIFIED CAFÉS &amp; BRANDS
          </div>

          {/* Centered "Gradient for Brands" Lockup in Brand Purple */}
          <h1 id="brd-hero-title" className="brd-hero-title-lockup">
            <div className="brd-title-top">
              <span className="brd-txt-grad">Gradient</span>
              <span className="brd-txt-for">for</span>
            </div>

            {/* The giant BRANDS with CrystalizedBall centered right behind 'AN' */}
            <div className="brd-brands-stage">
              <div className="brd-hero-ball-bg" aria-hidden="true">
                <CrystalizedBall
                  preset="plasma"
                  color="#6D28D9"
                  theme="light"
                  size={0.78}
                  crackle={0.85}
                  flares={0.75}
                  glow={1.15}
                  fill={0.52}
                  haze={0.35}
                  interactive={true}
                  hoverStrength={0.8}
                />
              </div>
              <span className="brd-txt-brands">BRANDS</span>
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
