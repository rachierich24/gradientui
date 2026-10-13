const http = require('http');
const fs = require('fs');

http.get('http://localhost:9222/json', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const list = JSON.parse(d);
    const tab = list.find(t => t.type === 'page' && t.url.includes('localhost:3000'));
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    ws.onopen = () => {
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: {
          expression: `
            Promise.all([1.0, 3.0, 5.0, 8.0].map((time, idx) => new Promise(r => {
              const v = document.createElement('video');
              v.src = '/cafe.mp4';
              v.currentTime = time;
              v.onseeked = () => {
                const c = document.createElement('canvas');
                c.width = v.videoWidth;
                c.height = v.videoHeight;
                c.getContext('2d').drawImage(v, 0, 0);
                r({ idx, time, data: c.toDataURL('image/jpeg', 0.8) });
              };
            })))
          `,
          awaitPromise: true,
          returnByValue: true
        }
      }));
    };
    ws.onmessage = e => {
      const msg = JSON.parse(e.data);
      if (msg.id === 1) {
        msg.result.result.value.forEach(item => {
          const b64 = item.data.replace(/^data:image\/jpeg;base64,/, '');
          fs.writeFileSync(`scratch/cafe_frame_${item.time}s.jpg`, Buffer.from(b64, 'base64'));
          console.log(`Saved scratch/cafe_frame_${item.time}s.jpg`);
        });
        ws.close();
      }
    };
  });
});
