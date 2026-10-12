const http = require('http');

async function test() {
  const version = await new Promise((resolve) => {
    http.get('http://127.0.0.1:9222/json/list', res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    });
  });
  const page = version.find(p => p.type === 'page' && p.url.includes('localhost:3000'));
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

  const res = await send('Runtime.evaluate', {
    expression: `(() => {
      const target = document.getElementById('intersystem');
      const rect = target ? target.getBoundingClientRect() : null;
      const windowHeight = window.innerHeight;
      const scrollY = window.scrollY;
      const stage = document.querySelector('.att-stage');
      const stageRect = stage ? stage.getBoundingClientRect() : null;
      const wires = document.querySelectorAll('.att-wire-path').length;
      return {
        scrollY,
        windowHeight,
        targetRect: rect ? { top: rect.top, bottom: rect.bottom, height: rect.height } : null,
        stageRect: stageRect ? { top: stageRect.top, bottom: stageRect.bottom, width: stageRect.width, height: stageRect.height } : null,
        wiresCount: wires
      };
    })()`,
    returnByValue: true
  });
  console.log('InView check:', res.result ? res.result.value : res);
  ws.close();
}

test().catch(console.error);
