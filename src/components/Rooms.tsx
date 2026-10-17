"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import type { Dict } from "@/data/i18n";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";

const srcs = ["/projects/tagamo3-115/04.webp", "/projects/october-250/05.webp", "/projects/hadayek-el-ahram-200/03.webp", "/projects/mountain-view-zayed-80/03.webp", "/projects/mountain-view-zayed-80/05.webp"];

/* 300 m: the page stops on this section and the wheel walks through all five rooms; each new room
   opens through a growing circle over the last one. Hover jumps to a room. */
export function Rooms({ t }: { t: Dict }) {
  const scenes = t.rooms.scenes;
  const [a, setA] = useState(0);
  const [prev, setPrev] = useState(0);
  const cur = useRef(0);
  const sec = useRef<HTMLElement>(null);
  const go = (k: number) => { if (k === cur.current) return; setPrev(cur.current); cur.current = k; setA(k); };
  useGSAP(() => {
    ScrollTrigger.create({ trigger: sec.current, start: "top top", end: "+=" + scenes.length * 55 + "%", pin: true, anticipatePin: 1,
      onUpdate: (st) => go(Math.min(scenes.length - 1, Math.floor(st.progress * scenes.length))) });
  }, { scope: sec });
  return (
    <section ref={sec} id="rooms" data-depth={t.gauge.rooms} data-meters="300 m" data-deep="1" className="relative h-[100svh] overflow-hidden bg-[var(--deeper)] text-[var(--surface)]">
      <div className="grid h-full grid-rows-[42svh_1fr] lg:grid-cols-12 lg:grid-rows-1">
        <div className="relative lg:order-2 lg:col-span-8">
          <Image src={srcs[prev]} alt="" fill sizes="(min-width:1024px) 66vw, 100vw" className="object-cover" />
          <div key={a} className="circle-in absolute inset-0"><Image src={srcs[a]} alt={scenes[a][0]} fill sizes="(min-width:1024px) 66vw, 100vw" className="ken object-cover" /></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--deeper)]/60 to-transparent lg:bg-gradient-to-r rtl:lg:bg-gradient-to-l" />
        </div>
        <div className="flex flex-col justify-center px-5 py-5 md:px-10 lg:order-1 lg:col-span-4 lg:py-10">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.2em] rtl:tracking-normal text-[var(--bronze)]">{t.rooms.eyebrow}</p>
            <p className="text-xs text-[var(--surface)]/60" dir="ltr">{a + 1} / {scenes.length}</p>
          </div>
          <ol className="mt-3">
            {scenes.map(([room, line], k) => (
              <li key={room} className="border-t border-[var(--surface)]/15">
                <button onMouseEnter={() => go(k)} onClick={() => go(k)} aria-current={a === k} className={`block w-full py-2 text-start transition-colors duration-500 md:py-2.5 ${a === k ? "text-[var(--surface)]" : "text-[var(--surface)]/35"}`}>
                  <span className="display block text-2xl md:text-3xl">{room}</span>
                  <span className={`grid transition-[grid-template-rows] duration-500 ${a === k ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}><span className="overflow-hidden"><span className="block max-w-sm pt-1 text-sm text-[var(--surface)]/75">{line}</span></span></span>
                </button>
              </li>
            ))}
          </ol>
          <div className="mt-4 h-px bg-[var(--surface)]/15"><div className="h-px bg-[var(--bronze)] transition-[width] duration-500" style={{ width: `${((a + 1) / scenes.length) * 100}%` }} /></div>
        </div>
      </div>
    </section>
  );
}