const { chromium } = require('playwright');
const path = require('path');

async function main() {
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch (e1) {
    console.log('Chrome channel failed, trying msedge...');
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000/brand...');
  await page.goto('http://localhost:3000/brand', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const outDir = 'C:/Users/shriyansh Sharma/.gemini/antigravity/brain/19c4ab20-86a1-42ea-b5b2-b8140e9268b8';

  // 1. Screenshot of Navbar and Hero
  console.log('Capturing Hero and Navbar...');
  await page.screenshot({
    path: path.join(outDir, 'verified_hero_navbar.png'),
    clip: { x: 0, y: 0, width: 1440, height: 750 },
  });

  // 2. Scroll into #capabilities
  console.log('Scrolling to #capabilities...');
  const capElement = await page.$('#capabilities');
  if (capElement) {
    await capElement.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);

    // Capture full capabilities view
    await page.screenshot({
      path: path.join(outDir, 'verified_capabilities_view.png'),
    });

    // Capture individual cards
    const cards = await page.$$('.bmoat-card');
    console.log(`Found ${cards.length} cards`);
    for (let i = 0; i < cards.length; i++) {
      await cards[i].screenshot({
        path: path.join(outDir, `verified_card_${i + 1}.png`),
      });
    }
  } else {
    console.log('#capabilities not found!');
  }

  await browser.close();
  console.log('Done captures successfully!');
}

main().catch(err => {
  console.error('Error in capture script:', err);
  process.exit(1);
});
