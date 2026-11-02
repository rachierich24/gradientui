const { chromium } = require('playwright');
const path = require('path');

const FONTS = [
  {
    id: 'alex_brush',
    name: '1. Alex Brush',
    family: "var(--font-alex-brush, 'Alex Brush', cursive)",
    size: 'clamp(38px, 5.0vw, 70px)',
    transform: 'rotate(-3deg)',
    weight: '400',
    letterSpacing: '0.02em',
    style: 'normal',
    desc: 'Graceful, fluid calligraphic cursive with elegant swoops.'
  },
  {
    id: 'parisienne',
    name: '2. Parisienne',
    family: "var(--font-parisienne, 'Parisienne', cursive)",
    size: 'clamp(36px, 4.6vw, 64px)',
    transform: 'rotate(-4deg)',
    weight: '400',
    letterSpacing: '0.02em',
    style: 'normal',
    desc: 'Chic French hand-lettering script with delicate loops.'
  },
  {
    id: 'italianno',
    name: '3. Italianno',
    family: "var(--font-italianno, 'Italianno', cursive)",
    size: 'clamp(46px, 6.0vw, 84px)',
    transform: 'rotate(-4deg)',
    weight: '400',
    letterSpacing: '0.02em',
    style: 'normal',
    desc: 'Slender, high-fashion Italian calligraphy with dramatic slope.'
  },
  {
    id: 'great_vibes',
    name: '4. Great Vibes',
    family: "var(--font-great-vibes, 'Great Vibes', cursive)",
    size: 'clamp(38px, 4.8vw, 68px)',
    transform: 'rotate(-3deg)',
    weight: '400',
    letterSpacing: '0.02em',
    style: 'normal',
    desc: 'Flourished, smooth cursive script with clean connective tails.'
  },
  {
    id: 'windsong',
    name: '5. WindSong',
    family: "var(--font-windsong, 'WindSong', cursive)",
    size: 'clamp(40px, 5.2vw, 72px)',
    transform: 'rotate(-5deg)',
    weight: '400',
    letterSpacing: '0.01em',
    style: 'normal',
    desc: 'Bespoke, rapid fluid signature handwriting with artistic flair.'
  },
  {
    id: 'sacramento',
    name: '6. Sacramento',
    family: "var(--font-sacramento, 'Sacramento', cursive)",
    size: 'clamp(42px, 5.2vw, 74px)',
    transform: 'rotate(-2deg)',
    weight: '400',
    letterSpacing: '0.01em',
    style: 'normal',
    desc: 'Monoline mid-century script, clean, modern, and perfectly legible.'
  }
];

async function capture() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000/brand...');
  await page.goto('http://localhost:3000/brand', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(2000);

  await page.evaluate(() => {
    document.querySelectorAll('.cky-consent-container, [aria-label*="cookie"]').forEach(el => el.remove());
  });

  const outDir = 'C:/Users/shriyansh Sharma/.gemini/antigravity/brain/19c4ab20-86a1-42ea-b5b2-b8140e9268b8';

  for (const f of FONTS) {
    console.log(`Applying ${f.name}...`);
    await page.evaluate((cfg) => {
      const el = document.querySelector('.brd-txt-for');
      if (el) {
        el.style.fontFamily = cfg.family;
        el.style.fontSize = cfg.size;
        el.style.transform = cfg.transform;
        el.style.fontWeight = cfg.weight;
        el.style.fontStyle = cfg.style;
        el.style.letterSpacing = cfg.letterSpacing;
      }
    }, f);

    await page.waitForTimeout(400);

    const lockupEl = await page.$('.brd-hero-title-lockup');
    if (lockupEl) {
      const box = await lockupEl.boundingBox();
      await page.screenshot({
        path: path.join(outDir, `cursive_${f.id}.png`),
        clip: {
          x: Math.max(0, box.x - 40),
          y: Math.max(0, box.y - 20),
          width: box.width + 80,
          height: Math.min(360, box.height + 40)
        }
      });
      console.log(`Saved cursive_${f.id}.png`);
    }
  }

  await browser.close();
  console.log('All cursive options captured!');
}

capture().catch(console.error);

