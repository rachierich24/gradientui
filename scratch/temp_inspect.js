const sharp = require('sharp');
sharp('C:/Users/shriyansh Sharma/.gemini/antigravity-ide/brain/ab56f431-bde6-4c86-a836-752aba7e93cb/.user_uploaded/media_1791459703538.png')
  .raw()
  .toBuffer({ resolveWithObject: true })
  .then(({ data, info }) => {
    console.log('Image dimensions:', info.width, 'x', info.height);
    for (let y = 50; y < info.height; y++) {
      let w = 0, g = 0;
      let minX = 9999, maxX = -1;
      for (let x = 0; x < info.width; x++) {
        const idx = (y * info.width + x) * info.channels;
        const r = data[idx], gr = data[idx+1], b = data[idx+2];
        if (r > 170 && gr > 170 && b > 170) {
          w++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
        } else if (gr > r && gr > b) {
          g++;
        }
      }
      if (w > 50) {
        console.log('y=' + y + ' white=' + w + ' green=' + g + ' minX=' + minX + ' maxX=' + maxX);
      }
    }
  });
