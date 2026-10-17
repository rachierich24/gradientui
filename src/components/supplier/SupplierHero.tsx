'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PackagingScene } from './PackagingScene';

interface SupplierHeroProps {
  onJoinClick?: () => void;
  onExploreClick?: () => void;
}

export function SupplierHero({ onJoinClick, onExploreClick }: SupplierHeroProps) {
  const [promptText, setPromptText] = useState('');

  const scrollToWorkspace = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onExploreClick) {
      onExploreClick();
    } else {
      const lenis = (window as unknown as { lenis?: { scrollTo: (target: string, opts?: object) => void } }).lenis;
      if (lenis) {
        lenis.scrollTo('#order-workspace');
      } else {
        const el = document.getElementById('order-workspace');
        el?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleExampleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setPromptText('Blue Tokai Koramangala needs 10kg Arabica AA Estate by 12:00 PM, medium-fine grind.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onJoinClick) {
      onJoinClick();
    }
  };

  return (
    <section className="sup-hero-section" id="hero" aria-label="Grabbit Supplier Portal Hero">
      {/* Precision Technical Grid Lines (Relume aesthetic) */}
      <div className="sup-hero-grid-lines" aria-hidden="true" />

      {/* 3D Supplier Packaging Scene (Left cartons, right crates) */}
      <PackagingScene />

      {/* Centered Editorial Content Column */}
      <div className="sup-container">
        <motion.div
          className="sup-hero-content"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Eyebrow: Pure vibrant green text (Relume style, no pill container) */}
          <div className="sup-hero-eyebrow-relume">
            TRUSTED BY 340+ SPECIALTY ROASTERS &amp; DISTRIBUTORS
          </div>

          {/* Large, Confident Headline (Relume 2-line cadence) */}
          <h1 className="sup-hero-headline">
            Every café order
            <br />
            <span className="sup-hero-headline">you&apos;d actually fulfill</span>
          </h1>

          {/* Supporting Copy */}
          <p className="sup-hero-sub">
            Start with café demand. Grabbit consolidates purchase orders, automates batch roast scheduling, and guarantees next-day escrow settlement. The platform handles logistics. You make the calls.
          </p>

          {/* ─── Relume-Style Interactive Prompt Card ─── */}
          <motion.div
            className="sup-relume-prompt-card"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <div className="sup-prompt-textarea-wrapper">
                <textarea
                  className="sup-prompt-textarea"
                  placeholder="Tell Grabbit what you're supplying (e.g., 100% Arabica AA, Oat Milk, Bio Cups)..."
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="sup-prompt-bottom-bar">
                {/* Left: Attachment Paperclip Icon */}
                <button
                  type="button"
                  className="sup-prompt-icon-btn"
                  title="Upload Catalogue Sheet or Rate Card"
                  onClick={onJoinClick}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                </button>

                {/* Right: Badges & Primary Action Button */}
                <div className="sup-prompt-actions-right">
                  <div className="sup-prompt-pill-badge">
                    <span>📦 Auto Routing</span>
                  </div>
                  <div className="sup-prompt-pill-badge">
                    <span>⚡ T+1 Escrow</span>
                  </div>

                  <button
                    type="submit"
                    className="sup-relume-action-btn"
                  >
                    <span>Accept Orders</span>
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              </div>
            </form>
          </motion.div>

          {/* Subtle "Try an example" prompt link with dotted underline */}
          <div className="sup-prompt-example-link">
            <button
              type="button"
              onClick={handleExampleClick}
              className="sup-example-btn"
            >
              Try an example: Blue Tokai Koramangala 10kg roast order
            </button>
          </div>
        </motion.div>
      </div>

      {/* ─── Bottom Peek of Emerging Dashboard Resting on Green Cutting Mat (Relume visual) ─── */}
      <div
        className="sup-hero-bottom-peek"
        onClick={scrollToWorkspace}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            scrollToWorkspace(e as unknown as React.MouseEvent);
          }
        }}
        aria-label="Scroll to Supplier Workspace Dashboard"
      >
        {/* Cutting Mat Peek Edge */}
        <div className="sup-peek-mat">
          <div className="sup-peek-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span
                style={{
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  background: 'var(--sup-fresh)',
                  boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.25)',
                }}
              />
              <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--sup-forest)' }}>
                Live Workspace · 34 Cafés Connected
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--sup-text-secondary)', fontWeight: 600 }}>
              <span>Scroll or click to view fulfillment workflow</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
