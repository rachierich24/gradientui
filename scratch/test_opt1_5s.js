const http = require('http');
const fs = require('fs');

http.get('http://localhost:9222/json', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const list = JSON.parse(d);
    const tab = list.find(t => t.type === 'page' && t.url.includes('localhost:3000'));
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    ws.onopen = async () => {
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: {
          expression: `
            (async () => {
              const v = document.querySelector('.eco-mobile-video');
              if (v) {
                v.currentTime = 5.0;
                v.pause();
              }
              await new Promise(r => setTimeout(r, 400));
              const el = document.querySelector('.eco-phone-chassis');
              const box = el.getBoundingClientRect();
              return {
                x: box.left + window.scrollX - 20,
                y: box.top + window.scrollY - 20,
                width: box.width + 40,
                height: box.height + 40
              };
            })()
          `,
          awaitPromise: true,
          returnByValue: true
        }
      }));
    };

    ws.onmessage = e => {
      const msg = JSON.parse(e.data);
      if (msg.id === 1) {
        const clip = msg.result.result.value;
        ws.send(JSON.stringify({
          id: 2,
          method: 'Page.captureScreenshot',
          params: {
            format: 'jpeg',
            quality: 90,
            clip: { ...clip, scale: 1 }
          }
        }));
      } else if (msg.id === 2) {
        fs.writeFileSync('scratch/live_phone_opt1_at_5s.jpg', Buffer.from(msg.result.data, 'base64'));
        console.log('Saved scratch/live_phone_opt1_at_5s.jpg');
        ws.close();
      }
    };
  });
});
