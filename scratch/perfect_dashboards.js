const fs = require('fs');
const path = require('path');

// 1. Update ProductSections.tsx
const prodPath = path.join(__dirname, '../src/components/landing/ProductSections.tsx');
let prod = fs.readFileSync(prodPath, 'utf8');

// Replace whatsappPOs.slice(0, 4) with slice(0, 2)
prod = prod.replace('whatsappPOs.slice(0, 4)', 'whatsappPOs.slice(0, 2)');

// Replace campaigns.slice(0, 4) with slice(0, 2)
prod = prod.replace('campaigns.slice(0, 4)', 'campaigns.slice(0, 2)');

// Ensure mainScrollRef resets scrollTop to 0 on mount in SupplierSection
const supplierMountReset = `  useEffect(() => {
    if (mainScrollRef.current) mainScrollRef.current.scrollTop = 0;
  }, []);`;
if (!prod.includes(supplierMountReset)) {
  prod = prod.replace(
    'const [whatsappPOs, setWhatsappPOs] = useState<WhatsAppPO[]>(INITIAL_WHATSAPP_POS);',
    `const [whatsappPOs, setWhatsappPOs] = useState<WhatsAppPO[]>(INITIAL_WHATSAPP_POS);\n${supplierMountReset}`
  );
}

// Ensure mainScrollRef resets scrollTop to 0 on mount in BrandSection
const brandMountReset = `  useEffect(() => {
    if (mainScrollRef.current) mainScrollRef.current.scrollTop = 0;
  }, []);`;
if (!prod.includes('const [campaigns, setCampaigns] = useState<BrandCampaign[]>(INITIAL_BRAND_CAMPAIGNS);\n' + brandMountReset)) {
  prod = prod.replace(
    'const [campaigns, setCampaigns] = useState<BrandCampaign[]>(INITIAL_BRAND_CAMPAIGNS);',
    `const [campaigns, setCampaigns] = useState<BrandCampaign[]>(INITIAL_BRAND_CAMPAIGNS);\n${brandMountReset}`
  );
}

// Clean up feature click handlers in SupplierSection
prod = prod.replace(
  "onClick={() => { setActiveFeature(0); scrollToAnchor('sup-catalog-table', 'catalog'); }}",
  "onClick={() => { setActiveFeature(0); showToast('Roast par schedule synced: 180kg scheduled'); }}"
);
prod = prod.replace(
  "onClick={() => { setActiveFeature(1); scrollToAnchor('sup-whatsapp-section', 'whatsapp'); }}",
  "onClick={() => { setActiveFeature(1); handleSimulateWhatsAppPO(); }}"
);
prod = prod.replace(
  "onClick={() => { setActiveFeature(2); scrollToAnchor('sup-route-section', 'routes'); }}",
  "onClick={() => { setActiveFeature(2); showToast('Morning van routes dispatched: 34 café deliveries'); }}"
);

// Clean up feature click handlers in BrandSection
prod = prod.replace(
  "onClick={() => { setActiveFeature(0); scrollToAnchor('brand-campaigns-table', 'campaigns'); }}",
  "onClick={() => { setActiveFeature(0); showToast('Filtering 312 specialty cafés across BLR, BOM, DEL'); }}"
);
prod = prod.replace(
  "onClick={() => { setActiveFeature(1); scrollToAnchor('brand-telemetry-section', 'telemetry'); }}",
  "onClick={() => { setActiveFeature(1); setShowNewCampaignModal(true); }}"
);
prod = prod.replace(
  "onClick={() => { setActiveFeature(2); scrollToAnchor('brand-funnel-section', 'funnel'); }}",
  "onClick={() => { setActiveFeature(2); showToast('78% trial-to-PO conversion rate · Standing Net-15'); }}"
);
prod = prod.replace(
  "onClick={() => { setActiveFeature(3); scrollToAnchor('brand-share-section', 'share'); }}",
  "onClick={() => { setActiveFeature(3); showToast('Market velocity: 4,200L/month oat milk consumed'); }}"
);

fs.writeFileSync(prodPath, prod, 'utf8');
console.log('Successfully updated ProductSections.tsx');
