"use client";
import Image from "next/image";
import { useCallback, useEffect } from "react";
import type { Img } from "@/data/projects";
import type { Dict } from "@/data/i18n";

/* Popup viewer shared by every project layout: full-screen photo at its real ratio, room name,
   counter, arrows, keyboard, click outside to close. */
export function Popup({ images, name, t, open, setOpen }: { images: Img[]; name: string; t: Dict; open: number | null; setOpen: (k: number | null) => void }) {
  const p = t.project;
  const step = useCallback((d: number) => { if (open === null) return; setOpen((open + d + images.length) % images.length); }, [open, images.length, setOpen]);
  useEffect(() => {
    if (open === null) return;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1); };
    addEventListener("keydown", key); document.body.style.overflow = "hidden";
    return () => { removeEventListener("keydown", key); document.body.style.overflow = ""; };
  }, [open, step, setOpen]);
  if (open === null) return null;
  const im = images[open];
  const u = "text-xs uppercase tracking-[0.16em] rtl:tracking-normal";
  return (
    <div role="dialog" aria-modal aria-label={`${name} ${p.gallery}`} className="popup fixed inset-0 z-[80] grid place-items-center bg-[var(--deeper)]/95 p-4" onClick={() => setOpen(null)}>
      <figure key={open} className="popup-img relative max-h-[86vh] max-w-[96vw]" onClick={(e) => e.stopPropagation()}>
        <Image src={im.src} alt={`${name}, ${im.room}`} width={im.w} height={im.h} sizes="96vw" priority className="h-auto max-h-[86vh] w-auto max-w-[96vw]" />
        <figcaption className={`${u} absolute bottom-3 start-3 rounded-full bg-[var(--deep)]/70 px-3 py-1.5 text-[var(--surface)]`}>{im.room} · <span dir="ltr">{open + 1} / {images.length}</span></figcaption>
      </figure>
      <button onClick={(e) => { e.stopPropagation(); step(-1); }} aria-label={p.prev} className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-[var(--surface)]/10 text-[var(--surface)]">&#8249;</button>
      <button onClick={(e) => { e.stopPropagation(); step(1); }} aria-label={p.nextImg} className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-[var(--surface)]/10 text-[var(--surface)]">&#8250;</button>
      <button onClick={() => setOpen(null)} aria-label={p.close} className="absolute right-4 top-4 grid h-12 w-12 place-items-center rounded-full bg-[var(--surface)]/10 text-xl text-[var(--surface)]">&#215;</button>
    </div>
  );
}