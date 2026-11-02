async function checkVercel() {
  const url = 'https://gradient-ui.vercel.app/brand';
  console.log('Fetching', url);
  const res = await fetch(url);
  console.log('Status:', res.status);
  console.log('Headers:');
  for (const [k, v] of res.headers.entries()) {
    if (k.startsWith('x-vercel') || k.includes('cache') || k === 'etag') {
      console.log(`  ${k}: ${v}`);
    }
  }

  const html = await res.text();
  console.log('\nContent checks:');
  console.log('Includes "graident":', html.includes('graident'));
  console.log('Includes "Built for brands selling into":', html.includes('Built for brands selling into'));
  console.log('Includes "#502B9A":', html.includes('#502B9A'));
  console.log('Includes "GhostFibers" or canvas:', html.includes('canvas') || html.includes('fibers'));
  console.log('Includes "Demand Intelligence":', html.includes('Demand Intelligence'));
  console.log('Includes "THE THREE PILLARS":', html.includes('THE THREE PILLARS'));
}

checkVercel();

