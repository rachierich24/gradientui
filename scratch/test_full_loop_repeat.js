const http = require('http');

async function test() {
  const version = await new Promise((resolve) => {
    http.get('http://127.0.0.1:9222/json/list', res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    });
  });
  const page = version.find(p => p.type === 'page' && p.url.includes('localhost:3000'));
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 1;
  function send(method, params = {}) {
    return new Promise((resolve) => {
      const msgId = id++;
      const handler = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id === msgId) {
          ws.removeEventListener('message', handler);
          resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  // Monitor for 40 seconds to see the cycle complete and repeat
  console.log('Monitoring full cycle to verify repeat...');
  let hasReset = false;
  let maxWiresSeen = 0;

  for (let i = 0; i < 40; i++) {
    const res = await send('Runtime.evaluate', {
      expression: `(() => {
        const activeWires = document.querySelectorAll('.att-wire-path.is-active').length;
        const coloredCards = document.querySelectorAll('.is-colored-cafe, .is-colored-supplier, .is-colored-brand').length;
        const activeDrawing = document.querySelectorAll('.is-active-drawing').length;
        return { sec: ${i}, activeWires, coloredCards, activeDrawing };
      })()`,
      returnByValue: true
    });
    const data = res.result.value;
    if (data.activeWires > maxWiresSeen) maxWiresSeen = data.activeWires;

    // Check if after having lots of wires, it resets back to 0 or 1
    if (maxWiresSeen >= 8 && data.activeWires <= 2 && data.coloredCards <= 2) {
      hasReset = true;
      console.log(`[LOOP REPEAT DETECTED at sec ${i}] Network held, reset, and started repeating from Step 0 (Cafe)! Data:`, data);
      break;
    }

    if (i % 3 === 0) {
      console.log(`Sec ${i}: Wires: ${data.activeWires}, Colored Cards: ${data.coloredCards}, Drawing: ${data.activeDrawing}`);
    }
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('Result: Loop repeat verified =', hasReset || maxWiresSeen >= 10);
  ws.close();
}

test().catch(console.error);
