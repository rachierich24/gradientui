'use client';
// Gradient 365 hero + footer
import { useEffect, useRef } from 'react';
import { openContactSalesModal } from '@/components/ContactSalesModal';
import { loadG365 } from './g365-scripts';
import { HeroHeadline } from './HeroPill';
import { HeroWorkflowHub } from './HeroWorkflowHub';

export function G365Hero() {
  return (
    <div className="g365 g365-hero" id="g365hero" suppressHydrationWarning>
      <header className="hero">
        <h1>
          <HeroHeadline />
        </h1>
        <p className="hero-sub">
          Sync live vendor catalogues, automate daily orders, and streamline kitchen restocks on one platform.
        </p>
        <div className="actions">
          <a
            className="btn primary"
            href="#contact-sales"
            onClick={(e) => {
              e.preventDefault();
              openContactSalesModal();
            }}
          >
            Start free
          </a>
          <a className="btn ghost" href="/contact">
            Book a walkthrough
          </a>
        </div>
      </header>

      {/* 3D Continuous Workflow Animation: Inputs -> Central 3D Hub -> Automated Outputs */}
      <HeroWorkflowHub />
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
