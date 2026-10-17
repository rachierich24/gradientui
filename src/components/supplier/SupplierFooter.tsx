'use client';

import React from 'react';
import Link from 'next/link';

export function SupplierFooter() {
  return (
    <footer className="sup-footer" id="footer" aria-label="Gradient Supplier Portal Footer">
      <div className="sup-container">
        <div className="sup-footer-grid">
          {/* Brand Col */}
          <div>
            <div className="sup-footer-brand-title">
              <span className="sup-logo-mark" style={{ width: '28px', height: '28px', fontSize: '14px' }}>
                G
              </span>
              <span>Gradient</span>
            </div>
            <p className="sup-footer-brand-desc">
              The unified B2B commerce layer connecting independent cafés, specialty coffee roasters, and wholesale food distributors across India.
            </p>
          </div>

          {/* Supplier Solutions */}
          <div>
            <div className="sup-footer-col-title">Supplier Platform</div>
            <ul className="sup-footer-links">
              <li>
                <a href="#workflow" className="sup-footer-link">
                  Order Ingest &amp; Parsing
                </a>
              </li>
              <li>
                <a href="#inventory" className="sup-footer-link">
                  Roast Batch Inventory
                </a>
              </li>
              <li>
                <a href="#dispatch" className="sup-footer-link">
                  Morning Route Dispatch
                </a>
              </li>
              <li>
                <a href="#analytics" className="sup-footer-link">
                  T+1 Settlement Velocity
                </a>
              </li>
            </ul>
          </div>

          {/* Ecosystem */}
          <div>
            <div className="sup-footer-col-title">Network</div>
            <ul className="sup-footer-links">
              <li>
                <Link href="/" className="sup-footer-link">
                  Grabbit Main Portal
                </Link>
              </li>
              <li>
                <Link href="/features#cafe" className="sup-footer-link">
                  For Independent Cafés
                </Link>
              </li>
              <li>
                <Link href="/features#brand" className="sup-footer-link">
                  For Brand Trials
                </Link>
              </li>
              <li>
                <Link href="/about" className="sup-footer-link">
                  Customer Stories
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Support */}
          <div>
            <div className="sup-footer-col-title">Company</div>
            <ul className="sup-footer-links">
              <li>
                <Link href="/contact" className="sup-footer-link">
                  Contact Sales &amp; Onboarding
                </Link>
              </li>
              <li>
                <Link href="/careers" className="sup-footer-link">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="sup-footer-link">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="sup-footer-link">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="sup-footer-bottom">
          <span>© {new Date().getFullYear()} Grabbit (Unified Nexgrade Pvt. Ltd.). All rights reserved.</span>
          <span>Designed with Relume spatial depth &amp; Grabbit B2B precision.</span>
        </div>
      </div>
    </footer>
  );
}
