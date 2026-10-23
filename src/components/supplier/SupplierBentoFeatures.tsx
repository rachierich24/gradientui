'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { SupplierBentoGrid } from './SupplierBentoGrid';
import { Particles } from './bento/Particles';

export function SupplierBentoFeatures() {
  const prefersReduced = useReducedMotion();
  const isReduced = prefersReduced ?? false;

  return (
    <section
      className="sup-bento-section"
      id="features"
      aria-label="Core Supplier Capabilities"
    >
      <Particles className="sbx-particles" />
      <div className="sup-container">
        {/* ─── A. SECTION INTRODUCTION (Ramp Two-Tone Headline & Dual CTAs) ─── */}
        <motion.div
          className="sup-bento-intro"
          initial={isReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="sup-bento-eyebrow">
            <span className="sup-bento-eyebrow-dot" />
            <span>ONE PLATFORM FOR WHOLESALE SUPPLY</span>
          </div>
          <h2 className="sup-bento-heading">
            One platform for all café supply.<br />
            <span className="sup-bento-heading-muted">Agents for every workflow, working 24/7.</span>
          </h2>
          <div className="sup-bento-cta-row">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('join') || document.getElementById('onboarding');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('open-supplier-modal'));
                }
              }}
              className="sup-bento-btn-primary"
            >
              Switch in days, not months
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('order-workspace') || document.getElementById('demo');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  window.scrollTo({ top: 850, behavior: 'smooth' });
                }
              }}
              className="sup-bento-btn-secondary"
            >
              View Demo
            </button>
          </div>
        </motion.div>

        {/* ─── B. Bento grid (SupplierBentoGrid) ─── */}
        <SupplierBentoGrid />
      </div>
    </section>
  );
}

export default SupplierBentoFeatures;
