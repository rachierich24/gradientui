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

  for (let pTarget = 0.1; pTarget <= 1.01; pTarget += 0.1) {
    await page.evaluate(({ secTop, total, p }) => {
      window.scrollTo(0, secTop + p * total);
    }, { secTop, total: totalScrollable, p: pTarget });

    await page.waitForTimeout(100);

    const res = await page.evaluate(() => {
      const el = document.querySelector('#system');
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const secProgress = -r.top / total;
      const morph = Math.min(1, Math.max(0, (secProgress - 0.08) / 0.78));

      const cards = Array.from(document.querySelectorAll('.bbo-card-before')).map((c, i) => ({
        i,
        op: window.getComputedStyle(c).opacity,
      }));
      const badge = document.querySelector('.bbo-dustbin-text')?.textContent;
      const isAfter = el.classList.contains('is-after-mode');
      return { secProgress: secProgress.toFixed(2), morph: morph.toFixed(2), badge, isAfter, cards };
    });

    console.log(`secProgress=${res.secProgress} morph=${res.morph} isAfter=${res.isAfter} badge='${res.badge}'`);
    console.log('  Cards: ' + res.cards.map(c => `c${c.i}:${c.op === '1' ? 'DOM' : 'HID'}`).join(' '));
  }

  await browser.close();
})();

