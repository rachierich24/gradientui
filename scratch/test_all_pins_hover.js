const { chromium } = require('playwright');
const path = require('path');

async function checkAllPins() {
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch (e) {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000/brand ...');
  await page.goto('http://localhost:3000/brand', { waitUntil: 'networkidle' });

  // Scroll to demand section
  const demandSection = page.locator('.bfx-s-demand');
  if (await demandSection.count() > 0) {
    await demandSection.scrollIntoViewIfNeeded();
  } else {
    // try finding ddm-container
    const ddm = page.locator('.ddm-container');
    await ddm.scrollIntoViewIfNeeded();
  }
  await page.waitForTimeout(1000);

  const container = await page.locator('.ddm-container').boundingBox();
  console.log('Container bounding box:', container);

  const pins = await page.$$eval('.ddm-pin-wrapper', els => {
    return els.map(el => {
      const name = el.querySelector('.ddm-pin-name')?.textContent?.trim();
      const style = el.getAttribute('style') || '';
      return { name, style };
    });
  });

  console.log(`Found ${pins.length} pins:`, pins.map(p => p.name));

  const artifactDir = 'C:/Users/shriyansh Sharma/.gemini/antigravity/brain/19c4ab20-86a1-42ea-b5b2-b8140e9268b8';

  for (let i = 0; i < pins.length; i++) {
    const pinName = pins[i].name;
    const pinWrapper = page.locator('.ddm-pin-wrapper').nth(i);
    const badge = pinWrapper.locator('.ddm-pin-badge');
    const tooltip = pinWrapper.locator('.ddm-tooltip');

    // Hover badge
    await badge.hover({ force: true });
    await page.waitForTimeout(300);

    const cBox = await page.locator('.ddm-container').boundingBox();
    const tBox = await tooltip.boundingBox();
    const bBox = await badge.boundingBox();

    console.log(`\n--- Pin [${i}]: ${pinName} ---`);
    console.log('Badge box:', bBox);
    console.log('Tooltip box:', tBox);

    if (tBox && cBox) {
      const clippedTop = tBox.y < cBox.y;
      const clippedBottom = (tBox.y + tBox.height) > (cBox.y + cBox.height);
      const clippedLeft = tBox.x < cBox.x;
      const clippedRight = (tBox.x + tBox.width) > (cBox.x + cBox.width);

      console.log(`Clipping check -> Top: ${clippedTop}, Bottom: ${clippedBottom}, Left: ${clippedLeft}, Right: ${clippedRight}`);
      if (clippedTop || clippedBottom || clippedLeft || clippedRight) {
        console.warn(`WARNING: Pin ${pinName} is CLIPPED!`);
      } else {
        console.log(`SUCCESS: Pin ${pinName} is fully inside container!`);
      }
    } else {
      console.error(`ERROR: Tooltip or container box missing for ${pinName}`);
    }

    const snapPath = path.join(artifactDir, `pin_hover_${i}_${pinName.replace(/\s+/g, '_').toLowerCase()}.png`);
    await page.locator('.ddm-container').screenshot({ path: snapPath });
  }

  await browser.close();
}

checkAllPins().catch(console.error);
