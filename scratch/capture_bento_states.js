const { chromium } = require('playwright');

async function capture() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000/brand ...');
  await page.goto('http://localhost:3000/brand', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Scroll to Bento section
  const bentoSection = await page.$('#system');
  if (bentoSection) {
    await bentoSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // 1. Click "BEFORE GRADIENT" switch pill
    const beforeBtn = await page.$('.bbo-switch-pill:has-text("BEFORE GRADIENT")');
    if (beforeBtn) {
      await beforeBtn.click();
      await page.waitForTimeout(1000);
      const stage = await page.$('.bbo-stage');
      if (stage) {
        await stage.screenshot({
          path: 'C:/Users/shriyansh Sharma/.gemini/antigravity/brain/19c4ab20-86a1-42ea-b5b2-b8140e9268b8/bento_stage_before_grounded.png'
        });
        console.log('Captured bento_stage_before_grounded.png');
      }
    }

    // 2. Click "AFTER GRADIENT" switch pill
    const afterBtn = await page.$('.bbo-switch-pill:has-text("AFTER GRADIENT")');
    if (afterBtn) {
      await afterBtn.click();
      await page.waitForTimeout(1200);
      const stage = await page.$('.bbo-stage');
      if (stage) {
        await stage.screenshot({
          path: 'C:/Users/shriyansh Sharma/.gemini/antigravity/brain/19c4ab20-86a1-42ea-b5b2-b8140e9268b8/bento_stage_after_6b33d3.png'
        });
        console.log('Captured bento_stage_after_6b33d3.png');
      }
    }
  }

  await browser.close();
  console.log('Bento stage captures complete.');
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});

