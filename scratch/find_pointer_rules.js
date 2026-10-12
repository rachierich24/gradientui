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
        const container = document.querySelector('.eco-container');
        
        // Find which stylesheets/rules have pointer-events for these elements
        const findRules = (el) => {
          const matched = [];
          for (const sheet of document.styleSheets) {
            try {
              for (const rule of sheet.cssRules) {
                if (rule.selectorText && el.matches(rule.selectorText)) {
                  if (rule.style.pointerEvents) {
                    matched.push({ selector: rule.selectorText, val: rule.style.pointerEvents, href: sheet.href });
                  }
                }
              }
            } catch (e) {}
          }
          return matched;
        };

        return JSON.stringify({
          cardRules: findRules(card),
          containerRules: findRules(container),
          cardParent: card.parentElement ? findRules(card.parentElement) : []
        });
      })()
    `
  });
  console.log('MATCHED RULES:', JSON.parse(res.result.value));
  ws.close();
}

run().catch(console.error);
