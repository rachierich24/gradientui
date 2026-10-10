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

  await new Promise(r => setTimeout(r, 2000));

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

  // Scroll to green section
  await send('Runtime.evaluate', {
    expression: `window.scrollTo(0, 1600);`
  });
  await new Promise(r => setTimeout(r, 800));

  // Check state BEFORE hover
  const beforeHover = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const nav = document.querySelector('.card-nav');
      const dropdown = document.querySelector('.card-nav-dropdown');
      const header = document.querySelector('.card-nav-header');
      return {
        headerClass: header.className,
        navRect: nav.getBoundingClientRect(),
        dropdownRect: dropdown.getBoundingClientRect(),
        dropdownDisplay: getComputedStyle(dropdown).display,
        dropdownVisibility: getComputedStyle(dropdown).visibility,
        dropdownOpacity: getComputedStyle(dropdown).opacity,
        dropdownBorder: getComputedStyle(dropdown).border,
        dropdownHeight: dropdown.offsetHeight
      };
    })()`
  });
  console.log('Before hover:', beforeHover.result?.value);

  // Trigger hover on Product tab
  await send('Runtime.evaluate', {
    expression: `(() => {
      const wrap = document.getElementById('card-nav-tab-0').parentElement;
      wrap.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    })()`
  });
  // Wait 100ms for dropdown to open
  await new Promise(r => setTimeout(r, 100));

  const duringHover = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const nav = document.querySelector('.card-nav');
      const dropdown = document.querySelector('.card-nav-dropdown');
      return {
        navRect: nav.getBoundingClientRect(),
        dropdownRect: dropdown.getBoundingClientRect(),
        dropdownDisplay: getComputedStyle(dropdown).display,
        dropdownVisibility: getComputedStyle(dropdown).visibility,
        dropdownOpacity: getComputedStyle(dropdown).opacity,
        dropdownHeight: dropdown.offsetHeight,
        dropdownInlineStyle: dropdown.getAttribute('style')
      };
    })()`
  });
  console.log('During hover (100ms):', duringHover.result?.value);

  // Wait 400ms for animation to finish
  await new Promise(r => setTimeout(r, 400));

  const afterHover = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const nav = document.querySelector('.card-nav');
      const dropdown = document.querySelector('.card-nav-dropdown');
      return {
        navRect: nav.getBoundingClientRect(),
        dropdownRect: dropdown.getBoundingClientRect(),
        dropdownHeight: dropdown.offsetHeight,
        dropdownInlineStyle: dropdown.getAttribute('style')
      };
    })()`
  });
  console.log('After hover (500ms):', afterHover.result?.value);

  // Screenshot
  const ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/screenshot_hover.png', Buffer.from(ss.data, 'base64'));

  ws.close();
  edge.kill();
}

main().catch(console.error);
