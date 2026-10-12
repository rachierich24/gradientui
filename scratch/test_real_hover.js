const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

async function main() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edge = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--user-data-dir=scratch/edge-profile',
    '--window-size=1280,900',
    'http://localhost:3000'
  ]);

  await new Promise(r => setTimeout(r, 2200));

  const version = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json/list', res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const page = version.find(p => p.type === 'page');
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

  await send('Page.enable');
  await send('Runtime.enable');
  await new Promise(r => setTimeout(r, 1500));

  // Get coords of Product button
  const rect = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const btn = document.getElementById('card-nav-tab-0');
      const r = btn.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, width: r.width, height: r.height };
    })()`
  });
  console.log('Button rect:', rect.result.value);

  // Focus button to trigger handleButtonMouseEnter
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.getElementById('card-nav-tab-0');
      btn.focus();
    })()`
  });

  // Wait 400ms for hover intent (85ms) + animation (240ms)
  await new Promise(r => setTimeout(r, 450));

  const state = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const dropdown = document.getElementById('card-nav-mega-dropdown');
      const r = dropdown.getBoundingClientRect();
      return {
        display: getComputedStyle(dropdown).display,
        visibility: getComputedStyle(dropdown).visibility,
        opacity: getComputedStyle(dropdown).opacity,
        rect: { top: r.top, left: r.left, width: r.width, height: r.height }
      };
    })()`
  });
  console.log('Dropdown state during hover:', state.result.value);

  // Mouseout to test close
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.getElementById('card-nav-tab-0');
      const wrap = btn.parentElement;
      wrap.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, relatedTarget: document.body }));
    })()`
  });
  await new Promise(r => setTimeout(r, 600));
  const closedState = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const dropdown = document.getElementById('card-nav-mega-dropdown');
      return {
        display: getComputedStyle(dropdown).display,
        visibility: getComputedStyle(dropdown).visibility,
        inlineDisplay: dropdown.style.display,
        className: dropdown.className
      };
    })()`
  });
  console.log('Closed dropdown state:', closedState.result.value);

  // Take screenshot
  const ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/snap_real_hover.png', Buffer.from(ss.data, 'base64'));
  console.log('Saved snap_real_hover.png');

  ws.close();
  edge.kill();
}

main().catch(console.error);
