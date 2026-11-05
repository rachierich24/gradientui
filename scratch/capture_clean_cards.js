const path = require('path');
const { chromium } = require(path.resolve('node_modules/playwright'));

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  console.log('Navigating to http://localhost:3000/brand ...');
  await page.goto('http://localhost:3000/brand', { waitUntil: 'networkidle' });

  // 1. Remove cookie banner and any overlays
  await page.evaluate(() => {
    // Remove cookie banner elements and nextjs overlays
    document.querySelectorAll('.cc-banner, [class*="cc-"], nextjs-portal, #nextjs-portal').forEach(el => el.remove());

    // Scroll to start of #system
    const el = document.querySelector('#system');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });

    // Ensure BEFORE state
    const btn = document.querySelector('.bbo-switch-pill:first-child');
    if (btn) btn.click();

    // Temporarily hide the dustbin and canvas so card 7 is 100% clean
    const bin = document.querySelector('.bbo-dustbin');
    if (bin) bin.style.display = 'none';
    const canvas = document.querySelector('.bbo-crumple-canvas');
    if (canvas) canvas.style.display = 'none';
  });

  await page.waitForTimeout(500);

  const cards = await page.locator('.bbo-card-before').all();
  console.log('Found cards count:', cards.length);

  for (let i = 0; i < cards.length; i++) {
    const filePath = `public/brand/card-before-${i}.png`;
    await cards[i].screenshot({ path: filePath });
    console.log(`Saved clean ${filePath}`);
  }

  await browser.close();
  console.log('All 8 cards screenshotted cleanly without cookie banner or dustbin!');
})();
