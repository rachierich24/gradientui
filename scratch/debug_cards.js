const path = require('path');
const { chromium } = require(path.resolve('node_modules/playwright'));

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

  await page.goto('http://localhost:3000/brand', { waitUntil: 'networkidle' });

  await page.evaluate(() => {
    const el = document.querySelector('#system');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    const btn = document.querySelector('.bbo-switch-pill:first-child');
    if (btn) btn.click();
  });

  const cards = await page.locator('.bbo-card-before').all();
  console.log('Cards count:', cards.length);

  for (let i = 0; i < cards.length; i++) {
    const rect = await cards[i].boundingBox();
    console.log('Card ' + i + ' rect:', rect);
  }

  await browser.close();
})();
