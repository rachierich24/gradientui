const http = require('http');

async function check() {
  const tabs = await new Promise((res, rej) => {
    http.get('http://localhost:9222/json', r => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => res(JSON.parse(d)));
    }).on('error', rej);
  });
  const tab = tabs.find(t => t.url.includes('localhost:3000'));
  if (!tab) { console.log('No tab'); return; }
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  function send(method, params) {
    return new Promise(res => {
      const id = 123;
      ws.onmessage = e => {
        const msg = JSON.parse(e.data);
        if (msg.id === id) res(msg.result);
      };
      ws.send(JSON.stringify({ id, method, params }));
    });
  }
  const evalRes = await send('Runtime.evaluate', {
    expression: `
      Promise.all(['/cafe.mp4', '/suppliers.mp4', '/brands.mp4'].map(src => {
        return new Promise(resolve => {
          const v = document.createElement('video');
          v.src = src;
          v.onloadedmetadata = () => resolve({ src, duration: v.duration, w: v.videoWidth, h: v.videoHeight });
          v.onerror = (e) => resolve({ src, error: true });
        });
      }))
    `,
    awaitPromise: true,
    returnByValue: true
  });
  console.log('Video details:', JSON.stringify(evalRes.result.value, null, 2));
  ws.close();
}
check().catch(console.error);
