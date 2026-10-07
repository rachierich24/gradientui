'use client';
// Fixed left-edge section rail (inspired by upvent.co): one small grey glyph per part of the
// page. The section under the middle of the viewport turns its glyph dark and draws a ring
// around it — a cup for cafés, a carton for suppliers, a tag for brands. The ring is the whole
// page: each section owns a slice of it. The active section's black arc starts exactly where the
// previous section ended (say 20%) and grows to its own end as you scroll; what came before
// stays as a faint arc. Click a glyph to jump there. Styles: app/section-rail.css
import { useEffect, useState, type ReactNode } from 'react';

const STOPS: { sel: string; label: string; ring: string; icon: ReactNode }[] = [
  { sel: '#g365hero', label: 'Overview', ring: '#1B1E27', icon: <circle cx="12" cy="12" r="6.5" /> },
  {
    sel: '#ecosystem', label: 'Ecosystem', ring: '#1B1E27',
    icon: <><path d="M12 6.5L6.5 16.5h11z" fill="none" stroke="currentColor" strokeWidth="1.6" /><circle cx="12" cy="6" r="3" /><circle cx="6" cy="17" r="3" /><circle cx="18" cy="17" r="3" /></>,
  },
  {
    sel: '#ecosystem #for-cafes', label: 'For cafés', ring: '#E5483B',
    icon: <><path d="M4 7.5h12V13a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" /><path d="M16 9.5h1.6a2.4 2.4 0 0 1 0 4.8H16" fill="none" stroke="currentColor" strokeWidth="1.9" /><rect x="3" y="19.6" width="14" height="1.9" rx=".95" /></>,
  },
  {
    sel: '#for-suppliers', label: 'For suppliers', ring: '#1F9D57',
    icon: <><path d="M12 3.2l8 4.4-8 4.4-8-4.4z" opacity=".55" /><path d="M3.6 8.6l7.6 4.2v8.4l-7.6-4.2z" /><path d="M20.4 8.6l-7.6 4.2v8.4l7.6-4.2z" opacity=".8" /></>,
  },
  {
    sel: '#for-brands', label: 'For brands', ring: '#7C4DDB',
    icon: <path fillRule="evenodd" d="M3 12.4V4h8.4L21 13.6 13.6 21zM7.6 9.2a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2z" />,
  },
  {
    sel: '#intersystem', label: 'Intersystem', ring: '#1B1E27',
    icon: <><path d="M6.4 6.5H21l-2.3 7.8H8.2z" /><path d="M2.5 3.5h2.7l3 10.8h10.3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><circle cx="9.6" cy="19" r="1.9" /><circle cx="17" cy="19" r="1.9" /></>,
  },
];

const R = 22, C = 2 * Math.PI * R;

export function SectionRail() {
  const [active, setActive] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [start, setStart] = useState(0);

  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      const mid = innerHeight * 0.5;
      const tops = STOPS.map((s) => { const el = document.querySelector(s.sel); return el ? el.getBoundingClientRect() : null; });
      let a = -1;
      tops.forEach((r, i) => { if (r && r.top <= mid) a = i; });
      // the ring spans first section's top → last section's bottom; a section's slice starts
      // where its top falls on that scale, so it begins at the previous section's end
      let p = 0, s0 = 0;
      const first = tops.find(Boolean), last = [...tops].reverse().find(Boolean);
      if (a >= 0 && first && last) {
        const total = Math.max(1, last.bottom - first.top);
        if (a === STOPS.length - 1 && last.bottom < mid) a = -1;
        else {
          p = Math.min(1, Math.max(0, (mid - first.top) / total));
          s0 = Math.min(p, Math.max(0, (tops[a]!.top - first.top) / total));
        }
      }
      setActive(a); setProgress(p); setStart(s0);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(read); };
    read();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    return () => { removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll); cancelAnimationFrame(raf); };
  }, []);

  const go = (sel: string) => {
    const el = document.querySelector(sel);
    if (!el) return;
    const lenis = (window as unknown as { lenis?: { scrollTo: (t: Element, o?: object) => void } }).lenis;
    if (lenis?.scrollTo) lenis.scrollTo(el, { offset: 0 });
    else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav className={`srail${active >= 0 ? ' is-on' : ''}`} aria-label="Page sections">
      {STOPS.map((s, i) => {
        const on = i === active;
        return (
          <button key={s.sel} type="button" className={`srail-stop${on ? ' is-active' : ''}`} style={{ ['--ring' as string]: s.ring }}
            aria-label={s.label} aria-current={on ? 'true' : undefined} onClick={() => go(s.sel)}>
            <svg className="srail-ring" viewBox="0 0 52 52" aria-hidden="true">
              <circle className="srail-track" cx="26" cy="26" r={R} />
              {/* earlier sections, faint */}
              <circle className="srail-done" cx="26" cy="26" r={R} strokeDasharray={`${on ? start * C : 0} ${C}`} />
              {/* this section's slice: from where the last one ended to where we are now */}
              <circle className="srail-fill" cx="26" cy="26" r={R} strokeDasharray={`${on ? Math.max(0.001, (progress - start) * C) : 0} ${C}`} strokeDashoffset={on ? -start * C : 0} />
            </svg>
            <svg className="srail-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{s.icon}</svg>
            <span className="srail-label">{s.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
