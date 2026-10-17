const http = require('http');
const fs = require('fs');

async function getWsUrl() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const tabs = JSON.parse(data);
        const tab = tabs.find(t => t.id === 'C4B0A1DEB45CE4A57E3D78BBAB6C3A1A');
        resolve(tab.webSocketDebuggerUrl);
      });
    }).on('error', reject);
  });
}

async function run() {
  const wsUrl = await getWsUrl();
  const ws = new WebSocket(wsUrl);
  await new Promise(r => ws.onopen = r);

  let reqId = 1;
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = reqId++;
      const handler = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.id === id) {
          ws.removeEventListener('message', handler);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');

  // Set scroll
  await send('Runtime.evaluate', {
    expression: 'window.lenis ? window.lenis.scrollTo(1000, { immediate: true }) : window.scrollTo(0, 1000)'
  });
  await new Promise(r => setTimeout(r, 600));

  // Loop through stages 3, 4, 5, 6
  for (const stage of [3, 4, 5, 6]) {
    await send('Runtime.evaluate', {
      expression: `
        const pills = document.querySelectorAll('.sup-step-pill');
        if (pills[${stage - 1}]) pills[${stage - 1}].click();
      `
    });
    await new Promise(r => setTimeout(r, 800));

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(`C:/Users/shriyansh Sharma/.gemini/antigravity-ide/brain/a3be52fd-3d82-409f-a95c-e418fda5192c/motion_stage_${stage}_verified.png`, Buffer.from(shot.data, 'base64'));
    console.log(`Saved motion_stage_${stage}_verified.png`);
  }

  ws.close();
}

run().catch(console.error);
