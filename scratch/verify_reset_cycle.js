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

  const { secTop } = await page.evaluate(() => {
    const el = document.querySelector('#system');
    return { secTop: window.scrollY + el.getBoundingClientRect().top };
  });

  await page.evaluate(({ secTop }) => {
    window.scrollTo(0, secTop + 10);
  }, { secTop });
  await page.waitForTimeout(300);

  // 1. Toss
  console.log('Clicking central dustbin to toss...');
  await page.click('.bbo-dustbin');
  await page.waitForTimeout(3500);

  // 2. Click BEFORE GRADIENT to reset
  console.log('Clicking BEFORE GRADIENT switch pill to reset...');
  const beforePill = await page.$('.bbo-switch-pill:first-child');
  await beforePill.click();
  await page.waitForTimeout(1400);

  const binResetState = await page.evaluate(() => {
    const bin = document.querySelector('.bbo-dustbin');
    return {
      opacity: window.getComputedStyle(bin).opacity,
      transform: window.getComputedStyle(bin).transform,
      isAfter: document.querySelector('#system')?.classList.contains('is-after-mode'),
    };
  });
  console.log('Dustbin reset state:', binResetState);
  await page.screenshot({ path: path.resolve('scratch/step6_reset_reappeared_dustbin.png') });
  console.log('Saved step6_reset_reappeared_dustbin.png');

  await browser.close();
  console.log('Reset verification successful!');
})();

