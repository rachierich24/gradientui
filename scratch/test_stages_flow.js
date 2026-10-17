const http = require('http');

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

    for (let i = 0; i < 6; i++) {
      const res = await evalCode(`
        (() => {
          const pills = document.querySelectorAll('.sup-step-pill');
          if (pills[${i}]) {
            pills[${i}].click();
          }
          return {
            clickedIdx: ${i},
            pillsLen: pills.length,
            stepText: document.querySelector('.sup-narrator-step')?.textContent,
            pillClasses: Array.from(pills).map(p => p.className)
          };
        })()
      `);
      console.log(`Step ${i + 1}:`, res.result.value);
      await new Promise(r => setTimeout(r, 800));
      const resAfter = await evalCode(`document.querySelector('.sup-narrator-step')?.textContent`);
      console.log(`Step ${i + 1} after 800ms:`, resAfter.result.value);
    }

    ws.close();
  });
});
