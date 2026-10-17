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
    function evalCode(code) {
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
        ws.send(JSON.stringify({
          id: curId,
          method: 'Runtime.evaluate',
          params: { expression: code, returnByValue: true }
        }));
      });
    }

    function captureJpeg() {
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
        ws.send(JSON.stringify({
          id: curId,
          method: 'Page.captureScreenshot',
          params: { format: 'jpeg', quality: 90 }
        }));
      });
    }

    // 1. Check Hero Section at scroll 0
    await evalCode('window.lenis ? window.lenis.scrollTo(0, { immediate: true }) : window.scrollTo(0, 0)');
    await new Promise(r => setTimeout(r, 1200));

    let heroText = await evalCode('document.querySelector(".sup-hero-headline")?.innerText');
    console.log('Hero Text 1:', heroText?.result?.value);
    let shot = await captureJpeg();
    fs.writeFileSync('C:/Users/shriyansh Sharma/.gemini/antigravity-ide/brain/a3be52fd-3d82-409f-a95c-e418fda5192c/hero_ghost_loop_1.jpg', Buffer.from(shot.data, 'base64'));

    // Wait 2.8s for transition to next phrase in loop
    await new Promise(r => setTimeout(r, 2800));
    heroText = await evalCode('document.querySelector(".sup-hero-headline")?.innerText');
    console.log('Hero Text 2:', heroText?.result?.value);
    shot = await captureJpeg();
    fs.writeFileSync('C:/Users/shriyansh Sharma/.gemini/antigravity-ide/brain/a3be52fd-3d82-409f-a95c-e418fda5192c/hero_ghost_loop_2.jpg', Buffer.from(shot.data, 'base64'));

    // 2. Check Dashboard with enhanced buttons at scroll 1000
    await evalCode('window.lenis ? window.lenis.scrollTo(1000, { immediate: true }) : window.scrollTo(0, 1000)');
    await new Promise(r => setTimeout(r, 800));

    // Ensure stage 1 is selected
    await evalCode('document.querySelectorAll(".sup-step-pill")[0]?.click()');
    await new Promise(r => setTimeout(r, 600));

    shot = await captureJpeg();
    fs.writeFileSync('C:/Users/shriyansh Sharma/.gemini/antigravity-ide/brain/a3be52fd-3d82-409f-a95c-e418fda5192c/dashboard_enhanced_buttons.jpg', Buffer.from(shot.data, 'base64'));
    console.log('Saved dashboard_enhanced_buttons.jpg');

    ws.close();
  });
});
