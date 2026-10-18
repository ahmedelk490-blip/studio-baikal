"use client";
import { useEffect, useRef } from "react";

/* The hero film seen through the surface of the lake (raw WebGL, no library). Rings spread from the
   pointer or a finger, and on their own every couple of seconds, bending the film and catching a soft
   bronze light. It draws only when there is something new to show (a new film frame or a moving ring)
   and only while the hero is on screen; without WebGL or with reduced motion the plain film stays. */
const N = 14;
const VS = `attribute vec2 p; varying vec2 uv; void main(){ uv = p * .5 + .5; gl_Position = vec4(p, 0., 1.); }`;
const FS = `precision highp float;
uniform sampler2D tex; uniform vec2 res, scale; uniform float t, reveal; uniform vec4 drops[${N}]; varying vec2 uv;
// light through moving water (a small turbulence loop): the bright web that plays on a lake floor
float caust(vec2 p, float t){
  vec2 i = p; float c = 1.;
  for (int n = 0; n < 4; n++) {
    float tt = t * (1. - 3.5 / float(n + 1));
    i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
    c += 1. / length(vec2(p.x / (sin(i.x + tt) / .005), p.y / (cos(i.y + tt) / .005)));
  }
  c /= 4.; c = 1.17 - pow(c, 1.4);
  return clamp(pow(abs(c), 8.), 0., 1.);
}
float h(vec2 p){
  vec2 a = vec2(res.x / res.y, 1.);
  float v = .0024 * sin(p.x * 17. + t * 1.1) * sin(p.y * 13. - t * .8);            // the lake breathing
  for (int i = 0; i < ${N}; i++) {
    vec4 d = drops[i]; float age = t - d.z;
    if (age < 0. || age > 4.5 || d.w <= 0.) continue;
    float r = length((p - d.xy) * a), k = r - age * .32;                          // ring front moving out
    v += d.w * .015 * sin(k * 58.) * exp(-abs(k) * 12.) * exp(-age * .85);
  }
  return v;
}
void main(){
  vec2 e = 1.5 / res;
  float hx = h(uv + vec2(e.x, 0.)) - h(uv - vec2(e.x, 0.));
  float hy = h(uv + vec2(0., e.y)) - h(uv - vec2(0., e.y));
  vec2 g = vec2(hx / (2. * e.x), hy / (2. * e.y));
  vec2 q = (uv + g * .04 - .5) * scale + .5;                                       // refraction, cover-fit
  vec3 c = texture2D(tex, clamp(q, .001, .999)).rgb;
  vec3 n = normalize(vec3(-g * 3.5, 1.));
  float s = pow(max(dot(n, normalize(vec3(-.35, .55, 1.))), 0.), 60.);              // glint
  c += s * .28 * vec3(1., .86, .66) * (1. - dot(c, vec3(.3, .59, .11)) * .7) + (g.x + g.y) * .07;
  vec2 a = vec2(res.x / res.y, 1.);
  float lum = dot(c, vec3(.3, .59, .11));
  c += caust((uv + g * .5) * a * 5. + t * .03, t * .35) * (.06 + .14 * lum) * (1. - lum * .75) * vec3(1., .9, .72);
  // the opening: the room surfaces from dark water inside a widening ring with a bronze edge
  float rd = length((uv - .5) * a);
  float m = 1. - smoothstep(reveal - .07, reveal, rd);
  c = mix(vec3(.03, .05, .06), c, m) + exp(-pow((rd - reveal) * 38., 2.)) * .45 * vec3(.85, .64, .36) * step(.001, reveal) * step(reveal, 1.5);
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
    const uRes = U("res"), uScale = U("scale"), uT = U("t"), uDrops = U("drops"), uReveal = U("reveal");
    // the canvas takes over from the plain film (which keeps decoding underneath as the texture source)
    video.style.opacity = "0";
    const drops = new Float32Array(N * 4); let di = 0;
    const t0 = performance.now(), now = () => (performance.now() - t0) / 1000;
    let lastDrop = -10, lastPointer = -10, ready = false, seen = true, raf = 0, born = -1;
    const drop = (x: number, y: number, w: number) => { drops.set([x, y, now(), w], (di++ % N) * 4); lastDrop = now(); kick(); };

    const fit = () => {
      const dpr = Math.min(1.5, devicePixelRatio || 1), W = host.clientWidth, H = host.clientHeight;
      c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); gl.viewport(0, 0, c.width, c.height);
      const ca = W / H, va = (video.videoWidth || 16) / (video.videoHeight || 9);
      gl.uniform2f(uRes, c.width, c.height); gl.uniform2f(uScale, ca > va ? 1 : ca / va, ca > va ? va / ca : 1);
    };
    const draw = () => {
      if (video.readyState >= 2) { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video); if (!ready) { ready = true; fit(); c.style.opacity = "1"; born = now(); drop(0.5, 0.5, 2.2); } }
      if (!ready) return;
      const age = now() - born, e = Math.min(1, age / 2.2);
      gl.uniform1f(uReveal, born < 0 ? 0 : e >= 1 ? 9 : (1 - Math.pow(1 - e, 3)) * 1.4);
      gl.uniform1f(uT, now()); gl.uniform4fv(uDrops, drops); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    // on demand: one frame per new film frame, plus a short run while rings are still moving
    const loop = () => { raf = 0; draw(); if (seen && (now() - lastDrop < 4.5 || video.paused || now() - born < 2.4)) raf = requestAnimationFrame(loop); };
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
    return () => { alive = false; video.style.opacity = ""; clearInterval(auto); cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); area.removeEventListener("pointermove", move); area.removeEventListener("pointerdown", tap); video.removeEventListener("timeupdate", kick); seen = false; };
  }, []);
  return <canvas ref={cv} className={`pointer-events-none absolute inset-0 h-full w-full opacity-0 transition-opacity duration-700 ${className}`} aria-hidden />;
}
