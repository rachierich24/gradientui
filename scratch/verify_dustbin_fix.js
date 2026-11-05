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

  console.log('Testing SCROLL transition at multiple key checkpoints...');

  // Check 1: p = 0.55 (during Card 6 & 7 flight)
  await page.evaluate(({ secTop, total }) => {
    // p = (secProgress - 0.06) / 0.78 => secProgress = 0.06 + 0.55 * 0.78 = 0.489
    window.scrollTo(0, secTop + 0.489 * total);
  }, { secTop, total: totalScrollable });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.resolve('scratch/verify_scroll_mid_flight.png') });
  console.log('Saved verify_scroll_mid_flight.png');

  // Check 2: p = 0.70 (just after Card 7 enters, lid sealed, clean board)
  await page.evaluate(({ secTop, total }) => {
    // p = 0.70 => secProgress = 0.06 + 0.70 * 0.78 = 0.606
    window.scrollTo(0, secTop + 0.606 * total);
  }, { secTop, total: totalScrollable });
  await page.waitForTimeout(300);
  const stateAt70 = await page.evaluate(() => {
    const bin = document.querySelector('.bbo-dustbin');
    const lid = document.querySelector('.bbo-can-lid');
    const badge = document.querySelector('.bbo-dustbin-text')?.textContent;
    const isAfter = document.querySelector('#system')?.classList.contains('is-after-mode');
    const lidTransform = window.getComputedStyle(lid).transform;
    return { badge, isAfter, lidTransform, classes: bin.className };
  });
  console.log('State at p=0.70:', stateAt70);
  await page.screenshot({ path: path.resolve('scratch/verify_scroll_at_70.png') });
  console.log('Saved verify_scroll_at_70.png');

  // Check 3: p = 0.88 (purple cards fully settled, lid sealed)
  await page.evaluate(({ secTop, total }) => {
    // p = 0.88 => secProgress = 0.06 + 0.88 * 0.78 = 0.746
    window.scrollTo(0, secTop + 0.746 * total);
  }, { secTop, total: totalScrollable });
  await page.waitForTimeout(300);
  const stateAt88 = await page.evaluate(() => {
    const bin = document.querySelector('.bbo-dustbin');
    const lid = document.querySelector('.bbo-can-lid');
    const badge = document.querySelector('.bbo-dustbin-text')?.textContent;
    const isAfter = document.querySelector('#system')?.classList.contains('is-after-mode');
    const lidTransform = window.getComputedStyle(lid).transform;
    return { badge, isAfter, lidTransform, classes: bin.className };
  });
  console.log('State at p=0.88:', stateAt88);
  await page.screenshot({ path: path.resolve('scratch/verify_scroll_at_88.png') });
  console.log('Saved verify_scroll_at_88.png');

  // Test CLICK programmatic sequence
  console.log('Testing CLICK programmatic sequence...');
  // First scroll back to top of section
  await page.evaluate(({ secTop }) => {
    window.scrollTo(0, secTop + 20);
  }, { secTop });
  await page.waitForTimeout(600);

  // Click the dustbin
  await page.click('.bbo-dustbin');
  console.log('Clicked .bbo-dustbin to trigger toss sequence...');

  // Wait for the animation to fully complete (1.3s animation + 400ms buffer)
  await page.waitForTimeout(2000);

  const stateAfterClick = await page.evaluate(() => {
    const bin = document.querySelector('.bbo-dustbin');
    const lid = document.querySelector('.bbo-can-lid');
    const badge = document.querySelector('.bbo-dustbin-text')?.textContent;
    const isAfter = document.querySelector('#system')?.classList.contains('is-after-mode');
    const lidTransform = window.getComputedStyle(lid).transform;
    return { badge, isAfter, lidTransform, classes: bin.className };
  });
  console.log('State after programmatic click:', stateAfterClick);
  await page.screenshot({ path: path.resolve('scratch/verify_click_completed.png') });
  console.log('Saved verify_click_completed.png');

  await browser.close();
  console.log('All verification tests completed successfully!');
})();

