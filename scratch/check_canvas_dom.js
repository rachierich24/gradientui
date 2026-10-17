const http = require('http');

async function checkConsole() {
  const tabs = await new Promise((resolve) => {
    http.get('http://localhost:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
  });
  const tab = tabs.find(t => t.url && t.url.includes('localhost:3000'));
  if (!tab) return console.log('No tab');

  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  ws.addEventListener('message', (e) => {
    const msg = JSON.parse(e.data);
    if (msg.method === 'Runtime.consoleAPICalled' || msg.method === 'Log.entryAdded' || msg.method === 'Runtime.exceptionThrown') {
      console.log('BROWSER EVENT:', JSON.stringify(msg.params));
    }
  });

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

  await send(1, 'Runtime.enable');
  await send(2, 'Log.enable');

  const evalRes = await send(3, 'Runtime.evaluate', {
    expression: '(() => { const c = document.querySelector(".sup-three-canvas-container"); const canvas = c ? c.querySelector("canvas") : null; return { hasContainer: !!c, hasCanvas: !!canvas, canvasW: canvas ? canvas.width : 0, canvasH: canvas ? canvas.height : 0, windowW: window.innerWidth, windowH: window.innerHeight }; })()',
    returnByValue: true
  });

  console.log('DOM check:', JSON.stringify(evalRes));
  setTimeout(() => process.exit(0), 1000);
}

checkConsole();
