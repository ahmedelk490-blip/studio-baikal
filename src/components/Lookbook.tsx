"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Img } from "@/data/projects";
import type { Dict } from "@/data/i18n";

/* Project layout C, the lookbook: a large sticky stage shows the whole render while the room
   list scrolls beside it; each room you pass takes the stage. */
export function Lookbook({ images, name, t }: { images: Img[]; name: string; t: Dict }) {
  const [k, setK] = useState(0);
  const list = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const els = list.current?.querySelectorAll<HTMLElement>("li") ?? [];
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setK(Number(e.target.getAttribute("data-k"))); }), { rootMargin: "-45% 0px -45% 0px" });
    els.forEach((el) => io.observe(el)); return () => io.disconnect();
  }, []);
  const u = "text-xs uppercase tracking-[0.16em] rtl:tracking-normal";
  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="hidden lg:col-span-8 lg:block">
        <div className="sticky top-24 h-[78vh] bg-[var(--mist)]">
          {images.map((im, j) => <Image key={im.src} src={im.src} alt={`${name}, ${im.room}`} fill sizes="66vw" className={`object-contain p-4 transition-[opacity,transform] duration-700 ${j === k ? "scale-100 opacity-100" : "scale-[1.03] opacity-0"}`} />)}
        </div>
      </div>
      <ol ref={list} className="lg:col-span-4">
        {images.map((im, j) => (
          <li key={im.src} data-k={j} className="flex flex-col justify-center border-t border-[var(--ink)]/15 py-6 lg:min-h-[62vh]">
            <p className={`${u} text-[var(--bronze)]`} dir="ltr">{j + 1} / {images.length}</p>
            <p className={`display mt-2 text-3xl transition-colors md:text-4xl ${j === k ? "text-[var(--ink)]" : "text-[var(--ink)]/35"}`}>{im.room}</p>
            <Image src={im.src} alt={`${name}, ${im.room}`} width={im.w} height={im.h} sizes="100vw" className="mt-4 h-auto w-full lg:hidden" />
          </li>
        ))}
      </ol>
    </div>
  );
}