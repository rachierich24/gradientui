const http = require('http');

http.get('http://localhost:9222/json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', async () => {
    const tabs = JSON.parse(data);
    const tab = tabs.find(t => t.url.includes('localhost:3000/supplier') || t.id === 'C4B0A1DEB45CE4A57E3D78BBAB6C3A1A');
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

    async function getStageInfo() {
      const res = await send('Runtime.evaluate', {
        expression: '(() => { const active = document.querySelector(".sup-step-pill.active")?.innerText?.trim(); const playBtn = document.querySelector(".sup-playback-btn")?.innerText?.trim(); return { active, playBtn }; })()',
        returnByValue: true
      });
      return res.result.value;
    }

    console.log('Reloading page to test fresh mount loop...');
    await send('Page.reload');
    await new Promise(r => setTimeout(r, 2000));

    async function getStageInfo() {
      const res = await send('Runtime.evaluate', {
        expression: '(() => { const active = document.querySelector(".sup-step-pill.active")?.innerText?.trim(); const playBtn = document.querySelector(".sup-playback-btn")?.innerText?.trim(); return { active, playBtn }; })()',
        returnByValue: true
      });
      return res.result?.value || {};
    }

    console.log('Testing continuous stage loop...');
    for (let i = 0; i < 9; i++) {
      const info = await getStageInfo();
      console.log(`Check ${i + 1} (${i * 3}s): Stage = "${info.active?.replace(/\n/g, ' ')}", Button = "${info.playBtn}"`);
      await new Promise(r => setTimeout(r, 3000));
    }

    ws.close();
  });
});
