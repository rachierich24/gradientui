const http = require('http');

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
            (() => {
              const chassis = document.querySelector('.eco-phone-chassis');
              const screen = document.querySelector('.eco-phone-screen-container');
              const viewport = document.querySelector('.eco-video-phone-viewport');
              const video = document.querySelector('.eco-mobile-video');
              const statusbar = document.querySelector('.eco-phone-statusbar');
              const island = document.querySelector('.eco-phone-island');
              return {
                chassis: chassis ? { w: chassis.offsetWidth, h: chassis.offsetHeight } : null,
                screen: screen ? { w: screen.offsetWidth, h: screen.offsetHeight } : null,
                viewport: viewport ? { w: viewport.offsetWidth, h: viewport.offsetHeight } : null,
                statusbar: statusbar ? { w: statusbar.offsetWidth, h: statusbar.offsetHeight } : null,
                island: island ? { w: island.offsetWidth, h: island.offsetHeight } : null,
                video: video ? { 
                  w: video.videoWidth, 
                  h: video.videoHeight, 
                  clientW: video.clientWidth, 
                  clientH: video.clientHeight 
                } : null
              };
            })()
          `,
          returnByValue: true
        }
      }));
    };
    ws.onmessage = e => {
      const msg = JSON.parse(e.data);
      if (msg.id === 1) {
        console.log('DOM Rects:', JSON.stringify(msg.result.result.value, null, 2));
        ws.close();
      }
    };
  });
});
