const http = require('http');
const fs = require('fs');

http.get('http://localhost:9222/json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', async () => {
    const tabs = JSON.parse(data);
    const tab = tabs.find(t => t.url.includes('localhost:3000/supplier') || t.id === 'C4B0A1DEB45CE4A57E3D78BBAB6C3A1A');
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let id = 1;
    function send(method, params = {}) {
      return new Promise(resolve => {
        const curId = id++;
        const handler = e => {
          const msg = JSON.parse(e.data);
          if (msg.id === curId) {
            ws.removeEventListener('message', handler);
            resolve(msg.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: curId, method, params }));
      });
    }

    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });

    // 1. Full section element screenshot
    const clipRes = await send('Runtime.evaluate', {
      expression: '(() => { const el = document.getElementById("features"); const r = el.getBoundingClientRect(); return { x: 0, y: window.scrollY + r.top, width: 1440, height: r.height, scale: 1 }; })()',
      returnByValue: true
    });
    const clip = clipRes.result.value;

    const fullShot = await send('Page.captureScreenshot', {
      format: 'jpeg',
      quality: 92,
      clip: clip,
      captureBeyondViewport: true
    });
    fs.writeFileSync('C:/Users/shriyansh Sharma/.gemini/antigravity-ide/brain/a3be52fd-3d82-409f-a95c-e418fda5192c/bento_full_section.jpg', Buffer.from(fullShot.data, 'base64'));
    console.log('Saved bento_full_section.jpg');

    ws.close();
  });
});
