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
    path: 'C:/Users/shriyansh Sharma/.gemini/antigravity/brain/19c4ab20-86a1-42ea-b5b2-b8140e9268b8/verify_final_01_overview.png',
  });
  console.log('1. Captured overview screenshot.');

  // Hover over Connaught Place pin
  const cpPin = page.locator('.ddm-pin-wrapper').filter({ hasText: 'Connaught Place' });
  await cpPin.hover();
  await page.waitForTimeout(300);

  await container.screenshot({
    path: 'C:/Users/shriyansh Sharma/.gemini/antigravity/brain/19c4ab20-86a1-42ea-b5b2-b8140e9268b8/verify_final_02_hover_cp.png',
  });
  console.log('2. Captured hover CP screenshot.');

  // Zoom in twice (~170%)
  const zoomInBtn = page.locator('.ddm-ctrl-btn[aria-label="Zoom in"]');
  await zoomInBtn.click();
  await page.waitForTimeout(350);
  await zoomInBtn.click();
  await page.waitForTimeout(500);

  await container.screenshot({
    path: 'C:/Users/shriyansh Sharma/.gemini/antigravity/brain/19c4ab20-86a1-42ea-b5b2-b8140e9268b8/verify_final_03_zoomed_170.png',
  });
  console.log('3. Captured 170% zoom screenshot with street labels.');

  // Zoom in to maximum (280%)
  await zoomInBtn.click();
  await page.waitForTimeout(300);
  await zoomInBtn.click();
  await page.waitForTimeout(300);
  await zoomInBtn.click();
  await page.waitForTimeout(500);

  await container.screenshot({
    path: 'C:/Users/shriyansh Sharma/.gemini/antigravity/brain/19c4ab20-86a1-42ea-b5b2-b8140e9268b8/verify_final_04_deep_zoom_280.png',
  });
  console.log('4. Captured 280% deep zoom screenshot with rich street detailing.');

  // Drag/pan the map
  const viewport = page.locator('.ddm-map-viewport');
  const box = await viewport.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 - 150, box.y + box.height / 2 - 80, { steps: 8 });
    await page.mouse.up();
  }
  await page.waitForTimeout(400);

  await container.screenshot({
    path: 'C:/Users/shriyansh Sharma/.gemini/antigravity/brain/19c4ab20-86a1-42ea-b5b2-b8140e9268b8/verify_final_05_panned.png',
  });
  console.log('5. Captured panned screenshot.');

  // Reset view
  const resetBtn = page.locator('.ddm-ctrl-reset');
  if (await resetBtn.isVisible()) {
    await resetBtn.click();
    await page.waitForTimeout(500);
  }

  await container.screenshot({
    path: 'C:/Users/shriyansh Sharma/.gemini/antigravity/brain/19c4ab20-86a1-42ea-b5b2-b8140e9268b8/verify_final_06_reset.png',
  });
  console.log('6. Captured reset screenshot.');

  await browser.close();
  console.log('All tests passed successfully!');
}

testLive().catch(console.error);

