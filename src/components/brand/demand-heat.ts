// The heat renderer behind the demand map (BrandFeatures.tsx). India is a field of dots `grid` map units apart;
// each city pours heat onto it, sized by its cafés and as strong as its index. In a small buffer the strongest
// city wins at each point, so the top city's core is the hottest spot on the map, and a little of the cities
// around it adds on, so clusters glow. That's coloured, clipped to India and scaled up, then the dots under it
// light up. Data: ./demand-data.ts. Outline: ./india-map.ts.
import { INDIA } from './india-map';
import { CITIES, LUT, VIEW } from './demand-data';

// how a city's heat falls away from its centre
const FALL = [[0, 1], [0.3, 0.86], [0.55, 0.52], [0.78, 0.2], [1, 0]];

export function createHeat(canvas: HTMLCanvasElement, grid: number) {
  const ctx = canvas.getContext('2d')!;
  const land = new Path2D(INDIA.d);
  const probe = document.createElement('canvas').getContext('2d')!;
  const dots: number[] = [];
  for (let y = grid / 2; y < INDIA.h; y += grid) for (let x = grid / 2; x < INDIA.w; x += grid) if (probe.isPointInPath(land, x, y)) dots.push(x, y);
  const dot = grid / 9;

  const stamp = document.createElement('canvas');
  stamp.width = stamp.height = 128;
  const sc = stamp.getContext('2d')!, g = sc.createRadialGradient(64, 64, 0, 64, 64, 64);
  FALL.forEach(([o, a]) => g.addColorStop(o, `rgba(0,0,0,${a})`));
  sc.fillStyle = g;
  sc.fillRect(0, 0, 128, 128);

  const top = document.createElement('canvas'), tc = top.getContext('2d', { willReadFrequently: true })!; // the strongest city at each point
  const sum = document.createElement('canvas'), uc = sum.getContext('2d', { willReadFrequently: true })!; // all of them added up
  const buf = document.createElement('canvas'), bc = buf.getContext('2d')!; // the coloured heat
  let W = 0, H = 0, s = 1, bs = 1, heatAt = new Uint8Array(0), out: ImageData | null = null;

  return {
    resize() {
      // layout size, not the on-screen box, so a tile scaled mid-flight still gets a full-size canvas
      const r = { width: canvas.clientWidth, height: canvas.clientHeight }, dpr = Math.min(2, window.devicePixelRatio || 1);
      W = canvas.width = Math.max(1, Math.round(r.width * dpr));
      H = canvas.height = Math.max(1, Math.round(r.height * dpr));
      for (const c of [top, sum, buf]) { c.width = Math.max(1, Math.round(r.width / 2)); c.height = Math.max(1, Math.round(r.height / 2)); }
      s = W / VIEW.w;
      bs = buf.width / VIEW.w;
      heatAt = new Uint8Array(buf.width * buf.height);
      out = bc.createImageData(buf.width, buf.height);
    },
    draw(vals: ArrayLike<number>, gain: number) {
      const bw = buf.width, bh = buf.height;
      if (!out) return;
      tc.globalCompositeOperation = 'source-over';
      tc.fillStyle = '#000';
      tc.fillRect(0, 0, bw, bh);
      tc.globalCompositeOperation = 'lighten';
      uc.clearRect(0, 0, bw, bh);
      uc.globalCompositeOperation = 'lighter';
      CITIES.forEach((c, i) => {
        const a = Math.min(1, (Math.max(0, vals[i]) / 300) ** 0.9 * 1.22) * gain;
        if (a < 0.004) return;
        const x = (c.x - VIEW.x) * bs, y = (c.y - VIEW.y) * bs, r = c.r * bs;
        const rg = tc.createRadialGradient(x, y, 0, x, y, r);
        FALL.forEach(([o, f]) => { const q = Math.round(255 * a * f); rg.addColorStop(o, `rgb(${q},${q},${q})`); });
        tc.fillStyle = rg;
        tc.fillRect(x - r, y - r, r * 2, r * 2);
        uc.globalAlpha = a * 0.5;
        uc.drawImage(stamp, x - r, y - r, r * 2, r * 2);
      });
      const T = tc.getImageData(0, 0, bw, bh).data, U = uc.getImageData(0, 0, bw, bh).data, d = out.data;
      for (let k = 0, p = 0; k < d.length; k += 4, p++) {
        const m = T[k], all = Math.min(255, U[k + 3] * 2), a = Math.min(255, Math.round(m + Math.max(0, all - m) * 0.24));
        heatAt[p] = a;
        // the coolest places fall back to the dark land, so the hot ones stand out
        if (a < 28) { d[k + 3] = 0; continue; }
        const j = a * 3;
        d[k] = LUT[j]; d[k + 1] = LUT[j + 1]; d[k + 2] = LUT[j + 2];
        d[k + 3] = Math.min(255, (a - 28) * 1.9) * 0.86;
      }
      bc.putImageData(out, 0, 0);

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      ctx.setTransform(s, 0, 0, s, -VIEW.x * s, -VIEW.y * s);
      ctx.clip(land);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(buf, 0, 0, W, H);
      // the dots under the heat light up with it, a little brighter and bigger the hotter it runs
      ctx.setTransform(s, 0, 0, s, -VIEW.x * s, -VIEW.y * s);
      const levels: number[][] = Array.from({ length: 16 }, () => []);
      for (let k = 0; k < dots.length; k += 2) {
        const bx = ((dots[k] - VIEW.x) * bs) | 0, by = ((dots[k + 1] - VIEW.y) * bs) | 0;
        const a = heatAt[by * bw + bx] / 255;
        if (a >= 0.12) levels[Math.min(15, (a * 16) | 0)].push(dots[k], dots[k + 1]);
      }
      levels.forEach((pts, q) => {
        if (!pts.length) return;
        const a = (q + 0.5) / 16, j = Math.min(255, Math.round((a + 0.14) * 255)) * 3, r = (1.2 + 1.7 * a) * dot;
        ctx.fillStyle = `rgba(${LUT[j]},${LUT[j + 1]},${LUT[j + 2]},${0.4 + 0.6 * a})`;
        ctx.beginPath();
        for (let k = 0; k < pts.length; k += 2) { ctx.moveTo(pts[k] + r, pts[k + 1]); ctx.arc(pts[k], pts[k + 1], r, 0, Math.PI * 2); }
        ctx.fill();
      });
      ctx.restore();
    },
  };
}
