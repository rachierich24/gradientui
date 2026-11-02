const fs = require('fs');

function replaceInFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  let count = 0;
  for (const [target, replacement] of replacements) {
    if (typeof target === 'string') {
      const parts = content.split(target);
      if (parts.length > 1) {
        count += parts.length - 1;
        content = parts.join(replacement);
      }
    } else if (target instanceof RegExp) {
      const matches = content.match(target);
      if (matches) {
        count += matches.length;
        content = content.replace(target, replacement);
      }
    }
  }
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${filePath}: ${count} replacements.`);
}

// 1. brand-moat.css
replaceInFile('src/app/brand/brand-moat.css', [
  ['#7F48E8', '#6B33D3'],
  ['#7f48e8', '#6b33d3'],
  ['rgba(127, 72, 232,', 'rgba(107, 51, 211,'],
  ['rgba(127,72,232,', 'rgba(107, 51, 211,']
]);

// 2. BrandMoat.tsx
replaceInFile('src/components/brand/BrandMoat.tsx', [
  ['#7F48E8', '#6B33D3'],
  ['#7f48e8', '#6b33d3'],
  ['rgba(127, 72, 232,', 'rgba(107, 51, 211,'],
  ['rgba(127,72,232,', 'rgba(107, 51, 211,']
]);

// 3. Moat3DArtwork.tsx
replaceInFile('src/components/brand/Moat3DArtwork.tsx', [
  ['#7F48E8', '#6B33D3'],
  ['#7f48e8', '#6b33d3']
]);

// 4. TrialMap.tsx
replaceInFile('src/components/brand/TrialMap.tsx', [
  ['#7F48E8', '#6B33D3'],
  ['#7f48e8', '#6b33d3']
]);

// 5. TrialMap3D.tsx
replaceInFile('src/components/brand/TrialMap3D.tsx', [
  ['#7F48E8', '#6B33D3'],
  ['#7f48e8', '#6b33d3']
]);

// 6. brand-transformation.css
replaceInFile('src/app/brand/brand-transformation.css', [
  ['#6A3BC8', '#6B33D3'],
  ['#6a3bc8', '#6b33d3'],
  ['#7C4DDB', '#6B33D3'],
  ['#7c4ddb', '#6b33d3'],
  ['#7F48E8', '#6B33D3'],
  ['#7f48e8', '#6b33d3'],
  ['#5B2BB5', '#5522B8'],
  ['#5b2bb5', '#5522b8'],
  ['rgba(106, 59, 200,', 'rgba(107, 51, 211,'],
  ['rgba(106,59,200,', 'rgba(107, 51, 211,'],
  ['rgba(124, 77, 219,', 'rgba(107, 51, 211,'],
  ['rgba(124,77,219,', 'rgba(107, 51, 211,']
]);

// 7. BrandTransformation.tsx
replaceInFile('src/components/brand/BrandTransformation.tsx', [
  ['#6A3BC8', '#6B33D3'],
  ['#6a3bc8', '#6b33d3'],
  ['#7C4DDB', '#6B33D3'],
  ['#7c4ddb', '#6b33d3'],
  ['#5B2BB5', '#5522B8'],
  ['#5b2bb5', '#5522b8'],
  ['rgba(106, 59, 200,', 'rgba(107, 51, 211,'],
  ['rgba(106,59,200,', 'rgba(107, 51, 211,']
]);

// 8. brand-features.css
replaceInFile('src/app/brand/brand-features.css', [
  ['#5A2CBE', '#6B33D3'],
  ['#5a2cbe', '#6b33d3']
]);

// 9. brand.css
replaceInFile('src/app/brand/brand.css', [
  ['#5B2BB5', '#5522B8'],
  ['#5b2bb5', '#5522b8']
]);

