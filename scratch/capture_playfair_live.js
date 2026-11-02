const { chromium } = require('playwright');
const path = require('path');

async function main() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2
  });

  console.log('Navigating to http://localhost:3000/brand...');
  await page.goto('http://localhost:3000/brand', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(2000);

  await page.evaluate(() => {
    document.querySelectorAll('.cky-consent-container, [aria-label*="cookie"]').forEach(el => el.remove());
  });

  const outDir = 'C:/Users/shriyansh Sharma/.gemini/antigravity/brain/19c4ab20-86a1-42ea-b5b2-b8140e9268b8';
  const lockupEl = await page.$('.brd-hero-title-lockup');
  if (lockupEl) {
    const box = await lockupEl.boundingBox();
    await page.screenshot({
      path: path.join(outDir, 'font_playfair_applied_live.png'),
      clip: {
        x: Math.max(0, box.x - 40),
        y: Math.max(0, box.y - 20),
        width: box.width + 80,
        height: Math.min(360, box.height + 40)
      }
    });
    console.log('Saved font_playfair_applied_live.png');
  }

  await browser.close();
  console.log('Done!');
}

main().catch(console.error);

