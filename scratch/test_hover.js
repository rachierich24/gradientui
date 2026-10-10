const { spawn } = require('child_process');
const http = require('http');

async function main() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edge = spawn(edgePath, [
    '--headless',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--window-size=1280,800',
    'http://localhost:3000'
  ]);

  await new Promise(r => setTimeout(r, 2500));

  try {
    const list = await new Promise((resolve, reject) => {
      http.get('http://localhost:9222/json', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
      }).on('error', reject);
    });

    console.log('Pages found:', list.length);
    const target = list.find(p => p.type === 'page');
    if (!target) {
      console.log('No page target found');
      return;
    }
    console.log('Target WS:', target.webSocketDebuggerUrl);

    // Connect via ws
    const WebSocket = require('ws'); // let's see if ws exists, or use basic http
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    edge.kill();
  }
}

main();
