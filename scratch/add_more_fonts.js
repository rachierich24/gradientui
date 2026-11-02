const fs = require('fs');
let code = fs.readFileSync('src/app/layout.tsx', 'utf8');

// Replace import list
code = code.replace(
  /Playfair_Display,?\s*\}\s*from\s*'next\/font\/google'/,
  "Playfair_Display,\n  Italianno,\n  Great_Vibes,\n  WindSong,\n} from 'next/font/google'"
);

// Add font definitions
const newDefs = `
const italianno = Italianno({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-italianno',
  display: 'swap',
})

const greatVibes = Great_Vibes({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-great-vibes',
  display: 'swap',
})

const windSong = WindSong({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-windsong',
  display: 'swap',
})
`;

const playfairPos = code.indexOf("variable: '--font-playfair'");
if (playfairPos !== -1) {
  const closePos = code.indexOf('})', playfairPos) + 2;
  code = code.slice(0, closePos) + newDefs + code.slice(closePos);
}

// Add variables to html class
code = code.replace(
  '${playfairDisplay.variable}',
  '${playfairDisplay.variable} ${italianno.variable} ${greatVibes.variable} ${windSong.variable}'
);

fs.writeFileSync('src/app/layout.tsx', code, 'utf8');
console.log('Successfully added Italianno, Great_Vibes, WindSong to layout.tsx!');

