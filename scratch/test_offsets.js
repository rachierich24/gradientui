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
      // Test different translateY offsets
      const offsets = [5.5, 6.5, 7.5];
      
      for (let i = 0; i < offsets.length; i++) {
        const off = offsets[i];
        await new Promise(resolve => {
          ws.send(JSON.stringify({
            id: 10 + i,
            method: 'Runtime.evaluate',
            params: {
              expression: `
                (() => {
                  const video = document.querySelector('.eco-mobile-video');
                  if (video) {
                    video.style.transform = 'scale(1.39) translateY(${off}%)';
                    video.style.transformOrigin = '50% 50%';
                  }
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
              returnByValue: true
            }
          }));

          const onMsg = e => {
            const msg = JSON.parse(e.data);
            if (msg.id === 10 + i) {
              const clip = msg.result.result.value;
              ws.send(JSON.stringify({
                id: 100 + i,
                method: 'Page.captureScreenshot',
                params: {
                  format: 'jpeg',
                  quality: 92,
                  clip: { ...clip, scale: 1 }
                }
              }));
            } else if (msg.id === 100 + i) {
              fs.writeFileSync(`scratch/test_offset_${off}.jpg`, Buffer.from(msg.result.data, 'base64'));
              console.log(`Saved scratch/test_offset_${off}.jpg`);
              ws.removeEventListener('message', onMsg);
              resolve();
            }
          };
          ws.addEventListener('message', onMsg);
        });
      }
      ws.close();
    };
  });
});
