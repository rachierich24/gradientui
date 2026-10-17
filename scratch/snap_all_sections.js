const http = require('http');
const fs = require('fs');
const path = require('path');

async function getWsUrl() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const tabs = JSON.parse(data);
        const tab = tabs.find(t => t.url && (t.url.includes('/supplier') || t.url.includes('localhost:3000')));
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
  console.log('Connected to CDP via global WebSocket');

  // Navigate to /supplier and wait
  await sendCommand(ws, 'Page.navigate', { url: 'http://localhost:3000/supplier' });
  await new Promise(r => setTimeout(r, 2500));

  const sections = ['benefits', 'workflow', 'inventory', 'dispatch', 'analytics', 'integrations', 'trust', 'faq', 'cta'];
  const artifactDir = path.join('C:', 'Users', 'shriyansh Sharma', '.gemini', 'antigravity-ide', 'brain', 'a3be52fd-3d82-409f-a95c-e418fda5192c');

  for (const id of sections) {
    await sendCommand(ws, 'Runtime.evaluate', {
      expression: `
        (function() {
          const el = document.getElementById('${id}');
          if (el) {
            if (window.lenis) {
              window.lenis.scrollTo(el, { immediate: true });
            } else {
              el.scrollIntoView({ behavior: 'instant' });
            }
          }
        })()
      `
    });
    await new Promise(r => setTimeout(r, 800));

    const snap = await sendCommand(ws, 'Page.captureScreenshot', { format: 'png' });
    const filePath = path.join(artifactDir, `redesign_sec_${id}.png`);
    fs.writeFileSync(filePath, Buffer.from(snap.data, 'base64'));
    console.log(`Saved screenshot for #${id} -> ${filePath}`);
  }

  ws.close();
  console.log('All sections successfully captured!');
}

run().catch(console.error);
