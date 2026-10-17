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

    const clipRes = await send('Runtime.evaluate', {
      expression: '(() => { const r = document.querySelector(".sup-hero-btn-group").getBoundingClientRect(); return { x: r.x - 20, y: r.y - 20, width: r.width + 40, height: r.height + 40, scale: 2 }; })()',
      returnByValue: true
    });
    const clip = clipRes.result.value;

    await new Promise(r => setTimeout(r, 800));
    const shot = await send('Page.captureScreenshot', {
      format: 'png',
      clip: clip
    });
    fs.writeFileSync('C:/Users/shriyansh Sharma/.gemini/antigravity-ide/brain/a3be52fd-3d82-409f-a95c-e418fda5192c/hero_buttons_crop.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved hero_buttons_crop.png');
    ws.close();
  });
});
