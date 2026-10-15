const fs = require('fs');
let code = fs.readFileSync('src/components/landing/ProductSections.tsx', 'utf8');

const target = 'aria-label="Brand growth and telemetry workspace"';
const repl = 'data-lenis-prevent\n                  aria-label="Brand growth and telemetry workspace"';

code = code.replace(target, repl);
fs.writeFileSync('src/components/landing/ProductSections.tsx', code, 'utf8');
console.log('Successfully updated BrandSection with data-lenis-prevent!');
