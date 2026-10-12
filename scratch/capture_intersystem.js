const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

async function main() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edge = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9230',
    '--user-data-dir=scratch/edge-profile-inter',
    '--window-size=1500,1050',
    'http://localhost:3000'
  ]);

  await new Promise(r => setTimeout(r, 2500));

  const version = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9230/json/list', res => {
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

  await send('Runtime.evaluate', {
    expression: `
      window.scrollTo(0, 0);
      const target = document.getElementById('intersystem');
      if (target) {
        const top = target.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: top - 20, behavior: 'instant' });
      }
    `
  });
  await new Promise(r => setTimeout(r, 1200));

  // Capture frame 1
  let ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/inter_frame1.png', Buffer.from(ss.data, 'base64'));

  // Wait 3s into animation and capture frame 2
  await new Promise(r => setTimeout(r, 3000));
  ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/inter_frame2.png', Buffer.from(ss.data, 'base64'));

  // Wait 5s into animation and capture frame 3
  await new Promise(r => setTimeout(r, 5000));
  ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/inter_frame3.png', Buffer.from(ss.data, 'base64'));

  console.log('Successfully captured inter_frame1.png, inter_frame2.png, inter_frame3.png');
  ws.close();
  edge.kill();
}

main().catch(console.error);
