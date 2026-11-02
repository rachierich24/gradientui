const { chromium } = require('playwright');
const path = require('path');

async function capture() {
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
    console.error('#capabilities not found!');
    await browser.close();
    process.exit(1);
  }

  // Scroll into view
  await page.evaluate(() => {
    const el = document.getElementById('capabilities');
    if (el) el.scrollIntoView({ block: 'center' });
  });
  await page.waitForTimeout(1500);

  // Capture full section screenshot
  const outPath = 'C:/Users/shriyansh Sharma/.gemini/antigravity/brain/19c4ab20-86a1-42ea-b5b2-b8140e9268b8/reverted_3d_artwork_section.png';
  await moat.screenshot({ path: outPath });
  console.log('Captured:', outPath);

  // Also capture viewport
  await page.screenshot({
    path: 'C:/Users/shriyansh Sharma/.gemini/antigravity/brain/19c4ab20-86a1-42ea-b5b2-b8140e9268b8/reverted_3d_artwork_viewport.png'
  });
  console.log('Captured viewport screenshot');

  await browser.close();
  console.log('Done.');
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
