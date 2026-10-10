const http = require('http');

http.get('http://localhost:9222/json', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const list = JSON.parse(d);
    const tab = list.find(t => t.type === 'page' && t.url.includes('localhost:3000'));
    if (!tab) {
      console.log('Tabs:', list.map(t => t.url));
      return;
    }
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    ws.onopen = () => {
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: {
          expression: `
            Promise.all(['/cafe.mp4', '/suppliers.mp4', '/brands.mp4'].map(s => new Promise(r => {
              const v = document.createElement('video');
              v.src = s;
              v.onloadedmetadata = () => r({ s, w: v.videoWidth, h: v.videoHeight, dur: v.duration });
              v.onerror = (e) => r({ s, err: true });
            })))
          `,
          awaitPromise: true,
          returnByValue: true
        }
      }));
    };
    ws.onmessage = e => {
      const msg = JSON.parse(e.data);
      if (msg.id === 1) {
        console.log('Result:', JSON.stringify(msg.result.result.value, null, 2));
        ws.close();
      }
    };
  });
});
