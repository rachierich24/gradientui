const fs = require('fs');
const path = require('path');

// 1. EcosystemShowcase.tsx
const ecoPath = path.join(__dirname, '../src/components/landing/EcosystemShowcase.tsx');
let eco = fs.readFileSync(ecoPath, 'utf8');
eco = eco.replace('aria-label="Grabbit Ecosystem and Café Workflow"', 'aria-label="Gradient Ecosystem and Café Workflow"');
eco = eco.replace('supplier.grabbit.io/live-orders', 'app.gradient365.com/supplier');
eco = eco.replace('brand.grabbit.io/campaigns/trials-funnel', 'app.gradient365.com/brand');
fs.writeFileSync(ecoPath, eco, 'utf8');
console.log('Updated EcosystemShowcase.tsx');

// 2. EcosystemCards.tsx
const cardsPath = path.join(__dirname, '../src/components/landing/EcosystemCards.tsx');
let cards = fs.readFileSync(cardsPath, 'utf8');
cards = cards.replace('aria-label="The Grabbit Ecosystem"', 'aria-label="The Gradient Ecosystem"');
fs.writeFileSync(cardsPath, cards, 'utf8');
console.log('Updated EcosystemCards.tsx');

// 3. IndiaGlobe.tsx
const globePath = path.join(__dirname, '../src/components/landing/IndiaGlobe.tsx');
let globe = fs.readFileSync(globePath, 'utf8');
globe = globe.replace('>T+7<', '>T+1<');
globe = globe.replace('>Settlement SLA<', '>Bank Payout<');
fs.writeFileSync(globePath, globe, 'utf8');
console.log('Updated IndiaGlobe.tsx');
