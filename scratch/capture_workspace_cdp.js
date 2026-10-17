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

  // Scroll to workspace with Lenis
  await sendCommand(ws, 'Runtime.evaluate', {
    expression: `
      if (window.lenis) {
        window.lenis.scrollTo('#order-workspace', { immediate: true });
      }
    `
  });
  await new Promise(r => setTimeout(r, 700));

  // 1. Stage 4: Prepare & Pack
  await sendCommand(ws, 'Runtime.evaluate', {
    expression: `
      const pills = document.querySelectorAll('.sup-step-pill');
      if (pills[3]) pills[3].click();
    `
  });
  await new Promise(r => setTimeout(r, 600));
  const shot4 = await sendCommand(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/shriyansh Sharma/.gemini/antigravity-ide/brain/a3be52fd-3d82-409f-a95c-e418fda5192c/cdp_workspace_stage4.png', Buffer.from(shot4.data, 'base64'));
  console.log('Saved cdp_workspace_stage4.png');

  // 2. Stage 5: Dispatch Route
  await sendCommand(ws, 'Runtime.evaluate', {
    expression: `
      const pills = document.querySelectorAll('.sup-step-pill');
      if (pills[4]) pills[4].click();
    `
  });
  await new Promise(r => setTimeout(r, 700));
  const shot5 = await sendCommand(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/shriyansh Sharma/.gemini/antigravity-ide/brain/a3be52fd-3d82-409f-a95c-e418fda5192c/cdp_workspace_stage5.png', Buffer.from(shot5.data, 'base64'));
  console.log('Saved cdp_workspace_stage5.png');

  // 3. Stage 6: Delivery Completed
  await sendCommand(ws, 'Runtime.evaluate', {
    expression: `
      const pills = document.querySelectorAll('.sup-step-pill');
      if (pills[5]) pills[5].click();
    `
  });
  await new Promise(r => setTimeout(r, 600));
  const shot6 = await sendCommand(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/shriyansh Sharma/.gemini/antigravity-ide/brain/a3be52fd-3d82-409f-a95c-e418fda5192c/cdp_workspace_stage6.png', Buffer.from(shot6.data, 'base64'));
  console.log('Saved cdp_workspace_stage6.png');

  ws.close();
}

run().catch(console.error);
