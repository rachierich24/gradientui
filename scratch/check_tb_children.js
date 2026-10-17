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
          const tb = document.querySelector('.sup-mat-master-toolbar');
          return Array.from(tb.children).map(c => ({
            tag: c.tagName,
            cls: c.className,
            h: c.offsetHeight,
            w: c.offsetWidth,
            children: Array.from(c.children).map(cc => ({ cls: cc.className, h: cc.offsetHeight, text: cc.innerText }))
          }));
        })()`,
        returnByValue: true
      }
    }));
  });
});
