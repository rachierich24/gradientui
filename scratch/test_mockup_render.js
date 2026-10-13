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
            new Promise((resolve) => {
              const v = document.createElement('video');
              v.src = '/cafe.mp4';
              v.currentTime = 1;
              v.onseeked = () => {
                // Mockup phone inner screen dimensions: 220px x 456px (radius 36px)
                // Let's render at 2x resolution: 440px x 912px
                const W = 440;
                const H = 912;
                
                // Option A: Video includes its own status bar (inner screen from y=90 to 1210)
                // Video inner screen bounds: x: 101..619 (w=518), y: 90..1215 (h=1125)
                const cA = document.createElement('canvas');
                cA.width = W;
                cA.height = H;
                const ctxA = cA.getContext('2d');
                ctxA.drawImage(v, 101, 88, 518, 1125, 0, 0, W, H);

                // Option B: Video content starts below status bar (from y=155 to 1180)
                // And we draw the HTML status bar on top (height ~54px at 2x)
                const cB = document.createElement('canvas');
                cB.width = W;
                cB.height = H;
                const ctxB = cB.getContext('2d');
                // Status bar area ~54px:
                ctxB.fillStyle = '#FFFFFF';
                ctxB.fillRect(0, 0, W, 54);
                // Draw app content from y=155:
                ctxB.drawImage(v, 101, 155, 518, 1040, 0, 54, W, H - 54);

                // Option C: Full phone bezel crop (from y=73 to 1275, x=66 to 654)
                const cC = document.createElement('canvas');
                cC.width = W;
                cC.height = H;
                const ctxC = cC.getContext('2d');
                ctxC.drawImage(v, 66, 73, 588, 1202, 0, 0, W, H);

                resolve({
                  optA: cA.toDataURL('image/jpeg', 0.9),
                  optB: cB.toDataURL('image/jpeg', 0.9),
                  optC: cC.toDataURL('image/jpeg', 0.9)
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
        const val = msg.result.result.value;
        ['optA', 'optB', 'optC'].forEach(k => {
          const b64 = val[k].replace(/^data:image\/jpeg;base64,/, '');
          fs.writeFileSync(`scratch/${k}.jpg`, Buffer.from(b64, 'base64'));
          console.log(`Saved scratch/${k}.jpg`);
        });
        ws.close();
      }
    };
  });
});
