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

  // Sample every second for 8 seconds
  for (let i = 0; i < 8; i++) {
    const res = await send('Runtime.evaluate', {
      expression: `(() => {
        const activeDrawing = document.querySelectorAll('.is-active-drawing').length;
        const coloredCards = document.querySelectorAll('.is-colored-cafe, .is-colored-supplier, .is-colored-brand').length;
        const activeWires = document.querySelectorAll('.att-wire-path.is-active').length;
        const svgRays = document.querySelectorAll('.attio-card-beam-svg').length;
        const photons = document.querySelectorAll('.att-photon-packet-core').length;
        return { activeDrawing, coloredCards, activeWires, svgRays, photons };
      })()`,
      returnByValue: true
    });
    console.log(`Sec ${i}:`, res.result ? res.result.value : res);
    await new Promise(r => setTimeout(r, 1000));
  }
  ws.close();
}

test().catch(console.error);
