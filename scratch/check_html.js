const http = require('http');

http.get('http://localhost:3000/supplier', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const idx = data.indexOf('order-workspace');
    if (idx !== -1) {
      console.log('Snippet around order-workspace:');
      console.log(data.substring(idx - 100, idx + 600));
    } else {
      console.log('Not found');
    }
  });
});
