const http = require('http');

async function inspectThree() {
  const tabs = await new Promise((resolve) => {
    http.get('http://localhost:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
  });
  const tab = tabs.find(t => t.url && t.url.includes('localhost:3000'));
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  const send = (id, method, params = {}) => {
    return new Promise((resolve) => {
      const handler = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.id === id) {
          ws.removeEventListener('message', handler);
          resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  };

  const evalRes = await send(1, 'Runtime.evaluate', {
    expression: '(() => { const container = document.querySelector(".sup-three-canvas-container"); const canvas = container ? container.querySelector("canvas") : null; return { hasContainer: !!container, hasCanvas: !!canvas, canvasStyle: canvas ? canvas.getAttribute("style") : null, containerStyle: container ? container.getAttribute("style") : null, clientWidth: container ? container.clientWidth : 0, clientHeight: container ? container.clientHeight : 0, windowW: window.innerWidth, windowH: window.innerHeight }; })()',
    returnByValue: true
  });
  console.log('Container check:', evalRes.result.value);
  process.exit(0);
}

inspectThree();
