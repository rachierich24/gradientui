const path = require('path');
const { chromium } = require(path.resolve('node_modules/playwright'));

async function run() {
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

  // Scroll to start of #system
  await page.evaluate(() => {
    const el = document.querySelector('#system');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    const btn = document.querySelector('.bbo-switch-pill:first-child');
    if (btn) btn.click();
  });
  await page.waitForTimeout(600);

  const artifactsDir = 'C:/Users/shriyansh Sharma/.gemini/antigravity/brain/19c4ab20-86a1-42ea-b5b2-b8140e9268b8';

  // 1. Initial State: All 8 Before cards sitting in bento grid
  await page.screenshot({ path: path.join(artifactsDir, 'phase1_initial_before_cards.png') });
  console.log('Saved phase1_initial_before_cards.png');

  // 2. Trigger Toss & Crumple Sequence
  await page.evaluate(() => {
    const btn = document.querySelectorAll('.bbo-switch-pill')[1];
    if (btn) btn.click();
  });

  // Capture at 300ms: Cards crumpling into 3D paper balls
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(artifactsDir, 'phase2_crumpling_batch1.png') });
  console.log('Saved phase2_crumpling_batch1.png');

  // Capture at 750ms: Multiple 3D crumpled paper balls flying in parabolic arcs
  await page.waitForTimeout(450);
  await page.screenshot({ path: path.join(artifactsDir, 'phase3_parabolic_flight.png') });
  console.log('Saved phase3_parabolic_flight.png');

  // Capture at 1800ms: Fully settled After Gradient purple cards
  await page.waitForTimeout(1050);
  await page.screenshot({ path: path.join(artifactsDir, 'phase5_purple_settled.png') });
  console.log('Saved phase5_purple_settled.png');

  // 3. Reset back to BEFORE GRADIENT
  console.log('Clicking BEFORE GRADIENT to reset...');
  await page.evaluate(() => {
    const btn = document.querySelectorAll('.bbo-switch-pill')[0];
    if (btn) btn.click();
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(artifactsDir, 'phase6_reset_back_to_before.png') });
  console.log('Saved phase6_reset_back_to_before.png');

  await browser.close();
  console.log('All verification snapshots complete!');
}

run().catch((err) => {
  console.error('Error during test:', err);
  process.exit(1);
});
