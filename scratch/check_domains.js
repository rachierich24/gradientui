const domains = [
  'https://www.gradient365.com/brand',
  'https://gradient365.com/brand',
  'https://brand.gradient365.com',
  'https://gradientui.vercel.app/brand',
  'https://gradientui-landing.vercel.app/brand',
  'https://gradient-ui.vercel.app/brand',
  'https://gradient365.vercel.app/brand'
];

async function checkDomains() {
  for (const d of domains) {
    try {
      const res = await fetch(d, { method: 'HEAD' });
      console.log(d, '->', res.status);
    } catch (e) {
      console.log(d, '-> FAILED:', e.message);
    }
  }
}

checkDomains();

