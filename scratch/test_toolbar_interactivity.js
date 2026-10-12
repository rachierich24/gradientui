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
  if (!page) return;

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

  // Scroll down so the toolbar and lower stage are centered
  await send('Runtime.evaluate', {
    expression: `
      window.scrollBy({ top: 320, behavior: 'instant' });
    `
  });
  await new Promise(r => setTimeout(r, 1000));

  let ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/enhanced_snap_toolbar.png', Buffer.from(ss.data, 'base64'));
  console.log('Saved enhanced_snap_toolbar.png');

  // Click on "3. Fulfillment" button on the toolbar to test interactivity!
  await send('Runtime.evaluate', {
    expression: `
      const btns = Array.from(document.querySelectorAll('.att-phase-btn'));
      const supplierBtn = btns.find(b => b.textContent.includes('Fulfillment'));
      if (supplierBtn) supplierBtn.click();
    `
  });
  await new Promise(r => setTimeout(r, 1500));

  ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/enhanced_snap_interactive_supplier.png', Buffer.from(ss.data, 'base64'));
  console.log('Saved enhanced_snap_interactive_supplier.png');

  ws.close();
}

main().catch(console.error);
