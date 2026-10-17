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

    function capture() {
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
          params: { format: 'png' }
        }));
      });
    }

    // Scroll to centered position
    await evalCode('window.lenis ? window.lenis.scrollTo(1000, { immediate: true }) : window.scrollTo(0, 1000)');
    await new Promise(r => setTimeout(r, 600));

    const stageNames = [
      'motion_step_1_receive.png',
      'motion_step_2_connect.png',
      'motion_step_3_accept.png',
      'motion_step_4_pack.png',
      'motion_step_5_dispatch.png',
      'motion_step_6_escrow.png',
    ];

    for (let i = 0; i < 6; i++) {
      // Click stage pill
      await evalCode(`
        const pills = document.querySelectorAll('.sup-step-pill');
        if (pills[${i}]) pills[${i}].click();
      `);

      // Wait 1.1s for animations (van progress, checklist, etc.)
      await new Promise(r => setTimeout(r, 1100));

      const shot = await capture();
      const filename = `C:/Users/shriyansh Sharma/.gemini/antigravity-ide/brain/a3be52fd-3d82-409f-a95c-e418fda5192c/${stageNames[i]}`;
      fs.writeFileSync(filename, Buffer.from(shot.data, 'base64'));
      console.log(`Saved ${stageNames[i]}`);
    }

    ws.close();
  });
});
