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
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });

    // Scroll down to cards 3, 4, 5
    await send('Runtime.evaluate', {
      expression: '(() => { const el = document.querySelector(".sup-bento-card-visibility"); if (el) { el.scrollIntoView({ behavior: "instant" }); } })()'
    });
    await new Promise(r => setTimeout(r, 600));

    let shot390_bottom = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync('C:/Users/shriyansh Sharma/.gemini/antigravity-ide/brain/a3be52fd-3d82-409f-a95c-e418fda5192c/bento_390_bottom.jpg', Buffer.from(shot390_bottom.data, 'base64'));
    console.log('Saved bento_390_bottom.jpg');

    await send('Emulation.clearDeviceMetricsOverride');
    ws.close();
  });
});
