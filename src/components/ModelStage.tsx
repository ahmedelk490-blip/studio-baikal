"use client";
import { useEffect, useRef } from "react";
import type { Mesh } from "three";

// one piece of the arrangement: its glTF, the height it should stand at, and where on the floor
export type Piece = { src: string; h: number; x: number; z?: number };

/* One lit stage for a small arrangement of real pieces (CC0 glTF from Poly Haven): warm key light from
   the window side, a soft fill, contact shadows on an invisible floor. The arrangement turns slowly on
   its own and a little further with the scroll. It draws only while on screen (and once, at rest, with
   reduced motion); three.js loads on the client only, when the stage first comes near. */
export function ModelStage({ pieces, className = "" }: { pieces: Piece[]; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = box.current!;
    let stop = () => {};
    const io = new IntersectionObserver(async ([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const THREE = await import("three");
      const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
      renderer.setPixelRatio(Math.min(1.75, devicePixelRatio || 1));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
      renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      el.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
      scene.add(new THREE.HemisphereLight(0xfff3e2, 0x3a3128, 1.1));
      const key = new THREE.DirectionalLight(0xffd9a8, 2.6); key.position.set(3, 5, 4); key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 6; key.shadow.camera.near = 0.5; key.shadow.camera.far = 20;
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xc49a5c, 1.2); rim.position.set(-4, 3, -3); scene.add(rim);
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.ShadowMaterial({ opacity: 0.28 }));
      floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
      const pivot = new THREE.Group(); scene.add(pivot);
      const fit = () => { const w = el.clientWidth, h = el.clientHeight; renderer.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix(); };
      fit();
      // each piece scaled to its height and set on the floor at its place; then frame the whole group
      const loader = new GLTFLoader();
      for (const pc of pieces) {
        // a piece that fails to load is left out quietly; the stage never throws on the page
        const gl = await loader.loadAsync(pc.src).catch(() => null);
        if (!gl) continue;
        const model = gl.scene;
        model.traverse((o) => { const m = o as Mesh; if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
        const b0 = new THREE.Box3().setFromObject(model), k = pc.h / b0.getSize(new THREE.Vector3()).y;
        model.scale.setScalar(k);
        const b1 = new THREE.Box3().setFromObject(model), c1 = b1.getCenter(new THREE.Vector3());
        model.position.set(pc.x - c1.x, -b1.min.y, (pc.z ?? 0) - c1.z); pivot.add(model);
      }
      if (!pivot.children.length) { renderer.dispose(); renderer.domElement.remove(); return; }
      const b = new THREE.Box3().setFromObject(pivot), size = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3());
      pivot.children.forEach((m) => { m.position.x -= c.x; m.position.z -= c.z; });
      const r = Math.max(size.x, size.y, size.z);
      cam.position.set(0, size.y * 0.75, r * 2.6); cam.lookAt(0, size.y * 0.42, 0);
      let scrollTurn = 0, visible = true, raf = 0;
      // a drag left or right turns the pieces by hand; let go and they coast to a stop, then keep turning slowly
      let dragTurn = 0, spin = 0, lastX: number | null = null;
      const t0 = performance.now();
      const draw = () => {
        if (lastX === null && Math.abs(spin) > 0.0005) { dragTurn += spin; spin *= 0.94; }
        pivot.rotation.y = -0.6 + (reduce ? 0 : ((performance.now() - t0) / 1000) * 0.18) + scrollTurn + dragTurn; renderer.render(scene, cam);
      };
      const loop = () => { draw(); raf = visible && (!reduce || lastX !== null || Math.abs(spin) > 0.0005) ? requestAnimationFrame(loop) : 0; };
      el.style.touchAction = "pan-y"; el.style.cursor = "grab";
      el.onpointerdown = (e) => { lastX = e.clientX; spin = 0; el.setPointerCapture(e.pointerId); el.style.cursor = "grabbing"; if (!raf) loop(); };
      el.onpointermove = (e) => { if (lastX === null) return; const d = (e.clientX - lastX) * 0.012; dragTurn += d; spin = d; lastX = e.clientX; };
      el.onpointerup = el.onpointercancel = () => { lastX = null; el.style.cursor = "grab"; if (!raf) loop(); };
      const onScroll = () => { const rr = el.getBoundingClientRect(); scrollTurn = (1 - (rr.top + rr.height / 2) / innerHeight) * 1.2; if (reduce) draw(); };
      const seen = new IntersectionObserver(([x]) => { visible = x.isIntersecting && !document.hidden; if (visible && !raf && !reduce) loop(); });
      seen.observe(el);
      const ro = new ResizeObserver(() => { fit(); draw(); }); ro.observe(el);
      addEventListener("scroll", onScroll, { passive: true }); onScroll();
      el.dataset.ready = "1"; draw(); if (!reduce) loop();
      stop = () => { cancelAnimationFrame(raf); seen.disconnect(); ro.disconnect(); removeEventListener("scroll", onScroll); renderer.dispose(); renderer.domElement.remove(); };
    }, { rootMargin: "400px 0px" });
    io.observe(el);
    return () => { io.disconnect(); stop(); };
  }, [pieces]);
  return <div ref={box} className={`relative select-none [&>canvas]:block [&>canvas]:h-full [&>canvas]:w-full ${className}`} aria-hidden />;
}
