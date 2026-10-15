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

    const evalRes = await sendCommand('Runtime.evaluate', {
      expression: 'Array.from(document.querySelectorAll(".dashboard-main")).map(m => ({ scrollTop: m.scrollTop, scrollHeight: m.scrollHeight, clientHeight: m.clientHeight }))',
      returnByValue: true
    });
    console.log(evalRes.result.value);
    ws.close();
  });
});
