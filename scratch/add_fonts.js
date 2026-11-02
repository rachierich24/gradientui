const fs = require('fs');
let code = fs.readFileSync('src/app/layout.tsx', 'utf8');

const fontDefinitions = `
const alexBrush = Alex_Brush({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-alex-brush',
  display: 'swap',
})

const parisienne = Parisienne({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-parisienne',
  display: 'swap',
})

const sacramento = Sacramento({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-sacramento',
  display: 'swap',
})

const homemadeApple = Homemade_Apple({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-homemade-apple',
  display: 'swap',
})

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
})
`;

// Insert after caveat declaration
const caveatIdx = code.indexOf("variable: '--font-caveat'");
if (caveatIdx !== -1) {
  const closeIdx = code.indexOf('})', caveatIdx) + 2;
  code = code.slice(0, closeIdx) + fontDefinitions + code.slice(closeIdx);
}

// Update className on <html>
code = code.replace(
  '${plusJakarta.variable} ${caveat.variable}',
  '${plusJakarta.variable} ${caveat.variable} ${alexBrush.variable} ${parisienne.variable} ${sacramento.variable} ${homemadeApple.variable} ${playfairDisplay.variable}'
);

fs.writeFileSync('src/app/layout.tsx', code, 'utf8');
console.log('Successfully updated src/app/layout.tsx with cursive fonts!');

