const { chromium } = require('playwright');
const path = require('path');

async function main() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  await page.goto('http://localhost:3000/brand', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Remove any overlay/cookie dialogs for clean screenshots
  await page.evaluate(() => {
    document.querySelectorAll('div').forEach(el => {
      if (el.textContent && el.textContent.includes('We use cookies') && el.style.position !== 'relative') {
        el.remove();
      }
    });
  });

  const outDir = 'C:/Users/shriyansh Sharma/.gemini/antigravity/brain/19c4ab20-86a1-42ea-b5b2-b8140e9268b8';

  const capElement = await page.$('#capabilities');
  if (capElement) {
    await capElement.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);

    const cards = await page.$$('.bmoat-card');
    if (cards[0]) {
      await cards[0].screenshot({
        path: path.join(outDir, 'verified_card_1_clean.png'),
      });
    }

    await page.screenshot({
      path: path.join(outDir, 'verified_capabilities_full_clean.png'),
    });
  }

  await browser.close();
  console.log('Clean capture finished!');
}

main().catch(console.error);

