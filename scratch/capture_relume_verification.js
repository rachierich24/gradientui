const http = require('http');
const fs = require('fs');

async function getWsUrl() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const tabs = JSON.parse(data);
        const tab = tabs.find(t => t.url && t.url.includes('localhost:3000'));
        if (tab) resolve(tab.webSocketDebuggerUrl);
        else reject(new Error('Tab not found'));
      });
    }).on('error', reject);
  });
}

function sendCommand(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 1000000);
    const handler = (event) => {
      try {
        const raw = typeof event.data === 'string' ? event.data : event.data.toString();
        const msg = JSON.parse(raw);
        if (msg.id === id) {
          ws.removeEventListener('message', handler);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      } catch (err) {
        console.error('Error parsing msg:', err);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function takeShot(ws, filename) {
  const screenshot = await sendCommand(ws, 'Page.captureScreenshot', { format: 'png' });
  const buffer = Buffer.from(screenshot.data, 'base64');
  const path = `C:/Users/shriyansh Sharma/.gemini/antigravity-ide/brain/a3be52fd-3d82-409f-a95c-e418fda5192c/${filename}`;
  fs.writeFileSync(path, buffer);
  console.log(`Saved ${filename}`);
}

async function run() {
  const wsUrl = await getWsUrl();
  const ws = new WebSocket(wsUrl);
  await new Promise(r => ws.onopen = r);

  console.log('Connected to CDP');

  // Reload page to get fresh state
  await sendCommand(ws, 'Page.navigate', { url: 'http://localhost:3000/supplier' });
  await new Promise(r => setTimeout(r, 2200));

  // 1. Hero top screenshot
  await sendCommand(ws, 'Runtime.evaluate', {
    expression: `window.scrollTo(0, 0);`
  });
  await new Promise(r => setTimeout(r, 600));
  await takeShot(ws, 'relume_verify_1_hero.png');

  // 1.5 Header & Scrubber controls bar
  await sendCommand(ws, 'Runtime.evaluate', {
    expression: `
      const el = document.querySelector('#order-workspace');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    `
  });
  await new Promise(r => setTimeout(r, 600));
  await takeShot(ws, 'relume_verify_scrubber_row.png');

  // 2. Scroll so dashboard cutting mat is centered in viewport
  await sendCommand(ws, 'Runtime.evaluate', {
    expression: `
      const target = document.querySelector('.sup-stage-cutting-mat') || document.querySelector('#order-workspace');
      if (target) {
        target.scrollIntoView({ behavior: 'instant', block: 'center' });
      }
    `
  });
  await new Promise(r => setTimeout(r, 800));
  await takeShot(ws, 'relume_verify_2_dashboard_center.png');

  // 3. Scroll to post-dashboard sections: Partner Logos & Operation Paths
  await sendCommand(ws, 'Runtime.evaluate', {
    expression: `
      const opSection = document.querySelector('.sup-logos-section') || document.querySelector('.sup-path-showcase-grid');
      if (opSection) {
        opSection.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    `
  });
  await new Promise(r => setTimeout(r, 800));
  await takeShot(ws, 'relume_verify_3_post_dashboard.png');

  // 4. Scroll further down to see the 2 comparison cards in full
  await sendCommand(ws, 'Runtime.evaluate', {
    expression: `window.scrollBy(0, 450);`
  });
  await new Promise(r => setTimeout(r, 600));
  await takeShot(ws, 'relume_verify_4_cards.png');

  ws.close();
  console.log('Done!');
}

run().catch(console.error);
