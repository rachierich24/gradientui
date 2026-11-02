const { chromium } = require('playwright');
const path = require('path');

async function capture() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000/brand ...');
  await page.goto('http://localhost:3000/brand', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // 1. Hero section lockup
  const heroLockup = await page.$('.brd-hero-title-lockup');
  if (heroLockup) {
    await heroLockup.screenshot({
      path: 'C:/Users/shriyansh Sharma/.gemini/antigravity/brain/19c4ab20-86a1-42ea-b5b2-b8140e9268b8/hero_lockup_6b33d3.png'
    });
    console.log('Captured hero_lockup_6b33d3.png');
  }

  // 2. Navbar CTA button
  const navBtn = await page.$('.brd-nav-right button');
  if (navBtn) {
    await navBtn.screenshot({
      path: 'C:/Users/shriyansh Sharma/.gemini/antigravity/brain/19c4ab20-86a1-42ea-b5b2-b8140e9268b8/navbar_cta_button.png'
    });
    console.log('Captured navbar_cta_button.png');
  }

  // 3. Platform Capabilities section ("Built for brands selling into India's café economy.")
  const moatSection = await page.$('#capabilities');
  if (moatSection) {
    await moatSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await moatSection.screenshot({
      path: 'C:/Users/shriyansh Sharma/.gemini/antigravity/brain/19c4ab20-86a1-42ea-b5b2-b8140e9268b8/platform_capabilities_6b33d3.png'
    });
    console.log('Captured platform_capabilities_6b33d3.png');
  }

  // 4. Bento Section - Before State and After State
  const bentoSection = await page.$('.bbo');
  if (bentoSection) {
    await bentoSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // Click "Before Gradient"
    const toggleBefore = await page.$('.bbo-toggle-pill:has-text("Before Gradient")');
    if (toggleBefore) {
      await toggleBefore.click();
      await page.waitForTimeout(1000);
      await bentoSection.screenshot({
        path: 'C:/Users/shriyansh Sharma/.gemini/antigravity/brain/19c4ab20-86a1-42ea-b5b2-b8140e9268b8/bento_section_before.png'
      });
      console.log('Captured bento_section_before.png');
    }

    // Click "After Gradient"
    const toggleAfter = await page.$('.bbo-toggle-pill:has-text("After Gradient")');
    if (toggleAfter) {
      await toggleAfter.click();
      await page.waitForTimeout(1200);
      await bentoSection.screenshot({
        path: 'C:/Users/shriyansh Sharma/.gemini/antigravity/brain/19c4ab20-86a1-42ea-b5b2-b8140e9268b8/bento_section_after_6b33d3.png'
      });
      console.log('Captured bento_section_after_6b33d3.png');
    }
  }

  await browser.close();
  console.log('All captures done.');
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
