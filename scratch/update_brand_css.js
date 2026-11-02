const fs = require('fs');
let css = fs.readFileSync('src/app/brand/brand.css', 'utf8');

// Fix brd-login back to 600
css = css.replace('.brd-login {\r\n  padding: 8px 14px;\r\n  border-radius: 8px;\r\n  font-size: 14.5px;\r\n  font-weight: 400;', '.brd-login {\r\n  padding: 8px 14px;\r\n  border-radius: 8px;\r\n  font-size: 14.5px;\r\n  font-weight: 600;');
css = css.replace('.brd-login {\n  padding: 8px 14px;\n  border-radius: 8px;\n  font-size: 14.5px;\n  font-weight: 400;', '.brd-login {\n  padding: 8px 14px;\n  border-radius: 8px;\n  font-size: 14.5px;\n  font-weight: 600;');

// Update .brd-txt-for
const forBlock = `.brd-txt-for {
  font-size: clamp(36px, 4.6vw, 64px);
  font-weight: 400;
  font-style: normal;
  font-family: var(--font-parisienne, 'Parisienne', var(--font-alex-brush, 'Alex Brush', cursive));
  color: #502B9A;
  letter-spacing: 0.02em;
  line-height: 1;
  transform: rotate(-4deg);
  display: inline-block;
  margin-left: 6px;
}`;

css = css.replace(/\.brd-txt-for\s*\{[\s\S]*?\}/, forBlock);

fs.writeFileSync('src/app/brand/brand.css', css, 'utf8');
console.log('Fixed brand.css successfully!');
