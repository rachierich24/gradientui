const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await page.goto('http://localhost:3000/brand', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const moat = await page.$('#capabilities');
  if (moat) {
    await moat.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);
    await moat.screenshot({ path: 'C:/Users/shriyansh Sharma/.gemini/antigravity/brain/19c4ab20-86a1-42ea-b5b2-b8140e9268b8/platform_capabilities_3d_restored.png' });
    console.log('Captured platform_capabilities_3d_restored.png');
  }
  await browser.close();
})();

