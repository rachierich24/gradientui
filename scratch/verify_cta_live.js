const { chromium } = require('playwright');
const path = require('path');

async function testBrandClose() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('Navigating to http://localhost:3000/brand ...');
  await page.goto('http://localhost:3000/brand', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  const bcl = page.locator('.bcl');
  await bcl.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);

  const artifactDir = 'C:/Users/shriyansh Sharma/.gemini/antigravity/brain/19c4ab20-86a1-42ea-b5b2-b8140e9268b8';

  // Desktop resting screenshot
  await page.screenshot({ path: path.join(artifactDir, 'verify_cta_desktop.png') });
  await bcl.screenshot({ path: path.join(artifactDir, 'verify_cta_card_only.png') });

  // Hover over the button
  const btn = page.locator('.bcl-beam-btn');
  await btn.hover({ force: true });
  await page.waitForTimeout(300);
  await bcl.screenshot({ path: path.join(artifactDir, 'verify_cta_button_hover.png') });

  // Mobile screenshot (390 x 844)
  await page.setViewportSize({ width: 390, height: 844 });
  await bcl.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await bcl.screenshot({ path: path.join(artifactDir, 'verify_cta_mobile.png') });

  await browser.close();
  console.log('Finished capturing all verification screenshots.');
}

testBrandClose().catch(console.error);

