const http = require('http');
const fs = require('fs');

async function getWsUrl() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const tabs = JSON.parse(data);
        const tab = tabs.find(t => t.url.includes('localhost:3000'));
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

  // 1. Supplier
  await sendCommand(ws, 'Runtime.evaluate', {
    expression: 'window.scrollTo({ top: 2500, behavior: "instant" });'
  });
  await new Promise(r => setTimeout(r, 700));
  const sShot = await sendCommand(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/shriyansh Sharma/.gemini/antigravity-ide/brain/ad10bc9d-560d-46a7-aa2c-08680e468c5a/final_supplier_view.png', Buffer.from(sShot.data, 'base64'));

  // 2. Brand
  await sendCommand(ws, 'Runtime.evaluate', {
    expression: 'window.scrollTo({ top: 3310, behavior: "instant" });'
  });
  await new Promise(r => setTimeout(r, 700));
  const bShot = await sendCommand(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/shriyansh Sharma/.gemini/antigravity-ide/brain/ad10bc9d-560d-46a7-aa2c-08680e468c5a/final_brand_view.png', Buffer.from(bShot.data, 'base64'));

  console.log('Saved both final views!');
  ws.close();
}

run().catch(console.error);
