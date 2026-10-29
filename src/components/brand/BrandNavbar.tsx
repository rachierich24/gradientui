'use client';
// Brand Portal top bar: same shape as the Supplier Portal's, in the brand purple. Transparent with light
// text while it's over the dark hero, white once the page moves past it.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BorderBeam } from '@/components/ui/border-beam';

const LINKS = [
  ['How it works', '#journey'],
  ['Platform', '#platform'],
  ['Results', '#results'],
  ['FAQ', '#faq'],
] as const;

export function BrandNavbar({ onStart }: { onStart: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(true);
  useEffect(() => {
    // light text while the bar sits over the dark hero
    const on = () => {
      setScrolled(window.scrollY > 20);
      const hero = document.getElementById('brd-top');
      setDark(!!hero && hero.getBoundingClientRect().bottom > 68);
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); };
  }, []);

  return (
    <header className={`brd-nav${scrolled ? ' is-scrolled' : ''}${dark ? ' is-dark' : ''}`}>
      <div className="brd-wrap brd-nav-in">
        <Link href="/brand" className="brd-logo" aria-label="Gradient Brand Portal">
          <span className="brd-logo-mark" aria-hidden="true">G</span>
          <span className="brd-logo-text">Gradient<span className="brd-logo-tag">Brand Portal</span></span>
        </Link>
        <nav aria-label="Brand Portal">
          <ul className="brd-nav-links">
            {LINKS.map(([label, href]) => <li key={href}><a href={href}>{label}</a></li>)}
          </ul>
        </nav>
        <div className="brd-nav-right">
          <a href="https://brand.gradient365.com" className="brd-login">Log in</a>
          <button type="button" className="brd-btn brd-btn-dark" onClick={onStart}>
            <BorderBeam size={42} duration={4} borderWidth={1.5} colorFrom="#C4B0F5" colorTo="#ffffff" />
            <span>Launch a trial</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </header>
  );
}
