// Small chart helpers shared by the Supplier Portal preview and the Results section.

/** A round axis maximum just above m (1, 1.5, 2, 2.5 … × a power of ten). */
export const niceMax = (m: number) => {
  const p = 10 ** Math.floor(Math.log10(Math.max(1, m)));
  return (Math.ceil((m / p) * 2) / 2) * p;
};

// tangents of the monotone cubic through the points (Fritsch–Carlson, as in d3's curveMonotoneX)
function slopes(pts: [number, number][]) {
  const n = pts.length;
  const dx: number[] = [], m: number[] = [], t: number[] = [];
  for (let i = 0; i < n - 1; i++) { dx[i] = pts[i + 1][0] - pts[i][0]; m[i] = (pts[i + 1][1] - pts[i][1]) / (dx[i] || 1); }
  t[0] = m[0]; t[n - 1] = m[n - 2];
  for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) { t[i] = t[i + 1] = 0; continue; }
    const a = t[i] / m[i], b = t[i + 1] / m[i], h = a * a + b * b;
    if (h > 9) { const k = 3 / Math.sqrt(h); t[i] = k * a * m[i]; t[i + 1] = k * b * m[i]; }
  }
  return { dx, t };
}

/** SVG path through the points as a monotone cubic spline (no overshoot), as in d3's curveMonotoneX. */
export function smooth(pts: [number, number][]) {
  const n = pts.length;
  if (n < 2) return '';
  const { dx, t } = slopes(pts);
  let path = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    path += `C${pts[i][0] + h},${pts[i][1] + h * t[i]} ${pts[i + 1][0] - h},${pts[i + 1][1] - h * t[i + 1]} ${pts[i + 1][0]},${pts[i + 1][1]}`;
  }
  return path;
}

/** The y of smooth(pts) at x, for putting a marker exactly on the drawn curve. */
export function smoothY(pts: [number, number][], x: number) {
  const n = pts.length;
  if (n < 2 || x <= pts[0][0]) return pts[0]?.[1] ?? 0;
  if (x >= pts[n - 1][0]) return pts[n - 1][1];
  const { dx, t } = slopes(pts);
  let i = 0;
  while (i < n - 2 && x > pts[i + 1][0]) i++;
  const s = (x - pts[i][0]) / dx[i], s2 = s * s, s3 = s2 * s;
  return (2 * s3 - 3 * s2 + 1) * pts[i][1] + (s3 - 2 * s2 + s) * dx[i] * t[i] + (3 * s2 - 2 * s3) * pts[i + 1][1] + (s3 - s2) * dx[i] * t[i + 1];
}
