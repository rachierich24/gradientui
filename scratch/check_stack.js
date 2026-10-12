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

  const res = await send(ws, 'Runtime.evaluate', {
    expression: `
      (() => {
        const card = document.querySelector('.eco-card');
        const style = window.getComputedStyle(card);
        const parentStyle = window.getComputedStyle(card.parentElement);
        const container = document.querySelector('.eco-container');
        const containerStyle = window.getComputedStyle(container);
        const section = document.querySelector('.eco-section');
        const sectionStyle = window.getComputedStyle(section);

        const cardRect = card.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const sectionRect = section.getBoundingClientRect();

        return JSON.stringify({
          cardRect,
          containerRect,
          sectionRect,
          card: {
            pointerEvents: style.pointerEvents,
            display: style.display,
            visibility: style.visibility,
            opacity: style.opacity,
            transform: style.transform,
            zIndex: style.zIndex
          },
          wrapper: {
            pointerEvents: parentStyle.pointerEvents,
            transform: parentStyle.transform,
            opacity: parentStyle.opacity,
            zIndex: parentStyle.zIndex
          },
          container: {
            pointerEvents: containerStyle.pointerEvents,
            zIndex: containerStyle.zIndex
          },
          section: {
            pointerEvents: sectionStyle.pointerEvents,
            zIndex: sectionStyle.zIndex
          }
        });
      })()
    `
  });
  console.log('POINTER DIAGNOSTIC:', JSON.parse(res.result.value));
  ws.close();
}

run().catch(console.error);
