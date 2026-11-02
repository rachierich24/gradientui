const fs = require('fs');
const brandNav = fs.readFileSync('src/components/brand/BrandNavbar.tsx', 'utf8');
console.log('BrandNavbar.tsx buttons:');
brandNav.split('\n').forEach((l, idx) => {
  if (l.includes('button') || l.includes('brd-btn') || l.includes('btn') || l.includes('cta')) {
    console.log((idx + 1) + ': ' + l.trim());
  }
});

const brandHero = fs.readFileSync('src/components/brand/BrandHero.tsx', 'utf8');
console.log('\nBrandHero.tsx buttons:');
brandHero.split('\n').forEach((l, idx) => {
  if (l.includes('button') || l.includes('brd-btn') || l.includes('btn') || l.includes('cta')) {
    console.log((idx + 1) + ': ' + l.trim());
  }
});

