'use client';
// Café portal top bar — the same pill as umanodesign.studio's nav (values read from its source): fixed 16 px from
// the top, #F0F0F0, 81 px tall, fully rounded. It drops in with the hero's headline (0.5 s; hidden by CSS while the
// hero's intro plays). Past the hero it swaps its links for the page's sections: the links fold away (0.45 s),
// change, and unfold, and the button turns red. Hovering the pill keeps the links open.
import { useEffect, useState } from 'react';
import Link from 'next/link';

type NavLink = { label: string; href: string; section?: string; current?: boolean };

const HERO_LINKS: NavLink[] = [
  { label: 'Café Portal', href: '/cafe', current: true },
  { label: 'For Suppliers', href: '/supplier' },
  { label: 'Log in', href: 'https://cafe.gradient365.com' },
];
const PAGE_LINKS: NavLink[] = [
  { label: 'Features', href: '#features', section: 'features' },
  { label: 'Stories', href: '#stories', section: 'stories' },
  { label: 'Integrations', href: '#integrations', section: 'integrations' },
  { label: 'Pricing', href: '/pricing' },
];

export function CafeNavbar({ onStart }: { onStart: () => void }) {
  const [pastHero, setPastHero] = useState(false);   // which set of links is showing
  const [open, setOpen] = useState(true);            // links unfolded (they fold away while the set changes)
  const [hover, setHover] = useState(false);
  const [section, setSection] = useState('');

  useEffect(() => {
    let past = false, timer = 0;
    const onScroll = () => {
      const hero = document.getElementById('cafe-hero');
      const now = window.scrollY > (hero ? hero.offsetHeight : window.innerHeight);
      if (now !== past) {
        past = now;
        setOpen(false);
        clearTimeout(timer);
        timer = window.setTimeout(() => { setPastHero(now); setOpen(true); }, 500);
      }
      let inView = '';
      for (const id of ['features', 'stories', 'integrations']) {
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= window.innerHeight * 0.4 && r.bottom > window.innerHeight * 0.3) inView = id;
      }
      setSection(inView);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); clearTimeout(timer); };
  }, []);

  const links = pastHero ? PAGE_LINKS : HERO_LINKS;

  return (
    <div className="cafe-nav">
      <header className="cafe-nav-pill" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <Link href="/cafe" className="cafe-logo" aria-label="Gradient Café Portal">
          <span className="cafe-logo-mark" aria-hidden="true">
            <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
              <path d="M 7.68 8.31 A 8.5 8.5 0 0 1 20.32 8.31" />
              <path d="M 22.08 11.37 A 8.5 8.5 0 0 1 15.77 22.31" />
              <path d="M 12.23 22.31 A 8.5 8.5 0 0 1 5.92 11.37" />
              <circle cx="14" cy="14" r="2.6" fill="currentColor" stroke="none" />
            </svg>
          </span>
          <span className="cafe-logo-text">gradient</span>
        </Link>
        <div className="cafe-nav-fold" data-open={open || hover ? 'true' : 'false'}>
          <nav aria-label="Café portal" className="cafe-nav-links">
            {links.map((l) => {
              const active = l.current || (!!l.section && l.section === section);
              return (
                <a key={l.label} href={l.href} className={active ? 'is-active' : undefined} aria-current={l.current ? 'page' : undefined}>
                  {l.label}
                </a>
              );
            })}
          </nav>
        </div>
        <button type="button" className={`cafe-nav-cta ${pastHero ? 'is-red' : ''}`} onClick={onStart}>
          Start ordering
        </button>
      </header>
    </div>
  );
}
