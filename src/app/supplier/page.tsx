'use client';

import React from 'react';
import {
  SupplierNavbar,
  SupplierHeroScene,
  SupplierChaosFlow,
  SupplierBentoFeatures,
  SupplierBillSyncAudit,
  SupplierGrowth,
  SupplierFaq,
  SupplierCta,
} from '@/components/supplier';
import { openContactSalesModal } from '@/components/ContactSalesModal';
import { G365Footer } from '@/components/landing/G365';

export default function SupplierPortalPage() {
  const handleJoinClick = () => {
    openContactSalesModal();
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

      {/* ─── 04a. Results: what selling through Gradient did to a supplier's month ─── */}
      <SupplierGrowth />

      {/* ─── 04b. AI Bill Sync, Automated GST & CA Audit Vault ─── */}
      <SupplierBillSyncAudit />

      {/* ─── 13. Frequently Asked Questions (Filtered Accordion) ─── */}
      <SupplierFaq />

      {/* ─── 14. High-Impact Conversion CTA (Quick Onboarding Card) ─── */}
      <SupplierCta />

      {/* ─── 15. Footer: the same animated gradient wordmark as the main site ─── */}
      <G365Footer />
    </div>
  );
}
