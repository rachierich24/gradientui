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

  await moat.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);

  // 1. Capture full section screenshot
  const outPath = 'C:/Users/shriyansh Sharma/.gemini/antigravity/brain/19c4ab20-86a1-42ea-b5b2-b8140e9268b8/capabilities_3d_section_restored.png';
  await moat.screenshot({ path: outPath });
  console.log('Captured:', outPath);

  // 2. Test Card 1 interactivity: hover W3
  const w3Point = await page.$('.bmoat-hud-axis-lbl:has-text("W3")');
  if (w3Point) {
    await w3Point.click();
    await page.waitForTimeout(300);
    console.log('Tested W3 click transition in Card 1');
  }

  // 3. Test Card 2 interactivity: click "Bramble"
  const brambleTab = await page.$('.bmoat-hud-tab-chip:has-text("Bramble")');
  if (brambleTab) {
    await brambleTab.click();
    await page.waitForTimeout(400);
    console.log('Tested Bramble tab click transition in Card 2');
  }

  // 4. Test Card 3 interactivity: click row 2 (Tamarind Lane)
  const rows = await page.$$('.bmoat-hud-po-row');
  if (rows.length > 1) {
    await rows[1].click();
    await page.waitForTimeout(400);
    console.log('Tested row 2 click transition in Card 3');
  }

  // 5. Restore back to default state matching user screenshot
  const w4Point = await page.$('.bmoat-hud-axis-lbl:has-text("W4")');
  if (w4Point) await w4Point.click();
  const hillfoldTab = await page.$('.bmoat-hud-tab-chip:has-text("Hillfold")');
  if (hillfoldTab) await hillfoldTab.click();
  if (rows.length > 0) await rows[0].click();
  await page.waitForTimeout(500);

  // Capture finalized default state matching user screenshot
  await moat.screenshot({
    path: 'C:/Users/shriyansh Sharma/.gemini/antigravity/brain/19c4ab20-86a1-42ea-b5b2-b8140e9268b8/capabilities_matching_screenshot.png'
  });
  console.log('Captured capabilities_matching_screenshot.png');

  await browser.close();
  console.log('Verification finished successfully.');
}

testMoat().catch(err => {
  console.error(err);
  process.exit(1);
});

