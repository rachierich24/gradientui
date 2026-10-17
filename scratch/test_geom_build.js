const THREE = require('three');

function createOpenSackGeometry(w, h, d) {
  const vSegments = 40;
  const radSegments = 32;
  const geom = new THREE.BufferGeometry();

  const vertices = [];
  const uvs = [];
  const indices = [];

  const hw = w * 0.5;
  const hd = d * 0.5;

  // Vertex 0: Bottom base center
  vertices.push(0, -h * 0.5, 0);
  uvs.push(0.5, 0);

  // Profile rings:
  // ring 1 to 4: base rounding on floor (y = -h*0.5 to -h*0.42)
  // ring 5 to 22: outer belly rising to rim (y = -h*0.42 to h*0.35)
  // ring 23 to 28: rolled rim collar curling outward and down (y = h*0.35 to h*0.42 then h*0.32)
  // ring 29 to 39: inner cavity wall descending to bean bed (y = h*0.32 down to 0)
  for (let i = 1; i <= vSegments; i++) {
    const t = i / (vSegments + 1); // 0 to 1
    let y = 0;
    let rx = hw;
    let rz = hd;

    if (t < 0.12) {
      // Bottom floor expanding outward
      const baseNorm = t / 0.12;
      rx *= baseNorm * 1.15;
      rz *= baseNorm * 1.15;
      y = -h * 0.5 + baseNorm * (h * 0.08);
    } else if (t < 0.65) {
      // Outer belly
      const bellyNorm = (t - 0.12) / 0.53;
      const belly = Math.sin(bellyNorm * Math.PI);
      rx *= (1.15 + belly * 0.32);
      rz *= (1.15 + belly * 0.30);
      y = -h * 0.42 + bellyNorm * (h * 0.72);
    } else if (t < 0.80) {
      // Rolled burlap rim curling out and over
      const rimNorm = (t - 0.65) / 0.15;
      const rimAngle = rimNorm * Math.PI;
      y = 0.30 * h + Math.sin(rimAngle) * (h * 0.08);
      const curl = Math.sin(rimNorm * Math.PI) * 0.35;
      rx *= (1.28 + curl);
      rz *= (1.26 + curl);
    } else {
      // Inner cavity wall
      const inNorm = (t - 0.80) / 0.20;
      y = 0.30 * h - inNorm * (h * 0.25);
      rx *= (1.20 - inNorm * 0.35);
      rz *= (1.18 - inNorm * 0.35);
    }

    for (let j = 0; j <= radSegments; j++) {
      const u = j / radSegments;
      const theta = u * Math.PI * 2;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);
      const p = 3.0;
      const sx = Math.sign(cosT) * Math.pow(Math.abs(cosT), 2 / p);
      const sz = Math.sign(sinT) * Math.pow(Math.abs(sinT), 2 / p);

      const ripple = t > 0.60 && t < 0.85 ? Math.sin(theta * 5) * 0.035 : 0;

      const vx = rx * sx * (1 + ripple);
      const vy = y;
      const vz = rz * sz * (1 + ripple);

      vertices.push(vx, vy, vz);
      uvs.push(u, t);
    }
  }

  // Inner cavity bottom center vertex
  const innerCenterIndex = vertices.length / 3;
  vertices.push(0, 0.05 * h, 0);
  uvs.push(0.5, 1.0);

  // Bottom fan indices
  for (let j = 0; j < radSegments; j++) {
    indices.push(0, j + 2, j + 1);
  }

  // Wall quads
  for (let i = 0; i < vSegments - 1; i++) {
    const rowA = 1 + i * (radSegments + 1);
    const rowB = 1 + (i + 1) * (radSegments + 1);
    for (let j = 0; j < radSegments; j++) {
      const a = rowA + j;
      const b = rowB + j;
      const c = rowB + (j + 1);
      const d = rowA + (j + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  // Inner bed fan indices
  const lastRow = 1 + (vSegments - 1) * (radSegments + 1);
  for (let j = 0; j < radSegments; j++) {
    indices.push(lastRow + j, innerCenterIndex, lastRow + j + 1);
  }

  geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

const openSack = createOpenSackGeometry(2.2, 2.1, 1.8);
console.log('Open sack vertices:', openSack.attributes.position.count, 'indices:', openSack.index.count);
openSack.computeBoundingBox();
console.log('Open sack bounds:', openSack.boundingBox);
