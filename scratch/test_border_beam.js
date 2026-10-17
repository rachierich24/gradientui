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

async function run() {
  const wsUrl = await getWsUrl();
  const ws = new WebSocket(wsUrl);
  await new Promise(r => ws.onopen = r);

  console.log('Connected to CDP');

  // Hard reload page
  await sendCommand(ws, 'Page.navigate', { url: 'http://localhost:3000/supplier' });
  await new Promise(r => setTimeout(r, 2000));

  // Capture navbar button area
  const shotNav = await sendCommand(ws, 'Page.captureScreenshot', {
    format: 'png',
    clip: { x: 1100, y: 0, width: 436, height: 80, scale: 2 }
  });
  fs.writeFileSync('C:/Users/shriyansh Sharma/.gemini/antigravity-ide/brain/a3be52fd-3d82-409f-a95c-e418fda5192c/beam_nav_btn.png', Buffer.from(shotNav.data, 'base64'));
  console.log('Saved beam_nav_btn.png');

  // Capture hero CTA button area
  const shotHero = await sendCommand(ws, 'Page.captureScreenshot', {
    format: 'png',
    clip: { x: 450, y: 440, width: 636, height: 140, scale: 2 }
  });
  fs.writeFileSync('C:/Users/shriyansh Sharma/.gemini/antigravity-ide/brain/a3be52fd-3d82-409f-a95c-e418fda5192c/beam_hero_btn.png', Buffer.from(shotHero.data, 'base64'));
  console.log('Saved beam_hero_btn.png');

  // Full view
  const shotFull = await sendCommand(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/shriyansh Sharma/.gemini/antigravity-ide/brain/a3be52fd-3d82-409f-a95c-e418fda5192c/beam_full_view.png', Buffer.from(shotFull.data, 'base64'));
  console.log('Saved beam_full_view.png');

  ws.close();
}

run().catch(console.error);
