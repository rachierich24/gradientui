const { chromium } = require('playwright');

async function debugPage() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  console.log('Visiting http://localhost:3000/brand...');
  await page.goto('http://localhost:3000/brand', { waitUntil: 'load' });
  await page.waitForTimeout(3000);

  const title = await page.title();
  console.log('Page Title:', title);

  const ids = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('section')).map(s => s.id || s.className);
  });
  console.log('Sections found:', ids);

  await browser.close();
}

debugPage().catch(console.error);

