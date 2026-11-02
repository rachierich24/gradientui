'use client';
// The close, just before the footer: the ask, on a quiet white screen. The line pokes at the launch the page opened
// on (kits left in a back room), a purple scribble draws itself under "back room" as the section comes into view,
// and a hand-written aside to its left points an arrow at the button. The button leans a little toward the pointer and
// opens the same contact form as the navbar's; the quieter link goes back up to how it works.
// Styles: app/brand/brand-close.css
import { useEffect, useRef } from 'react';
import { reduced } from './shared';

export function BrandClose({ onStart }: { onStart: () => void }) {
  const sec = useRef<HTMLElement>(null);
  const go = useRef<HTMLButtonElement>(null);

  // draw the scribble, the arrow and the aside once the section is well in view
  useEffect(() => {
    const el = sec.current;
    if (!el) return;
    if (reduced()) { el.classList.add('is-in'); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('is-in'); io.disconnect(); } }, { threshold: 0.45 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // the button leans toward the pointer, a few pixels at most
  const lean = (e: React.PointerEvent<HTMLDivElement>) => {
    const b = go.current;
    if (!b || e.pointerType !== 'mouse' || reduced()) return;
    const r = b.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) / r.width, y = (e.clientY - (r.top + r.height / 2)) / r.height;
    b.style.translate = `${(Math.max(-1, Math.min(1, x)) * 6).toFixed(1)}px ${(Math.max(-1, Math.min(1, y)) * 4).toFixed(1)}px`;
  };
  const rest = () => { if (go.current) go.current.style.translate = ''; };

  return (
    <section ref={sec} className="bcl" aria-labelledby="bcl-title">
      <h2 id="bcl-title">
        Your product deserves better than a{' '}
        <span className="bcl-mark">
          back room.
          <svg viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true"><path pathLength={1} d="M4 15c40-7 92-10 150-8 50 2 96 5 142 1M22 20c60-4 140-6 250-2" /></svg>
        </span>
      </h2>
      <p>Put it on the counter of 120 verified cafés instead, and know what sells in three weeks.</p>
      <div className="bcl-act" onPointerMove={lean} onPointerLeave={rest}>
        <span className="bcl-note" aria-hidden="true">
          <svg viewBox="0 0 96 56"><path pathLength={1} d="M90 8C70 4 46 10 34 24 26 33 22 41 14 48M14 48l1-12M14 48l11-3" /></svg>
          <span>your distributor will be fine.<br />probably.</span>
        </span>
        <button ref={go} type="button" className="bcl-go" onClick={onStart}>
          Launch a trial
          <i aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </i>
        </button>
        <a className="bcl-how" href="#features">See how it works</a>
      </div>
    </section>
  );
}
