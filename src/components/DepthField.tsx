"use client";
import { useEffect, useRef } from "react";

/* Gold dust drifting towards the viewer (a 2D canvas, no WebGL): points start far in the dark and
   grow and brighten as they come close, the same dust as the opening. It draws only while on screen;
   with reduced motion it shows one still frame. */
export function DepthField({ className = "" }: { className?: string }) {
  const cv = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = cv.current!, x = c.getContext("2d")!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const N = innerWidth < 768 ? 90 : 160;
    const P = Array.from({ length: N }, () => ({ x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2, z: Math.random() }));
    let W = 0, H = 0, raf = 0, seen = false, last = performance.now();
    const fit = () => { const d = Math.min(2, devicePixelRatio || 1); W = c.clientWidth; H = c.clientHeight; c.width = W * d; c.height = H * d; x.setTransform(d, 0, 0, d, 0, 0); };
    const draw = (dt: number) => {
      x.clearRect(0, 0, W, H);
      const f = Math.max(W, H) * 0.42;
      for (const p of P) {
        p.z -= dt * 0.07;
        if (p.z <= 0.04) { p.x = (Math.random() - 0.5) * 2; p.y = (Math.random() - 0.5) * 2; p.z = 1; }
        const sx = W / 2 + (p.x / p.z) * f * 0.5, sy = H / 2 + (p.y / p.z) * f * 0.5;
        if (sx < -10 || sx > W + 10 || sy < -10 || sy > H + 10) continue;
        const k = 1 - p.z, r = 0.4 + k * 2.4;
        x.fillStyle = `rgba(222,178,112,${(0.12 + k * 0.75).toFixed(3)})`;
        x.beginPath(); x.arc(sx, sy, r, 0, Math.PI * 2); x.fill();
      }
    };
    const loop = (now: number) => { draw(Math.min(0.05, (now - last) / 1000)); last = now; raf = seen && !document.hidden ? requestAnimationFrame(loop) : 0; };
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; if (seen && !raf && !reduce) { last = performance.now(); raf = requestAnimationFrame(loop); } });
    const ro = new ResizeObserver(() => { fit(); if (reduce) draw(0); });
    fit(); io.observe(c); ro.observe(c); if (reduce) draw(0);
    return () => { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); };
  }, []);
  return <canvas ref={cv} className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} aria-hidden />;
}
