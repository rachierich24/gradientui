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
      // Let's test CSS on the live page and capture screenshot of .eco-screen-mobile
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: {
          expression: `
            (() => {
              const video = document.querySelector('.eco-mobile-video');
              const viewport = document.querySelector('.eco-video-phone-viewport');
              const screen = document.querySelector('.eco-phone-screen-container');
              const statusbar = document.querySelector('.eco-phone-statusbar');
              const island = document.querySelector('.eco-phone-island');
              const homeIndicator = document.querySelector('.eco-phone-home-indicator');

              // Scroll to ecosystem showcase
              const sec = document.querySelector('.eco-showcase-section');
              if (sec) sec.scrollIntoView();

              // Style test: Option A
              // If we fill the entire screen-container with the video:
              // Video is 720x1280. Inner screen is w: 518 (71.94% of width), h: 1127 (88.05% of height)
              // To zoom so 518px fills 220px:
              // Width of video should be (720 / 518) * 100% = 139%
              // Or transform: scale(1.39) or object-fit with scale
              return 'ok';
            })()
          `,
          returnByValue: true
        }
      }));
    };
    ws.onmessage = e => {
      console.log('Eval response:', e.data);
      ws.close();
    };
  });
});
