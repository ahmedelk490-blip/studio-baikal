"use client";
import { useEffect, useRef, useState } from "react";

const N = 72; // one full turn, rendered in Blender (scripts/hero-render/house.py)

/* The house: a Baikal villa as an architect's model (travertine, walnut slats, the arched door, a pool),
   path-traced offline and played here as a 360 turn on a transparent ground, so it stands on the page
   with its own shadow. It turns slowly by itself; drag it left or right to turn it by hand, let go and it
   coasts to a stop, then carries on by itself. */
export function HouseTurn({ hint, className = "" }: { hint: string; className?: string }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const c = cv.current!, ctx = c.getContext("2d")!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const imgs: (HTMLImageElement | null)[] = Array(N).fill(null);
    let pos = 0, vel = 0, drag: number | null = null, shown = -1, visible = false, raf = 0, last = 0, dead = false;
    const nearest = (i: number) => { for (let d = 0; d < N; d++) { const a = (i - d + N) % N, b = (i + d) % N; if (imgs[a]) return a; if (imgs[b]) return b; } return -1; };
    const draw = (force = false) => {
      const k = nearest(((Math.round(pos) % N) + N) % N); if (k < 0 || (k === shown && !force)) return;
      const im = imgs[k]!, W = c.width, H = c.height, s = Math.min(W / im.naturalWidth, H / im.naturalHeight);
      ctx.clearRect(0, 0, W, H); ctx.drawImage(im, (W - im.naturalWidth * s) / 2, (H - im.naturalHeight * s) / 2, im.naturalWidth * s, im.naturalHeight * s); shown = k;
    };
    const tick = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0; last = now;
      if (drag === null) {
        if (Math.abs(vel) > 0.02) { pos += vel; vel *= 0.92; } else if (!reduce) pos += dt * 3; // three frames a second: one turn in 24 s
      }
      draw();
      raf = visible ? requestAnimationFrame(tick) : 0;
    };
    const wake = () => { if (!raf && visible) { last = 0; raf = requestAnimationFrame(tick); } };
    const fit = () => { const d = Math.min(2, devicePixelRatio || 1); c.width = c.clientWidth * d; c.height = c.clientHeight * d; draw(true); };
    c.style.touchAction = "pan-y";
    c.onpointerdown = (e) => { drag = e.clientX; vel = 0; c.setPointerCapture(e.pointerId); c.style.cursor = "grabbing"; wake(); };
    c.onpointermove = (e) => { if (drag === null) return; const d = ((e.clientX - drag) / c.clientWidth) * N * 0.9; pos -= d; vel = -d; drag = e.clientX; };
    c.onpointerup = c.onpointercancel = () => { drag = null; c.style.cursor = "grab"; wake(); };
    // loads only when the house comes near; every sixth view first, so it turns at once, the rest fill in after
    let started = false;
    const start = () => { if (started) return; started = true; fetch("/house-frames/manifest.json").then((r) => r.json()).catch(() => ({})).then((m: { house?: number }) => {
      if (dead || !m.house) return;
      const order = [...Array(N).keys()].sort((a, b) => (a % 6 ? 1 : 0) - (b % 6 ? 1 : 0) || a - b);
      let next = 0;
      const pump = () => {
        if (dead || next >= order.length) return;
        const i = order[next++], im = new window.Image(); im.decoding = "async";
        im.onload = () => { if (dead) return; imgs[i] = im; if (i === 0) { setReady(true); draw(true); } pump(); };
        im.onerror = () => pump();
        im.src = `/house-frames/${String(i + 1).padStart(4, "0")}.webp`;
      };
      for (let k = 0; k < 4; k++) pump();
    }); };
    const near = new IntersectionObserver(([e]) => { if (e.isIntersecting) { start(); near.disconnect(); } }, { rootMargin: "800px 0px" });
    near.observe(c);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting && !document.hidden; wake(); }, { rootMargin: "100px" });
    io.observe(c);
    const ro = new ResizeObserver(fit); ro.observe(c); fit();
    return () => { dead = true; cancelAnimationFrame(raf); near.disconnect(); io.disconnect(); ro.disconnect(); };
  }, []);
  return (
    <figure className={`relative ${className}`}>
      <canvas ref={cv} className={`block h-full w-full cursor-grab select-none transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`} aria-hidden />
      <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 text-xs text-[var(--ink)]/55">
        <span aria-hidden>←</span>{hint}<span aria-hidden>→</span>
      </figcaption>
    </figure>
  );
}
