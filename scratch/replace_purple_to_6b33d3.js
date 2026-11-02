const fs = require('fs');
const path = require('path');

function getAllFiles(dir, exts = ['.css', '.tsx', '.ts']) {
  let res = [];
  fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      res = res.concat(getAllFiles(full, exts));
    } else if (exts.includes(path.extname(entry.name))) {
      res.push(full);
    }
  });
  return res;
}

const files = getAllFiles('src');
let totalReplacements = 0;

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // 1. Hex color replacements (case-insensitive for #502B9A)
  content = content.replace(/#502[bB]9[aA]/g, '#6B33D3');

  // 2. RGBA replacements (rgba(80, 43, 154, X) -> rgba(107, 51, 211, X))
  content = content.replace(/rgba\(\s*80\s*,\s*43\s*,\s*154\s*,/g, 'rgba(107, 51, 211,');

  // 3. Dependent darker/lighter shades if present
  content = content.replace(/#3[aA]1[fF]70/g, '#5522B8');
  content = content.replace(/#251448/g, '#2B1454');
  content = content.replace(/#F3EDFD/gi, '#F5F0FF');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    const count = (original.match(/#502[bB]9[aA]|rgba\(\s*80\s*,\s*43\s*,\s*154\s*,/g) || []).length;
    totalReplacements += count;
    console.log(`Updated ${filePath} (${count} replacements)`);
  }
});

console.log(`\nSuccessfully replaced all purple colors to #6B33D3 and rgba(107, 51, 211, ...)! Total: ${totalReplacements}`);

