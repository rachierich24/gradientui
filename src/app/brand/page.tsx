'use client';

import { BrandNavbar, BrandHero, BrandDashboard, BrandMoat, BrandCompare, BrandFeatures, BrandBento, BrandClose } from '@/components/brand';
import { openContactSalesModal } from '@/components/ContactSalesModal';
import { G365Footer } from '@/components/landing/G365';

// The page tells one story, in order: feel it, the problem, how it's solved, the product you'll use, why only
// Gradient can do it, everything at a glance, then the ask.
export default function BrandPortalPage() {
  return (
    <>
      {/* ─── 01. Top navigation (light text while it's over the hero) ─── */}
      <BrandNavbar onStart={openContactSalesModal} />

      {/* ─── 02. Hero: the headline, then a full-screen film that rises over it ─── */}
      <BrandHero />

      {/* ─── 03. The problem: a café launch as one sentence, edited by Gradient as it comes into view ─── */}
      <BrandCompare />

      {/* ─── 04. How it works: four chapters that assemble as you scroll, from the demand map to the network ─── */}
      <BrandFeatures />

      {/* ─── 05. The product: the brand's own dashboard, playing a trial from day 1 to day 21 ─── */}
      <BrandDashboard />

      {/* ─── 06. Why only Gradient: the 3 network moats, demand telemetry, piggyback sampling and PO conversion ─── */}
      <BrandMoat />

      {/* ─── 07. Everything at a glance: a bento board that flies together on scroll, every tile live ─── */}
      <BrandBento />

      {/* ─── 08. The ask: one line, one button ─── */}
      <BrandClose onStart={openContactSalesModal} />

      {/* ─── 09. Footer: the same animated gradient wordmark as the main site, in brand purple ─── */}
      <G365Footer />
    </>
  );
}
