const fs = require('fs');
let css = fs.readFileSync('src/app/brand/brand.css', 'utf8');

const replacement = `.brd-txt-for {
  font-size: clamp(38px, 5.0vw, 70px);
  font-weight: 400;
  font-style: normal;
  font-family: var(--font-alex-brush, 'Alex Brush', var(--font-parisienne, 'Parisienne', cursive));
  color: #502B9A;
  letter-spacing: 0.02em;
  line-height: 1;
  transform: rotate(-3deg);
  display: inline-block;
  margin-left: 6px;
}`;

css = css.replace(/\.brd-txt-for\s*\{[\s\S]*?\}/, replacement);

fs.writeFileSync('src/app/brand/brand.css', css, 'utf8');
console.log('Applied Alex Brush cursive font successfully!');

