const { chromium } = require('playwright');
const path = require('path');

const FONTS = [
  {
    id: 'parisienne',
    name: 'Parisienne (Recommended)',
    css: "var(--font-parisienne, 'Parisienne', cursive)",
    size: 'clamp(36px, 4.6vw, 64px)',
    transform: 'rotate(-4deg)',
    weight: '400',
    letterSpacing: '0.02em',
    desc: 'Chic, Parisian café hand-lettering with fluid, elegant ligatures.'
  },
  {
    id: 'alex_brush',
    name: 'Alex Brush',
    css: "var(--font-alex-brush, 'Alex Brush', cursive)",
    size: 'clamp(38px, 4.8vw, 68px)',
    transform: 'rotate(-3deg)',
    weight: '400',
    letterSpacing: '0.02em',
    desc: 'Graceful, high-end calligraphic flow with classic cursive loops.'
  },
  {
    id: 'sacramento',
    name: 'Sacramento',
    css: "var(--font-sacramento, 'Sacramento', cursive)",
    size: 'clamp(42px, 5.2vw, 74px)',
    transform: 'rotate(-2deg)',
    weight: '400',
    letterSpacing: '0.01em',
    desc: 'Monoline mid-century script, exceptionally clean and balanced.'
  },
  {
    id: 'homemade_apple',
    name: 'Homemade Apple',
    css: "var(--font-homemade-apple, 'Homemade Apple', cursive)",
    size: 'clamp(30px, 3.8vw, 52px)',
    transform: 'rotate(-6deg)',
    weight: '400',
    letterSpacing: '0.01em',
    desc: 'Authentic fountain-pen signature look, intimate and crafted.'
  },
  {
    id: 'playfair_italic',
    name: 'Playfair Display Italic',
    css: "var(--font-playfair, 'Playfair Display', serif)",
    size: 'clamp(32px, 4.2vw, 58px)',
    transform: 'none',
    weight: '500',
    style: 'italic',
    letterSpacing: '0.01em',
    desc: 'Editorial luxury italic (like Stripe / Apple keynote titles).'
  },
  {
    id: 'caveat_original',
    name: 'Caveat (Original)',
    css: "var(--font-caveat, 'Caveat', cursive)",
    size: 'clamp(32px, 4.2vw, 58px)',
    transform: 'rotate(-4deg)',
    weight: '600',
    letterSpacing: '0.01em',
    desc: 'The original marker-style handwriting.'
  }
];

async function captureVariants() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000/brand...');
  await page.goto('http://localhost:3000/brand', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(2000);

  // Clear cookie popups
  await page.evaluate(() => {
    document.querySelectorAll('.cky-consent-container, [aria-label*="cookie"]').forEach(el => el.remove());
  });

  const outDir = 'C:/Users/shriyansh Sharma/.gemini/antigravity/brain/19c4ab20-86a1-42ea-b5b2-b8140e9268b8';

  const titleLockup = page.locator('.brd-title-top');
  await titleLockup.waitFor({ state: 'visible', timeout: 10000 });

  for (const font of FONTS) {
    console.log(`Applying font: ${font.name}...`);
    await page.evaluate((f) => {
      const el = document.querySelector('.brd-txt-for');
      if (el) {
        el.style.fontFamily = f.css;
        el.style.fontSize = f.size;
        el.style.transform = f.transform;
        el.style.fontWeight = f.weight;
        el.style.fontStyle = f.style || 'normal';
        el.style.letterSpacing = f.letterSpacing;
      }
    }, font);

    await page.waitForTimeout(400);

    // Capture the title top row
    const lockupEl = await page.$('.brd-hero-title-lockup');
    if (lockupEl) {
      const clipBox = await lockupEl.boundingBox();
      await page.screenshot({
        path: path.join(outDir, `font_${font.id}_preview.png`),
        clip: {
          x: Math.max(0, clipBox.x - 40),
          y: Math.max(0, clipBox.y - 20),
          width: clipBox.width + 80,
          height: Math.min(380, clipBox.height + 40)
        }
      });
      console.log(`Saved font_${font.id}_preview.png`);
    }
  }

  await browser.close();
  console.log('Captured all font previews!');
}

captureVariants().catch(console.error);

