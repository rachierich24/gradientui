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

function send(ws, method, params = {}) {
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
      } catch (e) {}
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

  // Reload page
  await send(ws, 'Page.reload');
  await new Promise(r => setTimeout(r, 2200));

  // Scroll to #ecosystem-cards
  await send(ws, 'Runtime.evaluate', {
    expression: `
      const el = document.getElementById('ecosystem-cards');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    `
  });
  await new Promise(r => setTimeout(r, 1200));

  // 1. Grid view
  let ss = await send(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/view1_cards_grid.png', Buffer.from(ss.data, 'base64'));
  console.log('Saved scratch/view1_cards_grid.png');

  // 2. Open Cafés modal
  await send(ws, 'Runtime.evaluate', {
    expression: `
      const cards = document.querySelectorAll('.eco-card');
      if (cards[0]) cards[0].click();
    `
  });
  await new Promise(r => setTimeout(r, 900));

  ss = await send(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/view2_macbook_cafes.png', Buffer.from(ss.data, 'base64'));
  console.log('Saved scratch/view2_macbook_cafes.png');

  // 3. Switch to Suppliers
  await send(ws, 'Runtime.evaluate', {
    expression: `
      const tabs = document.querySelectorAll('.eco-macbook-tab');
      if (tabs[1]) tabs[1].click();
    `
  });
  await new Promise(r => setTimeout(r, 800));

  ss = await send(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/view3_macbook_suppliers.png', Buffer.from(ss.data, 'base64'));
  console.log('Saved scratch/view3_macbook_suppliers.png');

  // 4. Switch to Brands
  await send(ws, 'Runtime.evaluate', {
    expression: `
      const tabs = document.querySelectorAll('.eco-macbook-tab');
      if (tabs[2]) tabs[2].click();
    `
  });
  await new Promise(r => setTimeout(r, 800));

  ss = await send(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/view4_macbook_brands.png', Buffer.from(ss.data, 'base64'));
  console.log('Saved scratch/view4_macbook_brands.png');

  // 5. Close Lid
  await send(ws, 'Runtime.evaluate', {
    expression: `
      const lidBtn = document.querySelector('.eco-macbook-lid-btn');
      if (lidBtn) lidBtn.click();
    `
  });
  await new Promise(r => setTimeout(r, 700));

  ss = await send(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/view5_macbook_closed.png', Buffer.from(ss.data, 'base64'));
  console.log('Saved scratch/view5_macbook_closed.png');

  // 6. Inspect Links
  const linksCheck = await send(ws, 'Runtime.evaluate', {
    expression: `
      JSON.stringify({
        cardCtas: Array.from(document.querySelectorAll('.eco-card-cta')).map(a => ({ text: a.innerText, href: a.href })),
        launchBtn: document.querySelector('.eco-macbook-launch-cta')?.href,
        previewAddress: document.querySelector('.eco-preview-address.is-link')?.href,
        drawerExtLink: document.querySelector('.eco-drawer-ext-link')?.href
      })
    `
  });
  console.log('LINKS VERIFICATION:', JSON.parse(linksCheck.result.value));

  ws.close();
}

run().catch(console.error);
