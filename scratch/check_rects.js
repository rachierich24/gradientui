const http = require('http');

async function run() {
  http.get('http://localhost:9222/json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', async () => {
      const tabs = JSON.parse(data);
      const tab = tabs.find(t => t.url.includes('localhost:3000'));
      const ws = new WebSocket(tab.webSocketDebuggerUrl);
      await new Promise(r => ws.onopen = r);

      function sendCommand(method, params = {}) {
        return new Promise((resolve) => {
          const id = 12345;
          const handler = (event) => {
            const raw = typeof event.data === 'string' ? event.data : event.data.toString();
            const msg = JSON.parse(raw);
            if (msg.id === id) {
              ws.removeEventListener('message', handler);
              resolve(msg.result);
            }
          };
          ws.addEventListener('message', handler);
          ws.send(JSON.stringify({ id, method, params }));
        });
      }

      const evalRes = await sendCommand('Runtime.evaluate', {
        expression: `
          JSON.stringify({
            forCafes: document.getElementById('for-cafes') ? document.getElementById('for-cafes').getBoundingClientRect() : null,
            forSuppliers: document.getElementById('for-suppliers') ? document.getElementById('for-suppliers').getBoundingClientRect() : null,
            forBrands: document.getElementById('for-brands') ? document.getElementById('for-brands').getBoundingClientRect() : null,
            scrollY: window.scrollY,
            pageHeight: document.body.scrollHeight
          })
        `
      });
      console.log(evalRes.result.value);
      ws.close();
    });
  });
}

run();
