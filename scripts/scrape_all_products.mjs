import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.resolve('public/landing/spotlight');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function downloadImage(url, filename) {
  const filePath = path.join(OUTPUT_DIR, filename);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    if (!res.ok) {
      console.log(`Failed HTTP ${res.status}: ${url}`);
      return null;
    }
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (buffer.length < 1000) {
      console.log(`Image too small (${buffer.length} bytes): ${url}`);
      return null;
    }
    fs.writeFileSync(filePath, buffer);
    console.log(`Saved ${filename} (${buffer.length} bytes)`);
    return `/landing/spotlight/${filename}`;
  } catch (err) {
    console.error(`Download error for ${url}:`, err.message);
    return null;
  }
}

// 1. Droptheq Products (Café food court items)
async function getDroptheqProducts() {
  const products = [];
  try {
    const storesRes = await fetch('https://papi.droptheq.com/api/stores/getLiveStoresByCompany/6921c1c4e8d867570d042afc', {
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' }
    });
    const stores = await storesRes.json();

    for (const store of stores) {
      const storeId = store._id;
      const menuRes = await fetch(`https://papi.droptheq.com/api/v2/menuItems/showmenuTopBarServeType/${storeId}/All`, {
        headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' }
      });
      if (!menuRes.ok) continue;
      const items = await menuRes.json();

      for (const item of items) {
        if (!item.title || !item.imageUrl?.url) continue;
        const imgUrl = item.imageUrl.url.trim();
        if (!imgUrl.startsWith('http')) continue;

        let cleanTitle = item.title.trim().replace(/\s+/g, ' ');
        // Shorten long menu titles nicely for marquee card labels
        if (cleanTitle.length > 26) {
          cleanTitle = cleanTitle.split(/[-–,(]/)[0].trim();
        }
        if (cleanTitle.length > 26) {
          cleanTitle = cleanTitle.slice(0, 26).trim();
        }

        const slug = slugify('dtq-' + cleanTitle);
        const ext = imgUrl.endsWith('.png') ? 'png' : 'jpg';
        const filename = `${slug}.${ext}`;

        products.push({
          source: 'droptheq',
          title: cleanTitle,
          category: 'CAFÉ',
          tagColor: '#E03527',
          url: imgUrl,
          filename,
          alt: `${cleanTitle} - DroptheQ Café & Food Court`
        });
      }
    }
  } catch (e) {
    console.error('Droptheq error:', e.message);
  }
  return products;
}

// 2. FoodServiceIndia Products (HORECA sauces & gravies)
async function getFsiProducts() {
  const products = [];
  try {
    const res = await fetch('https://foodserviceindia.com/horeca-solutions-sem/', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const html = await res.text();
    const imgs = [...html.matchAll(/<img[^>]+src=["']([^"']+\.(?:png|jpg|jpeg|webp))["'][^>]*alt=["']([^"']*)["']/gi)]
      .map(m => ({ src: m[1], alt: m[2] }));

    for (const img of imgs) {
      if (img.src.includes('logo') || img.src.includes('icon') || img.src.includes('avatar') || img.alt.length < 3) continue;
      let title = img.alt.replace(/\d+\s*x\s*\d+/gi, '').replace(/\d+/g, '').replace(/thumbnail/gi, '').trim();
      if (!title || title.length < 4 || title === 'wp img') continue;
      if (title.length > 26) {
        title = title.split(/[-–,(]/)[0].trim();
      }
      if (title.length > 26) title = title.slice(0, 26).trim();

      const slug = slugify('fsi-' + title);
      const ext = img.src.includes('.png') ? 'png' : 'jpg';
      const filename = `${slug}.${ext}`;

      products.push({
        source: 'fsi',
        title,
        category: 'SUPPLIER',
        tagColor: '#22C55E',
        url: img.src,
        filename,
        alt: `${title} - Food Service India HORECA Solution`
      });
    }
  } catch (e) {
    console.error('FSI error:', e.message);
  }
  return products;
}

// 3. McCain India Products (Fries & appetizers)
async function getMccainProducts() {
  const products = [];
  try {
    const res = await fetch('https://www.mccainindia.com/products', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const html = await res.text();
    const imgs = [...html.matchAll(/<img[^>]+src=["']([^"']+\.(?:png|jpg|jpeg|webp))["'][^>]*alt=["']([^"']*)["']/gi)]
      .map(m => ({ src: m[1], alt: m[2] }));

    for (const img of imgs) {
      if (img.src.includes('logo') || img.src.includes('icon') || img.alt.length < 3) continue;
      let title = img.alt.replace(/&amp;/g, '&').trim();
      if (!title || title.length < 4) continue;
      if (title.length > 26) title = title.slice(0, 26).trim();

      const imgUrl = img.src.startsWith('http') ? img.src : 'https://www.mccainindia.com' + (img.src.startsWith('/') ? '' : '/') + img.src;
      const slug = slugify('mccain-' + title);
      const ext = img.src.includes('.png') ? 'png' : 'jpg';
      const filename = `${slug}.${ext}`;

      products.push({
        source: 'mccain',
        title,
        category: 'BRAND',
        tagColor: '#6D28D9',
        url: imgUrl,
        filename,
        alt: `${title} - McCain Foodservice`
      });
    }
  } catch (e) {
    console.error('McCain error:', e.message);
  }
  return products;
}

// 4. Detpak Products (Café packaging bags & cups)
async function getDetpakProducts() {
  const products = [];
  try {
    const urls = ['https://www.detpak.com/', 'https://www.detpak.com/products/bags/'];
    for (const u of urls) {
      const res = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const html = await res.text();
      const imgs = [...html.matchAll(/(?:src|data-src)=["']([^"']+\.(?:png|jpg|jpeg|webp)[^"']*)["']/gi)].map(m => m[1]);

      for (const src of imgs) {
        if (!src.includes('product') && !src.includes('bags') && !src.includes('uber-eats')) continue;
        if (src.includes('logo') || src.includes('icon')) continue;

        let filenameBase = src.split('/').pop().split('?')[0].replace(/\.[^.]+$/, '');
        let title = filenameBase
          .replace(/[_-]/g, ' ')
          .replace(/webres|c\d+s\d+|size|ds/gi, '')
          .replace(/\s+/g, ' ')
          .trim();
        if (title.length < 3) title = 'Kraft Eco Packaging';
        title = title.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        if (title.length > 26) title = title.slice(0, 26).trim();

        const imgUrl = src.startsWith('http') ? src : 'https://www.detpak.com' + (src.startsWith('/') ? '' : '/') + src;
        const slug = slugify('detpak-' + title);
        const ext = src.includes('.png') ? 'png' : 'jpg';
        const filename = `${slug}.${ext}`;

        products.push({
          source: 'detpak',
          title,
          category: 'SUPPLIER',
          tagColor: '#22C55E',
          url: imgUrl,
          filename,
          alt: `${title} - Detpak Sustainable Packaging`
        });
      }
    }
  } catch (e) {
    console.error('Detpak error:', e.message);
  }
  return products;
}

// 5. Worldstar Packaging Products
async function getWorldstarProducts() {
  const products = [];
  try {
    const res = await fetch('https://www.worldstarpackagingindustry.com/', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const html = await res.text();
    const imgs = [...html.matchAll(/<img[^>]+src=["']([^"']+\.(?:png|jpg|jpeg|webp))["'][^>]*alt=["']([^"']*)["']/gi)]
      .map(m => ({ src: m[1], alt: m[2] }));

    const cupNames = {
      'c1.png': 'Gourmet Double Wall Cup',
      'c2.png': 'Coffee Eat Insulated Cup',
      'h-cup.png': 'Hot Beverage Paper Cup',
      'cup9.png': 'Emerald Ripple Hot Cup',
      'cup6.png': 'Matte Black Ripple Cup',
      'h1.png': 'Kraft Disposable Salad Bowl',
      'h2.png': 'Kraft Paper Meal Container',
      'h3.png': 'Bio-kraft Takeaway Food Tub'
    };

    for (const img of imgs) {
      const base = img.src.split('/').pop();
      if (cupNames[base]) {
        const title = cupNames[base];
        const imgUrl = 'https://www.worldstarpackagingindustry.com' + (img.src.startsWith('/') ? '' : '/') + img.src;
        const slug = slugify('worldstar-' + title);
        const ext = img.src.includes('.png') ? 'png' : 'jpg';
        const filename = `${slug}.${ext}`;

        products.push({
          source: 'worldstar',
          title,
          category: 'SUPPLIER',
          tagColor: '#22C55E',
          url: imgUrl,
          filename,
          alt: `${title} - Worldstar Packaging`
        });
      }
    }
  } catch (e) {
    console.error('Worldstar error:', e.message);
  }
  return products;
}

// 6. Heinz Products
async function getHeinzProducts() {
  const products = [];
  const heinzList = [
    {
      title: 'Heinz Tomato Ketchup',
      url: 'https://cdn.allotta.io/image/upload/f_auto/q_auto/v1754888527/Kraft-sauces-img-updated_wlxyo6.png'
    },
    {
      title: 'Heinz Yellow Mustard',
      url: 'https://cdn.allotta.io/image/upload/f_auto/q_auto/v1716904658/23_mglg39.png'
    },
    {
      title: 'Heinz Sweet Pickle Relish',
      url: 'https://cdn.allotta.io/image/upload/f_auto/q_auto/v1698431896/dxp-images/brands/Homepage/15_s0gvd2.png'
    },
    {
      title: 'Heinz Real Mayonnaise Dip',
      url: 'https://cdn.allotta.io/image/upload/f_auto/q_auto/v1707850566/dxp-images/brands/Lunchables/Lunchables-Navbar/19_rwhx67.png'
    },
    {
      title: 'Heinz Classic BBQ Sauce',
      url: 'https://cdn.allotta.io/image/upload/f_auto/q_auto/v1707850621/dxp-images/brands/Lunchables/Lunchables-Navbar/12_tycglj.png'
    },
    {
      title: 'Kraft Dipping Sauce Pot',
      url: 'https://cdn.allotta.io/image/upload/f_auto/q_auto/v1714511943/universal_nav_dtrrzh.png'
    },
    {
      title: 'Heinz 57 Gourmet Sauce',
      url: 'https://cdn.allotta.io/image/upload/f_auto/q_auto/v1711221759/Universal_Nav_copy_mdsmj8.png'
    },
    {
      title: 'Heinz Smoky Chipotle Dip',
      url: 'https://cdn.allotta.io/image/upload/f_auto/q_auto/v1711222467/33_lsda9u.png'
    }
  ];

  for (const item of heinzList) {
    const slug = slugify('heinz-' + item.title);
    const filename = `${slug}.png`;
    products.push({
      source: 'heinz',
      title: item.title,
      category: 'BRAND',
      tagColor: '#6D28D9',
      url: item.url,
      filename,
      alt: `${item.title} - Heinz Foodservice`
    });
  }
  return products;
}

// Master execution
async function main() {
  console.log('Fetching from all 6 sources...');
  const [dtq, fsi, mccain, detpak, worldstar, heinz] = await Promise.all([
    getDroptheqProducts(),
    getFsiProducts(),
    getMccainProducts(),
    getDetpakProducts(),
    getWorldstarProducts(),
    getHeinzProducts()
  ]);

  console.log(`Candidates:`);
  console.log(`  Droptheq: ${dtq.length}`);
  console.log(`  FoodServiceIndia: ${fsi.length}`);
  console.log(`  McCain: ${mccain.length}`);
  console.log(`  Detpak: ${detpak.length}`);
  console.log(`  Worldstar: ${worldstar.length}`);
  console.log(`  Heinz: ${heinz.length}`);

  // Deduplicate helper
  const dedupe = (list) => {
    const seen = new Set();
    const result = [];
    for (const item of list) {
      if (!seen.has(item.filename)) {
        seen.add(item.filename);
        result.push(item);
      }
    }
    return result;
  };

  // Select quota from each to ensure all 6 sources are strongly represented:
  // Droptheq: 12
  // FSI: 12
  // McCain: 12
  // Detpak: 8
  // Worldstar: 6
  // Heinz: 8
  // Total: 58 items
  const selectedCandidates = [
    ...dedupe(dtq).slice(0, 12),
    ...dedupe(fsi).slice(0, 12),
    ...dedupe(mccain).slice(0, 12),
    ...dedupe(detpak).slice(0, 8),
    ...dedupe(worldstar).slice(0, 6),
    ...dedupe(heinz).slice(0, 8)
  ];

  console.log(`Selected ${selectedCandidates.length} products to download across all 6 sites.`);

  const widths = [162, 168, 174, 180, 186, 170, 176, 182, 166, 172];
  let wIdx = 0;
  const verifiedProducts = [];

  for (const item of selectedCandidates) {
    const savedPath = await downloadImage(item.url, item.filename);
    if (savedPath) {
      verifiedProducts.push({
        id: `spotlight-${verifiedProducts.length + 1}`,
        title: item.title,
        category: item.category,
        tagColor: item.tagColor,
        image: savedPath,
        width: widths[wIdx % widths.length],
        alt: item.alt,
        source: item.source
      });
      wIdx++;
    }
  }

  console.log(`\nDONE! Verified and downloaded ${verifiedProducts.length} real product images.`);
  fs.writeFileSync('scripts/verified_products.json', JSON.stringify(verifiedProducts, null, 2));
}

main();
