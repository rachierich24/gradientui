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
      // Clean up any test style element
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: {
          expression: `
            (async () => {
              const testStyle = document.getElementById('test-video-zoom-style');
              if (testStyle) testStyle.remove();

              const phone = document.querySelector('.eco-screen-mobile');
              if (phone) phone.scrollIntoView({ block: 'center' });
              await new Promise(r => setTimeout(r, 600));

              const v = document.querySelector('.eco-mobile-video');
              if (v) {
                v.currentTime = 1.0;
                v.play();
              }
              await new Promise(r => setTimeout(r, 400));

              const el = document.querySelector('.eco-phone-chassis');
              const box = el.getBoundingClientRect();
              return {
                x: box.left + window.scrollX - 25,
                y: box.top + window.scrollY - 25,
                width: box.width + 50,
                height: box.height + 50
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
            quality: 92,
            clip: { ...clip, scale: 1 }
          }
        }));
      } else if (msg.id === 2) {
        fs.writeFileSync('scratch/final_mobile_mockup.jpg', Buffer.from(msg.result.data, 'base64'));
        console.log('Saved scratch/final_mobile_mockup.jpg');
        ws.close();
      }
    };
  });
});
