const path = require('path');
const { chromium } = require(path.resolve('node_modules/playwright'));

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000/brand ...');
  await page.goto('http://localhost:3000/brand', { waitUntil: 'networkidle' });

  // Reset to BEFORE state
  await page.evaluate(() => {
    const el = document.querySelector('#system');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    const btn = document.querySelector('.bbo-switch-pill:first-child');
    if (btn) btn.click();
  });
  await page.waitForTimeout(600);

  const cards = await page.$$('.bbo-card-before');
  console.log('Found before cards count:', cards.length);

  for (let i = 0; i < cards.length; i++) {
    const filePath = `public/brand/card-before-${i}.png`;
    await cards[i].screenshot({ path: filePath });
    console.log(`Saved ${filePath}`);
  }

  await browser.close();
  console.log('All 8 before cards screenshotted successfully!');
})();

