const fs = require('fs');
const content = fs.readFileSync('src/components/landing/ProductSections.tsx', 'utf8');
const supplierIdx = content.indexOf('function SupplierSection');
const nextSectionIdx = content.indexOf('function BrandSection');
const s = content.substring(supplierIdx, nextSectionIdx);
const lines = s.split('\n');
lines.forEach((l, i) => {
  if (l.includes('<section') || l.includes('className="product-stage') || l.includes('return (')) {
    console.log(i + ': ' + l);
  }
});
