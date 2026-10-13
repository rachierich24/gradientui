const http = require('http');
const fs = require('fs');

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
                // Outer phone screen aspect ratio:
                // Let's check outer phone chassis dimensions in ecosystem-showcase.css
                // Typically mobile screen is ~240px x 490px or ~260px x 530px (aspect ratio ~1:2.05 to 1:2.16, like iPhone 19.5:9 = 390x844 or similar)
                
                // Let's test different crop rectangles on the 720x1280 video:
                // 1. Crop just the inner phone bezel out: from bezelMinX=66, maxX=654 (w=588), minY=73, maxY=1275 (h=1202)
                // 2. Crop exactly the inner screen (including inner status bar): from x=101, w=518, y=101, h=1078 (or y=80 to 1200)
                // 3. Crop below inner status bar: from x=101, w=518, y=160 to 1180
                
                const crops = [
                  { name: 'crop_screen_full', sx: 101, sy: 95, sw: 518, sh: 1105 },
                  { name: 'crop_phone_bezel', sx: 66, sy: 73, sw: 588, sh: 1202 },
                  { name: 'crop_screen_content', sx: 101, sy: 155, sw: 518, sh: 960 },
                ];

                const results = crops.map(c => {
                  const canvas = document.createElement('canvas');
                  canvas.width = c.sw;
                  canvas.height = c.sh;
                  const ctx = canvas.getContext('2d');
                  ctx.drawImage(v, c.sx, c.sy, c.sw, c.sh, 0, 0, c.sw, c.sh);
                  return { name: c.name, data: canvas.toDataURL('image/jpeg', 0.85) };
                });

                resolve(results);
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
        const results = msg.result.result.value;
        results.forEach(r => {
          const b64 = r.data.replace(/^data:image\/jpeg;base64,/, '');
          fs.writeFileSync(`scratch/${r.name}.jpg`, Buffer.from(b64, 'base64'));
          console.log(`Saved scratch/${r.name}.jpg`);
        });
        ws.close();
      }
    };
  });
});
