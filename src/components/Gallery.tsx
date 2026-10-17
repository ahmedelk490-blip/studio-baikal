"use client";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { Img } from "@/data/projects";
import type { Dict } from "@/data/i18n";

/* Justified mosaic: rows are filled until their aspect sum reaches ~1.7, so a 16:9 render spans the
   width alone and portraits sit two or three side by side. Every photo keeps its exact ratio (no crop). */
function rowsOf(images: Img[], target = 1.7) {
  const rows: number[][] = []; let cur: number[] = [], sum = 0;
  images.forEach((im, i) => { cur.push(i); sum += im.w / im.h; if (sum >= target) { rows.push(cur); cur = []; sum = 0; } });
  if (cur.length) { if (rows.length && sum < target * 0.6) rows[rows.length - 1].push(...cur); else rows.push(cur); }
  return rows;
}

export function Gallery({ images, name, t }: { images: Img[]; name: string; t: Dict }) {
  const p = t.project;
  const [open, setOpen] = useState<number | null>(null);
  const step = useCallback((d: number) => setOpen((o) => (o === null ? o : (o + d + images.length) % images.length)), [images.length]);
  useEffect(() => {
    if (open === null) return;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1); };
    addEventListener("keydown", key); document.body.style.overflow = "hidden";
    return () => { removeEventListener("keydown", key); document.body.style.overflow = ""; };
  }, [open, step]);
  const rooms = [...new Set(images.map((i) => i.room))];
  const u = "text-xs uppercase tracking-[0.14em] rtl:tracking-normal";
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div><p className={`${u} text-[var(--bronze)]`}>{p.diveLog}</p><h2 className="display mt-2 text-4xl md:text-6xl">{rooms.length} {p.rooms}</h2></div>
        <ul className="flex max-w-2xl flex-wrap gap-2">{rooms.map((r) => <li key={r} className="rounded-full border border-[var(--ink)]/15 px-3 py-1.5 text-xs">{r}</li>)}</ul>
      </div>
      <div className="mt-10 grid gap-3 md:gap-4">
        {rowsOf(images).map((r, ri) => (
          <div key={ri} className="flex flex-col gap-3 md:flex-row md:gap-4">
            {r.map((i) => {
              const im = images[i];
              return (
                <figure key={im.src} className="group relative overflow-hidden bg-[var(--mist)] md:min-w-0 md:[flex:var(--ar)_1_0%]" style={{ ["--ar" as string]: im.w / im.h }}>
                  <button onClick={() => setOpen(i)} className="relative block w-full" style={{ aspectRatio: `${im.w} / ${im.h}` }} aria-label={`${p.open} ${im.room} ${p.full}`}>
                    <Image src={im.src} alt={`${name}, ${im.room}`} fill sizes="(min-width:768px) 60vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
                  </button>
                  <figcaption className={`${u} pointer-events-none absolute bottom-3 start-3 rounded-full bg-[var(--deep)]/70 px-3 py-1.5 text-[var(--surface)] transition-opacity md:opacity-0 md:group-hover:opacity-100`}>{im.room}</figcaption>
                </figure>
              );
            })}
          </div>
        ))}
      </div>
      {open !== null && (
        <div role="dialog" aria-modal aria-label={`${name} ${p.gallery}`} className="fixed inset-0 z-[80] grid place-items-center bg-[var(--deeper)]/95 p-4" onClick={() => setOpen(null)}>
          <div className="relative h-[86vh] w-full max-w-[96vw]" onClick={(e) => e.stopPropagation()}>
            <Image src={images[open].src} alt={`${name}, ${images[open].room}`} fill sizes="100vw" className="object-contain" priority />
          </div>
          <p className={`${u} absolute bottom-6 left-1/2 -translate-x-1/2 text-[var(--surface)]/80`}>{images[open].room} · {open + 1} / {images.length}</p>
          <button onClick={(e) => { e.stopPropagation(); step(-1); }} aria-label={p.prev} className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-[var(--surface)]/10 text-[var(--surface)]">&#8249;</button>
          <button onClick={(e) => { e.stopPropagation(); step(1); }} aria-label={p.nextImg} className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-[var(--surface)]/10 text-[var(--surface)]">&#8250;</button>
          <button onClick={() => setOpen(null)} aria-label={p.close} className="absolute right-4 top-4 grid h-12 w-12 place-items-center rounded-full bg-[var(--surface)]/10 text-xl text-[var(--surface)]">&#215;</button>
        </div>
      )}
    </div>
  );
}