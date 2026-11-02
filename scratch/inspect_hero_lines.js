const fs = require('fs');
const brandHero = fs.readFileSync('src/components/brand/BrandHero.tsx', 'utf8');
const lines = brandHero.split('\n');
console.log('BrandHero.tsx lines 1-120:');
for (let i = 0; i < 120 && i < lines.length; i++) {
  console.log((i+1) + ': ' + lines[i]);
}

