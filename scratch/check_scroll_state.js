const http = require('http');

http.get('http://localhost:9222/json', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const tabs = JSON.parse(data);
    const tab = tabs.find(t => t.url && t.url.includes('localhost:3000/supplier'));
    if (!tab) return console.log('No supplier tab found');
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    ws.onopen = () => {
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: {
          expression: `({
            lenis: !!window.lenis,
            scrollY: window.scrollY,
            bodyHeight: document.body.scrollHeight,
            heroHeight: document.querySelector(".sup-hero-scene")?.offsetHeight,
            stickyTop: document.querySelector(".sup-sticky-stage")?.getBoundingClientRect().top
          })`,
          returnByValue: true
        }
      }));
    };
    ws.onmessage = (e) => {
      console.log('Result:', JSON.parse(e.data).result?.result?.value);
      process.exit(0);
    };
  });
}).on('error', console.error);
