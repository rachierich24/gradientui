const { chromium } = require('playwright');
const path = require('path');

async function main() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  console.log('Navigating...');
  await page.goto('http://localhost:3000/brand', { waitUntil: 'networkidle' });

  // Dismiss cookie by clicking continue/reject
  try {
    const rejectBtn = page.locator('button:has-text("Reject"), button:has-text("Continue")').first();
    if (await rejectBtn.count() > 0) {
      await rejectBtn.click();
      await page.waitForTimeout(300);
    }
  } catch(e) {}

  // Also remove consent container element if still around
  await page.evaluate(() => {
    document.querySelectorAll('.cky-consent-container, [aria-label*="cookie"]').forEach(el => el.remove());
  });

  const outDir = 'C:/Users/shriyansh Sharma/.gemini/antigravity/brain/19c4ab20-86a1-42ea-b5b2-b8140e9268b8';

  const bentoLocator = page.locator('#system');
  await bentoLocator.waitFor({ state: 'attached', timeout: 15000 });
  await bentoLocator.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  // 1. Capture BEFORE state
  console.log('Clicking BEFORE...');
  const beforeBtn = page.locator('.bbo-switch-pill', { hasText: 'BEFORE GRADIENT' });
  if (await beforeBtn.count() > 0) {
    await beforeBtn.click();
    await page.waitForTimeout(1200);
  }

  console.log('Capturing clean BEFORE state...');
  await page.screenshot({
    path: path.join(outDir, 'bento_before_gradient_clean.png'),
  });

  // 2. Capture AFTER state
  console.log('Clicking AFTER...');
  const afterBtn = page.locator('.bbo-switch-pill', { hasText: 'AFTER GRADIENT' });
  if (await afterBtn.count() > 0) {
    await afterBtn.click();
    await page.waitForTimeout(1200);
  }

  console.log('Capturing clean AFTER state...');
  await page.screenshot({
    path: path.join(outDir, 'bento_after_gradient_clean.png'),
  });

  await browser.close();
  console.log('Done!');
}

main().catch(console.error);
