async function checkContent() {
  const res = await fetch('https://gradient-ui.vercel.app/brand');
  const html = await res.text();
  console.log('Length:', html.length);
  // Find h1, h2, h3
  const headings = html.match(/<h[1-3][^>]*>.*?<\/h[1-3]>/gi);
  console.log('Headings:', headings);
}

checkContent();

