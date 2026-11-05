const path = require('path');
const { chromium } = require(path.resolve('node_modules/playwright'));

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:3000/brand', { waitUntil: 'networkidle' });

  // Scroll to #system
  await page.evaluate(() => {
    const el = document.querySelector('#system');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    const btn = document.querySelector('.bbo-switch-pill:first-child');
    if (btn) btn.click();
  });
  await page.waitForTimeout(500);

  // Trigger toss
  await page.evaluate(() => {
    const btn = document.querySelectorAll('.bbo-switch-pill')[1];
    if (btn) btn.click();
  });

  // Check state at 900ms
  await page.waitForTimeout(900);

  const debug = await page.evaluate(() => {
    const canvas = document.querySelector('.bbo-crumple-canvas');
    const stage = document.querySelector('.bbo-stage');
    const cards = Array.from(document.querySelectorAll('.bbo-card-before')).map((c, i) => ({
      i,
      opacity: window.getComputedStyle(c).opacity,
      visibility: window.getComputedStyle(c).visibility,
      transform: window.getComputedStyle(c).transform,
    }));
    return { cards };
  });

  console.log('Cards at 900ms:', JSON.stringify(debug.cards, null, 2));

  await browser.close();
})();
