'use client';

import React from 'react';

export interface FutureCardData {
  title: string;
  desc: string;
  icon?: string;
  badge?: string;
}

export interface FutureSectionProps {
  id: string;
  badge: string;
  title: string;
  description: string;
  cards: FutureCardData[];
  isAlt?: boolean;
}

export function FutureSection({
  id,
  badge,
  title,
  description,
  cards,
  isAlt = false,
}: FutureSectionProps) {
  return (
    <section
      id={id}
      className={`sup-future-section ${isAlt ? 'alt-bg' : ''}`}
      aria-label={title}
    >
      <div className="sup-container">
        <div className="sup-future-header">
          <div className="sup-future-badge">
            <span>{badge}</span>
          </div>
          <h2 className="sup-future-title">{title}</h2>
          <p className="sup-future-desc">{description}</p>
        </div>

        <div className="sup-future-grid">
          {cards.map((card, idx) => (
            <div key={idx} className="sup-future-card">
              <div className="sup-future-icon">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {card.icon ? (
                    <path d={card.icon} />
                  ) : (
                    <>
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </>
                  )}
                </svg>
              </div>
              <h3 className="sup-future-card-title">{card.title}</h3>
              <p className="sup-future-card-text">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FINAL CALL-TO-ACTION SECTION (Phase 13 Section 12) ───
export function SupplierCtaSection({ onJoinClick }: { onJoinClick?: () => void }) {
  return (
    <section className="sup-future-section alt-bg" id="cta" style={{ textAlign: 'center', padding: '120px 0' }}>
      <div className="sup-container" style={{ maxWidth: '840px' }}>
        <div className="sup-future-badge" style={{ margin: '0 auto 16px' }}>
          <span>GET STARTED TODAY</span>
        </div>
        <h2 style={{ fontSize: 'clamp(32px, 4vw, 50px)', fontWeight: 800, color: 'var(--sup-text-primary)', lineHeight: 1.1, marginBottom: '20px' }}>
          Ready to streamline your wholesale café supply?
        </h2>
        <p style={{ fontSize: '18px', color: 'var(--sup-text-secondary)', maxWidth: '600px', margin: '0 auto 36px', lineHeight: 1.6 }}>
          Join 340+ verified specialty roasters and HoReCa distributors. Receive structured orders, eliminate WhatsApp confusion, and automate next-day bank settlement.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="sup-btn-cta"
            onClick={onJoinClick}
            style={{ fontSize: '15px', padding: '13px 26px' }}
          >
            <span>Apply as a Verified Supplier</span>
            <span>→</span>
          </button>
          <a
            href="/contact"
            className="sup-btn-login"
            style={{ border: '1px solid var(--sup-border)', background: '#FFFFFF', padding: '12px 22px', fontSize: '15px' }}
          >
            Schedule a Private Demo
          </a>
        </div>
      </div>
    </section>
  );
}
