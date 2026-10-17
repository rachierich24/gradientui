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
          params: { format: 'jpeg', quality: 85 }
        }));
      });
    }

    // Scroll to centered position
    await evalCode('window.lenis ? window.lenis.scrollTo(1000, { immediate: true }) : window.scrollTo(0, 1000)');
    await new Promise(r => setTimeout(r, 600));

    const stages = [
      { idx: 2, file: 'stage_3_accept_final.jpg' },
      { idx: 3, file: 'stage_4_pack_final.jpg' },
      { idx: 4, file: 'stage_5_dispatch_final.jpg' },
    ];

    for (const s of stages) {
      await evalCode(`
        (() => {
          const pills = document.querySelectorAll('.sup-step-pill');
          if (pills[${s.idx}]) pills[${s.idx}].click();
        })()
      `);
      await new Promise(r => setTimeout(r, 1200));

      const status = await evalCode(`document.querySelector('.sup-narrator-step')?.textContent`);
      console.log(`Target stage ${s.idx + 1}, active text: ${status.result.value}`);

      const shot = await captureJpeg();
      const filename = `C:/Users/shriyansh Sharma/.gemini/antigravity-ide/brain/a3be52fd-3d82-409f-a95c-e418fda5192c/${s.file}`;
      fs.writeFileSync(filename, Buffer.from(shot.data, 'base64'));
      console.log(`Saved ${s.file}`);
    }

    ws.close();
  });
});
