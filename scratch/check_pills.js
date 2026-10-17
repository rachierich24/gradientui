const http = require('http');

http.get('http://localhost:9222/json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const tabs = JSON.parse(data);
    const tab = tabs.find(t => t.url && t.url.includes('localhost:3000'));
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    ws.onopen = () => {
      const id = 123;
      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.id === id) {
          console.log('Pill evaluation:', msg.result);
          ws.close();
        }
      };
      ws.send(JSON.stringify({
        id,
        method: 'Runtime.evaluate',
        params: {
          expression: `
            (() => {
              const pills = Array.from(document.querySelectorAll('.sup-step-pill'));
              return {
                count: pills.length,
                texts: pills.map(p => p.textContent),
                active: pills.map(p => p.className)
              };
            })()
          `,
          returnByValue: true
        }
      }));
    };
  });
});
