const fs = require('fs');

function createForkPaths(x1, y1, fromEdge, gap = 11, forkW = 16, r = 5) {
  const dx = forkW - 2 * r;
  if (fromEdge === 'r') {
    const topProng = `M ${x1} ${y1 - gap} L ${x1 + dx} ${y1 - gap} A ${r} ${r} 0 0 1 ${x1 + dx + r} ${y1 - gap + r} L ${x1 + dx + r} ${y1 - r} A ${r} ${r} 0 0 0 ${x1 + forkW} ${y1}`;
    const botProng = `M ${x1} ${y1 + gap} L ${x1 + dx} ${y1 + gap} A ${r} ${r} 0 0 0 ${x1 + dx + r} ${y1 + gap - r} L ${x1 + dx + r} ${y1 + r} A ${r} ${r} 0 0 1 ${x1 + forkW} ${y1}`;
    return { topProng, botProng };
  } else {
    const topProng = `M ${x1} ${y1 - gap} L ${x1 - dx} ${y1 - gap} A ${r} ${r} 0 0 0 ${x1 - dx - r} ${y1 - gap + r} L ${x1 - dx - r} ${y1 - r} A ${r} ${r} 0 0 1 ${x1 - forkW} ${y1}`;
    const botProng = `M ${x1} ${y1 + gap} L ${x1 - dx} ${y1 + gap} A ${r} ${r} 0 0 1 ${x1 - dx - r} ${y1 + gap - r} L ${x1 - dx - r} ${y1 + r} A ${r} ${r} 0 0 0 ${x1 - forkW} ${y1}`;
    return { topProng, botProng };
  }
}

const { topProng, botProng } = createForkPaths(50, 100, 'r');
console.log('Top:', topProng);
console.log('Bot:', botProng);

const html = `<!DOCTYPE html>
<html>
<body style="background:#FAF8F5; padding: 40px; font-family: sans-serif;">
  <h3>Fork Preview</h3>
  <svg width="400" height="200" style="background:#fff; border: 1px solid #ddd; border-radius: 8px;">
    <!-- Left card boundary at x=50 -->
    <line x1="50" y1="40" x2="50" y2="160" stroke="#22C55E" stroke-width="2" />
    
    <!-- Three dots -->
    <circle cx="50" cy="89" r="4.5" fill="#fff" stroke="#22C55E" stroke-width="1.2" />
    <circle cx="50" cy="89" r="2" fill="#22C55E" />
    
    <circle cx="50" cy="100" r="4.5" fill="#fff" stroke="#22C55E" stroke-width="1.2" />
    <circle cx="50" cy="100" r="2" fill="#22C55E" />
    
    <circle cx="50" cy="111" r="4.5" fill="#fff" stroke="#22C55E" stroke-width="1.2" />
    <circle cx="50" cy="111" r="2" fill="#22C55E" />

    <!-- Fork branches -->
    <path d="${topProng}" fill="none" stroke="#22C55E" stroke-width="1.6" stroke-linecap="round" />
    <path d="${botProng}" fill="none" stroke="#22C55E" stroke-width="1.6" stroke-linecap="round" />
    
    <!-- Center trunk -->
    <path d="M 50 100 L 250 100" fill="none" stroke="#22C55E" stroke-width="1.6" stroke-linecap="round" />
    
    <!-- Destination card boundary at x=250 -->
    <line x1="250" y1="40" x2="250" y2="160" stroke="#CDCED2" stroke-width="2" />
    <circle cx="250" cy="100" r="4.5" fill="#fff" stroke="#CDCED2" stroke-width="1.2" />
    <circle cx="250" cy="100" r="2" fill="#CDCED2" />
  </svg>
</body>
</html>`;

fs.writeFileSync('scratch/test_fork.html', html);
console.log('Saved scratch/test_fork.html');
