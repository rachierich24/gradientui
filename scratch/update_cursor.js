const fs = require('fs');
let code = fs.readFileSync('src/components/landing/ProductSections.tsx', 'utf8');

const oldSupplier = `const supplierCursorCoords = [
    { x: '52%', y: '160px', label: 'Parse WhatsApp PO' },
    { x: '42%', y: '335px', label: 'Auto Batch Allocated' },
    { x: '75%', y: '315px', label: 'Dispatch Morning Fleet' },
  ];`;

const newSupplier = `const supplierCursorCoords = [
    { x: '35%', y: '230px', label: 'Parse WhatsApp PO' },
    { x: '75%', y: '190px', label: 'Roast Batch #4 (180kg)' },
    { x: '75%', y: '295px', label: 'Dispatch Morning Fleet' },
  ];`;

const oldBrand = `const brandCursorCoords = [
    { x: '55%', y: '165px', label: 'Filter 150 Specialty Cafés' },
    { x: '68%', y: '260px', label: 'Deploy Barista Sampling Kits' },
    { x: '45%', y: '345px', label: '94% Barista Approval Score' },
  ];`;

const newBrand = `const brandCursorCoords = [
    { x: '35%', y: '235px', label: 'Deploy Barista Sampling Flight' },
    { x: '75%', y: '190px', label: '94.2% SCA Cupping Score' },
    { x: '75%', y: '330px', label: 'Convert to Net-15 Standing PO' },
  ];`;

code = code.replace(oldSupplier, newSupplier);
code = code.replace(oldBrand, newBrand);

// If CRLF
code = code.replace(oldSupplier.replace(/\n/g, '\r\n'), newSupplier.replace(/\n/g, '\r\n'));
code = code.replace(oldBrand.replace(/\n/g, '\r\n'), newBrand.replace(/\n/g, '\r\n'));

fs.writeFileSync('src/components/landing/ProductSections.tsx', code, 'utf8');
console.log('Successfully updated cursor coords!');
