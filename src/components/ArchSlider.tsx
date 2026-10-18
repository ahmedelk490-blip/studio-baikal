"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Img } from "@/data/projects";
import type { Dict } from "@/data/i18n";

/* Project layout A — the arch slider. One room at a time inside the Baikal arch; the next room
   slides in behind a bronze rule, the previous one settles back. Autoplays until touched;
   thumbnails underneath; any photo opens the popup viewer. */
export function ArchSlider({ images, name, t, onOpen }: { images: Img[]; name: string; t: Dict; onOpen: (k: number) => void }) {
  const [k, setK] = useState(0);
  const [prev, setPrev] = useState(0);
  const cur = useRef(0);
  const hold = useRef(0);
  const go = (n: number) => { const i = (n + images.length) % images.length; if (i === cur.current) return; setPrev(cur.current); cur.current = i; setK(i); };
  // plays on its own; a manual step (arrow / thumbnail) only pauses it for 7 s
  const setHold = (_: boolean) => { hold.current = Date.now() + 7000; };
  useEffect(() => { const iv = setInterval(() => { if (Date.now() > hold.current && !document.hidden) go(cur.current + 1); }, 4200); return () => clearInterval(iv); }, [images.length]);
  const u = "text-xs uppercase tracking-[0.16em] rtl:tracking-normal";
  const im = images[k];
  return (
    <div>
      <div className="grid items-end gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className={`${u} text-[var(--bronze)]`}>{t.project.diveLog}</p>
          <p key={k} className="hero-in display mt-2 text-4xl md:text-6xl"><span>{im.room}</span></p>
          <p className={`${u} mt-2 text-[var(--muted)]`} dir="ltr">{k + 1} / {images.length}</p>
          <div className="mt-6 flex gap-3">
            <button onClick={() => { setHold(true); go(k - 1); }} aria-label={t.project.prev} className="grid h-12 w-12 place-items-center rounded-full border border-[var(--ink)]/25">&#8249;</button>
            <button onClick={() => { setHold(true); go(k + 1); }} aria-label={t.project.nextImg} className="grid h-12 w-12 place-items-center rounded-full bg-[var(--ink)] text-[var(--surface)]">&#8250;</button>
          </div>
        </div>
        <div className="lg:col-span-8">
          <button onClick={() => onOpen(k)} aria-label={`${t.project.open} ${im.room} ${t.project.full}`} className="arch relative block aspect-[4/5] w-full overflow-hidden bg-[var(--mist)] sm:aspect-[16/11]">
            <Image src={images[prev].src} alt="" fill sizes="(min-width:1024px) 60vw, 100vw" className="object-cover" />
            <div key={k} className="arch-slide absolute inset-0"><Image src={im.src} alt={`${name}, ${im.room}`} fill sizes="(min-width:1024px) 60vw, 100vw" className="object-cover" /></div>
            <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[var(--bronze)]" />
          </button>
        </div>
      </div>
      <ul className="mt-4 flex gap-2 overflow-x-auto pb-2" role="tablist">
        {images.map((x, i) => (
          <li key={x.src} className="shrink-0"><button role="tab" aria-selected={i === k} aria-label={x.room} onClick={() => { setHold(true); go(i); }} className={`relative block h-14 w-20 overflow-hidden rounded-md transition-opacity ${i === k ? "ring-2 ring-[var(--bronze)]" : "opacity-55 hover:opacity-100"}`}><Image src={x.src} alt="" fill sizes="80px" className="object-cover" /></button></li>
        ))}
      </ul>
    </div>
  );
}