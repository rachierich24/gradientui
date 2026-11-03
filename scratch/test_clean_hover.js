const { chromium } = require('playwright');
const path = require('path');

async function testCleanHover() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3000/brand', { waitUntil: 'networkidle' });
  await page.locator('.ddm-container').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  const artifactDir = 'C:/Users/shriyansh Sharma/.gemini/antigravity/brain/19c4ab20-86a1-42ea-b5b2-b8140e9268b8';

  const count = await page.locator('.ddm-pin-wrapper').count();
  console.log(`Testing ${count} pins...`);

  for (let i = 0; i < count; i++) {
    // Reset mouse away
    await page.mouse.move(50, 50);
    await page.waitForTimeout(150);

    const wrapper = page.locator('.ddm-pin-wrapper').nth(i);
    const name = await wrapper.locator('.ddm-pin-name').textContent();

    await wrapper.hover({ force: true });
    await page.waitForTimeout(250);

    const visibleNames = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.ddm-pin-wrapper'))
        .filter(w => {
          const tt = w.querySelector('.ddm-tooltip');
          const cs = window.getComputedStyle(tt);
          return cs.visibility === 'visible' && parseFloat(cs.opacity) > 0.5;
        })
        .map(w => w.querySelector('.ddm-pin-name')?.textContent?.trim());
    });

    console.log(`Pin ${i} [${name.trim()}]: active tooltip ->`, visibleNames);

    await page.locator('.ddm-container').screenshot({
      path: path.join(artifactDir, `clean_pin_${i}_${name.trim().replace(/\s+/g, '_').toLowerCase()}.png`)
    });
  }

  await browser.close();
}

testCleanHover().catch(console.error);

