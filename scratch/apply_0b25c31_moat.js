const { execSync } = require('child_process');
const fs = require('fs');

// 1. Get 0b25c31 versions
let moatTsx = execSync('git show 0b25c31:src/components/brand/BrandMoat.tsx', { encoding: 'utf8' });
let moatCss = execSync('git show 0b25c31:src/app/brand/brand-moat.css', { encoding: 'utf8' });

console.log('0b25c31 moatTsx length:', moatTsx.length);
console.log('0b25c31 moatCss length:', moatCss.length);

// 2. Set default activeIdx to 3 (W4, 118 kg) in DemandIntelligenceWorkspace
moatTsx = moatTsx.replace('const [activeIdx, setActiveIdx] = useState<number>(4);', 'const [activeIdx, setActiveIdx] = useState<number>(3);');

// 3. Set default selectedIdx to 1 (Hillfold) in SamplingFlightsWorkspace
moatTsx = moatTsx.replace('const [selectedIdx, setSelectedIdx] = useState<number>(0);', 'const [selectedIdx, setSelectedIdx] = useState<number>(1);');

// 4. Update purple colors in BrandMoat.tsx to #6B33D3 system
const tsxColors = [
  ['#502B9A', '#6B33D3'],
  ['#502b9a', '#6b33d3'],
  ['#9333EA', '#6B33D3'],
  ['#9333ea', '#6b33d3'],
  ['#7C4DDB', '#6B33D3'],
  ['#7c4ddb', '#6b33d3'],
  ['#7F48E8', '#6B33D3'],
  ['#7f48e8', '#6b33d3'],
  ['#6D28D9', '#6B33D3'],
  ['#6d28d9', '#6b33d3'],
  ['#A855F7', '#B491F5'],
  ['#a855f7', '#b491f5'],
  ['#C084FC', '#D9C6FA'],
  ['#c084fc', '#d9c6fa'],
  ['rgba(168, 85, 247,', 'rgba(107, 51, 211,'],
  ['rgba(168,85,247,', 'rgba(107, 51, 211,'],
  ['rgba(147, 51, 234,', 'rgba(107, 51, 211,'],
  ['rgba(147,51,234,', 'rgba(107, 51, 211,'],
  ['rgba(192, 132, 252,', 'rgba(217, 198, 250,'],
  ['rgba(192,132,252,', 'rgba(217, 198, 250,'],
  ['rgba(124, 77, 219,', 'rgba(107, 51, 211,'],
  ['rgba(124,77,219,', 'rgba(107, 51, 211,'],
  ['rgba(127, 72, 232,', 'rgba(107, 51, 211,'],
  ['rgba(127,72,232,', 'rgba(107, 51, 211,'],
  ['rgba(80, 43, 154,', 'rgba(107, 51, 211,']
];

for (const [from, to] of tsxColors) {
  moatTsx = moatTsx.split(from).join(to);
}

// 5. Update purple colors in brand-moat.css to #6B33D3 system
const cssColors = [
  ['#502B9A', '#6B33D3'],
  ['#502b9a', '#6b33d3'],
  ['#9333EA', '#6B33D3'],
  ['#9333ea', '#6b33d3'],
  ['#7C4DDB', '#6B33D3'],
  ['#7c4ddb', '#6b33d3'],
  ['#7F48E8', '#6B33D3'],
  ['#7f48e8', '#6b33d3'],
  ['#6D28D9', '#6B33D3'],
  ['#6d28d9', '#6b33d3'],
  ['#A855F7', '#B491F5'],
  ['#a855f7', '#b491f5'],
  ['#C084FC', '#D9C6FA'],
  ['#c084fc', '#d9c6fa'],
  ['#E9D5FF', '#F5F0FF'],
  ['#e9d5ff', '#f5f0ff'],
  ['rgba(168, 85, 247,', 'rgba(107, 51, 211,'],
  ['rgba(168,85,247,', 'rgba(107, 51, 211,'],
  ['rgba(147, 51, 234,', 'rgba(107, 51, 211,'],
  ['rgba(147,51,234,', 'rgba(107, 51, 211,'],
  ['rgba(192, 132, 252,', 'rgba(217, 198, 250,'],
  ['rgba(192,132,252,', 'rgba(217, 198, 250,'],
  ['rgba(139, 92, 246,', 'rgba(107, 51, 211,'],
  ['rgba(139,92,246,', 'rgba(107, 51, 211,'],
  ['rgba(126, 34, 206,', 'rgba(85, 34, 184,'],
  ['rgba(126,34,206,', 'rgba(85, 34, 184,'],
  ['rgba(124, 77, 219,', 'rgba(107, 51, 211,'],
  ['rgba(124,77,219,', 'rgba(107, 51, 211,'],
  ['rgba(127, 72, 232,', 'rgba(107, 51, 211,'],
  ['rgba(127,72,232,', 'rgba(107, 51, 211,'],
  ['rgba(80, 43, 154,', 'rgba(107, 51, 211,']
];

for (const [from, to] of cssColors) {
  moatCss = moatCss.split(from).join(to);
}

// 6. Ensure grid has minmax(0, 1fr) to prevent width jumps during transitions
moatCss = moatCss.replace('grid-template-columns: repeat(3, 1fr);', 'grid-template-columns: repeat(3, minmax(0, 1fr));');

fs.writeFileSync('src/components/brand/BrandMoat.tsx', moatTsx, 'utf8');
fs.writeFileSync('src/app/brand/brand-moat.css', moatCss, 'utf8');

console.log('Successfully applied 0b25c31 3D moat with transitions and #6B33D3 colors.');

