const sharp = require('sharp');
sharp('C:/Users/shriyansh Sharma/.gemini/antigravity-ide/brain/ab56f431-bde6-4c86-a836-752aba7e93cb/.user_uploaded/media_1791459703538.png')
  .raw()
  .toBuffer({ resolveWithObject: true })
  .then(({ data, info }) => {
    for (let y = 58; y <= 75; y++) {
      const row = [];
      for (let x = 20; x <= 40; x++) {
        const idx = (y * info.width + x) * info.channels;
        row.push(`(${data[idx]},${data[idx+1]},${data[idx+2]})`);
      }
      console.log(`y=${y}: x=20..40:`, row.slice(0, 10).join(' '));
    }
  });
