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

  // Scroll to #ecosystem-cards
  await sendCommand(ws, 'Runtime.evaluate', {
    expression: `
      const el = document.getElementById('ecosystem-cards');
      if (el) {
        el.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    `
  });

  await new Promise(r => setTimeout(r, 800));

  // Take screenshot
  const screenshot = await sendCommand(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/ecosystem_current.png', Buffer.from(screenshot.data, 'base64'));
  console.log('Saved scratch/ecosystem_current.png');

  // Click on the first card
  await sendCommand(ws, 'Runtime.evaluate', {
    expression: `
      const card = document.querySelector('.eco-card');
      if (card) {
        card.click();
      }
    `
  });

  await new Promise(r => setTimeout(r, 600));

  // Take screenshot of opened modal
  const modalScreenshot = await sendCommand(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/ecosystem_modal_current.png', Buffer.from(modalScreenshot.data, 'base64'));
  console.log('Saved scratch/ecosystem_modal_current.png');

  ws.close();
}

run().catch(console.error);
