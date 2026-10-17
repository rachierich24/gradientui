const http = require('http');

http.get('http://localhost:3000/supplier', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const idx = data.indexOf('sup-workspace-section');
    if (idx !== -1) {
      console.log('Found sup-workspace-section:');
      console.log(data.substring(idx - 50, idx + 800));
    } else {
      console.log('sup-workspace-section NOT found in HTML!');
    }
  });
});
