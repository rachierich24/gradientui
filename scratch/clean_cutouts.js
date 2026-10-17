const sharp = require('sharp');

async function processCoffee() {
  const inputPath = 'C:/Users/shriyansh Sharma/.gemini/antigravity-ide/brain/a3be52fd-3d82-409f-a95c-e418fda5192c/specialty_coffee_supply_1792186285491.jpg';
  const outputPath = 'public/supplier/specialty_coffee_cutout.png';
  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const outData = Buffer.alloc(width * height * 4);

  // We want to detect background from outer borders
  const visited = new Uint8Array(width * height);
  const isBg = new Uint8Array(width * height);
  const queue = [];

  for (let x = 0; x < width; x++) {
    queue.push(x, 0);
    queue.push(x, height - 1);
    visited[x] = 1;
    visited[(height - 1) * width + x] = 1;
  }
  for (let y = 1; y < height - 1; y++) {
    queue.push(0, y);
    queue.push(width - 1, y);
    visited[y * width] = 1;
    visited[y * width + (width - 1)] = 1;
  }

  let head = 0;
  while (head < queue.length) {
    const cx = queue[head++];
    const cy = queue[head++];
    const idx = (cy * width + cx) * 3;
    const r = data[idx], g = data[idx + 1], b = data[idx + 2];
    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    const chroma = (maxC - minC) / 255;
    const brightness = (r + g + b) / 3;

    // Floor / shadow condition:
    // Any pixel reachable from borders where brightness is high (> 230)
    // OR where it is floor shadow (chroma < 0.10 and brightness > 60)
    // Note: coffee beans are around x: 100-750, y: 700-880. For x > 750, y > 600, it is pure floor/shadow
    const isFloorRegion = (cx > 760 && cy > 650) || (cy > 850 && cx > 700);
    const allowShadow = isFloorRegion ? (chroma < 0.12 && brightness > 50) : (chroma < 0.08 && brightness > 60);

    if (brightness > 232 || allowShadow) {
      isBg[cy * width + cx] = 1;
      const neighbors = [
        [cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]
      ];
      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nIdx = ny * width + nx;
          if (!visited[nIdx]) {
            visited[nIdx] = 1;
            queue.push(nx, ny);
          }
        }
      }
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pIdx = y * width + x;
      const srcIdx = pIdx * 3;
      const outIdx = pIdx * 4;
      const r = data[srcIdx], g = data[srcIdx + 1], b = data[srcIdx + 2];
      const brightness = (r + g + b) / 3;

      if (isBg[pIdx]) {
        if (brightness >= 246) {
          outData[outIdx] = 255;
          outData[outIdx + 1] = 255;
          outData[outIdx + 2] = 255;
          outData[outIdx + 3] = 0;
        } else {
          // Soft smooth falloff to 0 at 246
          const progress = Math.max(0, Math.min(1, (246 - brightness) / 160));
          const alpha = Math.round(Math.pow(progress, 1.25) * 150);
          outData[outIdx] = 24;
          outData[outIdx + 1] = 20;
          outData[outIdx + 2] = 16;
          outData[outIdx + 3] = alpha;
        }
      } else {
        outData[outIdx] = r;
        outData[outIdx + 1] = g;
        outData[outIdx + 2] = b;
        outData[outIdx + 3] = 255;
      }
    }
  }

  await sharp(outData, { raw: { width, height, channels: 4 } })
    .png()
    .toFile(outputPath);
  console.log('Saved clean coffee cutout');
}

async function processFood() {
  const inputPath = 'C:/Users/shriyansh Sharma/.gemini/antigravity-ide/brain/a3be52fd-3d82-409f-a95c-e418fda5192c/cafe_bakery_food_1792186305744.jpg';
  const outputPath = 'public/supplier/cafe_food_cutout.png';
  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const outData = Buffer.alloc(width * height * 4);

  const visited = new Uint8Array(width * height);
  const isBg = new Uint8Array(width * height);
  const queue = [];

  for (let x = 0; x < width; x++) {
    queue.push(x, 0);
    queue.push(x, height - 1);
    visited[x] = 1;
    visited[(height - 1) * width + x] = 1;
  }
  for (let y = 1; y < height - 1; y++) {
    queue.push(0, y);
    queue.push(width - 1, y);
    visited[y * width] = 1;
    visited[y * width + (width - 1)] = 1;
  }

  let head = 0;
  while (head < queue.length) {
    const cx = queue[head++];
    const cy = queue[head++];
    const idx = (cy * width + cx) * 3;
    const r = data[idx], g = data[idx + 1], b = data[idx + 2];
    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    const chroma = (maxC - minC) / 255;
    const brightness = (r + g + b) / 3;

    // Outer floor and shadow outside tray:
    // The aluminum tray is centered between cx: 70 and 1080, cy: 220 and 780.
    // Outside that box or anywhere brightness > 230 is background / shadow.
    let isOuter = false;
    if (brightness > 238) {
      isOuter = true;
    } else if (brightness > 180 && chroma < 0.06) {
      isOuter = true;
    } else if ((cy > 750 || cx > 1050 || cx < 90 || cy < 180) && brightness > 90 && chroma < 0.08) {
      isOuter = true;
    }

    if (isOuter) {
      isBg[cy * width + cx] = 1;
      const neighbors = [
        [cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]
      ];
      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nIdx = ny * width + nx;
          if (!visited[nIdx]) {
            visited[nIdx] = 1;
            queue.push(nx, ny);
          }
        }
      }
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pIdx = y * width + x;
      const srcIdx = pIdx * 3;
      const outIdx = pIdx * 4;
      const r = data[srcIdx], g = data[srcIdx + 1], b = data[srcIdx + 2];
      const brightness = (r + g + b) / 3;

      if (isBg[pIdx]) {
        if (brightness >= 246) {
          outData[outIdx] = 255;
          outData[outIdx + 1] = 255;
          outData[outIdx + 2] = 255;
          outData[outIdx + 3] = 0;
        } else {
          const progress = Math.max(0, Math.min(1, (246 - brightness) / 140));
          const alpha = Math.round(Math.pow(progress, 1.25) * 140);
          outData[outIdx] = 24;
          outData[outIdx + 1] = 20;
          outData[outIdx + 2] = 16;
          outData[outIdx + 3] = alpha;
        }
      } else {
        outData[outIdx] = r;
        outData[outIdx + 1] = g;
        outData[outIdx + 2] = b;
        outData[outIdx + 3] = 255;
      }
    }
  }

  await sharp(outData, { raw: { width, height, channels: 4 } })
    .png()
    .toFile(outputPath);
  console.log('Saved clean food cutout');
}

async function main() {
  await processCoffee();
  await processFood();
}

main();
