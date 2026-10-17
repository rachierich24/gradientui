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

    console.log('Testing scroll with scroll event dispatch:');
    await evaluate(`
      window.lenis.scrollTo(800, { immediate: true });
      window.dispatchEvent(new Event('scroll'));
    `);
    await new Promise(r => setTimeout(r, 300));

    console.log(await evaluate(`({
      scrollY: window.scrollY,
      heroOpacity: document.querySelector('.sup-hero-content')?.style.opacity,
      dashTransform: document.querySelector('.sup-dashboard-rising-stage')?.style.transform
    })`));

    process.exit(0);
  });
});
