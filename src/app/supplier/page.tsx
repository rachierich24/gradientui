'use client';

import React from 'react';
import {
  SupplierNavbar,
  SupplierHeroScene,
  SupplierChaosFlow,
  SupplierGrowth,
  SupplierBentoFeatures,
  SupplierBillSyncAudit,
  SupplierLogos,
  SupplierBenefits,
  SupplierWorkflowSteps,
  SupplierInventory,
  SupplierLogistics,
  SupplierAnalytics,
  SupplierIntegrations,
  SupplierTrust,
  SupplierFaq,
  SupplierCta,
} from '@/components/supplier';
import { openContactSalesModal } from '@/components/ContactSalesModal';
import { G365Footer } from '@/components/landing/G365';

export default function SupplierPortalPage() {
  const handleJoinClick = () => {
    openContactSalesModal();
  };

  const handleExploreClick = () => {
    const el = document.getElementById('order-workspace');
    if (el) {
      if (typeof window !== 'undefined' && (window as unknown as { lenis?: { scrollTo: (target: string | HTMLElement, opts?: { immediate?: boolean }) => void } }).lenis) {
        (window as unknown as { lenis: { scrollTo: (target: string | HTMLElement, opts?: { immediate?: boolean }) => void } }).lenis.scrollTo(el, { immediate: false });
      } else {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="supplier-portal-root">
      {/* ─── 01. Minimal Top Navigation ─── */}
      <SupplierNavbar onJoinClick={handleJoinClick} />

      {/* ─── 02 & 03. Relume-Inspired Hero Scene: 3D Packaging, Editorial Typography, Input Card & Pinned Rising Dashboard on Green Cutting Mat ─── */}
      <SupplierHeroScene onJoinClick={handleJoinClick} />

      {/* ─── 03b. Before Gradient → one truck: the WhatsApp-and-spreadsheet chaos gathered into one delivery run ─── */}
      <SupplierChaosFlow />

      {/* ─── 04. Five-Tile Asymmetric Bento Feature Section (Core Supplier Capabilities) ─── */}
      <SupplierBentoFeatures />

      {/* ─── 04b. Results: what selling through Gradient did to a supplier's month (after order history) ─── */}
      <SupplierGrowth />

      {/* ─── 04c. AI Bill Sync, Automated GST & CA Audit Vault ─── */}
      <SupplierBillSyncAudit />

      {/* ─── 05. Relume-Style Partner Logo Ticker (Section Immediately after Dashboard) ─── */}
      <SupplierLogos />

      {/* ─── 06. Operational Benefits (Interactive Bento Grid) ─── */}
      <SupplierBenefits />

      {/* ─── 07. Ordering Lifecycle (Synchronized 3-Step Journey) ─── */}
      <SupplierWorkflowSteps />

      {/* ─── 08. Inventory & Catalogue Controls (Private Pricing Wall) ─── */}
      <SupplierInventory />

      {/* ─── 09. Dispatch, Logistics & Crate Tracking (Crate #C-88) ─── */}
      <SupplierLogistics />

      {/* ─── 10. Supplier Performance & Telemetry (Predictive Forecast) ─── */}
      <SupplierAnalytics />

      {/* ─── 11. Integrations Hub (Tally, Zoho & Live Webhook Simulator) ─── */}
      <SupplierIntegrations />

      {/* ─── 12. Trust, Verification & Reliability (FSSAI & Uptime Heartbeat) ─── */}
      <SupplierTrust />

      {/* ─── 13. Frequently Asked Questions (Filtered Accordion) ─── */}
      <SupplierFaq />

      {/* ─── 14. High-Impact Conversion CTA (Quick Onboarding Card) ─── */}
      <SupplierCta onJoinClick={handleJoinClick} />

      {/* ─── 15. Footer: the same animated gradient wordmark as the main site ─── */}
      <G365Footer />
    </div>
  );
}
