const fs = require('fs');
const path = require('path');

function searchInDir(dir) {
  fs.readdirSync(dir).forEach(f => {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) searchInDir(full);
    else if (/\.(tsx|css)$/.test(f)) {
      const content = fs.readFileSync(full, 'utf8');
      const matches = content.match(/brd-btn[^\s\"\'\`]+/g);
      if (matches) {
        console.log(full, [...new Set(matches)]);
      }
    }
  });
}

searchInDir('src');

