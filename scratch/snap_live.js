const http = require('http');
const fs = require('fs');

async function main() {
  const version = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json/list', res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const page = version.find(p => p.type === 'page' && p.url.includes('localhost:3000'));
  if (!page) {
    console.log('No page on localhost:3000 found');
    return;
  }

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

  // Reload page to refresh state cleanly
  await send('Page.reload');
  await new Promise(r => setTimeout(r, 2000));

  await send('Runtime.evaluate', {
    expression: `
      const target = document.getElementById('intersystem');
      if (target) target.scrollIntoView({ block: 'start' });
    `
  });
  await new Promise(r => setTimeout(r, 800));

  // Snap frame 1 (Phase 1: Cafe active)
  let ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/enhanced_snap1.png', Buffer.from(ss.data, 'base64'));
  console.log('Saved enhanced_snap1.png');

  // Wait 3.5s (Phase 2/3: Grabbit and Supplier)
  await new Promise(r => setTimeout(r, 3500));
  ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/enhanced_snap2.png', Buffer.from(ss.data, 'base64'));
  console.log('Saved enhanced_snap2.png');

  // Wait 6s (Phase 4: Brand & full hold)
  await new Promise(r => setTimeout(r, 6000));
  ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/enhanced_snap3.png', Buffer.from(ss.data, 'base64'));
  console.log('Saved enhanced_snap3.png');

  ws.close();
}

main().catch(console.error);
