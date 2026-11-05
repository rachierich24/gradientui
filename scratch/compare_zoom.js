const path = require('path');
const { chromium } = require(path.resolve('node_modules/playwright'));

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  const cwd = process.cwd().replace(/\\/g, '/');
  const imgUrl = `file:///${cwd}/public/brand/delhi-demand-map-3d-cutout.png`;

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { margin: 0; background: #fafafa; display: flex; flex-direction: column; gap: 20px; padding: 20px; }
      .row { display: flex; gap: 20px; }
      .viewport { width: 500px; height: 260px; overflow: hidden; position: relative; border: 1px solid #ccc; background: #fff; }
      
      /* Method A: Current (transform: scale on parent with will-change and preserve-3d) */
      .stage-a {
        width: 100%; height: 100%; position: absolute;
        transform: translate3d(0, 0, 0) scale(2.8) perspective(1200px);
        transform-origin: 50% 50%;
        will-change: transform;
        transform-style: preserve-3d;
      }
      .stage-a img { width: 100%; height: 100%; object-fit: contain; }

      /* Method B: No will-change, 2D transform */
      .stage-b {
        width: 100%; height: 100%; position: absolute;
        transform: scale(2.8);
        transform-origin: 50% 50%;
      }
      .stage-b img { width: 100%; height: 100%; object-fit: contain; }

      /* Method C: Canvas 2D or SVG viewport where image is drawn at native 2752x1536 resolution! */
      .stage-c {
        width: 100%; height: 100%; position: absolute;
      }
      .stage-c svg {
        width: 100%; height: 100%; display: block;
      }

      /* Method D: Direct layout sizing with pan/zoom (image width/height scale with zoom) */
      .stage-d {
        position: absolute;
        left: 50%; top: 50%;
        transform: translate(-50%, -50%);
        width: calc(500px * 2.8);
        height: calc(260px * 2.8);
      }
      .stage-d img { width: 100%; height: 100%; object-fit: contain; }
    </style>
  </head>
  <body>
    <h3>Method A (Current CSS transform with will-change) vs Method B (Clean 2D) vs Method C (SVG/Canvas) vs Method D (Layout sizing)</h3>
    <div class="row">
      <div>
        <p>Method A: GPU layer scale (blurry)</p>
        <div class="viewport"><div class="stage-a"><img src="${imgUrl}"></div></div>
      </div>
      <div>
        <p>Method B: Clean 2D scale</p>
        <div class="viewport"><div class="stage-b"><img src="${imgUrl}"></div></div>
      </div>
    </div>
    <div class="row">
      <div>
        <p>Method C: SVG viewBox native zoom</p>
        <div class="viewport">
          <div class="stage-c">
            <svg viewBox="900 450 952 531" preserveAspectRatio="xMidYMid meet">
              <image href="${imgUrl}" width="2752" height="1536" />
            </svg>
          </div>
        </div>
      </div>
      <div>
        <p>Method D: Direct layout width/height</p>
        <div class="viewport"><div class="stage-d"><img src="${imgUrl}"></div></div>
      </div>
    </div>
  </body>
  </html>
  `;

  await page.setContent(html);
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: 'C:/Users/shriyansh Sharma/.gemini/antigravity/brain/19c4ab20-86a1-42ea-b5b2-b8140e9268b8/compare_zoom_methods.png',
    fullPage: true,
  });
  await browser.close();
  console.log('Saved compare_zoom_methods.png');
})();

