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
        resolve(tab.webSocketDebuggerUrl);
      });
    });
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

async function setViewport(ws, width, height) {
  await sendCommand(ws, 'Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 768,
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

  console.log('Testing responsive viewports...');

  // 1. 1440x900 Desktop
  await setViewport(ws, 1440, 900);
  await sendCommand(ws, 'Runtime.evaluate', { expression: `window.scrollTo(0, 0);` });
  await new Promise(r => setTimeout(r, 600));
  await takeShot(ws, 'viewport_1440_hero.png');

  // 2. 1280x720 Laptop
  await setViewport(ws, 1280, 720);
  await new Promise(r => setTimeout(r, 600));
  await takeShot(ws, 'viewport_1280_hero.png');

  // 3. 1024x768 Tablet
  await setViewport(ws, 1024, 768);
  await new Promise(r => setTimeout(r, 600));
  await takeShot(ws, 'viewport_1024_hero.png');

  // 4. 768x1024 Portrait Tablet
  await setViewport(ws, 768, 1024);
  await new Promise(r => setTimeout(r, 600));
  await takeShot(ws, 'viewport_768_hero.png');

  // 5. 390x844 Mobile
  await setViewport(ws, 390, 844);
  await new Promise(r => setTimeout(r, 600));
  await takeShot(ws, 'viewport_390_mobile.png');

  // Reset back to desktop 1536x778
  await setViewport(ws, 1536, 778);
  ws.close();
  console.log('Responsive testing complete!');
}

run().catch(console.error);
