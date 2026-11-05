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

  const times = [400, 700, 900, 1100, 1300, 1500, 1700];
  for (const t of times) {
    await page.waitForTimeout(t === 400 ? 400 : 200);
    const p = path.resolve(`scratch/test_cards67_t${t}.png`);
    await page.screenshot({ path: p, clip: { x: 0, y: 550, width: 1440, height: 350 } });
    console.log('Saved', p);
  }

  await browser.close();
})();
