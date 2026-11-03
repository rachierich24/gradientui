'use client';
// Brand Portal top bar:
// Transparent until the ending of the video section.
// Adapts text color seamlessly over light hero and dark video.
// Transitions to frosted glass once scrolled past the video section.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BorderBeam } from '@/components/ui/border-beam';

const LINKS = [
  ['How it works', '#capabilities'],
  ['Platform', '#platform'],
  ['Results', '#results'],
  ['FAQ', '#faq'],
] as const;

export function BrandNavbar({ onStart }: { onStart: () => void }) {
  const [pastVideo, setPastVideo] = useState(false);
  const [overVideo, setOverVideo] = useState(false);

  useEffect(() => {
    const updateNav = () => {
      const film = document.querySelector('.brd-film') as HTMLElement | null;
      const hero = document.getElementById('brd-top');
      const navH = 68;
      const targetEl = film || hero;

      if (targetEl) {
        const rect = targetEl.getBoundingClientRect();
        // The navbar remains transparent till the ending of the video section
        const isPast = rect.bottom <= navH;
        setPastVideo(isPast);

        // When the dark video film is underneath the navbar
        const isOver = film
          ? film.getBoundingClientRect().top <= navH && film.getBoundingClientRect().bottom > navH
          : false;
        setOverVideo(isOver);
      } else {
        setPastVideo(window.scrollY > 800);
        setOverVideo(false);
      }
    };

    updateNav();
    window.addEventListener('scroll', updateNav, { passive: true });
    window.addEventListener('resize', updateNav);
    return () => {
      window.removeEventListener('scroll', updateNav);
      window.removeEventListener('resize', updateNav);
    };
  }, []);

  return (
    <header
      className={`brd-nav ${pastVideo ? 'is-scrolled' : 'is-transparent'} ${
        overVideo ? 'is-over-video' : 'is-over-light'
      }`}
    >
      <div className="brd-wrap brd-nav-in">
        <Link href="/brand" className="brd-logo" aria-label="Gradient Brand Portal">
          <span className="brd-logo-text">gradient</span>
        </Link>
        <nav aria-label="Brand Portal">
          <ul className="brd-nav-links">
            {LINKS.map(([label, href]) => (
              <li key={href}>
                <a href={href}>{label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="brd-nav-right">
          <a href="https://brand.gradient365.com" className="brd-login">
            Log in
          </a>
          <button type="button" className="brd-btn brd-btn-dark" onClick={onStart}>
            <BorderBeam size={42} duration={4} borderWidth={1.5} colorFrom="#D9C6FA" colorTo="#6B33D3" />
            <span>Launch a trial</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
