const { chromium } = require('playwright');
const path = require('path');

async function testFlyInTransition() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000/brand...');
  await page.goto('http://localhost:3000/brand', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Remove cookie popups if any
  await page.evaluate(() => {
    document.querySelectorAll('.cky-consent-container, [aria-label*="cookie"]').forEach(el => el.remove());
  });

  const bentoLocator = page.locator('#system');
  await bentoLocator.waitFor({ state: 'attached', timeout: 15000 });
  await bentoLocator.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);

  const outDir = 'C:/Users/shriyansh Sharma/.gemini/antigravity/brain/19c4ab20-86a1-42ea-b5b2-b8140e9268b8';

  // Get absolute top of #system
  const { bentoTop, totalHeight } = await page.evaluate(() => {
    const el = document.getElementById('system');
    const rect = el.getBoundingClientRect();
    return {
      bentoTop: window.scrollY + rect.top,
      totalHeight: rect.height
    };
  });

  const totalScrollable = totalHeight - 900;
  console.log(`Bento top: ${bentoTop}, total scrollable height: ${totalScrollable}`);

  // Test 1: Mid-flight entrance (secProgress = 0.12)
  console.log('Scrolling to entrance phase: progress = 0.12...');
  await page.evaluate(({ top, scrollable }) => {
    window.scrollTo({ top: top + 0.12 * scrollable, behavior: 'instant' });
  }, { top: bentoTop, scrollable: totalScrollable });
  await page.waitForTimeout(400);

  // Read tile transforms at progress 0.12
  const transformsAt12 = await page.evaluate(() => {
    const tiles = Array.from(document.querySelectorAll('.bbo-t'));
    return tiles.map((t, idx) => ({
      index: idx,
      e: t.style.getPropertyValue('--e'),
      fx: t.style.getPropertyValue('--fx'),
      fy: t.style.getPropertyValue('--fy'),
      fr: t.style.getPropertyValue('--fr'),
      isIn: t.classList.contains('is-in')
    }));
  });
  console.log('Tiles at progress 0.12:', JSON.stringify(transformsAt12, null, 2));

  await page.screenshot({
    path: path.join(outDir, 'bento_flyin_midflight.png'),
    fullPage: false
  });
  console.log('Saved bento_flyin_midflight.png');

  // Test 2: Late flight entrance (progress = 0.28)
  console.log('Scrolling to entrance phase: progress = 0.28...');
  await page.evaluate(({ top, scrollable }) => {
    window.scrollTo({ top: top + 0.28 * scrollable, behavior: 'instant' });
  }, { top: bentoTop, scrollable: totalScrollable });
  await page.waitForTimeout(400);

  const transformsAt28 = await page.evaluate(() => {
    const tiles = Array.from(document.querySelectorAll('.bbo-t'));
    return tiles.map((t, idx) => ({
      index: idx,
      e: t.style.getPropertyValue('--e'),
      isIn: t.classList.contains('is-in')
    }));
  });
  console.log('Tiles at progress 0.28:', JSON.stringify(transformsAt28, null, 2));

  await page.screenshot({
    path: path.join(outDir, 'bento_flyin_lateflight.png'),
    fullPage: false
  });
  console.log('Saved bento_flyin_lateflight.png');

  // Test 3: Fully landed Before state (progress = 0.44)
  console.log('Scrolling to landed Before state: progress = 0.44...');
  await page.evaluate(({ top, scrollable }) => {
    window.scrollTo({ top: top + 0.44 * scrollable, behavior: 'instant' });
  }, { top: bentoTop, scrollable: totalScrollable });
  await page.waitForTimeout(400);

  await page.screenshot({
    path: path.join(outDir, 'bento_landed_before.png'),
    fullPage: false
  });
  console.log('Saved bento_landed_before.png');

  // Test 4: Fully landed After state (progress = 0.90)
  console.log('Scrolling to landed After state: progress = 0.90...');
  await page.evaluate(({ top, scrollable }) => {
    window.scrollTo({ top: top + 0.90 * scrollable, behavior: 'instant' });
  }, { top: bentoTop, scrollable: totalScrollable });
  await page.waitForTimeout(400);

  await page.screenshot({
    path: path.join(outDir, 'bento_landed_after.png'),
    fullPage: false
  });
  console.log('Saved bento_landed_after.png');

  await browser.close();
  console.log('Verification complete!');
}

testFlyInTransition().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
