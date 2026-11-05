const path = require('path');
const { chromium } = require(path.resolve('node_modules/playwright'));

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3000/brand', { waitUntil: 'networkidle' });

  // Remove cookie banner
  await page.evaluate(() => {
    document.querySelectorAll('.cc-banner, [class*="cc-"]').forEach(el => el.remove());
  });

  const section = await page.$('#system');
  const secBox = await section.boundingBox();
  const totalScroll = secBox.height - 900;

  // Let's scroll to secProgress = 0.46 (Card 6 crumpling)
  // secProgress = (scrollY - secY) / totalScroll
  // Target scrollY = secY + 0.46 * totalScroll
  const secY = secBox.y;

  // 1. Snapshot Card 6 crumpling at 46%
  await page.evaluate(({ secY, total }) => {
    window.scrollTo(0, secY + 0.46 * total);
  }, { secY, total: totalScroll });
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.resolve('scratch/scroll_card6_crumpling.png') });
  console.log('Saved scroll_card6_crumpling.png');

  // 2. Snapshot Card 7 crumpling at 56%
  await page.evaluate(({ secY, total }) => {
    window.scrollTo(0, secY + 0.56 * total);
  }, { secY, total: totalScroll });
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.resolve('scratch/scroll_card7_crumpling.png') });
  console.log('Saved scroll_card7_crumpling.png');

  // 3. Snapshot Card 6 & 7 mid-flight into dustbin at 66%
  await page.evaluate(({ secY, total }) => {
    window.scrollTo(0, secY + 0.66 * total);
  }, { secY, total: totalScroll });
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.resolve('scratch/scroll_cards67_flight.png') });
  console.log('Saved scroll_cards67_flight.png');

  // 4. Snapshot dustbin catch at 78%
  await page.evaluate(({ secY, total }) => {
    window.scrollTo(0, secY + 0.78 * total);
  }, { secY, total: totalScroll });
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.resolve('scratch/scroll_dustbin_catch.png') });
  console.log('Saved scroll_dustbin_catch.png');

  await browser.close();
  console.log('All scroll snapshots saved successfully!');
})();
