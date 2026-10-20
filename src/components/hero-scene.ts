import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { GTAOPass } from "three/examples/jsm/postprocessing/GTAOPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

/* The hero's scale model, built to read like an architect's rendered model: image-based light from a
   studio HDRI, a warm sun through the arched window with soft shadows, ground-truth ambient occlusion
   for the contact shadows in every corner, real PBR surfaces (herringbone oak, walnut veneer, travertine,
   plaster, wool, linen) projected at their true size, and real CC0 furniture from Poly Haven at 1:2 scale
   (meshopt + WebP, ~2 MB in all). The camera follows `p` (0 overview → 1 through the door). */
const A = "/models/hero/";
const S = 0.5; // model units per metre

export async function buildScene(el: HTMLElement, o: { lang: string; phone: boolean; reduce: boolean }) {
  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(o.phone ? 1.5 : 1.75, devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(32, 1, 0.04, 80);

  // the page's navy, as a soft pool of light behind the model
  const bg = document.createElement("canvas"); bg.width = bg.height = 512;
  const g2 = bg.getContext("2d")!, rg = g2.createRadialGradient(317, 215, 10, 317, 215, 420);
  rg.addColorStop(0, "#22323a"); rg.addColorStop(1, "#0B1013"); g2.fillStyle = rg; g2.fillRect(0, 0, 512, 512);
  const bgt = new THREE.CanvasTexture(bg); bgt.colorSpace = THREE.SRGBColorSpace; scene.background = bgt;

  // everything loads together; the stage shows once it is all in
  const tl = new THREE.TextureLoader(), gl = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const tex = (n: string, srgb = false) => tl.loadAsync(`${A}tex/${n}.webp`).then((t) => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t; });
  const pbr = async (n: string, c: number, rough: "arm" | "rough", extra: Partial<THREE.MeshStandardMaterialParameters> = {}) => {
    const [map, normalMap, r] = await Promise.all([tex(`${n}_diff`, true), tex(`${n}_nor_gl`), tex(`${n}_${rough}`)]);
    return new THREE.MeshStandardMaterial({ map, normalMap, roughnessMap: r, color: c, roughness: 1, normalScale: new THREE.Vector2(0.6, 0.6), ...extra });
  };
  const glb = (n: string) => gl.loadAsync(`${A}${n}.glb`).then((g) => g.scene).catch(() => null);
  const [env, plaster, oak, walnut, trav, wool, linen, table, chair, sofa, arm, coffee, plant, side, pillows] = await Promise.all([
    new RGBELoader().loadAsync(`${A}studio.hdr`),
    Promise.resolve(new THREE.MeshStandardMaterial({ color: 0xf1ece4, roughness: 0.92 })), pbr("herringbone_parquet", 0xffffff, "arm"), pbr("american_walnut_veneer", 0xffffff, "arm"),
    pbr("marble_01", 0xe4ddd2, "rough", { normalScale: new THREE.Vector2(0.3, 0.3) }), pbr("poly_wool_herringbone", 0xd9cbb6, "arm"), pbr("rough_linen", 0xf1ebe1, "arm"),
    glb("dining_table"), glb("dining_chair_02"), glb("sofa_03"), glb("modern_arm_chair_01"), glb("modern_coffee_table_01"), glb("potted_plant_02"), glb("side_table_tall_01"), glb("throw_pillows_01"),
  ]);
  oak.color.setRGB(1.45, 1.32, 1.18); walnut.color.setRGB(1.15, 1, 0.92); // a pale, washed oak like the reference model
  // the pieces wear the studio's palette: linen upholstery instead of their stock leather and prints
  const dress = (o3: THREE.Object3D | null, c: number) => o3?.traverse((x) => { const m = (x as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
    if (m && "color" in m) { m.map = null; m.color.setHex(c); m.needsUpdate = true; } });
  dress(sofa, 0xd6cbbb); dress(pillows, 0xe6ddd0);
  const pm = new THREE.PMREMGenerator(renderer); env.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = pm.fromEquirectangular(env).texture; scene.environmentIntensity = 1.05; env.dispose(); pm.dispose();

  // a warm late sun through the arch from behind, soft-edged
  const sun = new THREE.DirectionalLight(0xffe2c0, 2.4);
  sun.position.set(-2.6, 4.4, -6.5); sun.target.position.set(-1.55, 0, 0.4); scene.add(sun, sun.target);
  sun.castShadow = true; sun.shadow.mapSize.set(o.phone ? 1024 : 2048, o.phone ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -4.5, right: 4.5, top: 4.5, bottom: -4.5, near: 1, far: 16 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; sun.shadow.radius = 5; sun.shadow.blurSamples = 16;
  const fill = new THREE.DirectionalLight(0xfff4e6, 0.5); fill.position.set(6, 7, 7); scene.add(fill);

  const model = new THREE.Group(); scene.add(model);
  // box-projected UVs in world units, so every surface shows its texture at true size
  const project = (geo: THREE.BufferGeometry, at: THREE.Vector3, tile: number) => {
    const p = geo.attributes.position, n = geo.attributes.normal, uv = new Float32Array(p.count * 2);
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i) + at.x, y = p.getY(i) + at.y, z = p.getZ(i) + at.z, ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i));
      const [u, v] = ax >= ay && ax >= az ? [z, y] : ay >= az ? [x, z] : [x, y];
      uv[i * 2] = u / tile; uv[i * 2 + 1] = v / tile;
    }
    geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  };
  const put = (geo: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number, tile = 0, to: THREE.Object3D = model) => {
    if (tile) project(geo, new THREE.Vector3(x, y, z), tile);
    const mesh = new THREE.Mesh(geo, m); mesh.position.set(x, y, z); mesh.castShadow = mesh.receiveShadow = true; to.add(mesh); return mesh;
  };
  const box = (w: number, h: number, d: number, x: number, y: number, z: number, m: THREE.Material = plaster, tile = 0.9, r = 0.008, to?: THREE.Object3D) =>
    put(new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2.2, h / 2.2, d / 2.2)), m, x, y, z, tile, to);
  // a CC0 piece at 1:2, standing on the floor at (x, z), turned by r
  const F = 0.04, H = 1.4, T = 0.08, wy = F + H / 2;
  const place = (src: THREE.Object3D | null, x: number, z: number, r = 0, y = F) => {
    if (!src) return null;
    const p = src.clone(true); p.scale.setScalar(S); p.rotation.y = r;
    p.traverse((c) => { const m = c as THREE.Mesh; if (m.isMesh) { m.castShadow = m.receiveShadow = true; } });
    const b = new THREE.Box3().setFromObject(p), c = b.getCenter(new THREE.Vector3());
    p.position.set(x - c.x, y - b.min.y, z - c.z); model.add(p); return p;
  };

  // plinth and herringbone floor: the home is 6 x 4 (12 x 8 m), open along its front and right side
  box(6.5, 0.16, 4.5, 0, -0.08, 0, new THREE.MeshStandardMaterial({ color: 0x24272b, roughness: 0.55, metalness: 0.2 }), 0, 0.012);
  box(6, F, 4, 0, F / 2, 0, oak, 0.75, 0.004);
  // dining room (left): the back wall carries the arched window, with a black steel frame
  const ax = -1.55, hw = 0.55, spring = 0.82;
  const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(2.9, 0); sh.lineTo(2.9, H); sh.lineTo(0, H); sh.lineTo(0, 0);
  const hole = new THREE.Path(); hole.moveTo(ax + 3 - hw, 0.1); hole.lineTo(ax + 3 + hw, 0.1); hole.lineTo(ax + 3 + hw, spring);
  hole.absarc(ax + 3, spring, hw, 0, Math.PI, false); hole.lineTo(ax + 3 - hw, 0.1); sh.holes.push(hole);
  const ext = new THREE.ExtrudeGeometry(sh, { depth: T - 0.012, bevelEnabled: true, bevelSize: 0.006, bevelThickness: 0.006, bevelSegments: 2, curveSegments: 48 });
  put(ext, plaster, -3, F, -2 - T + 0.006, 0.9);
  const steel = new THREE.MeshStandardMaterial({ color: 0x1f1b18, roughness: 0.4, metalness: 0.6 });
  const fz = -2 - T / 2;
  [-hw, -hw / 3, hw / 3, hw].forEach((dx) => box(0.022, spring - 0.1, 0.028, ax + dx, F + 0.1 + (spring - 0.1) / 2, fz, steel, 0, 0.004));
  box(hw * 2, 0.022, 0.028, ax, F + 0.5, fz, steel, 0, 0.004); box(hw * 2, 0.022, 0.028, ax, F + spring, fz, steel, 0, 0.004);
  put(new THREE.TorusGeometry(hw - 0.011, 0.012, 8, 64, Math.PI), steel, ax, F + spring, fz).castShadow = false;
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.2), new THREE.MeshBasicMaterial({ color: 0xfff0d6 })); sky.position.set(ax, F + 0.62, -2.5); model.add(sky);
  box(3.1, H, T, 1.45, wy, -2 - T / 2); // bedroom back wall
  box(T, H, 4 + T, -3 - T / 2, wy, -T / 2); // left wall
  box(T, H, 4, -0.1, wy, 0); // dining | corridor
  box(T, H, 2.4, 0.6, wy, 0.8); // corridor | living
  // corridor end wall and its tall walnut door into the bedroom
  box(0.13, H, T, -0.035, wy, -0.4); box(2.53, H, T, 1.735, wy, -0.4); box(0.44, H - 1.12, T, 0.25, F + 1.12 + (H - 1.12) / 2, -0.4);
  const door = new THREE.Group(); door.position.set(0.03, F, -0.4); model.add(door);
  box(0.44, 1.12, 0.035, 0.22, 0.56, 0, walnut, 0.6, 0.004, door);
  const brass = new THREE.MeshStandardMaterial({ color: 0xc49a5c, roughness: 0.3, metalness: 0.9 });
  box(0.01, 0.26, 0.016, 0.4, 0.56, 0.03, brass, 0, 0.003, door);
  const beyond = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 1.3), new THREE.MeshBasicMaterial({ color: 0xfff2dc })); beyond.position.set(0.25, F + 0.6, -0.5); model.add(beyond);
  box(6 + T, 0.12, T, 0, F + 0.06, 2 + T / 2); box(T, 0.12, 4 + T, 3 + T / 2, F + 0.06, -T / 2); // cut-away curbs
  const stone = new THREE.MeshStandardMaterial({ color: 0xe4d9c9, roughness: 0.75 });
  // corridor: travertine floor and tall panels, walnut panels between, a line of light overhead
  box(0.62, 0.008, 2.36, 0.25, F + 0.004, 0.8, trav, 0.6, 0.002);
  [-0.054, 0.554].forEach((px) => [1.7, 1.12, 0.54, -0.06].forEach((z, i) => box(0.014, H - 0.14, 0.54, px, F + (H - 0.14) / 2 + 0.02, z, i % 2 ? walnut : stone, 0.6, 0.004)));
  const strip = put(new THREE.BoxGeometry(0.025, 0.01, 2.3), new THREE.MeshBasicMaterial({ color: 0xfff1d6 }), 0.25, F + H - 0.03, 0.8); strip.castShadow = false;
  // a ceiling over the corridor, shown only once the camera is inside (the model is roofless from above)
  const ceil = box(0.72, 0.03, 2.4, 0.25, F + H + 0.015, 0.8, plaster, 0, 0.004); ceil.castShadow = false;
  const lamp = new THREE.PointLight(0xffd9a6, 1.4, 3, 1.6); lamp.position.set(0.25, F + 1.15, 0.6); model.add(lamp);

  const slat = walnut.clone(); slat.color.setHex(0x8d6c55);
  // dining: walnut slats along the left wall, a wool rug, the table and six chairs, a plant, a pendant
  for (let z = -1.85; z < 1.75; z += 0.1) box(0.03, H - 0.04, 0.05, -2.945, wy, z, slat, 0.6, 0.006);
  box(2.2, 0.012, 1.6, ax, F + 0.006, -0.45, wool, 0.5, 0.004);
  if (table) {
    const probe = new THREE.Box3().setFromObject(table).getSize(new THREE.Vector3()).multiplyScalar(S);
    const turn = probe.z > probe.x;
    place(table, ax, -0.45, turn ? Math.PI / 2 : 0);
    const L = Math.max(probe.x, probe.z), D = Math.min(probe.x, probe.z), xs = L > 0.8 ? [-L / 3, 0, L / 3] : [-L / 4, L / 4];
    xs.forEach((dx) => { place(chair, ax + dx, -0.45 - D / 2 - 0.05, 0); place(chair, ax + dx, -0.45 + D / 2 + 0.05, Math.PI); });
  }
  place(plant, -2.65, -1.7);
  put(new THREE.SphereGeometry(0.1, 32, 16), new THREE.MeshStandardMaterial({ color: 0xfff0d0, emissive: 0xffc982, emissiveIntensity: 1.4 }), ax, F + 0.95, -0.45).castShadow = false;
  put(new THREE.CylinderGeometry(0.004, 0.004, 0.4, 8), brass, ax, F + 1.25, -0.45).castShadow = false;
  // living (front right): sofa against the corridor wall, coffee table, armchair, rug, plant, side table
  box(1.4, 0.012, 1.25, 1.55, F + 0.006, 0.85, wool, 0.5, 0.004);
  place(sofa, 0.98, 0.85, Math.PI / 2); place(coffee, 1.55, 0.85); place(arm, 2.35, 0.85, -Math.PI / 2);
  place(plant, 2.7, -0.1); place(side, 0.86, 1.82);
  // bedroom (behind the door): linen bed on a walnut base, walnut headboard, pillows, side tables
  box(1.1, 0.16, 1.22, 1.75, F + 0.08, -1.37, walnut, 0.6, 0.01);
  box(1.06, 0.12, 1.16, 1.75, F + 0.22, -1.37, linen, 0.5, 0.03);
  box(1.06, 0.03, 0.42, 1.75, F + 0.29, -0.96, wool, 0.4, 0.012);
  box(1.4, 0.58, 0.06, 1.75, F + 0.29, -1.95, walnut, 0.6, 0.01);
  place(pillows, 1.75, -1.72, Math.PI, F + 0.28);
  place(side, 0.95, -1.8); place(side, 2.55, -1.8);

  // the architect's drawing lines round the plinth, with end ticks
  const dl: number[] = [], gy = -0.155;
  const seg = (a: number[], b: number[]) => dl.push(...a, ...b);
  seg([-3.35, gy, 2.8], [3.35, gy, 2.8]); seg([-3.35, gy, 2.68], [-3.35, gy, 2.92]); seg([3.35, gy, 2.68], [3.35, gy, 2.92]);
  seg([3.8, gy, -2.35], [3.8, gy, 2.35]); seg([3.68, gy, -2.35], [3.92, gy, -2.35]); seg([3.68, gy, 2.35], [3.92, gy, 2.35]);
  const lg = new THREE.BufferGeometry(); lg.setAttribute("position", new THREE.Float32BufferAttribute(dl, 3));
  model.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: 0xc49a5c, transparent: true, opacity: 0.75 })));
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: 0.35 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -0.16; ground.receiveShadow = true; scene.add(ground);

  // post: MSAA scene pass, ground-truth AO for the contact shadows, then tone mapping and sRGB
  const rt = new THREE.WebGLRenderTarget(1, 1, { samples: 4, type: THREE.HalfFloatType });
  const composer = new EffectComposer(renderer, rt);
  composer.addPass(new RenderPass(scene, cam));
  const ao = new GTAOPass(scene, cam, 1, 1);
  ao.updateGtaoMaterial({ radius: 0.18, distanceExponent: 1.5, thickness: 1, scale: 1.2, samples: o.phone ? 8 : 16, distanceFallOff: 1 });
  ao.blendIntensity = 0.9; composer.addPass(ao); composer.addPass(new OutputPass());

  // the camera's path: overview, a sweep down to the corridor's open end, then a walk to the door
  const P0 = new THREE.Vector3(0.62, 0.6, 0.78).normalize(), C = new THREE.Vector3(0.25, 2.4, 5.6), P1 = new THREE.Vector3(0.25, 0.62, 1.85);
  const L0 = new THREE.Vector3(0, 0.25, 0), L1 = new THREE.Vector3(0.25, 0.6, -0.4), look = new THREE.Vector3(), pos = new THREE.Vector3(), start = new THREE.Vector3();
  let w = 1, h = 1, R = 12, prog = 0;
  const t0 = performance.now();
  const ease = (x: number) => x * x * (3 - 2 * x), cl = (x: number) => Math.min(1, Math.max(0, x));
  el.appendChild(renderer.domElement);
  const fit = () => {
    w = el.clientWidth; h = el.clientHeight; renderer.setSize(w, h); composer.setSize(w, h); cam.aspect = w / h;
    R = 12.5 * Math.min(2.3, Math.max(1, 1.45 / cam.aspect));
  };
  const draw = () => {
    const p = cl(prog), d = ease(cl((p - 0.04) / 0.64)), u = 1 - d, walk = ease(cl((p - 0.68) / 0.32));
    start.copy(P0).multiplyScalar(R);
    pos.set(0, 0, 0).addScaledVector(start, u * u).addScaledVector(C, 2 * u * d).addScaledVector(P1, d * d);
    pos.z -= 1.1 * walk;
    look.lerpVectors(L0, L1, ease(cl((p - 0.04) / 0.5)));
    cam.position.copy(pos); cam.lookAt(look); cam.fov = 32 + 24 * d;
    // the model stands beside the words at first (right on wide screens, up on phones) and centres as it dives
    const k = 1 - cl(p * 2.4), wide = w >= 1024;
    cam.setViewOffset(w, h, wide ? -w * 0.17 * k * (o.lang === "ar" ? -1 : 1) : 0, wide ? 0 : h * 0.15 * k, w, h);
    cam.updateProjectionMatrix();
    strip.visible = ceil.visible = p > 0.45;
    // inside there is no sun, only the corridor's own light (the model has no ceiling to stop it)
    sun.intensity = 2.4 * (1 - 0.9 * d); lamp.intensity = 1.4 + 3 * d; scene.environmentIntensity = 1.05 + 0.4 * d;
    // the AO gives the model its contact shadows from afar; up close in the corridor it only smudges
    ao.enabled = d < 0.7; ao.blendIntensity = 0.9 * (1 - d / 0.7);
    door.rotation.y = 1.75 * ease(cl((p - 0.8) / 0.18));
    model.rotation.y = o.reduce ? 0 : Math.sin(((performance.now() - t0) / 1000) * 0.32) * 0.2 * (1 - d);
    composer.render();
  };
  fit();
  return {
    fit, draw,
    set: (p: number) => { prog = p; },
    get: () => prog,
    dispose: () => { composer.dispose(); rt.dispose(); renderer.dispose(); renderer.domElement.remove(); },
  };
}
