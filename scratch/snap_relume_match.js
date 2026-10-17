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
        // Find any regular page tab (type 'page' or has webSocketDebuggerUrl)
        const tab = tabs.find(t => t.type === 'page' && !t.url.startsWith('chrome://'));
        if (tab) resolve(tab.webSocketDebuggerUrl);
        else reject(new Error('Page tab not found'));
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
  console.log('Connected to CDP page');

  // Navigate back to our local supplier portal
  await sendCommand(ws, 'Page.navigate', { url: 'http://localhost:3000/supplier' });
  await new Promise(r => setTimeout(r, 2500));

  const artifactDir = path.join('C:', 'Users', 'shriyansh Sharma', '.gemini', 'antigravity-ide', 'brain', 'a3be52fd-3d82-409f-a95c-e418fda5192c');

  // 1. Hero top screenshot
  await sendCommand(ws, 'Runtime.evaluate', {
    expression: 'window.scrollTo(0, 0);'
  });
  await new Promise(r => setTimeout(r, 600));
  let snap = await sendCommand(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'relume_match_1_hero.png'), Buffer.from(snap.data, 'base64'));
  console.log('Captured relume_match_1_hero.png');

  // 2. Workspace on Green Cutting Mat
  await sendCommand(ws, 'Runtime.evaluate', {
    expression: `
      (function() {
        const el = document.getElementById('order-workspace');
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
  snap = await sendCommand(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'relume_match_2_workspace_mat.png'), Buffer.from(snap.data, 'base64'));
  console.log('Captured relume_match_2_workspace_mat.png');

  // 3. Logo banner + Choose your operation path (section after dashboard)
  await sendCommand(ws, 'Runtime.evaluate', {
    expression: `
      (function() {
        const el = document.getElementById('operation-path');
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
  snap = await sendCommand(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'relume_match_3_operation_path.png'), Buffer.from(snap.data, 'base64'));
  console.log('Captured relume_match_3_operation_path.png');

  ws.close();
  console.log('Done capturing all Relume match snapshots!');
}

run().catch(console.error);
