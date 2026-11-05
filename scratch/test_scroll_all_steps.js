const path = require('path');
const { chromium } = require(path.resolve('node_modules/playwright'));

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:3000/brand', { waitUntil: 'networkidle' });

  const section = await page.$('#system');
  const secBox = await section.boundingBox();
  console.log('Section box:', secBox);

  // We will scroll from top of section to bottom in 10 steps
  const totalScroll = secBox.height - 900;
  console.log('Total scrollable height:', totalScroll);

  for (let step = 0; step <= 10; step++) {
    const fraction = step / 10;
    const targetY = secBox.y + window_scroll_offset(secBox, fraction, totalScroll);
    
    await page.evaluate(({ secY, frac, total }) => {
      const scrollY = secY + frac * total;
      window.scrollTo(0, scrollY);
    }, { secY: secBox.y, frac: fraction, total: totalScroll });

    await page.waitForTimeout(100);

    const state = await page.evaluate(() => {
      const el = document.querySelector('#system');
      const rect = el.getBoundingClientRect();
      const totalScrollable = Math.max(1, rect.height - window.innerHeight);
      const secProgress = Math.min(1, Math.max(0, -rect.top / totalScrollable));

      const cards = Array.from(document.querySelectorAll('.bbo-card-before')).map((c, i) => ({
        i,
        op: window.getComputedStyle(c).opacity,
        vis: window.getComputedStyle(c).visibility,
      }));

      const badge = document.querySelector('.bbo-dustbin-text')?.textContent;
      const lidOpen = document.querySelector('.bbo-dustbin')?.classList.contains('is-open');

      return { secProgress, badge, lidOpen, cards };
    });

    console.log(`Step ${step} (${(fraction*100).toFixed(0)}% scroll, secProgress=${state.secProgress.toFixed(3)}): badge="${state.badge}", lidOpen=${state.lidOpen}`);
    console.log('   Cards vis:', state.cards.map(c => `c${c.i}:${c.op === '1' ? 'DOM' : 'HID'}`).join(' '));
  }

  await browser.close();

  function window_scroll_offset(b, f, t) {
    return f * t;
  }
})();

