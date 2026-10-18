"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/* A framed room that changes by itself while it is on screen: each new room opens through the next
   shape reveal (arch, circle, diamond, wipe, split) over the last one. Give the frame its shape with
   className (rounded-t-full = Baikal arch, rounded-full = circle). Swapping `imgs` reveals the new set. */
export function ShapeCycle({ imgs, className = "", sizes = "50vw", every = 3600 }: { imgs: string[]; className?: string; sizes?: string; every?: number }) {
  const box = useRef<HTMLDivElement>(null);
  const [s, set] = useState({ top: imgs[0], under: imgs[0], n: 0 });
  const i = useRef(0);
  const seen = useRef(false);
  const step = (src: string) => set((p) => (p.top === src ? p : { top: src, under: p.top, n: p.n + 1 }));
  const key = imgs.join("|");
  useEffect(() => { i.current = 0; step(imgs[0]); }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const el = box.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { seen.current = e.isIntersecting; }, { threshold: 0.2 });
    io.observe(el);
    const iv = setInterval(() => { if (!seen.current || document.hidden) return; i.current = (i.current + 1) % imgs.length; step(imgs[i.current]); }, every);
    return () => { clearInterval(iv); io.disconnect(); };
  }, [key, every]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div ref={box} className={`relative overflow-hidden bg-[var(--deep)] ${className}`}>
      <Image src={s.under} alt="" fill sizes={sizes} className="object-cover" />
      <div key={s.n} className={`rv rv-${s.n % 5} absolute inset-0`}><Image src={s.top} alt="" fill sizes={sizes} className="ken object-cover" /></div>
    </div>
  );
}
