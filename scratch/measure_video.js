const http = require('http');

http.get('http://localhost:9222/json', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const list = JSON.parse(d);
    const tab = list.find(t => t.type === 'page' && t.url.includes('localhost:3000'));
    if (!tab) return console.log('no localhost:3000 tab');
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    ws.onopen = () => {
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: {
          expression: `
            new Promise((resolve) => {
              const v = document.createElement('video');
              v.src = '/cafe.mp4';
              v.currentTime = 1;
              v.onseeked = () => {
                const c = document.createElement('canvas');
                c.width = v.videoWidth;
                c.height = v.videoHeight;
                const ctx = c.getContext('2d');
                ctx.drawImage(v, 0, 0);
                const id = ctx.getImageData(0, 0, c.width, c.height);
                const data = id.data;

                // Let's sample horizontal line at y = 640 (middle of screen)
                const midY = Math.floor(c.height / 2);
                let bezelMinX = -1, bezelMaxX = -1;
                let screenMinX = -1, screenMaxX = -1;
                for (let x = 0; x < c.width; x++) {
                  const idx = (midY * c.width + x) * 4;
                  const r = data[idx], g = data[idx+1], b = data[idx+2];
                  // Bezel detection: dark border (< 80)
                  if (r < 80 && g < 80 && b < 80) {
                    if (bezelMinX === -1) bezelMinX = x;
                    bezelMaxX = x;
                  }
                  // Screen content (white background > 245)
                  if (x > 100 && x < 620 && r > 245 && g > 245 && b > 245) {
                    if (screenMinX === -1) screenMinX = x;
                    screenMaxX = x;
                  }
                }

                // Vertical line at x = 360 (middle of screen)
                const midX = Math.floor(c.width / 2);
                let bezelMinY = -1, bezelMaxY = -1;
                let screenMinY = -1, screenMaxY = -1;
                for (let y = 0; y < c.height; y++) {
                  const idx = (y * c.width + midX) * 4;
                  const r = data[idx], g = data[idx+1], b = data[idx+2];
                  if (r < 80 && g < 80 && b < 80) {
                    if (bezelMinY === -1) bezelMinY = y;
                    bezelMaxY = y;
                  }
                  if (y > 100 && y < 1180 && r > 245 && g > 245 && b > 245) {
                    if (screenMinY === -1) screenMinY = y;
                    screenMaxY = y;
                  }
                }

                resolve({
                  videoWidth: c.width,
                  videoHeight: c.height,
                  bezelMinX,
                  bezelMaxX,
                  bezelWidth: bezelMaxX - bezelMinX,
                  bezelMinY,
                  bezelMaxY,
                  bezelHeight: bezelMaxY - bezelMinY,
                  screenMinX,
                  screenMaxX,
                  screenWidth: screenMaxX - screenMinX,
                  screenMinY,
                  screenMaxY,
                  screenHeight: screenMaxY - screenMinY
                });
              };
            })
          `,
          awaitPromise: true,
          returnByValue: true
        }
      }));
    };
    ws.onmessage = e => {
      const msg = JSON.parse(e.data);
      if (msg.id === 1) {
        console.log('Measurement:', JSON.stringify(msg.result.result.value, null, 2));
        ws.close();
      }
    };
  });
});
