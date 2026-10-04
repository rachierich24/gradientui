'use client';
// Gradient 365 hero + footer, ported from the standalone ~/gradient build.
// The markup lives here; the animation runs from the original scripts in public/g365/js
// (three.js is self-hosted there too, so the CSP's script-src 'self' is enough).
import { useEffect, useRef } from 'react';
import { openContactSalesModal } from '@/components/ContactSalesModal';
import { loadG365, G365_LIBS } from './g365-scripts';

// Runs inline during HTML parse, before first paint, so the hero starts blank and
// switches itself on. A failsafe reveals everything after 5s regardless.
const BOOT = `(function(){var d=document.getElementById("g365hero");if(!d||matchMedia("(prefers-reduced-motion: reduce)").matches)return;var c=["boot-head","boot-ui","boot-rows","boot-solid"];c.forEach(function(k){d.classList.add(k)});window.G365BOOT=performance.now();setTimeout(function(){c.forEach(function(k){d.classList.remove(k)})},5000)})();`;

export function G365Hero() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    // The scripts build their DOM once per element; guard against StrictMode's double effect.
    if (!root || root.dataset.g365Init) return;
    root.dataset.g365Init = '1';
    loadG365([...G365_LIBS, 'thumbs.js', 'riders.js'], ['hero-flow.js', 'energy.js']).catch(() => {});
  }, []);

  return (
    <div className="g365 g365-hero" id="g365hero" ref={rootRef} suppressHydrationWarning>
      <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      <header className="hero">
        <h1>The infrastructure behind every <em>great café.</em></h1>
        <div className="actions">
          <a className="btn primary" href="#contact-sales" onClick={(e) => { e.preventDefault(); openContactSalesModal(); }}>
            Start free <span aria-hidden="true">→</span>
          </a>
          <a className="btn ghost" href="/contact"><span>Book a walkthrough</span></a>
        </div>
      </header>

      <section className="stage" id="stage" aria-label="Scattered café supply becoming organised orders on Gradient 365">
        <div className="rows" id="rows"></div>
        <canvas id="riders" aria-hidden="true"></canvas>
        {/* the ribbons reach past the stage and land on the phone and dashboards in the ecosystem section */}
        <canvas className="energy" id="energy" aria-hidden="true"></canvas>
        <div className="core" id="core" aria-hidden="true"></div>
      </section>

    </div>
  );
}

export function G365Footer() {
  const markRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mark = markRef.current;
    if (!mark || mark.dataset.g365Init) return;
    mark.dataset.g365Init = '1';
    loadG365([], ['footer.js']).catch(() => {});
  }, []);

  return (
    <footer className="g365 g365-footer">
      <div className="ft-wrap">
      <div className="ft-top">
        <div className="ft-links">
          <a href="/features">Platform</a>
          <a href="https://brand.gradient365.com" target="_blank" rel="noopener noreferrer">Brands</a>
          <a href="/features#supplier">Suppliers</a>
          <a href="/features#cafe">Cafés</a>
        </div>
        <div className="ft-side">
          <small>Café commerce, connected</small>
          <div className="ft-links">
            <a href="/contact">Book a demo</a>
            <a href="/careers">Careers</a>
            <a href="/contact">Contact</a>
          </div>
        </div>
      </div>
      <div className="ft-mark" id="ftMark" ref={markRef} role="img" aria-label="Gradient 365"></div>
      <div className="ft-bottom">
        <span>© 2026 Gradient 365</span>
        <div className="ft-legal">
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms</a>
          <a href="#">LinkedIn</a>
          <a href="#">Instagram</a>
        </div>
      </div>
      <p className="ft-note">
        Gradient 365 is a product of <a href="https://unifiednexgrade.com" target="_blank" rel="noopener noreferrer">Unified Nexgrade Private Limited</a>, Delhi NCR.
        Also from Unified Nexgrade: <a href="https://letsgrabbit.com" target="_blank" rel="noopener noreferrer">Grabbit</a>, café order-ahead and pickup in Delhi.
        Product screens, dashboards, figures and any names shown on this site are illustrative and for demonstration only, and do not represent live data or actual customers.
        Third-party names, logos and marks are the property of their respective owners; their use here indicates supported or planned integrations only and does not imply partnership, sponsorship or endorsement.
      </p>
      </div>
    </footer>
  );
}
