"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/* First visit only: gold dust drifts in from the whole screen and gathers into the Baikal mark; the
   mark then settles on its cream tile, the dust fades into it, and the curtain lifts (CSS). */
export function Preloader({ label }: { label: string }) {
  const [gone, setGone] = useState(false);
  const [lit, setLit] = useState(false);
  const [lift, setLift] = useState(false);
  const cv = useRef<HTMLCanvasElement>(null);
  // decided once per mount, so a re-run of the effect (React dev double-invoke) keeps the first answer
  const first = useRef<boolean | null>(null);
  useEffect(() => {
    if (first.current === null) {
      let seen = false;
      try { seen = sessionStorage.getItem("bk-intro") === "1"; sessionStorage.setItem("bk-intro", "1"); } catch {}
      first.current = seen;
    }
    if (first.current) { setGone(true); return; }
    // timeline from this moment: dust gathers 0-1.35s, the tile lights at 1.25s, the curtain lifts at 2.0s
    const litT = setTimeout(() => setLit(true), 1250);
    // the hero film restarts as the curtain lifts, so its first lit room is not spent behind the loader
    const liftT = setTimeout(() => { setLift(true); const v = document.querySelector<HTMLVideoElement>("main section video"); if (v) { v.currentTime = 0; v.play().catch(() => {}); } }, 2000);
    const done = setTimeout(() => setGone(true), 2950);
    let raf = 0;
    const born = performance.now(); // one clock with the CSS curtain, even if the mark loads late
    const c = cv.current!, x = c.getContext("2d")!, dpr = Math.min(2, devicePixelRatio || 1);
    const W = innerWidth, H = innerHeight; c.width = W * dpr; c.height = H * dpr; x.scale(dpr, dpr);
    // the tile is S px with a 6px cream border (globals.css), so the mark itself is S-12 inside it
    const S = W < 768 ? 120 : 160, max = W < 768 ? 650 : 1300;
    const img = new window.Image(); img.src = "/brand/logo.png";
    img.onload = () => {
      // targets: the mark's drawn pixels, sampled on a small grid and thinned to a budget
      const o = document.createElement("canvas"); o.width = o.height = S; const ox = o.getContext("2d", { willReadFrequently: true })!;
      ox.drawImage(img, 6, 6, S - 12, S - 12); const d = ox.getImageData(0, 0, S, S).data, pts: [number, number][] = [];
      for (let yy = 0; yy < S; yy += 2) for (let xx = 0; xx < S; xx += 2) if (d[(yy * S + xx) * 4 + 3] > 120) pts.push([xx, yy]);
      for (let i = pts.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [pts[i], pts[j]] = [pts[j], pts[i]]; }
      const mark = c.parentElement!.querySelector("img")!.getBoundingClientRect();
      const cx = mark.left + mark.width / 2 - S / 2, cy = mark.top + mark.height / 2 - S / 2;
      const P = pts.slice(0, max).map(([tx, ty]) => {
        const a = Math.random() * Math.PI * 2, r = Math.max(W, H) * (0.45 + Math.random() * 0.4);
        return { sx: W / 2 + Math.cos(a) * r, sy: H / 2 + Math.sin(a) * r, tx: cx + tx, ty: cy + ty, dl: Math.random() * 0.35, sw: (Math.random() - 0.5) * 120, s: (W < 768 ? 1.3 : 0.9) + Math.random() * 1.1 };
      });
      const draw = (now: number) => {
        const t = (now - born) / 1000;
        x.clearRect(0, 0, W, H); x.globalCompositeOperation = "lighter";
        const fade = Math.max(0, 1 - Math.max(0, t - 1.3) / 0.5);
        for (const q of P) {
          const k = Math.min(1, Math.max(0, (t - q.dl) / 1.0)), e = 1 - Math.pow(1 - k, 3);
          const px = q.sx + (q.tx - q.sx) * e + Math.sin(e * Math.PI) * q.sw, py = q.sy + (q.ty - q.sy) * e + Math.cos(e * Math.PI) * q.sw * 0.4;
          x.fillStyle = `rgba(222,178,112,${(0.25 + 0.75 * e) * fade})`; x.fillRect(px, py, q.s, q.s);
        }
        if (t < 2) raf = requestAnimationFrame(draw);
      };
      raf = requestAnimationFrame(draw);
    };
    return () => { clearTimeout(done); clearTimeout(litT); clearTimeout(liftT); cancelAnimationFrame(raf); };
  }, []);
  if (gone) return null;
  return (
    <div className={`preloader${lift ? " lift" : ""}`} aria-hidden>
      <canvas ref={cv} className="absolute inset-0 h-full w-full" />
      <div className="preloader-mark relative text-[var(--surface)]">
        <Image src="/brand/logo.png" alt="" width={160} height={160} priority className={`h-[120px] w-[120px] transition-[opacity,transform] duration-700 ease-out md:h-[160px] md:w-[160px] ${lit ? "scale-100 opacity-100" : "scale-95 opacity-0"}`} />
        <p className={`mt-5 text-xs uppercase tracking-[0.3em] rtl:tracking-normal transition-opacity duration-700 ${lit ? "opacity-70" : "opacity-0"}`}>{label}</p>
      </div>
    </div>
  );
}
