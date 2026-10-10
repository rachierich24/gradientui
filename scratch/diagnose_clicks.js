const http = require('http');

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

  // Scroll to #ecosystem-cards
  await send(ws, 'Runtime.evaluate', {
    expression: "document.getElementById('ecosystem-cards').scrollIntoView({ behavior: 'instant', block: 'start' });"
  });
  await new Promise(r => setTimeout(r, 800));

  const diag = await send(ws, 'Runtime.evaluate', {
    expression: `
      (function() {
        const cards = document.querySelectorAll('.eco-card');
        const list = [];
        cards.forEach((c, idx) => {
          const r = c.getBoundingClientRect();
          const target = document.elementFromPoint(r.left + 50, r.top + 50);
          list.push({
            idx: idx,
            top: r.top,
            left: r.left,
            width: r.width,
            height: r.height,
            targetTag: target ? target.tagName : null,
            targetClass: target ? target.className : null
          });
        });
        return JSON.stringify({
          cardsCount: cards.length,
          list: list,
          activeCardIdInDom: document.querySelector('.eco-macbook-overlay') ? true : false
        });
      })()
    `
  });
  console.log('DIAGNOSTIC:', JSON.parse(diag.result.value));

  // Now simulate a real user click at the center of the first card
  const clickTest = await send(ws, 'Runtime.evaluate', {
    expression: `
      (function() {
        const card = document.querySelector('.eco-card');
        if (!card) return 'no card';
        // Check click handler
        card.click();
        return 'card clicked via .click()';
      })()
    `
  });
  console.log('CLICK TEST:', clickTest.result.value);

  await new Promise(r => setTimeout(r, 500));

  const afterClick = await send(ws, 'Runtime.evaluate', {
    expression: "document.querySelector('.eco-macbook-overlay') ? 'MODAL IS OPEN' : 'MODAL NOT FOUND'"
  });
  console.log('AFTER CLICK:', afterClick.result.value);

  ws.close();
}

run().catch(console.error);
