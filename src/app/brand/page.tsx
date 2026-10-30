'use client';

import { BrandNavbar, BrandHero, BrandDashboard, BrandMoat, BrandTransformation, BrandMarketing } from '@/components/brand';
import { openContactSalesModal } from '@/components/ContactSalesModal';
import { G365Footer } from '@/components/landing/G365';

export default function BrandPortalPage() {
  return (
    <>
      {/* ─── 01. Top navigation (light text while it's over the hero) ─── */}
      <BrandNavbar onStart={openContactSalesModal} />

      {/* ─── 02. Hero: a dark band with the headline, then a full-screen film that rises on scroll ─── */}
      <BrandHero />

      {/* ─── 02b. The brand's own dashboard: slides in from the left, then plays a trial from day 1 to day 21 ─── */}
      <BrandDashboard />

      {/* ─── 02c. The 3 Brand Network Moats: Demand Telemetry, Piggyback Sampling & PO Conversion ─── */}
      <BrandMoat />

      {/* ─── 02d. Transformation: From fragmented supplier operations to one connected ecosystem ─── */}
      <BrandTransformation />

      {/* ─── 03. How we market for you: a wall of cells that acts out each move, from reading demand to the reorder ─── */}
      <BrandMarketing />

      {/* ─── 04. Footer: the same animated gradient wordmark as the main site, in brand purple ─── */}
      <G365Footer />
    </>
  );
}
