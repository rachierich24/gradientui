// WebGL Earth for the India globe. NASA imagery on a sphere, shaded in one fragment shader:
// Blue Marble for the day side, Black Marble for city lights, real cloud cover drifting slowly,
// a soft terminator, sun glint on water and a blue atmosphere toward the limb. City lights are gold
// across India and faint cool white elsewhere (set ALL_GOLD to light the whole world in gold).
// The 2D engine (india-globe.ts) owns the camera maths and draws stars, routes and the rim on top;
// this module only paints the planet. Uses the self-hosted three.js (window.THREE).
// Imagery: NASA Earth Observatory / Visible Earth (public domain), in public/g365/earth.

/* eslint-disable @typescript-eslint/no-explicit-any */
type Three = any;

export type EarthFrame = {
  W: number; H: number; DPR: number;
  cx: number; cy: number; R: number;
  lon: number; lat: number;
  fade: number; t: number;
  mx: number; my: number; lens: number;
  sun: number[];
};
export type IndiaBits = { bits: Uint8Array; w: number; h: number; lat0: number; lon0: number; step: number };

const ALL_GOLD = false;
const D = Math.PI / 180;
const TEX = { day: '/g365/earth/day-2048.jpg', night: '/g365/earth/night-4096.jpg', clouds: '/g365/earth/clouds-2048.jpg' };

const VERT = /* glsl */ `
  varying vec3 vN;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vN = normalize(mat3(modelMatrix) * position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  uniform sampler2D uDay, uNight, uClouds, uLand, uIndia;
  uniform vec3 uSun;
  uniform vec4 uIndiaBox;          // lon0, lat0 (north edge), lon span, lat span
  uniform vec2 uMouse;
  uniform float uFade, uCloudShift, uLens, uPR, uAllGold;
  varying vec3 vN;
  varying vec2 vUv;

  void main() {
    vec3 n = normalize(vN);
    float ndl = dot(n, uSun);
    float day = smoothstep(-0.12, 0.32, ndl);
    float night = 1.0 - smoothstep(-0.22, 0.16, ndl);

    // surface: Blue Marble by day (slightly cooled, as from orbit), a faint moonlit copy by night
    vec3 dayTex = texture2D(uDay, vUv).rgb;
    float luma = dot(dayTex, vec3(0.299, 0.587, 0.114));
    vec3 dayCol = mix(vec3(luma), dayTex, 0.62) * vec3(0.9, 0.96, 1.08) * (0.25 + 0.95 * clamp(ndl + 0.15, 0.0, 1.0));
    vec3 nightCol = dayTex * vec3(0.07, 0.08, 0.115) + vec3(0.005, 0.008, 0.018);
    vec3 col = mix(nightCol, dayCol, day);

    // India, from its official-outline mask (soft at the edge)
    float lon = vUv.x * 360.0 - 180.0, lat = vUv.y * 180.0 - 90.0;
    vec2 iu = vec2((lon - uIndiaBox.x) / uIndiaBox.z, (uIndiaBox.y - lat) / uIndiaBox.w);
    float india = (iu.x > 0.0 && iu.x < 1.0 && iu.y > 0.0 && iu.y < 1.0) ? texture2D(uIndia, iu).r : 0.0;
    float inK = smoothstep(0.3, 0.7, india);

    // clouds: bright on the day side, barely there at night, thinned over India
    float cl = texture2D(uClouds, vUv + vec2(uCloudShift, 0.0)).r;
    float ck = smoothstep(0.18, 0.85, cl) * (0.08 + 0.85 * day) * (1.0 - 0.85 * inK);
    vec3 cloudCol = mix(vec3(0.05, 0.065, 0.1), vec3(0.95, 0.97, 1.0) * (0.35 + 0.75 * clamp(ndl + 0.1, 0.0, 1.0)), day);
    col = mix(col, cloudCol, ck);

    // city lights (Black Marble): gold across India, faint cool white elsewhere; the cursor is a lens
    vec3 lt = texture2D(uNight, vUv).rgb;
    float L = pow(max(dot(lt, vec3(0.4, 0.4, 0.2)) - 0.05, 0.0) * 1.06, 1.35);
    vec2 fc = gl_FragCoord.xy / uPR;
    float lens = uLens * pow(max(0.0, 1.0 - distance(fc, uMouse) / 140.0), 2.0);
    float lightsK = night * (1.0 - ck * 0.7);
    float g = max(inK, uAllGold);
    vec3 gold = vec3(1.0, 0.74, 0.36);
    col += gold * L * (2.6 + lens * 3.0) * lightsK * g;
    col += vec3(0.62, 0.72, 1.0) * L * (0.32 + lens * 1.2) * lightsK * (1.0 - g);
    float edge = (india > 0.02 && india < 0.98) ? pow(1.0 - abs(india * 2.0 - 1.0), 1.5) : 0.0;
    col += gold * (inK * 0.035 + edge * 0.22) * (0.4 + 0.6 * night);

    // sun glint on open water
    float water = 1.0 - texture2D(uLand, vUv).r;
    vec3 h = normalize(uSun + vec3(0.0, 0.0, 1.0));
    col += vec3(1.0, 0.97, 0.9) * pow(max(dot(n, h), 0.0), 60.0) * water * day * 0.45 * (1.0 - ck);

    // atmosphere: thicker toward the limb, brighter on the lit side
    float rim = pow(1.0 - max(n.z, 0.0), 2.4);
    vec3 atm = vec3(0.32, 0.56, 1.0) * (0.35 + 0.75 * clamp(ndl + 0.45, 0.0, 1.0));
    col = mix(col, atm, rim * 0.7);

    gl_FragColor = vec4(col * uFade, uFade);
  }
`;

export function createEarthGL(stage: HTMLElement, before: Element, landMask: Uint8Array, india: IndiaBits) {
  const THREE: Three = (window as unknown as { THREE?: Three }).THREE;
  if (!THREE) return null;

  const canvas = document.createElement('canvas');
  canvas.className = 'ig-canvas-gl';
  canvas.setAttribute('aria-hidden', 'true');
  stage.insertBefore(canvas, before);

  let renderer: Three;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, premultipliedAlpha: true, powerPreference: 'high-performance' });
  } catch {
    canvas.remove();
    return null;
  }
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(0, 1, 1, 0, -1e5, 1e5);

  // A sphere with our own latitude/longitude UVs, so the seam sits at ±180° and mipmaps behave.
  // Positions are the same unit vectors the 2D engine uses: [cos lat · sin lon, sin lat, cos lat · cos lon].
  const SEG = 192, RING = 96, verts = (SEG + 1) * (RING + 1);
  const pos = new Float32Array(verts * 3), uv = new Float32Array(verts * 2), idx: number[] = [];
  for (let j = 0; j <= RING; j++) {
    const lat = -90 + (180 * j) / RING, cl = Math.cos(lat * D);
    for (let i = 0; i <= SEG; i++) {
      const lon = -180 + (360 * i) / SEG, k = j * (SEG + 1) + i;
      pos[k * 3] = cl * Math.sin(lon * D); pos[k * 3 + 1] = Math.sin(lat * D); pos[k * 3 + 2] = cl * Math.cos(lon * D);
      uv[k * 2] = i / SEG; uv[k * 2 + 1] = j / RING;
    }
  }
  for (let j = 0; j < RING; j++) for (let i = 0; i < SEG; i++) {
    const a = j * (SEG + 1) + i, b = a + 1, c = a + SEG + 1, d = c + 1;
    idx.push(a, b, c, b, d, c);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geometry.setIndex(idx);

  // Land mask → water mask for the glint. Row 0 of the bitmask is the north edge; DataTexture row 0 is v = 0 (south).
  const land = new Uint8Array(720 * 360 * 4);
  for (let r = 0; r < 360; r++) for (let c = 0; c < 720; c++) {
    const n = (359 - r) * 720 + c, v = ((landMask[n >> 3] >> (n & 7)) & 1) * 255, o = (r * 720 + c) * 4;
    land[o] = land[o + 1] = land[o + 2] = v; land[o + 3] = 255;
  }
  const landTex = new THREE.DataTexture(land, 720, 360, THREE.RGBAFormat);
  landTex.magFilter = landTex.minFilter = THREE.LinearFilter; landTex.wrapS = THREE.RepeatWrapping; landTex.needsUpdate = true;

  // India mask: row 0 is its north edge, which here is v = 0; the shader maps latitude to match.
  const ib = new Uint8Array(india.w * india.h * 4);
  for (let j = 0; j < india.h; j++) for (let i = 0; i < india.w; i++) {
    const n = j * india.w + i, v = ((india.bits[n >> 3] >> (n & 7)) & 1) * 255, o = n * 4;
    ib[o] = ib[o + 1] = ib[o + 2] = v; ib[o + 3] = 255;
  }
  const indiaTex = new THREE.DataTexture(ib, india.w, india.h, THREE.RGBAFormat);
  indiaTex.magFilter = indiaTex.minFilter = THREE.LinearFilter; indiaTex.needsUpdate = true;

  const uniforms = {
    uDay: { value: null }, uNight: { value: null }, uClouds: { value: null },
    uLand: { value: landTex }, uIndia: { value: indiaTex },
    uSun: { value: new THREE.Vector3(0, 1, 0) },
    uIndiaBox: { value: new THREE.Vector4(india.lon0, india.lat0, india.w * india.step, india.h * india.step) },
    uMouse: { value: new THREE.Vector2(-999, -999) },
    uFade: { value: 0 }, uCloudShift: { value: 0 }, uLens: { value: 0 }, uPR: { value: 1 }, uAllGold: { value: ALL_GOLD ? 1 : 0 },
  };
  const material = new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG, transparent: true });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.matrixAutoUpdate = false;
  scene.add(mesh);

  // Textures (about 1.5 MB) load on the first render, which the 2D engine only calls once the
  // section is near the viewport; the planet fades in when all three have arrived.
  let loaded = 0, readyAt = -1, requested = false;
  const maxAniso = renderer.capabilities.getMaxAnisotropy?.() ?? 1;
  const textures: Three[] = [];
  const load = () => {
    requested = true;
    const loader = new THREE.TextureLoader();
    (Object.keys(TEX) as (keyof typeof TEX)[]).forEach((k) => {
      loader.load(TEX[k], (tex: Three) => {
        tex.anisotropy = Math.min(8, maxAniso);
        if (k === 'clouds') tex.wrapS = THREE.RepeatWrapping;
        textures.push(tex);
        uniforms[k === 'day' ? 'uDay' : k === 'night' ? 'uNight' : 'uClouds'].value = tex;
        if (++loaded === 3) readyAt = performance.now();
      });
    });
  };

  let lastW = 0, lastH = 0, lastDPR = 0;
  return {
    /** 0 → 1 over the second after the imagery arrives */
    reveal(now: number) {
      return readyAt < 0 ? 0 : Math.min(1, (now - readyAt) / 900);
    },
    render(f: EarthFrame) {
      if (!requested) load();
      if (f.W !== lastW || f.H !== lastH || f.DPR !== lastDPR) {
        lastW = f.W; lastH = f.H; lastDPR = f.DPR;
        renderer.setPixelRatio(f.DPR);
        renderer.setSize(f.W, f.H, false);
        camera.left = 0; camera.right = f.W; camera.top = f.H; camera.bottom = 0;
        camera.updateProjectionMatrix();
      }
      if (loaded < 3) { renderer.clear(); return; }
      // model = translate(cx, H − cy) · tilt(lat) · spin(lon) · scale(R), matching the 2D rotator
      const cL = Math.cos(f.lon * D), sL = Math.sin(f.lon * D), ct = Math.cos(f.lat * D), st = Math.sin(f.lat * D), R = f.R;
      mesh.matrix.set(
        R * cL, 0, -R * sL, f.cx,
        -R * st * sL, R * ct, -R * st * cL, f.H - f.cy,
        R * ct * sL, R * st, R * ct * cL, 0,
        0, 0, 0, 1,
      );
      mesh.matrixWorldNeedsUpdate = true;
      uniforms.uSun.value.set(f.sun[0], f.sun[1], f.sun[2]);
      uniforms.uFade.value = f.fade;
      uniforms.uCloudShift.value = f.t * 0.0005;
      uniforms.uLens.value = f.lens;
      uniforms.uMouse.value.set(f.mx, f.H - f.my);
      uniforms.uPR.value = f.DPR;
      renderer.render(scene, camera);
    },
    destroy() {
      textures.forEach((t) => t.dispose());
      landTex.dispose(); indiaTex.dispose(); geometry.dispose(); material.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
