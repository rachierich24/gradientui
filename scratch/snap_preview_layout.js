const http = require('http');
const fs = require('fs');

http.get('http://localhost:9222/json', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const list = JSON.parse(d);
    const tab = list.find(t => t.type === 'page' && t.url.includes('localhost:3000'));
    if (!tab) return;
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    ws.onopen = async () => {
      function send(method, params) {
        return new Promise(r => {
          const id = Math.floor(Math.random() * 100000);
          const h = e => {
            const m = JSON.parse(e.data);
            if (m.id === id) { ws.removeEventListener('message', h); r(m.result); }
          };
          ws.addEventListener('message', h);
          ws.send(JSON.stringify({ id, method, params }));
        });
      }

      await send('Page.navigate', { url: 'http://localhost:3000/scratch/preview_videos_layout.html' });
      await new Promise(r => setTimeout(r, 1200));

      const ss = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('scratch/snap_layout_direct.png', Buffer.from(ss.data, 'base64'));
      console.log('Saved scratch/snap_layout_direct.png');

      await send('Page.navigate', { url: 'http://localhost:3000/' });
      ws.close();
    };
  });
});
