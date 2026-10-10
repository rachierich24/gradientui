const http = require('http');
const fs = require('fs');

async function test() {
  const version = await new Promise((resolve) => {
    http.get('http://127.0.0.1:9222/json/list', res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    });
  });
  const page = version.find(p => p.type === 'page' && p.url.includes('localhost:3000'));
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 1;
  function send(method, params = {}) {
    return new Promise((resolve) => {
      const msgId = id++;
      const handler = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id === msgId) {
          ws.removeEventListener('message', handler);
          resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  // Set window size & viewport
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  // Scroll to intersystem
  await send('Runtime.evaluate', {
    expression: `
      const target = document.getElementById('intersystem');
      if (target) {
        const top = target.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: top - 30, behavior: 'instant' });
      }
    `
  });
  await new Promise(r => setTimeout(r, 600));

  // Snap 1: Early phase
  let ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/minimal_attio_snap1.png', Buffer.from(ss.data, 'base64'));
  console.log('Saved minimal_attio_snap1.png');

  // Wait 4s: Supplier phase
  await new Promise(r => setTimeout(r, 4500));
  ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/minimal_attio_snap2.png', Buffer.from(ss.data, 'base64'));
  console.log('Saved minimal_attio_snap2.png');

  // Wait 6s: Brand phase
  await new Promise(r => setTimeout(r, 6500));
  ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/minimal_attio_snap3.png', Buffer.from(ss.data, 'base64'));
  console.log('Saved minimal_attio_snap3.png');

  ws.close();
}

test().catch(console.error);
