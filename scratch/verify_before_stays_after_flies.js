const { chromium } = require('playwright');
const path = require('path');

async function testBeforeStaysAfterFlies() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000/brand...');
  await page.goto('http://localhost:3000/brand', { waitUntil: 'domcontentloaded', timeout: 20000 });
  console.log('Page loaded, waiting for hydration...');
  await page.waitForTimeout(2000);

  // Clear cookie container if present
  await page.evaluate(() => {
    document.querySelectorAll('.cky-consent-container, [aria-label*="cookie"]').forEach(el => el.remove());
  });

  const outDir = 'C:/Users/shriyansh Sharma/.gemini/antigravity/brain/19c4ab20-86a1-42ea-b5b2-b8140e9268b8';

  const systemInfo = await page.evaluate(() => {
    const el = document.getElementById('system');
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return {
      top: window.scrollY + rect.top,
      height: rect.height
    };
  });
  console.log('System section info:', systemInfo);
  if (!systemInfo) {
    console.error('System element not found on page!');
    await browser.close();
    return;
  }
  const scrollable = systemInfo.height - 900;

  // 1. Initial Before state (progress = 0.02)
  console.log('Scrolling to Before state (progress = 0.02)...');
  await page.evaluate(({ top, scrollable }) => {
    window.scrollTo({ top: top + 0.02 * scrollable, behavior: 'instant' });
  }, { top: systemInfo.top, scrollable });
  await page.waitForTimeout(500);

  const initialBeforeInfo = await page.evaluate(() => {
    const beforeCards = Array.from(document.querySelectorAll('.bbo-card-before'));
    const afterCards = Array.from(document.querySelectorAll('.bbo-t-after'));
    return {
      beforeCount: beforeCards.length,
      beforeVisible: beforeCards.every(c => window.getComputedStyle(c).display !== 'none'),
      afterCount: afterCards.length,
      afterE: afterCards.map(c => c.style.getPropertyValue('--e')),
      afterOpacity: afterCards.map(c => window.getComputedStyle(c).opacity)
    };
  });
  console.log('State at progress = 0.02 (Before stays in place):', JSON.stringify(initialBeforeInfo, null, 2));

  await page.screenshot({
    path: path.join(outDir, 'bento_1_before_stays_grounded.png'),
    fullPage: false
  });
  console.log('Saved bento_1_before_stays_grounded.png');

  // 2. Mid-flight (progress = 0.28) - Purple cards flying in over grounded Before cards
  console.log('Scrolling to mid-flight (progress = 0.28)...');
  await page.evaluate(({ top, scrollable }) => {
    window.scrollTo({ top: top + 0.28 * scrollable, behavior: 'instant' });
  }, { top: systemInfo.top, scrollable });
  await page.waitForTimeout(500);

  const midFlightInfo = await page.evaluate(() => {
    const afterCards = Array.from(document.querySelectorAll('.bbo-t-after'));
    return afterCards.map(c => ({
      e: c.style.getPropertyValue('--e'),
      fx: c.style.getPropertyValue('--fx'),
      fy: c.style.getPropertyValue('--fy'),
      fr: c.style.getPropertyValue('--fr'),
      isIn: c.classList.contains('is-in'),
      transform: window.getComputedStyle(c).transform
    }));
  });
  console.log('After cards mid-flight (progress = 0.28):', JSON.stringify(midFlightInfo, null, 2));

  await page.screenshot({
    path: path.join(outDir, 'bento_2_after_flying_in.png'),
    fullPage: false
  });
  console.log('Saved bento_2_after_flying_in.png');

  // 3. Fully landed After state (progress = 0.80)
  console.log('Scrolling to fully landed After state (progress = 0.80)...');
  await page.evaluate(({ top, scrollable }) => {
    window.scrollTo({ top: top + 0.80 * scrollable, behavior: 'instant' });
  }, { top: systemInfo.top, scrollable });
  await page.waitForTimeout(500);

  const landedAfterInfo = await page.evaluate(() => {
    const afterCards = Array.from(document.querySelectorAll('.bbo-t-after'));
    return afterCards.map(c => ({
      e: c.style.getPropertyValue('--e'),
      isIn: c.classList.contains('is-in')
    }));
  });
  console.log('After cards landed (progress = 0.80):', JSON.stringify(landedAfterInfo, null, 2));

  await page.screenshot({
    path: path.join(outDir, 'bento_3_after_fully_landed.png'),
    fullPage: false
  });
  console.log('Saved bento_3_after_fully_landed.png');

  await browser.close();
  console.log('All verification stages completed!');
}

testBeforeStaysAfterFlies().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
