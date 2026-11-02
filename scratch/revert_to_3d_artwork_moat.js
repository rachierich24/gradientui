const { execSync } = require('child_process');
const fs = require('fs');

// 1. Get 8a8cf15 versions
let moatTsx = execSync('git show 8a8cf15:src/components/brand/BrandMoat.tsx', { encoding: 'utf8' });
let moatCss = execSync('git show 8a8cf15:src/app/brand/brand-moat.css', { encoding: 'utf8' });

console.log('Original 8a8cf15 BrandMoat.tsx length:', moatTsx.length);
console.log('Original 8a8cf15 brand-moat.css length:', moatCss.length);

// 2. Color mappings for TSX
const colorMap = [
  ['#502B9A', '#6B33D3'],
  ['#502b9a', '#6b33d3'],
  ['rgba(80, 43, 154,', 'rgba(107, 51, 211,'],
  ['rgba(80,43,154,', 'rgba(107, 51, 211,'],
  ['#3A1F70', '#5522B8'],
  ['#3a1f70', '#5522b8'],
  ['#251448', '#2B1454'],
  ['#251448', '#2b1454'],
  ['#7F48E8', '#6B33D3'],
  ['#7f48e8', '#6b33d3'],
  ['rgba(127, 72, 232,', 'rgba(107, 51, 211,'],
  ['rgba(127,72,232,', 'rgba(107, 51, 211,'],
  ['#F3EDFD', '#F5F0FF'],
  ['#f3edfd', '#f5f0ff'],
];

for (const [from, to] of colorMap) {
  moatTsx = moatTsx.split(from).join(to);
  moatCss = moatCss.split(from).join(to);
}

// Write the files
fs.writeFileSync('src/components/brand/BrandMoat.tsx', moatTsx, 'utf8');
fs.writeFileSync('src/app/brand/brand-moat.css', moatCss, 'utf8');

console.log('Successfully restored BrandMoat.tsx and brand-moat.css to the 3D wireframe artwork version with #6B33D3.');
