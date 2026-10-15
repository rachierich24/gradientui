const http = require('http');

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

    // First scroll to supplier section
    await sendCommand('Runtime.evaluate', {
      expression: 'window.scrollTo({ top: 2500, behavior: "instant" });'
    });
    await new Promise(r => setTimeout(r, 400));

    // Get position of first dashboard
    const boundsRes = await sendCommand('Runtime.evaluate', {
      expression: `
        (() => {
          const m = document.querySelector('.dashboard-main');
          const r = m.getBoundingClientRect();
          return { x: r.left + r.width / 2, y: r.top + r.height / 2, scrollTop: m.scrollTop };
        })()
      `,
      returnByValue: true
    });
    const { x, y, scrollTop: beforeScroll } = boundsRes.result.value;
    console.log('Target center:', { x, y, beforeScroll });

    // Dispatch a realistic trackpad gesture scroll event
    await sendCommand('Input.dispatchMouseEvent', {
      type: 'mouseWheel',
      x,
      y,
      deltaX: 0,
      deltaY: 60
    });

    await new Promise(r => setTimeout(r, 100));

    const afterRes = await sendCommand('Runtime.evaluate', {
      expression: 'document.querySelector(".dashboard-main").scrollTop',
      returnByValue: true
    });
    console.log('ScrollTop after two-finger wheel:', afterRes.result.value);

    ws.close();
  });
});
