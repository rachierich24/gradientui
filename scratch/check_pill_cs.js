const http = require('http');

http.get('http://localhost:9222/json', (res) => {
  let d = ''; res.on('data', c => d += c);
  res.on('end', async () => {
    const tab = JSON.parse(d).find(t => t.url?.includes('3000/supplier'));
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);
    ws.onmessage = e => {
      console.log('Result:', JSON.parse(e.data).result?.result?.value);
      process.exit(0);
    };
    ws.send(JSON.stringify({
      id: 1,
      method: 'Runtime.evaluate',
      params: {
        expression: `(() => {
          const pill = document.querySelector('.sup-step-pill');
          const cs = window.getComputedStyle(pill);
          return {
            height: cs.height,
            padding: cs.padding,
            fontSize: cs.fontSize,
            lineHeight: cs.lineHeight,
            display: cs.display,
            alignItems: cs.alignItems,
            parentHeight: pill.parentElement.offsetHeight,
            parentClass: pill.parentElement.className
          };
        })()`,
        returnByValue: true
      }
    }));
  });
});
