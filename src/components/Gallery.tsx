"use client";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Img } from "@/data/projects";

/* Dive log: a sticky index on the left names the room you are looking at; the photos scroll on the right. */
export function Gallery({ images, name }: { images: Img[]; name: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const [cur, setCur] = useState(0);
  const list = useRef<HTMLUListElement>(null);
  const step = useCallback((d: number) => setOpen((o) => (o === null ? o : (o + d + images.length) % images.length)), [images.length]);
  useEffect(() => {
    const els = list.current?.querySelectorAll<HTMLElement>("li") ?? [];
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setCur(Number(e.target.getAttribute("data-k"))); }), { rootMargin: "-45% 0px -45% 0px" });
    els.forEach((el) => io.observe(el)); return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (open === null) return;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1); };
    addEventListener("keydown", key); document.body.style.overflow = "hidden";
    return () => { removeEventListener("keydown", key); document.body.style.overflow = ""; };
  }, [open, step]);
  return (
    <div className="grid gap-8 md:grid-cols-12">
      <div className="md:col-span-4">
        <div className="md:sticky md:top-28">
          <p className="text-xs uppercase tracking-[0.2em] rtl:tracking-normal text-[var(--bronze)]">Dive log</p>
          <p className="display mt-3 text-4xl md:text-6xl">{images[cur]?.room}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.16em] rtl:tracking-normal text-[var(--muted)]">{cur + 1} of {images.length} rooms</p>
          <ol className="mt-8 hidden border-t border-current/15 md:block">
            {images.map((im, k) => <li key={im.src} className={`border-b border-current/15 py-2 text-xs uppercase tracking-[0.14em] rtl:tracking-normal transition-opacity ${k === cur ? "opacity-100" : "opacity-40"}`}>{im.room}</li>)}
          </ol>
        </div>
      </div>
      <ul ref={list} className="grid gap-6 md:col-span-8">
        {images.map((im, k) => (
          <li key={im.src} data-k={k}>
            <button onClick={() => setOpen(k)} className={`relative block w-full overflow-hidden ${k % 3 === 1 ? "aspect-[4/3] md:ml-auto md:w-4/5" : "aspect-[16/10]"}`} aria-label={`Open ${im.room} full screen`}>
              <Image src={im.src} alt={`${name}, ${im.room}`} fill sizes="(min-width:768px) 60vw, 100vw" className="object-cover transition-transform duration-700 hover:scale-[1.03]" />
            </button>
            <p className="mt-2 text-xs uppercase tracking-[0.14em] rtl:tracking-normal text-[var(--muted)]">{im.room}</p>
          </li>
        ))}
      </ul>
      {open !== null && (
        <div role="dialog" aria-modal aria-label={`${name} gallery`} className="fixed inset-0 z-[80] grid place-items-center bg-[var(--deeper)]/95 p-4" onClick={() => setOpen(null)}>
          <div className="relative aspect-[16/9] w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
            <Image src={images[open].src} alt={`${name}, ${images[open].room}`} fill sizes="100vw" className="object-contain" priority />
          </div>
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.16em] rtl:tracking-normal text-[var(--surface)]/80">{images[open].room} · {open + 1} / {images.length}</p>
          <button onClick={(e) => { e.stopPropagation(); step(-1); }} aria-label="Previous" className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center bg-[var(--surface)]/10 text-[var(--surface)]">&#8249;</button>
          <button onClick={(e) => { e.stopPropagation(); step(1); }} aria-label="Next" className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center bg-[var(--surface)]/10 text-[var(--surface)]">&#8250;</button>
          <button onClick={() => setOpen(null)} aria-label="Close" className="absolute right-4 top-4 grid h-12 w-12 place-items-center bg-[var(--surface)]/10 text-xl text-[var(--surface)]">&#215;</button>
        </div>
      )}
    </div>
  );
}