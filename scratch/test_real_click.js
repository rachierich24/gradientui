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

  // Scroll card into center of viewport
  await send(ws, 'Runtime.evaluate', {
    expression: `
      (() => {
        const card = document.querySelector('.eco-card');
        if (card) card.scrollIntoView({ behavior: 'instant', block: 'center' });
      })()
    `
  });
  await new Promise(r => setTimeout(r, 600));

  // Get new card and button coordinates
  const coords = await send(ws, 'Runtime.evaluate', {
    expression: `
      (() => {
        const card = document.querySelector('.eco-card');
        const previewBtn = document.querySelector('.eco-card-preview-btn');
        const cta = document.querySelector('.eco-card-cta');
        return JSON.stringify({
          viewport: { w: window.innerWidth, h: window.innerHeight },
          card: card.getBoundingClientRect(),
          previewBtn: previewBtn ? previewBtn.getBoundingClientRect() : null,
          elementFromPointCard: document.elementFromPoint(
            card.getBoundingClientRect().left + 100,
            card.getBoundingClientRect().top + 100
          )?.className,
          elementFromPointBtn: previewBtn ? document.elementFromPoint(
            previewBtn.getBoundingClientRect().left + 10,
            previewBtn.getBoundingClientRect().top + 10
          )?.className : null
        });
      })()
    `
  });
  const data = JSON.parse(coords.result.value);
  console.log('Centered data:', data);

  // Click on the preview button using CDP
  if (data.previewBtn) {
    const cx = data.previewBtn.left + data.previewBtn.width / 2;
    const cy = data.previewBtn.top + data.previewBtn.height / 2;
    console.log('Dispatching mouse click at:', cx, cy);
    await send(ws, 'Input.dispatchMouseEvent', { type: 'mousePressed', x: cx, y: cy, button: 'left', clickCount: 1 });
    await send(ws, 'Input.dispatchMouseEvent', { type: 'mouseReleased', x: cx, y: cy, button: 'left', clickCount: 1 });
  }

  await new Promise(r => setTimeout(r, 700));

  const afterClick = await send(ws, 'Runtime.evaluate', {
    expression: `
      JSON.stringify({
        hasOverlay: !!document.querySelector('.eco-macbook-overlay'),
        activeCardId: document.querySelector('.eco-macbook-modal') ? 'modal found' : 'modal not found'
      })
    `
  });
  console.log('Modal status after clicking preview button:', JSON.parse(afterClick.result.value));

  // Also test clicking the card body itself!
  if (data.card) {
    const cx = data.card.left + data.card.width / 2;
    const cy = data.card.top + 100; // click on header/preview area
    console.log('Dispatching mouse click on card at:', cx, cy);
    await send(ws, 'Input.dispatchMouseEvent', { type: 'mousePressed', x: cx, y: cy, button: 'left', clickCount: 1 });
    await send(ws, 'Input.dispatchMouseEvent', { type: 'mouseReleased', x: cx, y: cy, button: 'left', clickCount: 1 });
  }

  await new Promise(r => setTimeout(r, 700));

  const afterCardClick = await send(ws, 'Runtime.evaluate', {
    expression: `
      JSON.stringify({
        hasOverlay: !!document.querySelector('.eco-macbook-overlay'),
        activeCardId: document.querySelector('.eco-macbook-modal') ? 'modal found' : 'modal not found'
      })
    `
  });
  console.log('Modal status after clicking card body:', JSON.parse(afterCardClick.result.value));

  ws.close();
}

run().catch(console.error);
