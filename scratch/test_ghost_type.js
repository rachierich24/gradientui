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
  await new Promise(r => setTimeout(r, 2200));

  // Capture hero view during ghost type animation
  const shot1 = await sendCommand(ws, 'Page.captureScreenshot', { format: 'png' });
  const buf1 = Buffer.from(shot1.data, 'base64');
  fs.writeFileSync('C:/Users/shriyansh Sharma/.gemini/antigravity-ide/brain/a3be52fd-3d82-409f-a95c-e418fda5192c/ghost_type_hero_1.png', buf1);
  console.log('Saved ghost_type_hero_1.png');

  // Wait for accept phase
  await new Promise(r => setTimeout(r, 1600));

  const shot2 = await sendCommand(ws, 'Page.captureScreenshot', { format: 'png' });
  const buf2 = Buffer.from(shot2.data, 'base64');
  fs.writeFileSync('C:/Users/shriyansh Sharma/.gemini/antigravity-ide/brain/a3be52fd-3d82-409f-a95c-e418fda5192c/ghost_type_hero_2.png', buf2);
  console.log('Saved ghost_type_hero_2.png');

  ws.close();
}

run().catch(console.error);
