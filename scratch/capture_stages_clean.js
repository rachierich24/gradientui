const http = require('http');
const fs = require('fs');

async function getWsUrl() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const tabs = JSON.parse(data);
        const tab = tabs.find(t => t.url && t.url.includes('localhost:3000'));
        if (tab) resolve(tab.webSocketDebuggerUrl);
        else reject(new Error('Tab not found'));
      });
    }).on('error', reject);
  });
}

function createClient(ws) {
  return {
    send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = Math.floor(Math.random() * 1000000);
        const timer = setTimeout(() => {
          ws.removeEventListener('message', handler);
          reject(new Error(`Timeout waiting for CDP method: ${method}`));
        }, 6000);

        const handler = (e) => {
          try {
            const raw = typeof e.data === 'string' ? e.data : e.data.toString();
            const msg = JSON.parse(raw);
            if (msg.id === id) {
              clearTimeout(timer);
              ws.removeEventListener('message', handler);
              if (msg.error) reject(msg.error);
              else resolve(msg.result);
            }
          } catch (err) {
            console.error('Error handling message:', err);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }
  };
}

async function run() {
  const wsUrl = await getWsUrl();
  const ws = new WebSocket(wsUrl);
  await new Promise(r => ws.onopen = r);
  const client = createClient(ws);

  console.log('Connected to CDP');

  // Bring to front and focus so compositor doesn't throttle
  try {
    await client.send('Page.bringToFront');
  } catch (e) {
    console.log('bringToFront error:', e.message);
  }

  // Scroll to dashboard
  await client.send('Runtime.evaluate', {
    expression: `
      if (window.lenis) {
        window.lenis.scrollTo(1000, { immediate: true });
      } else {
        window.scrollTo(0, 1000);
      }
    `
  });
  await new Promise(r => setTimeout(r, 600));

  const stages = [
    { num: 1, name: 'stage_1_receive.png' },
    { num: 2, name: 'stage_2_connect.png' },
    { num: 3, name: 'stage_3_accept.png' },
    { num: 4, name: 'stage_4_pack.png' },
    { num: 5, name: 'stage_5_dispatch.png' },
    { num: 6, name: 'stage_6_complete.png' },
  ];

  for (const s of stages) {
    console.log(`Setting stage ${s.num}...`);
    await client.send('Runtime.evaluate', {
      expression: `
        (() => {
          const pills = document.querySelectorAll('.sup-step-pill');
          if (pills[${s.num - 1}]) {
            pills[${s.num - 1}].click();
          }
        })()
      `
    });

    await new Promise(r => setTimeout(r, 800));

    try {
      const shot = await client.send('Page.captureScreenshot', { format: 'png' });
      const filepath = `C:/Users/shriyansh Sharma/.gemini/antigravity-ide/brain/a3be52fd-3d82-409f-a95c-e418fda5192c/${s.name}`;
      fs.writeFileSync(filepath, Buffer.from(shot.data, 'base64'));
      console.log(`Successfully saved ${s.name}`);
    } catch (err) {
      console.error(`Failed to capture ${s.name}:`, err.message);
    }
  }

  ws.close();
}

run().catch(console.error);
