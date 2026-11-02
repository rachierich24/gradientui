async function checkDev() {
  try {
    const res = await fetch('http://localhost:3000/brand');
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Length:', text.length);
    console.log('Contains "id=\\"system\\"":', text.includes('id="system"'));
    console.log('Contains "bbo":', text.includes('bbo'));
    console.log('Contains "BEFORE GRADIENT":', text.includes('BEFORE GRADIENT'));
    console.log('Contains "BrandBento":', text.includes('BrandBento'));
  } catch (e) {
    console.error('Fetch error:', e.message);
  }
}
checkDev();

