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

  const { secTop, totalScrollable } = await page.evaluate(() => {
    const el = document.querySelector('#system');
    const r = el.getBoundingClientRect();
    return {
      secTop: window.scrollY + r.top,
      totalScrollable: r.height - window.innerHeight,
    };
  });

  console.log('secTop:', secTop, 'totalScrollable:', totalScrollable);

  // 1. Snapshot Card 6 crumpling at secProgress = 0.45 (morph = 0.47)
  await page.evaluate(({ secTop, total }) => {
    window.scrollTo(0, secTop + 0.45 * total);
  }, { secTop, total: totalScrollable });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.resolve('scratch/scroll_card6_crumpling.png') });
  console.log('Saved scroll_card6_crumpling.png');

  // 2. Snapshot Card 7 crumpling at secProgress = 0.52 (morph = 0.56)
  await page.evaluate(({ secTop, total }) => {
    window.scrollTo(0, secTop + 0.52 * total);
  }, { secTop, total: totalScrollable });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.resolve('scratch/scroll_card7_crumpling.png') });
  console.log('Saved scroll_card7_crumpling.png');

  // 3. Snapshot Cards 6 & 7 in mid-flight into dustbin at secProgress = 0.62 (morph = 0.69)
  await page.evaluate(({ secTop, total }) => {
    window.scrollTo(0, secTop + 0.62 * total);
  }, { secTop, total: totalScrollable });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.resolve('scratch/scroll_cards67_flight.png') });
  console.log('Saved scroll_cards67_flight.png');

  // 4. Snapshot dustbin catching at secProgress = 0.72 (morph = 0.82)
  await page.evaluate(({ secTop, total }) => {
    window.scrollTo(0, secTop + 0.72 * total);
  }, { secTop, total: totalScrollable });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.resolve('scratch/scroll_dustbin_catch.png') });
  console.log('Saved scroll_dustbin_catch.png');

  // 5. Snapshot After purple cards at secProgress = 0.85 (morph = 0.98)
  await page.evaluate(({ secTop, total }) => {
    window.scrollTo(0, secTop + 0.85 * total);
  }, { secTop, total: totalScrollable });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.resolve('scratch/scroll_purple_settled.png') });
  console.log('Saved scroll_purple_settled.png');

  await browser.close();
  console.log('All scroll snapshots saved successfully!');
})();
