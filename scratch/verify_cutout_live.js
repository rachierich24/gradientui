const path = require('path');
const { chromium } = require(path.resolve('node_modules/playwright'));

async function testLive() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  console.log('Navigating to http://localhost:3000/brand ...');
  await page.goto('http://localhost:3000/brand', { waitUntil: 'networkidle' });

  // Scroll down to the demand map section
  await page.evaluate(() => {
    const el = document.querySelector('.ddm-container');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await page.waitForTimeout(1000);

  const container = page.locator('.ddm-container');
  await container.screenshot({
    path: 'C:/Users/shriyansh Sharma/.gemini/antigravity/brain/19c4ab20-86a1-42ea-b5b2-b8140e9268b8/verify_cutout_01_overview.png',
  });
  console.log('1. Captured overview screenshot.');

  // Zoom in 3 times to ~205%
  const zoomInBtn = page.locator('.ddm-ctrl-btn[aria-label="Zoom in"]');
  await zoomInBtn.click();
  await page.waitForTimeout(400);
  await zoomInBtn.click();
  await page.waitForTimeout(400);
  await zoomInBtn.click();
  await page.waitForTimeout(600);

  await container.screenshot({
    path: 'C:/Users/shriyansh Sharma/.gemini/antigravity/brain/19c4ab20-86a1-42ea-b5b2-b8140e9268b8/verify_cutout_02_zoomed_205.png',
  });
  console.log('2. Captured 205% zoom screenshot.');

  // Zoom in to maximum (280%)
  await zoomInBtn.click();
  await page.waitForTimeout(400);
  await zoomInBtn.click();
  await page.waitForTimeout(600);

  await container.screenshot({
    path: 'C:/Users/shriyansh Sharma/.gemini/antigravity/brain/19c4ab20-86a1-42ea-b5b2-b8140e9268b8/verify_cutout_03_deep_zoom_280.png',
  });
  console.log('3. Captured 280% zoom screenshot.');

  // Drag/pan the map
  const viewport = page.locator('.ddm-map-viewport');
  const box = await viewport.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 - 120, box.y + box.height / 2 - 60, { steps: 8 });
    await page.mouse.up();
  }
  await page.waitForTimeout(400);

  await container.screenshot({
    path: 'C:/Users/shriyansh Sharma/.gemini/antigravity/brain/19c4ab20-86a1-42ea-b5b2-b8140e9268b8/verify_cutout_04_panned.png',
  });
  console.log('4. Captured panned screenshot.');

  // Reset view
  const resetBtn = page.locator('.ddm-ctrl-reset');
  if (await resetBtn.isVisible()) {
    await resetBtn.click();
    await page.waitForTimeout(600);
  }

  await container.screenshot({
    path: 'C:/Users/shriyansh Sharma/.gemini/antigravity/brain/19c4ab20-86a1-42ea-b5b2-b8140e9268b8/verify_cutout_05_reset.png',
  });
  console.log('5. Captured reset screenshot.');

  await browser.close();
  console.log('All screenshots captured successfully!');
}

testLive().catch(console.error);
