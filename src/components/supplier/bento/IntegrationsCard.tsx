'use client';
// Integrations: 3D interactive Icon Cloud displaying the wholesale tools a supplier runs on:
// Tally, Zoho Books, QuickBooks, Razorpay, PhonePe, Paytm, Shiprocket, Delhivery, WhatsApp, Sheets, Excel, SAP, etc.
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { IconCloud } from '@/components/ui/icon-cloud';
import { useEvery } from './shared';
import { INTEGRATION_TOOLS } from './integration-icons';

const INTEGRATION_IMAGES = INTEGRATION_TOOLS.map((t) => t.icon);
const TOOL_NAMES = INTEGRATION_TOOLS.map((t) => t.name);

export function IntegrationsCard({ run }: { run: boolean }) {
  const [activeIdx, setActiveIdx] = useState(0);

  // Periodically cycle the active integration indicator
  useEvery(2200, run, () => {
    setActiveIdx((prev) => (prev + 1) % TOOL_NAMES.length);
  });

  return (
    <div className="sbx-int">
      <div className="sbx-cloud-wrap">
        <IconCloud
          images={INTEGRATION_IMAGES}
          radius={142}
          iconSize={58}
          showControl={false}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeIdx}
          className="sbx-sync"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
        >
          <i style={{ background: '#1FA952' }} />
          <span>Live sync with <b>{TOOL_NAMES[activeIdx]}</b></span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
