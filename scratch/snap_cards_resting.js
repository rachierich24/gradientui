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

function send(ws, method, params = {}) {
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
      } catch (e) {}
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function run() {
  const wsUrl = await getWsUrl();
  const ws = new WebSocket(wsUrl);
  await new Promise(r => ws.onopen = r);

  // Close modal if open
  await send(ws, 'Runtime.evaluate', {
    expression: `
      const closeBtn = document.querySelector('.eco-macbook-close-btn');
      if (closeBtn) closeBtn.click();
    `
  });
  await new Promise(r => setTimeout(r, 600));

  // Scroll smoothly to #ecosystem-cards
  await send(ws, 'Runtime.evaluate', {
    expression: `
      const el = document.getElementById('ecosystem-cards');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    `
  });
  await new Promise(r => setTimeout(r, 800));

  let ss = await send(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/cards_section_resting.png', Buffer.from(ss.data, 'base64'));
  console.log('Saved scratch/cards_section_resting.png');

  ws.close();
}

run().catch(console.error);
