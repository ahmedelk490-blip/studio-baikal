"use client";
import { useEffect, useRef } from "react";

/* The hero film seen through the surface of the lake (raw WebGL, no library). Rings spread from the
   pointer or a finger, and on their own every couple of seconds, bending the film and catching a soft
   bronze light. It draws only when there is something new to show (a new film frame or a moving ring)
   and only while the hero is on screen; without WebGL or with reduced motion the plain film stays. */
const N = 14;
const VS = `attribute vec2 p; varying vec2 uv; void main(){ uv = p * .5 + .5; gl_Position = vec4(p, 0., 1.); }`;
const FS = `precision highp float;
uniform sampler2D tex; uniform vec2 res, scale; uniform float t; uniform vec4 drops[${N}]; varying vec2 uv;
float h(vec2 p){
  vec2 a = vec2(res.x / res.y, 1.);
  float v = .0024 * sin(p.x * 17. + t * 1.1) * sin(p.y * 13. - t * .8);            // the lake breathing
  for (int i = 0; i < ${N}; i++) {
    vec4 d = drops[i]; float age = t - d.z;
    if (age < 0. || age > 4.5 || d.w <= 0.) continue;
    float r = length((p - d.xy) * a), k = r - age * .32;                          // ring front moving out
    v += d.w * .011 * sin(k * 60.) * exp(-abs(k) * 13.) * exp(-age * .9);
  }
  return v;
}
void main(){
  vec2 e = 1.5 / res;
  float hx = h(uv + vec2(e.x, 0.)) - h(uv - vec2(e.x, 0.));
  float hy = h(uv + vec2(0., e.y)) - h(uv - vec2(0., e.y));
  vec2 g = vec2(hx / (2. * e.x), hy / (2. * e.y));
  vec2 q = (uv + g * .03 - .5) * scale + .5;                                       // refraction, cover-fit
  vec3 c = texture2D(tex, clamp(q, .001, .999)).rgb;
  vec3 n = normalize(vec3(-g * 3.5, 1.));
  float s = pow(max(dot(n, normalize(vec3(-.35, .55, 1.))), 0.), 60.);              // glint
  c += s * .45 * vec3(1., .86, .66) + (g.x + g.y) * .06;
  gl_FragColor = vec4(c, 1.);
}`;

export function LakeSurface({ className = "" }: { className?: string }) {
  const cv = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = cv.current!, host = c.parentElement!, video = host.querySelector("video");
    // the words sit above the film, so the whole hero panel listens for the pointer
    const area = host.closest<HTMLElement>(".h-panel") ?? host;
    let alive = true;
    if (!video || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const gl = c.getContext("webgl", { antialias: false, alpha: false, premultipliedAlpha: false });
    if (!gl) return;
    const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const pr = gl.createProgram()!; gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
    const U = (n: string) => gl.getUniformLocation(pr, n);
    const uRes = U("res"), uScale = U("scale"), uT = U("t"), uDrops = U("drops");
    const drops = new Float32Array(N * 4); let di = 0;
    const t0 = performance.now(), now = () => (performance.now() - t0) / 1000;
    let lastDrop = -10, lastPointer = -10, ready = false, seen = true, raf = 0;
    const drop = (x: number, y: number, w: number) => { drops.set([x, y, now(), w], (di++ % N) * 4); lastDrop = now(); kick(); };

    const fit = () => {
      const dpr = Math.min(1.5, devicePixelRatio || 1), W = host.clientWidth, H = host.clientHeight;
      c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); gl.viewport(0, 0, c.width, c.height);
      const ca = W / H, va = (video.videoWidth || 16) / (video.videoHeight || 9);
      gl.uniform2f(uRes, c.width, c.height); gl.uniform2f(uScale, ca > va ? 1 : ca / va, ca > va ? va / ca : 1);
    };
    const draw = () => {
      if (video.readyState >= 2) { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video); if (!ready) { ready = true; fit(); c.style.opacity = "1"; } }
      if (!ready) return;
      gl.uniform1f(uT, now()); gl.uniform4fv(uDrops, drops); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    // on demand: one frame per new film frame, plus a short run while rings are still moving
    const loop = () => { raf = 0; draw(); if (seen && (now() - lastDrop < 4.5 || video.paused)) raf = requestAnimationFrame(loop); };
    function kick() { if (!raf && seen) raf = requestAnimationFrame(loop); }
    const vfc = (video as HTMLVideoElement & { requestVideoFrameCallback?: (cb: () => void) => number }).requestVideoFrameCallback?.bind(video);
    const onFrame = () => { if (!alive) return; if (seen) draw(); vfc?.(onFrame); };
    if (vfc) vfc(onFrame); else video.addEventListener("timeupdate", kick);

    const ro = new ResizeObserver(() => { fit(); kick(); }); ro.observe(host);
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; if (seen) kick(); }, { threshold: 0 }); io.observe(host);
    // the pointer / a finger stirs the water; with nobody touching it, the lake drops a ring by itself
    let lx = -1, ly = -1, lt = 0;
    const move = (e: PointerEvent) => {
      const r = area.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = 1 - (e.clientY - r.top) / r.height, tt = now();
      lastPointer = tt;
      if (tt - lt > 0.07 && Math.hypot(x - lx, y - ly) > 0.015) { drop(x, y, 0.55); lx = x; ly = y; lt = tt; }
    };
    const tap = (e: PointerEvent) => { const r = area.getBoundingClientRect(); drop((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height, 1.4); };
    area.addEventListener("pointermove", move); area.addEventListener("pointerdown", tap);
    const auto = setInterval(() => { if (seen && !document.hidden && now() - lastPointer > 2.5) drop(0.15 + Math.random() * 0.7, 0.15 + Math.random() * 0.7, 0.9); }, 1900);
    return () => { alive = false; clearInterval(auto); cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); area.removeEventListener("pointermove", move); area.removeEventListener("pointerdown", tap); video.removeEventListener("timeupdate", kick); seen = false; };
  }, []);
  return <canvas ref={cv} className={`pointer-events-none absolute inset-0 h-full w-full opacity-0 transition-opacity duration-700 ${className}`} aria-hidden />;
}
