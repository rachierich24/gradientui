'use client';

import React, { useState } from 'react';

interface FaqItem {
  q: string;
  a: string;
  cat: 'all' | 'onboarding' | 'escrow' | 'logistics';
}

export function SupplierFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCat, setActiveCat] = useState<'all' | 'onboarding' | 'escrow' | 'logistics'>('all');

  const faqs: FaqItem[] = [
    {
      q: 'How fast can our roastery or wholesale distributorship onboard?',
      a: 'Digital onboarding takes under 2 hours. Simply submit your active GSTIN, FSSAI food safety certificate, and bank current account details. Once verified by our compliance team, you can upload your wholesale SKU catalogue, set your private pricing tiers, and begin accepting café orders the same business day.',
      cat: 'onboarding',
    },
    {
      q: 'Do we have to change our current delivery fleet or drivers?',
      a: 'No. Grabbit gives you complete operational flexibility. You can dispatch orders using your existing delivery vans and in-house drivers (equipped with the Grabbit Driver App for ePOD signatures), your contracted 3PL logistics partners, or on-demand Grabbit EV cargo carrier routes.',
      cat: 'logistics',
    },
    {
      q: 'How does the HDFC commercial payment escrow protect our business?',
      a: 'Every café order is pre-authorized and 100% funded into an institutional HDFC commercial escrow account at checkout. When your driver delivers the goods and the barista signs the electronic Proof of Delivery (ePOD) on their mobile or tablet, funds are instantly unlocked and disbursed directly to your bank account on a guaranteed T+1 09:00 AM schedule. No unpaid invoices, no 45-day credit chasing, and zero bad debt risk.',
      cat: 'escrow',
    },
    {
      q: 'Can we offer different wholesale pricing to multi-outlet chains versus independent cafés?',
      a: 'Yes. Our private pricing wall feature lets you create customized price tiers (e.g., Tier A for 10+ outlet chains, Tier B for independent neighborhood coffee bars). Negotiated rates are visible only to the specific café accounts you assign, and remain completely invisible to other buyers or competing suppliers.',
      cat: 'onboarding',
    },
    {
      q: 'How does returnable crate tracking work for our heavy-duty green crates?',
      a: 'Each reusable wholesale crate (such as crate #C-88) is assigned an industrial QR/RFID barcode tag. When your packaging team loads orders, the crates are scanned out to the specific van and destination café. On the next delivery run, the driver scans and reclaims empty sanitized crates, reducing replacement costs and eliminating single-use cardboard waste.',
      cat: 'logistics',
    },
    {
      q: 'Does Grabbit integrate with Tally Prime and Zoho Books for accounting?',
      a: 'Yes. Completed purchase orders automatically generate GST-compliant e-invoices with valid IRN numbers and push directly into your Tally Prime, Zoho Books, or QuickBooks ledger without manual data entry or reconciliation headaches.',
      cat: 'onboarding',
    },
  ];

  const filtered = activeCat === 'all' ? faqs : faqs.filter((f) => f.cat === activeCat);

  return (
    <section className="sup-section-shell alt-bg" id="faq" aria-label="Frequently Asked Questions">
      <div className="sup-container">
        <div className="sup-section-header">
          <div className="sup-section-eyebrow">
            <span className="dot" />
            <span>FREQUENTLY ASKED QUESTIONS</span>
          </div>
          <h2 className="sup-section-title">
            Clear answers for wholesale suppliers.
          </h2>
          <p className="sup-section-desc">
            Everything you need to know about café order fulfillment, bank escrows, fleet logistics, and catalogue security.
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '36px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveCat('all')}
            style={{
              padding: '7px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              border: activeCat === 'all' ? '1px solid var(--sup-primary)' : '1px solid var(--sup-border)',
              background: activeCat === 'all' ? 'var(--sup-pale)' : '#FFFFFF',
              color: activeCat === 'all' ? 'var(--sup-forest)' : 'var(--sup-text-secondary)',
            }}
          >
            All Questions
          </button>
          <button
            type="button"
            onClick={() => setActiveCat('onboarding')}
            style={{
              padding: '7px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              border: activeCat === 'onboarding' ? '1px solid var(--sup-primary)' : '1px solid var(--sup-border)',
              background: activeCat === 'onboarding' ? 'var(--sup-pale)' : '#FFFFFF',
              color: activeCat === 'onboarding' ? 'var(--sup-forest)' : 'var(--sup-text-secondary)',
            }}
          >
            Onboarding &amp; Catalogue
          </button>
          <button
            type="button"
            onClick={() => setActiveCat('escrow')}
            style={{
              padding: '7px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              border: activeCat === 'escrow' ? '1px solid var(--sup-primary)' : '1px solid var(--sup-border)',
              background: activeCat === 'escrow' ? 'var(--sup-pale)' : '#FFFFFF',
              color: activeCat === 'escrow' ? 'var(--sup-forest)' : 'var(--sup-text-secondary)',
            }}
          >
            Payments &amp; Escrow
          </button>
          <button
            type="button"
            onClick={() => setActiveCat('logistics')}
            style={{
              padding: '7px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              border: activeCat === 'logistics' ? '1px solid var(--sup-primary)' : '1px solid var(--sup-border)',
              background: activeCat === 'logistics' ? 'var(--sup-pale)' : '#FFFFFF',
              color: activeCat === 'logistics' ? 'var(--sup-forest)' : 'var(--sup-text-secondary)',
            }}
          >
            Fleet &amp; Crates
          </button>
        </div>

        <div className="sup-faq-wrapper">
          {filtered.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className={`sup-faq-item ${isOpen ? 'is-open' : ''}`}>
                <button
                  type="button"
                  className="sup-faq-question"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <div className="sup-faq-icon">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </div>
                </button>
                {isOpen && <div className="sup-faq-answer">{faq.a}</div>}
              </div>
            );
          })}
        </div>

        {/* Still have questions card */}
        <div style={{ maxWidth: '860px', margin: '40px auto 0', background: 'var(--sup-warm-white)', border: '1px solid var(--sup-border)', borderRadius: '16px', padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--sup-text-primary)' }}>
              Have custom wholesale requirements?
            </div>
            <div style={{ fontSize: '13px', color: 'var(--sup-text-secondary)', marginTop: '2px' }}>
              Speak directly with our supplier operations team in Bangalore &amp; Mumbai.
            </div>
          </div>
          <a
            href="/contact"
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--sup-border)',
              color: 'var(--sup-forest)',
              padding: '9px 18px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '13.5px',
              textDecoration: 'none',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            Talk to Supplier Success →
          </a>
        </div>
      </div>
    </section>
  );
}
