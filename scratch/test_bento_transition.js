const http = require('http');
const fs = require('fs');

http.get('http://localhost:9222/json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', async () => {
    const tabs = JSON.parse(data);
    const tab = tabs.find(t => t.id === 'C4B0A1DEB45CE4A57E3D78BBAB6C3A1A');
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let id = 1;
    function send(method, params = {}) {
      return new Promise(resolve => {
        const curId = id++;
        const handler = e => {
          const msg = JSON.parse(e.data);
          if (msg.id === curId) {
            ws.removeEventListener('message', handler);
            resolve(msg.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: curId, method, params }));
      });
    }

    // Scroll to the features section
    await send('Runtime.evaluate', {
      expression: 'document.getElementById("features").scrollIntoView({ behavior: "instant", block: "start" })'
    });
    await new Promise(r => setTimeout(r, 800));

    // Capture screenshot
    const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync('C:/Users/shriyansh Sharma/.gemini/antigravity-ide/brain/a3be52fd-3d82-409f-a95c-e418fda5192c/hero_to_bento_transition.jpg', Buffer.from(shot.data, 'base64'));
    console.log('Saved hero_to_bento_transition.jpg');

    ws.close();
  });
});
