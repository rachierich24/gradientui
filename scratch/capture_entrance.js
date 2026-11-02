const { chromium } = require('playwright');
const path = require('path');

async function main() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();

  console.log('Navigating with domcontentloaded...');
  await page.goto('http://localhost:3000/brand', { waitUntil: 'domcontentloaded', timeout: 20000 });
  console.log('Page loaded!');

  // Wait 1.5 seconds for hydration
  await page.waitForTimeout(1500);

  // Remove cookies or modals
  await page.evaluate(() => {
    document.querySelectorAll('.cky-consent-container, [aria-label*="cookie"]').forEach(el => el.remove());
  });

  const outDir = 'C:/Users/shriyansh Sharma/.gemini/antigravity/brain/19c4ab20-86a1-42ea-b5b2-b8140e9268b8';

  // Scroll to #system
  const systemInfo = await page.evaluate(() => {
    const el = document.getElementById('system');
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return {
      top: window.scrollY + rect.top,
      height: rect.height
    };
  });

  console.log('System info:', systemInfo);
  if (!systemInfo) {
    console.error('System element not found!');
    await browser.close();
    return;
  }

  const scrollable = systemInfo.height - 900;

  // 1. Entrance flight snapshot (progress = 0.15)
  console.log('Scrolling to entrance (progress = 0.15)...');
  await page.evaluate(({ top, scrollable }) => {
    window.scrollTo({ top: top + 0.15 * scrollable, behavior: 'instant' });
  }, { top: systemInfo.top, scrollable });
  await page.waitForTimeout(600);

  const tilesInfo15 = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.bbo-t')).map(t => ({
      e: t.style.getPropertyValue('--e'),
      fx: t.style.getPropertyValue('--fx'),
      fy: t.style.getPropertyValue('--fy'),
      fr: t.style.getPropertyValue('--fr'),
      isIn: t.classList.contains('is-in'),
      transform: window.getComputedStyle(t).transform
    }));
  });
  console.log('Tiles at 0.15:', JSON.stringify(tilesInfo15, null, 2));

  await page.screenshot({
    path: path.join(outDir, 'bento_entrance_flight_015.png'),
    fullPage: false
  });
  console.log('Saved bento_entrance_flight_015.png');

  // 2. Entrance flight snapshot (progress = 0.30)
  console.log('Scrolling to entrance (progress = 0.30)...');
  await page.evaluate(({ top, scrollable }) => {
    window.scrollTo({ top: top + 0.30 * scrollable, behavior: 'instant' });
  }, { top: systemInfo.top, scrollable });
  await page.waitForTimeout(600);

  const tilesInfo30 = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.bbo-t')).map(t => ({
      e: t.style.getPropertyValue('--e'),
      isIn: t.classList.contains('is-in')
    }));
  });
  console.log('Tiles at 0.30:', JSON.stringify(tilesInfo30, null, 2));

  await page.screenshot({
    path: path.join(outDir, 'bento_entrance_flight_030.png'),
    fullPage: false
  });
  console.log('Saved bento_entrance_flight_030.png');

  // 3. Fully assembled Before state (progress = 0.44)
  console.log('Scrolling to Before state (progress = 0.44)...');
  await page.evaluate(({ top, scrollable }) => {
    window.scrollTo({ top: top + 0.44 * scrollable, behavior: 'instant' });
  }, { top: systemInfo.top, scrollable });
  await page.waitForTimeout(600);

  await page.screenshot({
    path: path.join(outDir, 'bento_assembled_before.png'),
    fullPage: false
  });
  console.log('Saved bento_assembled_before.png');

  // 4. Fully transformed After state (progress = 0.90)
  console.log('Scrolling to After state (progress = 0.90)...');
  await page.evaluate(({ top, scrollable }) => {
    window.scrollTo({ top: top + 0.90 * scrollable, behavior: 'instant' });
  }, { top: systemInfo.top, scrollable });
  await page.waitForTimeout(600);

  await page.screenshot({
    path: path.join(outDir, 'bento_assembled_after.png'),
    fullPage: false
  });
  console.log('Saved bento_assembled_after.png');

  await browser.close();
  console.log('All tests completed successfully!');
}

main().catch(console.error);

