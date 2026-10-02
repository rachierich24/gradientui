/* Gradient 365 — product loader + studio thumbnails rendered from the 3D café models */
(function () {
  const G = (window.G365 = window.G365 || {});

  function loadScript(src) {
    return new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  }

  // Label artwork is drawn into canvases when products.js loads, so fonts must be ready first.
  let loading = null;
  G.loadProducts = function () {
    if (!loading) loading = (async () => {
      try { await Promise.all([document.fonts.load('600 52px "Geist"'), document.fonts.load('500 24px "Geist Mono"')]); } catch (e) {}
      G.buildMaterials();
      if (!G.products) await loadScript("/g365/js/products.js");
    })();
    return loading;
  };

  G.productMakers = function () {
    const P = G.products;
    return {
      bag0: () => P.bag(0), bag1: () => P.bag(1), bag2: () => P.bag(2), carton: () => P.carton(), bottle: () => P.bottle(),
      cup: () => P.cup(false), cupStack: () => P.cupStack(), box: () => P.box(0.9, 0.6, 0.75, "ORDER #24817", "CAFÉ LUNE · 14"),
      paperBag: () => P.paperBag(), tote: () => P.tote(), crate: () => P.crate(0),
    };
  };

  G.studioLights = function (scene) {
    scene.add(new THREE.HemisphereLight(0xffffff, 0xc9d3de, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 1.1); key.position.set(-3, 5, 4); scene.add(key);
    const rim = new THREE.DirectionalLight(0xe6fbfa, 0.6); rim.position.set(3, 2, -4); scene.add(rim);
  };

  G.renderThumbs = async function (keys, size) {
    size = size || 240;
    await G.loadProducts();
    const canvas = document.createElement("canvas");
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true }); } catch (e) { return {}; }
    renderer.setPixelRatio(1); renderer.setSize(size, size, false);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
    renderer.setClearColor(0x000000, 0);

    const makers = G.productMakers();
    const scene = new THREE.Scene();
    scene.environment = G.studioEnv(renderer);
    G.studioLights(scene);
    const camera = new THREE.PerspectiveCamera(28, 1, 0.01, 50);

    const out = {};
    for (const k of keys) {
      if (!makers[k] || out[k]) continue;
      const obj = makers[k]();
      obj.rotation.y = -0.5;
      scene.add(obj);
      const box = new THREE.Box3().setFromObject(obj), c = box.getCenter(new THREE.Vector3()), s = box.getSize(new THREE.Vector3());
      const r = Math.max(s.x, s.y, s.z) * 0.5 * 1.2;
      const dist = r / Math.tan(THREE.MathUtils.degToRad(14));
      camera.position.set(c.x + dist * 0.22, c.y + dist * 0.3, c.z + dist * 0.93);
      camera.lookAt(c);
      renderer.render(scene, camera);
      out[k] = canvas.toDataURL("image/png");
      scene.remove(obj);
    }
    renderer.dispose();
    return out;
  };
})();
