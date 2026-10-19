"use client";
import { useEffect, useRef } from "react";
import type { Mesh } from "three";

/* One lit stage for one real piece of furniture (CC0 glTF from Poly Haven): warm key light from the
   window side, a soft fill, a contact shadow on an invisible floor. The piece turns slowly on its own
   and a little further with the scroll. It draws only while on screen (and once, at rest, with
   reduced motion); three.js loads on the client only, when the stage first comes near. */
export function ModelStage({ src, className = "" }: { src: string; className?: string }) {
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
      const gltf = await new GLTFLoader().loadAsync(src);
      const model = gltf.scene;
      model.traverse((o) => { const m = o as Mesh; if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
      // centre it on the floor and frame it whatever its size
      const b = new THREE.Box3().setFromObject(model), size = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3());
      model.position.set(-c.x, -b.min.y, -c.z); pivot.add(model);
      const r = Math.max(size.x, size.y, size.z);
      cam.position.set(0, size.y * 0.75, r * 2.6); cam.lookAt(0, size.y * 0.42, 0);
      let scrollTurn = 0, visible = true, raf = 0;
      const t0 = performance.now();
      const draw = () => { pivot.rotation.y = -0.6 + (reduce ? 0 : ((performance.now() - t0) / 1000) * 0.18) + scrollTurn; renderer.render(scene, cam); };
      const loop = () => { draw(); raf = visible && !reduce ? requestAnimationFrame(loop) : 0; };
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
  }, [src]);
  return <div ref={box} className={`relative [&>canvas]:block [&>canvas]:h-full [&>canvas]:w-full ${className}`} aria-hidden />;
}
