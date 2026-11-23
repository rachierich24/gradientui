'use client';

import { CafeNavbar, CafeHero, CafeFeatures, CafeBento, CafeStories, CafeIntegrations, CafeCta } from '@/components/cafe';
import { openContactSalesModal } from '@/components/ContactSalesModal';
import { G365Footer } from '@/components/landing/G365';

// The café portal, in four sections: the hero (a hand holding the café app), what it does, what it plugs
// into, and the ask. Kept deliberately simple below the hero; each section gets its own pass later.
export default function CafePortalPage() {
  return (
    <>
      {/* ─── Floating pill navigation ─── */}
      <CafeNavbar onStart={openContactSalesModal} />

      {/* ─── 01. Hero: a notification lands on the phone in a hand, the headline arrives, the app cycles ─── */}
      <CafeHero />

      {/* ─── 02. Everything a café orders: the goods float around the headline, rising into the hero ─── */}
      <CafeFeatures />

      {/* ─── 03. Why Gradient: a Shopify-style bento — never run out, verified distributors, best price, GST, brand chefs ─── */}
      <CafeBento />

      {/* ─── 04. Stories of cafés: umano's logo zoom, then three cafés' stories flying in (on a warm white) ─── */}
      <CafeStories />

      {/* ─── 05. What it plugs into: POS, accounting, payments, compliance ─── */}
      <CafeIntegrations />

      {/* ─── 06. The ask: download the app now, or use it right here (the hand and phone again, on a lock screen) ─── */}
      <CafeCta onStart={openContactSalesModal} />

      {/* ─── Footer: the same animated wordmark as the main site ─── */}
      <G365Footer />

      {/* a faint film grain over the whole page */}
      <div className="cafe-grain" aria-hidden="true" />
    </>
  );
}
