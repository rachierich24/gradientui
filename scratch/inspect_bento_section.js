const http = require('http');
const fs = require('fs');

http.get('http://localhost:9222/json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', async () => {
    const tabs = JSON.parse(data);
    const tab = tabs.find(t => t.url.includes('localhost:3000/supplier') || t.id === 'C4B0A1DEB45CE4A57E3D78BBAB6C3A1A');
    if (!tab) {
      console.error('Supplier tab not found!');
      process.exit(1);
    }
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

    console.log('Navigating and checking layout...');
    // Enable Console
    await send('Console.enable');

    // Reload tab to get fresh state
    await send('Page.reload');
    await new Promise(r => setTimeout(r, 2000));

    // Scroll to bento section
    await send('Runtime.evaluate', {
      expression: '(() => { const el = document.getElementById("features"); if (el) { el.scrollIntoView({ behavior: "instant" }); } })()'
    });
    await new Promise(r => setTimeout(r, 800));

    // Capture at 1440x900
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });
    await new Promise(r => setTimeout(r, 400));
    let shot1440 = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync('C:/Users/shriyansh Sharma/.gemini/antigravity-ide/brain/a3be52fd-3d82-409f-a95c-e418fda5192c/bento_1440x900.jpg', Buffer.from(shot1440.data, 'base64'));
    console.log('Saved bento_1440x900.jpg');

    // Capture at 1280x720
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 720,
      deviceScaleFactor: 1,
      mobile: false
    });
    await new Promise(r => setTimeout(r, 400));
    let shot1280 = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync('C:/Users/shriyansh Sharma/.gemini/antigravity-ide/brain/a3be52fd-3d82-409f-a95c-e418fda5192c/bento_1280x720.jpg', Buffer.from(shot1280.data, 'base64'));
    console.log('Saved bento_1280x720.jpg');

    // Capture at 1024 tablet landscape
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1024,
      height: 768,
      deviceScaleFactor: 1,
      mobile: false
    });
    await new Promise(r => setTimeout(r, 400));
    let shot1024 = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync('C:/Users/shriyansh Sharma/.gemini/antigravity-ide/brain/a3be52fd-3d82-409f-a95c-e418fda5192c/bento_1024.jpg', Buffer.from(shot1024.data, 'base64'));
    console.log('Saved bento_1024.jpg');

    // Capture at 768 tablet portrait
    await send('Emulation.setDeviceMetricsOverride', {
      width: 768,
      height: 1024,
      deviceScaleFactor: 1,
      mobile: true
    });
    await new Promise(r => setTimeout(r, 400));
    let shot768 = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync('C:/Users/shriyansh Sharma/.gemini/antigravity-ide/brain/a3be52fd-3d82-409f-a95c-e418fda5192c/bento_768.jpg', Buffer.from(shot768.data, 'base64'));
    console.log('Saved bento_768.jpg');

    // Capture at 390 mobile
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await new Promise(r => setTimeout(r, 400));
    let shot390 = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync('C:/Users/shriyansh Sharma/.gemini/antigravity-ide/brain/a3be52fd-3d82-409f-a95c-e418fda5192c/bento_390.jpg', Buffer.from(shot390.data, 'base64'));
    console.log('Saved bento_390.jpg');

    // Reset emulation to normal
    await send('Emulation.clearDeviceMetricsOverride');

    ws.close();
  });
});
