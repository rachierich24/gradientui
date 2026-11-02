const { chromium } = require('playwright');
const path = require('path');

async function main() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  const consoleLogs = [];
  const pageErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleLogs.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    pageErrors.push(err.message);
  });

  const targetUrl = 'https://gradientui-ehfc.vercel.app/brand';
  console.log(`Navigating to live Vercel URL: ${targetUrl}...`);
  const response = await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
  console.log(`Page HTTP Status: ${response.status()}`);

  await page.waitForTimeout(2000);

  // Remove any cookies or overlay banner if present
  await page.evaluate(() => {
    document.querySelectorAll('div').forEach(el => {
      if (el.textContent && el.textContent.includes('We use cookies') && el.style.position !== 'relative') {
        el.remove();
      }
    });
  });

  const outDir = 'C:/Users/shriyansh Sharma/.gemini/antigravity/brain/19c4ab20-86a1-42ea-b5b2-b8140e9268b8';

  // 1. Screenshot of Live Vercel Navbar + Hero
  console.log('Capturing Live Vercel Hero + Navbar...');
  await page.screenshot({
    path: path.join(outDir, 'vercel_live_hero_navbar.png'),
    clip: { x: 0, y: 0, width: 1440, height: 780 }
  });

  // 2. Scroll into #capabilities
  console.log('Scrolling to #capabilities on live Vercel deployment...');
  const cap = await page.$('#capabilities');
  if (cap) {
    await cap.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);

    // Capture Full Capabilities section
    await page.screenshot({
      path: path.join(outDir, 'vercel_live_capabilities.png')
    });

    // Capture individual 3D cards
    const cards = await page.$$('.bmoat-card');
    console.log(`Found ${cards.length} cards on live Vercel`);
    for (let i = 0; i < cards.length; i++) {
      await cards[i].screenshot({
        path: path.join(outDir, `vercel_live_card_${i + 1}.png`)
      });
    }

    // Check if WebGL canvases exist inside graphic frames
    const canvasesCount = await page.$$eval('.bmoat-stage-left canvas', els => els.length);
    console.log(`Active WebGL canvases rendered on live Vercel: ${canvasesCount}`);
  } else {
    console.error('Capabilities section #capabilities not found!');
  }

  console.log('\nPage Errors:', pageErrors);
  console.log('Console Errors:', consoleLogs);

  await browser.close();
  console.log('Live Vercel verification complete!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

