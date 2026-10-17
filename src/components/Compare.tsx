"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";

/* Drawing vs finished: the line sweeps on its own until the visitor drags it (range input on top). */
export function Compare({ src, a, b }: { src: string; a: string; b: string }) {
  const box = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const set = (v: number) => box.current?.style.setProperty("--x", `${v}%`);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0; const t0 = performance.now();
    const loop = (t: number) => { if (touched.current) return; set(50 + 32 * Math.sin((t - t0) / 1500)); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div ref={box} dir="ltr" className="cmp relative aspect-[16/9] w-full overflow-hidden" style={{ ["--x" as string]: "50%" }}>
      <Image src={src} alt={b} fill sizes="100vw" className="object-cover" />
      <div className="cmp-top absolute inset-0"><Image src={src} alt={a} fill sizes="100vw" className="cmp-draw object-cover" /><div className="cmp-grid absolute inset-0" /></div>
      <div className="cmp-line absolute inset-y-0"><span className="cmp-knob">&#8596;</span></div>
      <span className="cmp-tag start-4">{a}</span><span className="cmp-tag end-4">{b}</span>
      <input type="range" min={0} max={100} defaultValue={50} aria-label={`${a} / ${b}`} onPointerDown={() => { touched.current = true; }} onInput={(e) => { touched.current = true; set(Number(e.currentTarget.value)); }} className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0" />
    </div>
  );
}