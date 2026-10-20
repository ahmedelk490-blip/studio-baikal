"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { BufferGeometry, Group, Material } from "three";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Dict, Lang } from "@/data/i18n";
import { Btn } from "./Btn";
import { extras } from "@/data/extras";

const ROOM = "/projects/el-nakhil-villa/01.webp";

/* Surface — the scale model. A Baikal home stands as an architect's model on a travertine plinth, cut
   open so every room shows, with drawing lines round it, and turns gently in warm light. Scrolling dives
   the camera down into the model's entrance corridor (travertine and walnut panels, a line of light),
   walks it to the walnut door at the end; the door swings open and the finished room takes over (the
   photo). Three.js loads on the client; the scene draws only while on screen and only while it moves. */
export function HeroModel({ t, lang }: { t: Dict; lang: Lang }) {
  const ref = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const prog = useRef(0); // the walk through the model (0 = overview, 1 = door open), set by the scroll
  const kick = useRef(() => {});
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [intro, setIntro] = useState(true);
  const firstVisit = useRef<boolean | null>(null);

  useEffect(() => {
    const el = stage.current!;
    let stop = () => {}, dead = false;
    (async () => {
      const THREE = await import("three");
      if (dead) return;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" }); }
      catch { setFailed(true); return; }
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches, phone = innerWidth < 768;
      renderer.setPixelRatio(Math.min(phone ? 1.5 : 1.75, devicePixelRatio || 1));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
      renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      el.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const cam = new THREE.PerspectiveCamera(32, 1, 0.04, 80);

      // light: a soft sky, warm sun through the arch from behind, a fill from the viewer's side
      scene.add(new THREE.HemisphereLight(0xfff1de, 0x262b2f, 0.85));
      const sun = new THREE.DirectionalLight(0xffcf94, 3.2);
      sun.position.set(-2.6, 4.2, -6.5); sun.target.position.set(-1.55, 0, 0.4); scene.add(sun, sun.target);
      sun.castShadow = true; sun.shadow.mapSize.set(phone ? 1024 : 2048, phone ? 1024 : 2048);
      Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 0.5, far: 20 }); sun.shadow.bias = -0.0006; sun.shadow.radius = 4;
      const fill = new THREE.DirectionalLight(0xfff4e6, 0.9); fill.position.set(6, 7, 7); scene.add(fill);

      const M = (c: number, r = 0.85, m = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
      const wall = M(0xf2ede6, 0.92), oak = M(0xc19b72, 0.7), walnut = M(0x4f3524, 0.55), trav = M(0xdcd2c3, 0.8),
        fabric = M(0xd8cdbd, 1), linen = M(0xefe8dd, 1), frame = M(0x2a2420, 0.5), bronze = M(0xc49a5c, 0.35, 0.8), leaf = M(0x5d7354, 0.9);
      const model = new THREE.Group(); scene.add(model);
      type G = BufferGeometry; type Mt = Material; type Gr = Group;
      const add = (g: G, m: Mt, x: number, y: number, z: number, to: Gr = model) => {
        const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; to.add(o); return o;
      };
      const box = (w: number, h: number, d: number, x: number, y: number, z: number, m: Mt = wall, to?: Gr) => add(new THREE.BoxGeometry(w, h, d), m, x, y, z, to);
      const cyl = (r: number, h: number, x: number, y: number, z: number, m: Mt = walnut, r2 = r) => add(new THREE.CylinderGeometry(r, r2, h, 32), m, x, y, z);

      // plinth and floor: the home is 6 x 4, cut open along its front and right side
      const F = 0.04, H = 1.4, T = 0.08, wy = F + H / 2;
      box(6.7, 0.32, 4.7, 0, -0.16, 0, trav);
      box(6, F, 4, 0, F / 2, 0, oak);
      // dining room (left): back wall with an arched window, its black steel frame and the glow beyond
      const ax = -1.55, hw = 0.55, spring = 0.82;
      const shape = new THREE.Shape(); shape.moveTo(0, 0); shape.lineTo(2.9, 0); shape.lineTo(2.9, H); shape.lineTo(0, H); shape.lineTo(0, 0);
      const hole = new THREE.Path(); hole.moveTo(ax + 3 - hw, 0.1); hole.lineTo(ax + 3 + hw, 0.1); hole.lineTo(ax + 3 + hw, spring);
      hole.absarc(ax + 3, spring, hw, 0, Math.PI, false); hole.lineTo(ax + 3 - hw, 0.1); shape.holes.push(hole);
      add(new THREE.ExtrudeGeometry(shape, { depth: T, bevelEnabled: false, curveSegments: 40 }), wall, -3, F, -2 - T);
      const fz = -2 - T / 2;
      [-hw, -hw / 3, hw / 3, hw].forEach((dx) => box(0.025, spring - 0.1, 0.03, ax + dx, F + 0.1 + (spring - 0.1) / 2, fz, frame));
      box(hw * 2, 0.025, 0.03, ax, F + spring, fz, frame);
      add(new THREE.TorusGeometry(hw - 0.012, 0.014, 8, 48, Math.PI), frame, ax, F + spring, fz).castShadow = false;
      const sky = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), new THREE.MeshBasicMaterial({ color: 0xffe0ad })); sky.position.set(ax, F + 0.75, -2.45); model.add(sky);
      box(3.1, H, T, 1.45, wy, -2 - T / 2); // back wall of the bedroom
      box(T, H, 4 + T, -3 - T / 2, wy, -T / 2); // left wall
      box(T, H, 4, -0.1, wy, 0); // dining | corridor
      box(T, H, 2.4, 0.6, wy, 0.8); // corridor | kitchen
      // the corridor's end wall with the walnut door into the bedroom
      box(0.13, H, T, -0.035, wy, -0.4); box(2.53, H, T, 1.735, wy, -0.4); box(0.44, H - 1.1, T, 0.25, F + 1.1 + (H - 1.1) / 2, -0.4);
      const door = new THREE.Group(); door.position.set(0.03, F, -0.4); model.add(door);
      box(0.44, 1.1, 0.035, 0.22, 0.55, 0, walnut, door); box(0.012, 0.22, 0.02, 0.39, 0.55, 0.03, bronze, door);
      const beyond = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 1.3), new THREE.MeshBasicMaterial({ color: 0xfff0d8 })); beyond.position.set(0.25, F + 0.6, -0.47); model.add(beyond);
      box(6 + T, 0.12, T, 0, F + 0.06, 2 + T / 2); box(T, 0.12, 4 + T, 3 + T / 2, F + 0.06, -T / 2); // cut-away curbs
      // corridor: travertine floor, tall travertine panels with walnut ones between, a line of light above
      box(0.62, 0.006, 2.36, 0.25, F + 0.003, 0.8, trav);
      [-0.054, 0.554].forEach((px) => [1.7, 1.12, 0.54, -0.06].forEach((z, i) => box(0.012, H - 0.12, 0.54, px, F + (H - 0.12) / 2 + 0.02, z, i % 2 ? walnut : trav)));
      const strip = box(0.025, 0.012, 2.3, 0.25, F + H - 0.03, 0.8, new THREE.MeshBasicMaterial({ color: 0xfff1d6 })); strip.castShadow = false;
      const glow = new THREE.PointLight(0xffd9a6, 1.6, 3.2, 1.6); glow.position.set(0.25, F + 1.15, 0.6); model.add(glow);
      // dining: walnut slats along the left wall, rug, oval table, chairs, console, plant, a pendant
      for (let z = -1.85; z < 1.75; z += 0.1) box(0.03, H - 0.04, 0.05, -2.945, wy, z, walnut);
      box(2.2, 0.01, 1.7, ax, F + 0.005, -0.45, M(0xb7a58c, 1));
      const top = cyl(0.5, 0.045, ax, F + 0.36, -0.45); top.scale.set(1.4, 1, 0.85);
      cyl(0.08, 0.34, ax, F + 0.17, -0.45, walnut, 0.14);
      const seat = (x: number, z: number, a: number) => {
        const g = new THREE.Group(); g.position.set(x, F, z); g.rotation.y = a; model.add(g);
        box(0.22, 0.04, 0.22, 0, 0.2, 0, fabric, g); box(0.2, 0.18, 0.18, 0, 0.09, 0, walnut, g);
        const b = add(new THREE.CylinderGeometry(0.11, 0.11, 0.03, 24), fabric, 0, 0.36, 0.11, g); b.rotation.x = Math.PI / 2; b.scale.set(1, 1, 1.25);
      };
      [-0.5, 0, 0.5].forEach((dx) => { seat(ax + dx, -0.95, 0); seat(ax + dx, 0.05, Math.PI); });
      seat(ax - 0.86, -0.45, Math.PI / 2); seat(ax + 0.86, -0.45, -Math.PI / 2);
      box(0.3, 0.38, 1, -0.29, F + 0.19, -1.4, walnut); cyl(0.07, 0.24, -0.29, F + 0.5, -1.25, linen, 0.05);
      cyl(0.13, 0.26, -2.65, F + 0.13, -1.7, trav, 0.1); add(new THREE.SphereGeometry(0.26, 20, 16), leaf, -2.65, F + 0.48, -1.7);
      cyl(0.01, 0.5, ax, F + 1.15, -0.45, bronze);
      add(new THREE.SphereGeometry(0.11, 24, 16), new THREE.MeshStandardMaterial({ color: 0xffe3b0, emissive: 0xffc982, emissiveIntensity: 1.6 }), ax, F + 0.88, -0.45).castShadow = false;
      // bedroom (behind the door): a walnut bed against the back wall, side tables and lamps
      box(1.1, 0.22, 1.2, 1.75, F + 0.11, -1.38, walnut); box(1.04, 0.12, 1.14, 1.75, F + 0.28, -1.38, linen);
      box(1.4, 0.62, 0.07, 1.75, F + 0.31, -1.95, walnut); box(1.06, 0.02, 0.4, 1.75, F + 0.35, -0.98, M(0x8c6a49, 1));
      [0.95, 2.55].forEach((x) => { box(0.3, 0.28, 0.3, x, F + 0.14, -1.8, oak); cyl(0.06, 0.16, x, F + 0.36, -1.8, linen, 0.08); });
      // kitchen (right front): island with a travertine top, bronze stools, a run of cabinets
      box(1.3, 0.44, 0.6, 1.8, F + 0.22, 0.9, walnut); box(1.4, 0.04, 0.7, 1.8, F + 0.46, 0.9, trav);
      [1.4, 1.8, 2.2].forEach((x) => cyl(0.08, 0.3, x, F + 0.15, 1.42, bronze, 0.07));
      box(1.8, 0.44, 0.36, 1.85, F + 0.22, -0.18, walnut); box(1.82, 0.04, 0.38, 1.85, F + 0.46, -0.18, trav);
      // the architect's drawing lines on the table round the plinth, with end ticks
      const dl: number[] = [], gy = -0.315;
      const seg = (a: number[], b: number[]) => dl.push(...a, ...b);
      seg([-3.35, gy, 2.8], [3.35, gy, 2.8]); seg([-3.35, gy, 2.68], [-3.35, gy, 2.92]); seg([3.35, gy, 2.68], [3.35, gy, 2.92]);
      seg([3.8, gy, -2.35], [3.8, gy, 2.35]); seg([3.68, gy, -2.35], [3.92, gy, -2.35]); seg([3.68, gy, 2.35], [3.92, gy, 2.35]);
      const lg = new THREE.BufferGeometry(); lg.setAttribute("position", new THREE.Float32BufferAttribute(dl, 3));
      model.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: 0xc49a5c, transparent: true, opacity: 0.7 })));
      const ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: 0.32 }));
      ground.rotation.x = -Math.PI / 2; ground.position.y = -0.32; ground.receiveShadow = true; scene.add(ground);

      // the camera's path: overview, a sweep down to the corridor's open end, then a walk to the door
      const P0 = new THREE.Vector3(0.62, 0.6, 0.78).normalize(), C = new THREE.Vector3(0.25, 2.4, 5.6), P1 = new THREE.Vector3(0.25, 0.62, 1.85);
      const L0 = new THREE.Vector3(0, 0.25, 0), L1 = new THREE.Vector3(0.25, 0.6, -0.4), look = new THREE.Vector3(), pos = new THREE.Vector3(), start = new THREE.Vector3();
      let w = 1, h = 1, R = 12;
      const fit = () => { w = el.clientWidth; h = el.clientHeight; renderer.setSize(w, h); cam.aspect = w / h; R = 12.5 * Math.min(2.3, Math.max(1, 1.45 / cam.aspect)); };
      const ease = (x: number) => x * x * (3 - 2 * x), cl = (x: number) => Math.min(1, Math.max(0, x));
      const t0 = performance.now();
      const draw = () => {
        const p = cl(prog.current), d = ease(cl((p - 0.04) / 0.64)), u = 1 - d, walk = ease(cl((p - 0.68) / 0.32));
        start.copy(P0).multiplyScalar(R);
        pos.set(0, 0, 0).addScaledVector(start, u * u).addScaledVector(C, 2 * u * d).addScaledVector(P1, d * d);
        pos.z -= 1.1 * walk;
        look.lerpVectors(L0, L1, ease(cl((p - 0.04) / 0.5)));
        cam.position.copy(pos); cam.lookAt(look);
        cam.fov = 32 + 24 * d;
        // the model stands beside the words at first (right on wide screens, up on phones) and centres as it dives
        const k = 1 - cl(p * 2.4), wide = w >= 1024;
        cam.setViewOffset(w, h, wide ? -w * 0.17 * k * (lang === "ar" ? -1 : 1) : 0, wide ? 0 : h * 0.15 * k, w, h);
        cam.updateProjectionMatrix();
        door.rotation.y = 1.75 * ease(cl((p - 0.8) / 0.18));
        model.rotation.y = reduce ? 0 : Math.sin(((performance.now() - t0) / 1000) * 0.32) * 0.2 * (1 - d);
        renderer.render(scene, cam);
      };
      let visible = true, raf = 0;
      // turn while the overview shows; once the camera is in, draw only when the scroll moves it
      const loop = () => { draw(); raf = visible && !reduce && prog.current < 0.3 ? requestAnimationFrame(loop) : 0; };
      kick.current = () => { if (raf) return; if (visible && !reduce && prog.current < 0.3) loop(); else if (visible) draw(); };
      const seen = new IntersectionObserver(([x]) => { visible = x.isIntersecting; if (visible) kick.current(); });
      seen.observe(el);
      const ro = new ResizeObserver(() => { fit(); draw(); }); ro.observe(el);
      fit(); draw(); setReady(true); el.dataset.ready = "1"; if (!reduce) loop();
      stop = () => { cancelAnimationFrame(raf); seen.disconnect(); ro.disconnect(); renderer.dispose(); renderer.domElement.remove(); };
    })();
    return () => { dead = true; stop(); };
  }, [lang]);

  useGSAP(() => {
    const sec = ref.current!;
    if (firstVisit.current === null) {
      let seen = false;
      try { seen = sessionStorage.getItem("bk-intro") === "1"; sessionStorage.setItem("bk-intro", "1"); } catch {}
      firstVisit.current = !seen;
    }
    const first = firstVisit.current;
    gsap.matchMedia().add({ motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
      if (ctx.conditions!.reduce) { setIntro(false); return; }
      const tl = gsap.timeline({ delay: 0.15 });
      if (first) {
        // the Baikal mark and its filling line; then the mark lands on the header logo
        const mark = sec.querySelector<HTMLElement>(".hm-mark")!, dest = document.querySelector<HTMLElement>("header#top img");
        tl.to(".hm-rule", { scaleX: 1, duration: 1, ease: "power2.inOut" });
        if (dest) { const a = mark.getBoundingClientRect(), b = dest.getBoundingClientRect();
          tl.to(mark, { x: b.left + b.width / 2 - (a.left + a.width / 2), y: b.top + b.height / 2 - (a.top + a.height / 2), scale: b.width / a.width, duration: 0.95, ease: "power3.inOut" }, "+=0.15"); }
        tl.to(".hm-rule", { opacity: 0, duration: 0.35 }, "<").to(".hm-veil", { opacity: 0, duration: 0.6 }, "-=0.35").set(".hm-intro", { display: "none" });
      } else gsap.set(".hm-intro", { display: "none" });
      tl.fromTo(".hm-rise", { y: 60, scale: 0.92 }, { y: 0, scale: 1, duration: 1.6, ease: "power3.out" }, first ? "-=0.5" : 0)
        .from(".h-word", { yPercent: 120, opacity: 0, duration: 1.1, ease: "power4.out", stagger: 0.07 }, "-=1.3")
        .from(".h-fade", { opacity: 0, y: 16, duration: 0.8, ease: "power3.out", stagger: 0.08 }, "-=0.7")
        .call(() => setIntro(false));
      // the walk: the page holds while the camera goes in; the finished room takes over when the door opens
      const dive = { p: 0 };
      gsap.timeline({ scrollTrigger: { trigger: sec, start: "top top", end: "+=190%", pin: true, scrub: 0.8, anticipatePin: 1 } })
        .to(dive, { p: 1, ease: "none", duration: 0.86, onUpdate: () => { prog.current = dive.p; kick.current(); } }, 0)
        .to(".hm-bar", { scaleY: 1, ease: "none", duration: 1 }, 0)
        .to(".hm-copy", { opacity: 0, y: -40, duration: 0.2, ease: "power1.in" }, 0.04)
        .fromTo(".hm-photo", { opacity: 0, scale: 1.12 }, { opacity: 1, scale: 1, duration: 0.14, ease: "power1.out" }, 0.8)
        .fromTo(".hm-after > *", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.1, stagger: 0.03 }, 0.88);
    });
  }, { scope: ref });

  const words = (s: string) => s.split(" ").map((w, k) => (
    <span key={k} className="inline-block overflow-hidden px-[0.06em] -mx-[0.06em] py-[0.22em] -my-[0.22em] align-bottom">
      <span className="h-word inline-block">{w}&nbsp;</span>
    </span>
  ));
  const x = extras[lang];
  const u = "text-xs uppercase tracking-[0.2em] rtl:tracking-normal";
  return (
    <section ref={ref} data-depth={t.gauge.surface} data-meters="0 m" data-deep="1" className="relative h-[100svh] min-h-[620px] overflow-hidden bg-[radial-gradient(ellipse_at_62%_42%,#1d2a30,#0B1013_70%)] text-[var(--surface)]">
      {/* the model; without WebGL the finished room shows instead */}
      <div className="hm-rise absolute inset-0">
        <div ref={stage} className={`absolute inset-0 transition-opacity duration-1000 [&>canvas]:block [&>canvas]:h-full [&>canvas]:w-full ${ready ? "opacity-100" : "opacity-0"}`} aria-hidden />
      </div>
      <div className="hm-photo absolute inset-0 opacity-0" style={failed ? { opacity: 1 } : undefined}>
        <Image src={ROOM} alt={x.grow.eyebrow} fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1013] via-[#0B1013]/30 to-transparent" />
      </div>

      {/* the opening words beside the model; they lift away as the camera goes in */}
      <div className="hm-copy pointer-events-none absolute inset-x-0 bottom-0 px-5 pb-10 md:px-10 md:pb-12 lg:inset-y-0 lg:flex lg:w-[46%] lg:flex-col lg:justify-center lg:pb-0">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1013] via-[#0B1013]/75 to-transparent lg:hidden" aria-hidden />
        <div className="relative">
          <h1 className="display text-[12vw] leading-[.98] rtl:leading-[1.3] rtl:text-[10vw] md:text-[8vw] md:rtl:text-[7vw] lg:text-[5vw] lg:rtl:text-[4.4vw]">
            <span className="block">{words(t.hero.t1)}</span>
            <span className="block italic text-[var(--bronze)] rtl:not-italic">{words(t.hero.t2)}</span>
          </h1>
          <p className="h-fade mt-5 max-w-md text-sm leading-relaxed text-[var(--surface)]/80">{t.hero.intro}</p>
          <div className={`h-fade pointer-events-auto mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 ${u}`}>
            <Btn href={`/${lang}#contact`}>{t.hero.cta1}</Btn>
            <Btn href={`/${lang}#projects`} variant="ghost">{t.hero.cta2}</Btn>
          </div>
          <p className={`h-fade mt-10 flex items-center gap-3 text-[var(--surface)]/60 max-lg:hidden ${u}`}>
            <span className="block h-8 w-px bg-gradient-to-b from-[var(--bronze)] to-transparent" aria-hidden />{x.enter}
          </p>
        </div>
      </div>

      {/* how far in: a hairline on the far side that fills as the camera walks */}
      <div className="pointer-events-none absolute end-6 top-1/2 h-40 w-px -translate-y-1/2 bg-[var(--surface)]/15 max-md:hidden" aria-hidden>
        <div className="hm-bar h-full w-full origin-top scale-y-0 bg-[var(--bronze)]" />
      </div>

      {/* through the door: the finished room and the studio's promise */}
      <div className="hm-after pointer-events-none absolute inset-x-0 bottom-0 px-5 pb-10 md:px-10 md:pb-14">
        <p className={`${u} text-[var(--bronze)] opacity-0`}>{x.grow.eyebrow}</p>
        <p className="display mt-3 max-w-4xl text-[10vw] leading-[1.02] opacity-0 rtl:leading-[1.3] md:text-[6vw] lg:text-[4.6vw]">
          {x.heroAlt[0]} <span className="italic text-[var(--bronze)] rtl:not-italic">{x.heroAlt[1]}</span>
        </p>
      </div>

      {intro && (
        <div className="hm-intro fixed inset-0 z-[70]" aria-hidden>
          <div className="hm-veil absolute inset-0 bg-[#0B1013]" />
          <div className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2">
            <div className="hm-mark bg-[var(--surface)] p-2"><Image src="/brand/logo.png" alt="" width={120} height={120} priority className="h-24 w-24 md:h-28 md:w-28" /></div>
            <div className="hm-rule mx-auto mt-6 h-px w-[min(56vw,240px)] origin-left scale-x-0 bg-[var(--bronze)] rtl:origin-right" />
          </div>
        </div>
      )}
    </section>
  );
}
