'use client';
// Brand Portal hero, in two halves. The top is a purple band: the nav, the headline set big at the bottom
// left, a line and "Scroll down" at the bottom right. Under it sits a full-screen film that rises into view
// as you scroll, easing from a slight zoom to rest, warm against the purple: Times Square on a sunny
// afternoon, where the centre screen plays a 19-second Gradient for brands ad shot on real footage. A call
// centre asks "Still cold-calling cafés?"; then a founder launches a campaign to café owners, a café opens
// its trial kit, a barista pours (with the rating that came back), a phone tracks every kit, a demand index
// shows where it'll sell, and the old way meets Gradient side by side. The camera flies into the screen, the
// ad plays full frame, and the camera pulls back out to the first shot, so it loops. Phones held upright get
// a portrait cut that lands on the whole billboard: each scene's line above the footage, its card below.
// The film plays only while it's on screen; with reduced motion it stays on its first frame. Footage:
// Mixkit (free licence); the ad, its cards and the phone screen are composited for this page.
import { useEffect, useRef } from 'react';
import { reduced, scrollToId } from './shared';

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
      if (e.isIntersecting && !still) v.play().catch(() => {}); else v.pause();
    }, { threshold: 0 });
    io.observe(el);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); io.disconnect(); };
  }, []);

  return (
    <section className="brd-hero" id="brd-top" aria-labelledby="brd-hero-title">
      <div className="brd-band">
        <div className="brd-wrap brd-band-in">
          <h1 id="brd-hero-title">Get your product into<br className="brd-br" /> India’s best cafés<sup>®</sup></h1>
          <div className="brd-band-side">
            <p>Trial kits to verified cafés, through the suppliers they already buy from.</p>
            <button type="button" className="brd-scroll" onClick={() => scrollToId('platform')}>Scroll down</button>
          </div>
        </div>
      </div>

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
