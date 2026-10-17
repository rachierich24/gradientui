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

  // Ensure scroll is centered
  await sendCommand(ws, 'Runtime.evaluate', {
    expression: `
      if (window.lenis) {
        window.lenis.scrollTo(1000, { immediate: true });
      } else {
        window.scrollTo(0, 1000);
      }
    `
  });
  await new Promise(r => setTimeout(r, 600));

  for (let stage = 1; stage <= 6; stage++) {
    console.log(`Switching to Stage ${stage}...`);
    await sendCommand(ws, 'Runtime.evaluate', {
      expression: `
        const pills = document.querySelectorAll('.sup-step-pill');
        if (pills[${stage - 1}]) {
          pills[${stage - 1}].click();
        }
      `
    });
    await new Promise(r => setTimeout(r, 700));

    const shot = await sendCommand(ws, 'Page.captureScreenshot', { format: 'png' });
    const filename = `C:/Users/shriyansh Sharma/.gemini/antigravity-ide/brain/a3be52fd-3d82-409f-a95c-e418fda5192c/motion_stage_${stage}.png`;
    fs.writeFileSync(filename, Buffer.from(shot.data, 'base64'));
    console.log(`Saved motion_stage_${stage}.png`);
  }

  ws.close();
}

run().catch(console.error);
