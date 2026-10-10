const http = require('http');
const fs = require('fs');

async function getWsUrl() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const tabs = JSON.parse(data);
        const tab = tabs.find(t => t.url.includes('localhost:3000'));
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
        // ignore partial chunks
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function run() {
  const wsUrl = await getWsUrl();
  const ws = new WebSocket(wsUrl);
  await new Promise(r => ws.onopen = r);

  console.log('Connected to CDP');

  await sendCommand(ws, 'Page.enable');
  await sendCommand(ws, 'Runtime.enable');

  // Reload page cleanly to load the fresh styles and components
  await sendCommand(ws, 'Page.reload');
  await new Promise(r => setTimeout(r, 2500));

  // Scroll to #ecosystem-cards
  await sendCommand(ws, 'Runtime.evaluate', {
    expression: `
      const el = document.getElementById('ecosystem-cards');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    `
  });
  await new Promise(r => setTimeout(r, 1000));

  // 1. Snapshot the cards in resting view
  let ss = await sendCommand(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/macbook_cards_grid.png', Buffer.from(ss.data, 'base64'));
  console.log('Saved scratch/macbook_cards_grid.png');

  // 2. Click the first card (.eco-card)
  const clickRes = await sendCommand(ws, 'Runtime.evaluate', {
    expression: `
      const card = document.querySelector('.eco-card');
      if (card) {
        card.click();
        'clicked';
      } else {
        'not found';
      }
    `
  });
  console.log('Card click result:', clickRes);

  // Wait 700ms for the MacBook lid to swing open
  await new Promise(r => setTimeout(r, 800));

  // 3. Snapshot opened MacBook
  ss = await sendCommand(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/macbook_modal_open.png', Buffer.from(ss.data, 'base64'));
  console.log('Saved scratch/macbook_modal_open.png');

  // 4. Click the "Close Lid" button (.eco-macbook-lid-btn)
  const toggleRes = await sendCommand(ws, 'Runtime.evaluate', {
    expression: `
      const btn = document.querySelector('.eco-macbook-lid-btn');
      if (btn) {
        btn.click();
        'toggled lid';
      } else {
        'lid btn not found';
      }
    `
  });
  console.log('Lid toggle result:', toggleRes);

  // Wait 600ms for lid to fold closed
  await new Promise(r => setTimeout(r, 600));

  // 5. Snapshot closed MacBook lid
  ss = await sendCommand(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/macbook_modal_lid_closed.png', Buffer.from(ss.data, 'base64'));
  console.log('Saved scratch/macbook_modal_lid_closed.png');

  // 6. Open lid again and switch to Suppliers tab
  await sendCommand(ws, 'Runtime.evaluate', {
    expression: `
      const tabs = document.querySelectorAll('.eco-macbook-tab');
      if (tabs.length >= 2) tabs[1].click();
    `
  });
  await new Promise(r => setTimeout(r, 700));

  ss = await sendCommand(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/macbook_modal_suppliers.png', Buffer.from(ss.data, 'base64'));
  console.log('Saved scratch/macbook_modal_suppliers.png');

  // 7. Verify links exist and lead to correct destinations
  const linksInfo = await sendCommand(ws, 'Runtime.evaluate', {
    expression: `
      JSON.stringify({
        cardLinks: Array.from(document.querySelectorAll('.eco-card-cta')).map(a => ({ text: a.textContent.trim(), href: a.href })),
        launchBtn: document.querySelector('.eco-macbook-launch-cta')?.href,
        addressLink: document.querySelector('.eco-preview-address.is-link')?.href,
        drawerLink: document.querySelector('.eco-drawer-ext-link')?.href
      })
    `
  });
  console.log('Links inspection:', JSON.parse(linksInfo.result.value));

  ws.close();
}

run().catch(console.error);
