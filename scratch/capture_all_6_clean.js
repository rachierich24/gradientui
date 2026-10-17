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

    // Scroll to centered position
    await evalCode('window.lenis ? window.lenis.scrollTo(1000, { immediate: true }) : window.scrollTo(0, 1000)');
    await new Promise(r => setTimeout(r, 600));

    const stageNames = [
      'workflow_stage_1_receive.jpg',
      'workflow_stage_2_connect.jpg',
      'workflow_stage_3_accept.jpg',
      'workflow_stage_4_pack.jpg',
      'workflow_stage_5_dispatch.jpg',
      'workflow_stage_6_escrow.jpg'
    ];

    for (let i = 0; i < 6; i++) {
      // Pause autoplay first if needed or directly click the pill
      await evalCode(`
        (() => {
          const pills = document.querySelectorAll('.sup-step-pill');
          if (pills[${i}]) {
            pills[${i}].click();
          }
        })()
      `);

      await new Promise(r => setTimeout(r, 1200));

      const title = await evalCode(`document.querySelector('.sup-narrator-title')?.textContent`);
      console.log(`Stage ${i + 1} Title: ${title?.result?.value}`);

      const shot = await captureJpeg();
      const filename = `C:/Users/shriyansh Sharma/.gemini/antigravity-ide/brain/a3be52fd-3d82-409f-a95c-e418fda5192c/${stageNames[i]}`;
      fs.writeFileSync(filename, Buffer.from(shot.data, 'base64'));
      console.log(`Captured ${stageNames[i]}`);
    }

    ws.close();
  });
});
