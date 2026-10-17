const http = require('http');

http.get('http://localhost:9222/json', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', async () => {
    const tabs = JSON.parse(data);
    const tab = tabs.find(t => t.url && t.url.includes('localhost:3000/supplier'));
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    function evaluate(expr) {
      return new Promise((resolve) => {
        const id = Math.floor(Math.random() * 100000);
        const handler = (e) => {
          const msg = JSON.parse(e.data);
          if (msg.id === id) {
            ws.removeEventListener('message', handler);
            resolve(msg.result?.result?.value);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({
          id,
          method: 'Runtime.evaluate',
          params: { expression: expr, returnByValue: true }
        }));
      });
    }

    const rect = await evaluate(`
      (() => {
        const r = document.querySelector('.sup-stage-cutting-mat')?.getBoundingClientRect();
        return r ? { top: r.top, bottom: r.bottom, width: r.width, height: r.height } : null;
      })()
    `);
    console.log('Cutting mat rect:', rect);
    const win = await evaluate(`({ innerHeight: window.innerHeight, innerWidth: window.innerWidth })`);
    console.log('Window:', win);

    process.exit(0);
  });
});
