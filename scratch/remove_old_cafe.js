const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/landing/ProductSections.tsx');
const content = fs.readFileSync(filePath, 'utf8');

const markerStart = 'function CafeSection({ isMobile }: { isMobile: boolean }) {';
const markerEnd = '/* ═════════════════════════════════════════════════════════════════════════\r\n   SECTION 02: SUPPLIER PRODUCT';
const markerEndAlt = '/* ═════════════════════════════════════════════════════════════════════════\n   SECTION 02: SUPPLIER PRODUCT';

let endIdx = content.indexOf(markerEnd);
if (endIdx === -1) {
  endIdx = content.indexOf(markerEndAlt);
}

const startIdx = content.indexOf(markerStart);

if (startIdx !== -1 && endIdx !== -1) {
  const newContent = content.substring(0, startIdx) + content.substring(endIdx);
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log('Successfully removed old CafeSection!');
} else {
  console.error('Could not find markers', { startIdx, endIdx });
}
