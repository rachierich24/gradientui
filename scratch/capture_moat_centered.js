const { chromium } = require('playwright');
const path = require('path');

async function testMoat() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000/brand ...');
  await page.goto('http://localhost:3000/brand', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const moat = await page.$('#capabilities');
  if (!moat) {
    console.error('Capabilities section not found!');
    await browser.close();
    process.exit(1);
  }

  // Scroll so section is perfectly centered in viewport
  await page.evaluate(() => {
    const el = document.getElementById('capabilities');
    if (el) el.scrollIntoView({ block: 'center' });
  });
  await page.waitForTimeout(800);

  // Capture full section screenshot
  const outPath = 'C:/Users/shriyansh Sharma/.gemini/antigravity/brain/19c4ab20-86a1-42ea-b5b2-b8140e9268b8/capabilities_3d_final.png';
  await moat.screenshot({ path: outPath });
  console.log('Captured:', outPath);

  await browser.close();
  console.log('Done');
}

testMoat().catch(err => {
  console.error(err);
  process.exit(1);
});

