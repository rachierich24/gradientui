const urls = [
  'https://gradientui-1e71i5zne-rachitvij24-1251.vercel.app/brand',
  'https://gradientui-ehfc-njaf270dx-rachitvij24-1251.vercel.app/brand',
  'https://gradientui-ehfc.vercel.app/brand',
  'https://gradientui.vercel.app/brand',
];

async function testVercelDeployments() {
  for (const u of urls) {
    try {
      const res = await fetch(u);
      console.log(`\nURL: ${u}`);
      console.log(`Status: ${res.status}`);
      const html = await res.text();
      console.log('Includes "graident":', html.includes('graident'));
      console.log('Includes "Built for brands selling into":', html.includes('Built for brands selling into'));
      console.log('Includes "#502B9A":', html.includes('#502B9A') || html.includes('502B9A') || html.includes('502b9a'));
      console.log('Includes "Demand Intelligence":', html.includes('Demand Intelligence'));
      console.log('Includes "Direct Café Sampling":', html.includes('Direct Café Sampling'));
      console.log('Includes "Automated Reorders":', html.includes('Automated Reorders'));
    } catch (e) {
      console.error(u, 'error:', e.message);
    }
  }
}

testVercelDeployments();

