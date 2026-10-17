"use client";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Img } from "@/data/projects";
import type { Dict } from "@/data/i18n";

/* Dive log: a sticky index names the room you are looking at; the photos scroll beside it. */
export function Gallery({ images, name, t }: { images: Img[]; name: string; t: Dict }) {
  const p = t.project;
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
  const u = "text-xs uppercase tracking-[0.14em] rtl:tracking-normal";
  return (
    <div className="grid gap-8 md:grid-cols-12">
      <div className="md:col-span-3">
        <div className="md:sticky md:top-28">
          <p className={`${u} text-[var(--bronze)]`}>{p.diveLog}</p>
          <p className="display mt-3 text-4xl md:text-6xl">{images[cur]?.room}</p>
          <p className={`${u} mt-2 text-[var(--muted)]`}>{cur + 1} {p.of} {images.length} {p.rooms}</p>
          <ol className="mt-8 hidden border-t border-current/15 md:block">
            {images.map((im, k) => <li key={im.src} className={`${u} border-b border-current/15 py-2 transition-opacity ${k === cur ? "opacity-100" : "opacity-40"}`}>{im.room}</li>)}
          </ol>
        </div>
      </div>
      <ul ref={list} className="grid gap-10 md:col-span-9">
        {images.map((im, k) => (
          <li key={im.src} data-k={k}>
            <button onClick={() => setOpen(k)} className="block w-full" aria-label={`${p.open} ${im.room} ${p.full}`}>
              <Image src={im.src} alt={`${name}, ${im.room}`} width={im.w} height={im.h} sizes="(min-width:768px) 75vw, 100vw" className="mx-auto h-auto max-h-[90vh] w-auto max-w-full" />
            </button>
            <p className={`${u} mt-2 text-[var(--muted)]`}>{im.room}</p>
          </li>
        ))}
      </ul>
      {open !== null && (
        <div role="dialog" aria-modal aria-label={`${name} ${p.gallery}`} className="fixed inset-0 z-[80] grid place-items-center bg-[var(--deeper)]/95 p-4" onClick={() => setOpen(null)}>
          <div className="relative h-[86vh] w-full max-w-[96vw]" onClick={(e) => e.stopPropagation()}>
            <Image src={images[open].src} alt={`${name}, ${images[open].room}`} fill sizes="100vw" className="object-contain" priority />
          </div>
          <p className={`${u} absolute bottom-6 left-1/2 -translate-x-1/2 text-[var(--surface)]/80`}>{images[open].room} · {open + 1} / {images.length}</p>
          <button onClick={(e) => { e.stopPropagation(); step(-1); }} aria-label={p.prev} className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center bg-[var(--surface)]/10 text-[var(--surface)]">&#8249;</button>
          <button onClick={(e) => { e.stopPropagation(); step(1); }} aria-label={p.nextImg} className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center bg-[var(--surface)]/10 text-[var(--surface)]">&#8250;</button>
          <button onClick={() => setOpen(null)} aria-label={p.close} className="absolute right-4 top-4 grid h-12 w-12 place-items-center bg-[var(--surface)]/10 text-xl text-[var(--surface)]">&#215;</button>
        </div>
      )}
    </div>
  );
}