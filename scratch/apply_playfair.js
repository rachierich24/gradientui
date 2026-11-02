const fs = require('fs');
let css = fs.readFileSync('src/app/brand/brand.css', 'utf8');

const replacement = `.brd-txt-for {
  font-size: clamp(34px, 4.4vw, 60px);
  font-weight: 500;
  font-style: italic;
  font-family: var(--font-playfair, 'Playfair Display', serif);
  color: #502B9A;
  letter-spacing: -0.01em;
  line-height: 1;
  transform: none;
  display: inline-block;
  margin-left: 8px;
}`;

css = css.replace(/\.brd-txt-for\s*\{[\s\S]*?\}/, replacement);

fs.writeFileSync('src/app/brand/brand.css', css, 'utf8');
console.log('Applied Playfair Display Italic successfully!');
