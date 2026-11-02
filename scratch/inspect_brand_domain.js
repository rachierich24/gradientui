async function inspectBrandDomain() {
  const url = 'https://brand.gradient365.com';
  const res = await fetch(url, { headers: { 'Cache-Control': 'no-cache, no-store' } });
  const html = await res.text();

  console.log('Includes "graident":', html.includes('graident'));
  console.log('Includes "Built for brands selling into":', html.includes('Built for brands selling into'));
  console.log('Includes "Three interconnected capabilities":', html.includes('Three interconnected capabilities'));
  console.log('Includes "#502B9A":', html.includes('#502B9A') || html.includes('502B9A') || html.includes('502b9a'));
  console.log('Includes "Demand Intelligence":', html.includes('Demand Intelligence'));
  console.log('Includes "Direct Café Sampling":', html.includes('Direct Café Sampling'));
  console.log('Includes "Automated Reorders":', html.includes('Automated Reorders'));
  console.log('Includes "GhostFibers":', html.includes('GhostFibers') || html.includes('ghost-fibers'));
  console.log('Includes "bmoat-grid":', html.includes('bmoat-grid'));

  // Look for any commit SHA or deployment indicators
  const scriptTags = html.match(/src="\/_next\/static\/chunks\/[^"]+"/g);
  console.log('Sample script chunks:', scriptTags?.slice(0, 5));
}

inspectBrandDomain();

