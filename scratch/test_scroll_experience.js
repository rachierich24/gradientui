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

function sendCommand(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 1000000);
    const handler = (event) => {
      try {
        const raw = typeof event.data === 'string' ? event.data : event.data.toString();
        const msg = JSON.parse(raw);
        if (msg.id === id) {
          ws.removeEventListener('message', handler);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      } catch (err) {
        console.error('Error parsing msg:', err);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function takeShot(ws, filename) {
  const screenshot = await sendCommand(ws, 'Page.captureScreenshot', { format: 'png' });
  const buffer = Buffer.from(screenshot.data, 'base64');
  const path = `C:/Users/shriyansh Sharma/.gemini/antigravity-ide/brain/a3be52fd-3d82-409f-a95c-e418fda5192c/${filename}`;
  fs.writeFileSync(path, buffer);
  console.log(`Saved ${filename}`);
}

async function setScroll(ws, y) {
  await sendCommand(ws, 'Runtime.evaluate', {
    expression: `
      if (window.lenis) {
        window.lenis.scrollTo(${y}, { immediate: true });
      }
      window.scrollTo(0, ${y});
      window.dispatchEvent(new Event('scroll'));
    `
  });
  await new Promise(r => setTimeout(r, 600));
}

async function run() {
  const wsUrl = await getWsUrl();
  const ws = new WebSocket(wsUrl);
  await new Promise(r => ws.onopen = r);

  console.log('Connected to CDP');

  // Hard reload page
  await sendCommand(ws, 'Page.navigate', { url: 'http://localhost:3000/supplier' });
  await new Promise(r => setTimeout(r, 2400));

  // 1. Initial State A: Hero at scrollY = 0
  await setScroll(ws, 0);
  await takeShot(ws, 'scroll_state_a_hero.png');

  // 2. State B: Scroll begins (scrollY ~ 450px)
  await setScroll(ws, 450);
  await takeShot(ws, 'scroll_state_b_rising.png');

  // 3. State C: Dashboard Center Stage (scrollY ~ 850px)
  await setScroll(ws, 850);
  await takeShot(ws, 'scroll_state_c_centered.png');

  // 4. State D: Settled in Center before unpin (scrollY ~ 1080px)
  await setScroll(ws, 1080);
  await takeShot(ws, 'scroll_state_d_settled.png');

  // 5. State E: Released into Next Sections (scrollY ~ 1920px)
  await setScroll(ws, 1920);
  await takeShot(ws, 'scroll_state_e_released.png');

  // 6. Test Reverse Scroll: Scroll back up to 0
  await setScroll(ws, 0);
  await takeShot(ws, 'scroll_state_f_reversed_to_top.png');

  console.log('Test complete!');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
