const fs = require('fs');
const path = require('path');

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(full));
    } else if (/\.(css|tsx|ts|jsx|js)$/.test(file)) {
      results.push(full);
    }
  });
  return results;
}

const files = getFiles('src');
console.log('--- Buttons in src/ ---');
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((l, idx) => {
    if (/<button|className=.*btn/i.test(l) && !l.includes('//')) {
      // print short summary
      console.log(`${f}:${idx+1} -> ${l.trim().slice(0, 100)}`);
    }
  });
});

