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

  // 1. Initial State: Central Dustbin in Before mode
  await page.evaluate(({ secTop }) => {
    window.scrollTo(0, secTop + 10);
  }, { secTop });
  await page.waitForTimeout(400);

  const binBoxBefore = await page.evaluate(() => {
    const bin = document.querySelector('.bbo-dustbin');
    const r = bin.getBoundingClientRect();
    return {
      left: r.left,
      top: r.top,
      width: r.width,
      height: r.height,
      centerX: r.left + r.width / 2,
      centerY: r.top + r.height / 2,
      opacity: window.getComputedStyle(bin).opacity,
    };
  });
  console.log('Initial Central Dustbin:', binBoxBefore);
  await page.screenshot({ path: path.resolve('scratch/step1_center_dustbin_before.png') });
  console.log('Saved step1_center_dustbin_before.png');

  // 2. Mid Crumpling & Inward Radial Flight (Click toss button)
  console.log('Triggering toss sequence to test improved deliberate crumpling & central catch...');
  await page.click('.bbo-dustbin');

  // Snapshot at 0.6s (Cards 0, 1, 2 crumpling and arcing inward)
  await page.waitForTimeout(650);
  await page.screenshot({ path: path.resolve('scratch/step2_cards_crumpling_inward.png') });
  console.log('Saved step2_cards_crumpling_inward.png');

  // Snapshot at 1.6s (Cards 3, 4, 5, 6 flying radially toward center)
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.resolve('scratch/step3_radial_flight_to_center.png') });
  console.log('Saved step3_radial_flight_to_center.png');

  // Snapshot at 3.0s (All cards caught, lid shut, dustbin vanishing, purple cards blooming)
  await page.waitForTimeout(1400);
  await page.screenshot({ path: path.resolve('scratch/step4_dustbin_vanishing_purple_bloom.png') });
  console.log('Saved step4_dustbin_vanishing_purple_bloom.png');

  // Snapshot at 3.8s (Completely settled: dustbin vanished, 100% clean board)
  await page.waitForTimeout(800);
  const binBoxAfter = await page.evaluate(() => {
    const bin = document.querySelector('.bbo-dustbin');
    const r = bin.getBoundingClientRect();
    return {
      opacity: window.getComputedStyle(bin).opacity,
      pointerEvents: window.getComputedStyle(bin).pointerEvents,
      transform: window.getComputedStyle(bin).transform,
      isAfter: document.querySelector('#system')?.classList.contains('is-after-mode'),
    };
  });
  console.log('Final Settled Dustbin State:', binBoxAfter);
  await page.screenshot({ path: path.resolve('scratch/step5_fully_clean_board_vanished_dustbin.png') });
  console.log('Saved step5_fully_clean_board_vanished_dustbin.png');

  await browser.close();
  console.log('All center dustbin verification steps completed successfully!');
})();

