const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await page.goto('http://localhost:3000/brand', { waitUntil: 'networkidle' });

  // Scroll down so the capabilities grid is centered and scrollProgress reaches 1
  await page.evaluate(() => {
    const el = document.getElementById('capabilities');
    if (el) {
      const rect = el.getBoundingClientRect();
      window.scrollTo(0, window.scrollY + rect.top + 200);
    }
  });

  // Wait for useSpring to settle completely
  await page.waitForTimeout(2000);

  const moat = await page.$('#capabilities');
  if (moat) {
    await moat.screenshot({ path: 'C:/Users/shriyansh Sharma/.gemini/antigravity/brain/19c4ab20-86a1-42ea-b5b2-b8140e9268b8/capabilities_fully_settled.png' });
    console.log('Captured capabilities_fully_settled.png');
  }

  await browser.close();
})();

