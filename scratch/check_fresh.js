const { spawn } = require('child_process');
const http = require('http');

async function check() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edge = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9223',
    '--user-data-dir=scratch/fresh-profile-' + Date.now(),
    'http://localhost:3000'
  ]);
  await new Promise(r => setTimeout(r, 2000));
  const version = await new Promise((res, rej) => {
    http.get('http://127.0.0.1:9223/json/list', r => {
      let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d)));
    }).on('error', rej);
  });
  const page = version.find(p => p.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  function send(method, params = {}) {
    return new Promise(res => {
      const id = Math.random();
      const h = e => {
        const m = JSON.parse(e.data);
        if (m.id === id) { ws.removeEventListener('message', h); res(m.result); }
      };
      ws.addEventListener('message', h);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }
  await send('Runtime.enable');
  await new Promise(r => setTimeout(r, 1000));
  const res = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: '(() => { const d = document.querySelector(".card-nav-dropdown"); return { inline: d.getAttribute("style"), compVis: getComputedStyle(d).visibility, compOp: getComputedStyle(d).opacity, compDisp: getComputedStyle(d).display, class: d.className, rect: d.getBoundingClientRect() }; })()'
  });
  console.log('Fresh load dropdown state:', res.result?.value);
  ws.close(); edge.kill();
}
check().catch(console.error);
