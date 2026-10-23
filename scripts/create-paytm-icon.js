const fs = require('fs');

// Read the raw Wikimedia SVG
const orig = fs.readFileSync('public/logos/integrations/paytm.svg', 'utf8');

// We know the viewBox of the original is 0 0 16.837998 5.2849998
// Let's create an SVG that embeds the original with <svg viewBox="0 0 16.838 5.285"> inside a 100x100 squircle
// Nested SVG is standard SVG and handles scaling and centering automatically!
const targetW = 82;
const targetH = targetW / (16.838 / 5.285); // 25.72
const targetX = (100 - targetW) / 2; // 9
const targetY = (100 - targetH) / 2; // 37.14

// Extract the contents inside <svg ...> ... </svg>
const innerMatch = orig.match(/<svg[^>]*>([\s\S]*)<\/svg>/i);
const innerContent = innerMatch ? innerMatch[1] : '';

const newPaytmSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 100 100">
  <!-- White squircle base like official Paytm App Icon -->
  <rect width="100" height="100" rx="22" fill="#FFFFFF"/>
  <rect width="97" height="97" x="1.5" y="1.5" rx="20.5" fill="none" stroke="#E6EEF8" stroke-width="2"/>
  
  <!-- Authentic official Paytm logo centered with exact proportions -->
  <svg x="${targetX}" y="${targetY}" width="${targetW}" height="${targetH}" viewBox="0 0 16.837998 5.2849998">
    ${innerContent}
  </svg>
</svg>
`;

fs.writeFileSync('public/logos/integrations/paytm.svg', newPaytmSvg, 'utf8');
console.log('Saved perfected square Paytm icon!');
