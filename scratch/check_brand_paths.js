async function checkPaths() {
  const urls = [
    'https://brand.gradient365.com',
    'https://brand.gradient365.com/brand',
  ];

  for (const u of urls) {
    const res = await fetch(u);
    console.log(u, 'status:', res.status);
    const html = await res.text();
    console.log('  title:', html.match(/<title>.*?<\/title>/i)?.[0]);
    console.log('  h1:', html.match(/<h1[^>]*>.*?<\/h1>/i)?.[0]);
    console.log('  h2:', html.match(/<h2[^>]*>.*?<\/h2>/i)?.[0]);
    console.log('  includes "Demand Intelligence":', html.includes('Demand Intelligence'));
    console.log('  includes "moat":', html.includes('moat') || html.includes('capabilities'));
  }
}

checkPaths();

