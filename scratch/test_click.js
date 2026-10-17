const http = require('http');
const fs = require('fs');

http.get('http://localhost:9222/json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', async () => {
    const tabs = JSON.parse(data);
    const tab = tabs.find(t => t.url && t.url.includes('localhost:3000'));
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    function send(method, params = {}) {
      return new Promise((resolve) => {
        const id = Math.floor(Math.random() * 1000000);
        const handler = (e) => {
          const msg = JSON.parse(e.data);
          if (msg.id === id) {
            ws.removeEventListener('message', handler);
            resolve(msg.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    // Click pill 2
    const res2 = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const pills = document.querySelectorAll('.sup-step-pill');
          if (pills[1]) pills[1].click();
          return Array.from(pills).map(p => p.className);
        })()
      `,
      returnByValue: true
    });
    console.log('After clicking pill 2:', res2.result.value);

    await new Promise(r => setTimeout(r, 600));
    const shot2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/shriyansh Sharma/.gemini/antigravity-ide/brain/a3be52fd-3d82-409f-a95c-e418fda5192c/motion_stage_2_actual.png', Buffer.from(shot2.data, 'base64'));
    console.log('Saved motion_stage_2_actual.png');

    // Click pill 4 (Pack)
    const res4 = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const pills = document.querySelectorAll('.sup-step-pill');
          if (pills[3]) pills[3].click();
          return Array.from(pills).map(p => p.className);
        })()
      `,
      returnByValue: true
    });
    console.log('After clicking pill 4:', res4.result.value);

    await new Promise(r => setTimeout(r, 600));
    const shot4 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/shriyansh Sharma/.gemini/antigravity-ide/brain/a3be52fd-3d82-409f-a95c-e418fda5192c/motion_stage_4_actual.png', Buffer.from(shot4.data, 'base64'));
    console.log('Saved motion_stage_4_actual.png');

    // Click pill 5 (Dispatch)
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const pills = document.querySelectorAll('.sup-step-pill');
          if (pills[4]) pills[4].click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 600));
    const shot5 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/shriyansh Sharma/.gemini/antigravity-ide/brain/a3be52fd-3d82-409f-a95c-e418fda5192c/motion_stage_5_actual.png', Buffer.from(shot5.data, 'base64'));
    console.log('Saved motion_stage_5_actual.png');

    // Click pill 6 (Escrow)
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const pills = document.querySelectorAll('.sup-step-pill');
          if (pills[5]) pills[5].click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 600));
    const shot6 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/shriyansh Sharma/.gemini/antigravity-ide/brain/a3be52fd-3d82-409f-a95c-e418fda5192c/motion_stage_6_actual.png', Buffer.from(shot6.data, 'base64'));
    console.log('Saved motion_stage_6_actual.png');

    ws.close();
  });
});
