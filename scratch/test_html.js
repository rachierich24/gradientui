async function test() {
  const res = await fetch('http://localhost:3000/brand');
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Length:', text.length);
  console.log('Has id="system":', text.includes('id="system"'));
  console.log('Has bbo:', text.includes('class="bbo"'));
  console.log('Has bbo-grid:', text.includes('bbo-grid'));
}
test();

