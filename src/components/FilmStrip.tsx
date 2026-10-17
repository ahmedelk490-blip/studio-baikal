"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Img } from "@/data/projects";
import type { Dict } from "@/data/i18n";

/* Project layout B, the film strip: rooms side by side at full height and natural ratio,
   advancing by themselves until the visitor takes over (arrows, swipe, trackpad). */
export function FilmStrip({ images, name, t }: { images: Img[]; name: string; t: Dict }) {
  const box = useRef<HTMLDivElement>(null);
  const cur = useRef(0);
  const [k, setK] = useState(0);
  const [hold, setHold] = useState(false);
  const go = (n: number) => {
    const el = box.current; if (!el) return;
    const i = (n + images.length) % images.length;
    const c = el.children[i] as HTMLElement;
    el.scrollTo({ left: c.offsetLeft - el.offsetLeft, behavior: "smooth" });
    cur.current = i; setK(i);
  };
  useEffect(() => {
    if (hold) return;
    let seen = false;
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; }, { threshold: 0.4 });
    if (box.current) io.observe(box.current);
    const iv = setInterval(() => { if (seen) go(cur.current + 1); }, 3800);
    return () => { clearInterval(iv); io.disconnect(); };
  }, [hold]);
  const onScroll = () => {
    const el = box.current; if (!el) return;
    let best = 0, d = Infinity;
    Array.from(el.children).forEach((c, i) => { const x = Math.abs((c as HTMLElement).offsetLeft - el.offsetLeft - el.scrollLeft); if (x < d) { d = x; best = i; } });
    cur.current = best; setK(best);
  };
  const u = "text-xs uppercase tracking-[0.16em] rtl:tracking-normal";
  return (
    <div>
      <div className="flex items-end justify-between gap-6">
        <div><p className={`${u} text-[var(--bronze)]`}>{t.project.diveLog}</p><p className="display mt-2 text-4xl md:text-6xl">{images[k]?.room}</p></div>
        <div className="flex items-center gap-3">
          <span className={`${u} text-[var(--muted)]`} dir="ltr">{k + 1} / {images.length}</span>
          <button onClick={() => { setHold(true); go(k - 1); }} aria-label={t.project.prev} className="grid h-12 w-12 place-items-center rounded-full border border-[var(--ink)]/25">&#8249;</button>
          <button onClick={() => { setHold(true); go(k + 1); }} aria-label={t.project.nextImg} className="grid h-12 w-12 place-items-center rounded-full bg-[var(--ink)] text-[var(--surface)]">&#8250;</button>
        </div>
      </div>
      <div className="mt-4 h-px bg-[var(--ink)]/15"><div className="h-px bg-[var(--bronze)] transition-[width] duration-700" style={{ width: `${((k + 1) / images.length) * 100}%` }} /></div>
      <div ref={box} dir="ltr" onScroll={onScroll} onPointerDown={() => setHold(true)} onWheel={() => setHold(true)} className="relative mt-8 flex snap-x snap-mandatory items-start gap-5 overflow-x-auto pb-4">
        {images.map((im) => (
          <figure key={im.src} className="shrink-0 snap-start">
            <Image src={im.src} alt={`${name}, ${im.room}`} width={im.w} height={im.h} sizes="(min-width:768px) 80vw, 90vw" className="h-auto max-h-[74vh] w-auto max-w-[86vw]" />
            <figcaption className={`${u} mt-3 text-[var(--muted)]`}>{im.room}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}