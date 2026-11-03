const { chromium } = require('playwright');
const path = require('path');

async function verifyLiveCentralCTA() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('Navigating to http://localhost:3000/brand ...');
  await page.goto('http://localhost:3000/brand', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  const bcl = page.locator('.bcl');
  await bcl.scrollIntoViewIfNeeded();
  // Wait for the entrance drawing transition to complete
  await page.waitForTimeout(1500);

  const artifactDir = 'C:/Users/shriyansh Sharma/.gemini/antigravity/brain/19c4ab20-86a1-42ea-b5b2-b8140e9268b8';

  // Desktop resting screenshot of the central design
  await bcl.screenshot({ path: path.join(artifactDir, 'verify_central_cta_resting.png') });
  await page.screenshot({ path: path.join(artifactDir, 'verify_central_cta_page.png') });

  // Hover over the central button
  const btn = page.locator('.bcl-central-btn');
  await btn.hover({ force: true });
  await page.waitForTimeout(300);
  await bcl.screenshot({ path: path.join(artifactDir, 'verify_central_cta_hover.png') });

  // Mobile screenshot (390 x 844)
  await page.setViewportSize({ width: 390, height: 844 });
  await bcl.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await bcl.screenshot({ path: path.join(artifactDir, 'verify_central_cta_mobile.png') });

  await browser.close();
  console.log('Finished capturing all verification screenshots.');
}

verifyLiveCentralCTA().catch(console.error);

