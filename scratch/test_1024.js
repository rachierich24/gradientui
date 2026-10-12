const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

async function main() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edge = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9225',
    '--user-data-dir=scratch/edge-profile-1024',
    '--window-size=1024,800',
    'http://localhost:3000'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  const version = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9225/json/list', res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const page = version.find(p => p.type === 'page');
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

  await send('Page.enable');
  await send('Runtime.enable');
  await new Promise(r => setTimeout(r, 1500));

  // Scroll to green section (for-suppliers)
  await send('Runtime.evaluate', {
    expression: `
      const target = document.getElementById('for-suppliers');
      if (target) target.scrollIntoView({ block: 'start' });
    `
  });
  await new Promise(r => setTimeout(r, 800));

  // Take screenshot BEFORE hover
  let ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/snap_before.png', Buffer.from(ss.data, 'base64'));

  // Trigger hover
  await send('Runtime.evaluate', {
    expression: `
      const btn = document.getElementById('card-nav-tab-0');
      btn.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    `
  });

  // Capture at 50ms, 120ms, 300ms
  await new Promise(r => setTimeout(r, 50));
  ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/snap_50ms.png', Buffer.from(ss.data, 'base64'));

  await new Promise(r => setTimeout(r, 70));
  ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/snap_120ms.png', Buffer.from(ss.data, 'base64'));

  await new Promise(r => setTimeout(r, 200));
  ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/snap_320ms.png', Buffer.from(ss.data, 'base64'));

  console.log('Snapshots taken!');
  ws.close();
  edge.kill();
}

main().catch(console.error);
