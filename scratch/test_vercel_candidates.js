const candidateUrls = [
  'https://gradientui-rachierich24.vercel.app',
  'https://gradientui-rachierich24s-projects.vercel.app',
  'https://gradientui-git-master-rachierich24.vercel.app',
  'https://gradientui-git-master-rachierich24s-projects.vercel.app',
  'https://gradientui-two.vercel.app',
  'https://gradientui-landing.vercel.app',
  'https://gradient-ui.vercel.app',
  'https://gradientui.vercel.app',
  'https://gradient365.vercel.app',
  'https://brand.gradient365.com',
  'https://gradient-brands.vercel.app',
  'https://gradientui-brand.vercel.app'
];

async function testCandidates() {
  for (const url of candidateUrls) {
    try {
      const res = await fetch(url, { method: 'GET' });
      console.log(url, '->', res.status);
      if (res.status === 200) {
        const text = await res.text();
        console.log('  title:', text.match(/<title>.*?<\/title>/i)?.[0]);
        console.log('  has brand:', text.includes('Brand') || text.includes('brand'));
        console.log('  has graident:', text.includes('graident'));
      }
    } catch (e) {
      // ignore
    }
  }
}

testCandidates();

