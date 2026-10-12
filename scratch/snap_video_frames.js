const http = require('http');
const fs = require('fs');

http.get('http://localhost:9222/json', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const list = JSON.parse(d);
    const tab = list.find(t => t.type === 'page' && t.url.includes('localhost:3000'));
    if (!tab) return;
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    ws.onopen = () => {
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: {
          expression: `
            Promise.all(['/cafe.mp4', '/suppliers.mp4', '/brands.mp4'].map((s, idx) => new Promise(r => {
              const v = document.createElement('video');
              v.src = s;
              v.crossOrigin = 'anonymous';
              v.currentTime = 0.5;
              v.onseeked = () => {
                const canvas = document.createElement('canvas');
                canvas.width = v.videoWidth;
                canvas.height = v.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(v, 0, 0);
                r({ src: s, data: canvas.toDataURL('image/jpeg', 0.8) });
              };
              v.onerror = (e) => r({ src: s, error: true });
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
        const results = msg.result.result.value;
        results.forEach((item, i) => {
          if (item.data) {
            const base64 = item.data.replace(/^data:image\/jpeg;base64,/, '');
            fs.writeFileSync(`scratch/video_frame_${i}.jpg`, Buffer.from(base64, 'base64'));
            console.log(`Saved scratch/video_frame_${i}.jpg for ${item.src}`);
          }
        });
        ws.close();
      }
    };
  });
});
