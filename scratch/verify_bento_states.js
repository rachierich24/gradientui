const { chromium } = require('playwright');
const path = require('path');

async function main() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000/brand...');
  await page.goto('http://localhost:3000/brand', { waitUntil: 'domcontentloaded' });

  // Wait for #system to be attached to DOM
  console.log('Waiting for #system to attach...');
  const bentoLocator = page.locator('#system');
  await bentoLocator.waitFor({ state: 'attached', timeout: 15000 });

  // Remove cookie banner if present
  await page.evaluate(() => {
    document.querySelectorAll('div').forEach(el => {
      if (el.textContent && el.textContent.includes('We use cookies') && el.style.position !== 'relative') {
        el.remove();
      }
    });
  });

  const outDir = 'C:/Users/shriyansh Sharma/.gemini/antigravity/brain/19c4ab20-86a1-42ea-b5b2-b8140e9268b8';

  // Scroll into view
  console.log('Scrolling to bento section...');
  await bentoLocator.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  // 1. Capture BEFORE state
  console.log('Clicking BEFORE GRADIENT button...');
  const beforeBtn = page.locator('.bbo-switch-pill', { hasText: 'BEFORE GRADIENT' });
  if (await beforeBtn.count() > 0) {
    await beforeBtn.click();
    await page.waitForTimeout(800);
  }

  console.log('Capturing BEFORE state full screenshot...');
  await page.screenshot({
    path: path.join(outDir, 'bento_before_gradient_full.png'),
  });

  // Capture individual cards in BEFORE state
  const cards = await page.$$('.bbo-t');
  console.log(`Found ${cards.length} cards`);
  if (cards[0]) await cards[0].screenshot({ path: path.join(outDir, 'bento_card_a_before.png') });
  if (cards[1]) await cards[1].screenshot({ path: path.join(outDir, 'bento_card_b_before.png') });
  if (cards[2]) await cards[2].screenshot({ path: path.join(outDir, 'bento_card_c_before.png') });
  if (cards[6]) await cards[6].screenshot({ path: path.join(outDir, 'bento_card_g_before.png') });
  if (cards[7]) await cards[7].screenshot({ path: path.join(outDir, 'bento_card_h_before.png') });

  // 2. Capture AFTER state
  console.log('Clicking AFTER GRADIENT button...');
  const afterBtn = page.locator('.bbo-switch-pill', { hasText: 'AFTER GRADIENT' });
  if (await afterBtn.count() > 0) {
    await afterBtn.click();
    await page.waitForTimeout(800);
  }

  console.log('Capturing AFTER state full screenshot...');
  await page.screenshot({
    path: path.join(outDir, 'bento_after_gradient_full.png'),
  });

  // Capture individual cards in AFTER state
  if (cards[0]) await cards[0].screenshot({ path: path.join(outDir, 'bento_card_a_after.png') });
  if (cards[1]) await cards[1].screenshot({ path: path.join(outDir, 'bento_card_b_after.png') });
  if (cards[2]) await cards[2].screenshot({ path: path.join(outDir, 'bento_card_c_after.png') });
  if (cards[6]) await cards[6].screenshot({ path: path.join(outDir, 'bento_card_g_after.png') });
  if (cards[7]) await cards[7].screenshot({ path: path.join(outDir, 'bento_card_h_after.png') });

  await browser.close();
  console.log('All Bento captures completed successfully!');
}

main().catch(console.error);
