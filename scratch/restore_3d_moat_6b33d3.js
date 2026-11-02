const { execSync } = require('child_process');
const fs = require('fs');

// 1. Get 167d4dd versions
let moatTsx = execSync('git show 167d4dd:src/components/brand/BrandMoat.tsx', { encoding: 'utf8' });
let moatCss = execSync('git show 167d4dd:src/app/brand/brand-moat.css', { encoding: 'utf8' });

console.log('Original 167d4dd BrandMoat.tsx length:', moatTsx.length);
console.log('Original 167d4dd brand-moat.css length:', moatCss.length);

// 2. Color replacements for BrandMoat.tsx
// Map any old purple colors (#9333EA, #A855F7, #7C4DDB, #502B9A, etc.) to #6B33D3 system
const tsxReplacements = [
  ['#502B9A', '#6B33D3'],
  ['#502b9a', '#6b33d3'],
  ['#9333EA', '#6B33D3'],
  ['#9333ea', '#6b33d3'],
  ['#7C4DDB', '#6B33D3'],
  ['#7c4ddb', '#6b33d3'],
  ['#7F48E8', '#6B33D3'],
  ['#7f48e8', '#6b33d3'],
  ['#A855F7', '#B491F5'],
  ['#a855f7', '#b491f5'],
  ['#C084FC', '#D9C6FA'],
  ['#c084fc', '#d9c6fa'],
  ['rgba(168, 85, 247,', 'rgba(107, 51, 211,'],
  ['rgba(147, 51, 234,', 'rgba(107, 51, 211,'],
  ['rgba(124, 77, 219,', 'rgba(107, 51, 211,'],
  ['rgba(127, 72, 232,', 'rgba(107, 51, 211,'],
  ['rgba(80, 43, 154,', 'rgba(107, 51, 211,']
];

for (const [from, to] of tsxReplacements) {
  moatTsx = moatTsx.split(from).join(to);
}

// 3. Color replacements for brand-moat.css
const cssReplacements = [
  ['#502B9A', '#6B33D3'],
  ['#502b9a', '#6b33d3'],
  ['#9333EA', '#6B33D3'],
  ['#9333ea', '#6b33d3'],
  ['#7C4DDB', '#6B33D3'],
  ['#7c4ddb', '#6b33d3'],
  ['#7F48E8', '#6B33D3'],
  ['#7f48e8', '#6b33d3'],
  ['#A855F7', '#B491F5'],
  ['#a855f7', '#b491f5'],
  ['#C084FC', '#D9C6FA'],
  ['#c084fc', '#d9c6fa'],
  ['#E9D5FF', '#F5F0FF'],
  ['rgba(168, 85, 247,', 'rgba(107, 51, 211,'],
  ['rgba(147, 51, 234,', 'rgba(107, 51, 211,'],
  ['rgba(124, 77, 219,', 'rgba(107, 51, 211,'],
  ['rgba(127, 72, 232,', 'rgba(107, 51, 211,'],
  ['rgba(80, 43, 154,', 'rgba(107, 51, 211,']
];

for (const [from, to] of cssReplacements) {
  moatCss = moatCss.split(from).join(to);
}

// Write restored files
fs.writeFileSync('src/components/brand/BrandMoat.tsx', moatTsx, 'utf8');
fs.writeFileSync('src/app/brand/brand-moat.css', moatCss, 'utf8');

console.log('Successfully wrote BrandMoat.tsx and brand-moat.css with #6B33D3 colors.');

