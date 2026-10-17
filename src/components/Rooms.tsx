"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Dict } from "@/data/i18n";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";

const srcs = ["/projects/tagamo3-115/04.webp", "/projects/october-250/05.webp", "/projects/hadayek-el-ahram-200/03.webp", "/projects/mountain-view-zayed-80/03.webp", "/projects/mountain-view-zayed-80/05.webp"];
const EVERY = 4200;

/* 300 m: a room stage that plays by itself. Each new room opens through a growing circle
   (the porthole again) over the last one; the index beside it runs a timer. */
export function Rooms({ t }: { t: Dict }) {
  const scenes = t.rooms.scenes;
  const [a, setA] = useState(0);
  const [prev, setPrev] = useState(0);
  const [hold, setHold] = useState(false);
  const cur = useRef(0);
  const go = (k: number) => { if (k === cur.current) return; setPrev(cur.current); cur.current = k; setA(k); };
  const sec = useRef<HTMLElement>(null);
  useGSAP(() => { ScrollTrigger.create({ trigger: sec.current, start: "top 60%", end: "bottom 40%", onUpdate: (st) => go(Math.min(scenes.length - 1, Math.floor(st.progress * scenes.length))) }); }, { scope: sec });
  useEffect(() => { if (hold) return; const x = setInterval(() => go((cur.current + 1) % scenes.length), EVERY); return () => clearInterval(x); }, [hold, scenes.length]);
  return (
    <section ref={sec} id="rooms" data-depth={t.gauge.rooms} data-meters="300 m" data-deep="1" className="relative overflow-hidden bg-[var(--deeper)] text-[var(--surface)]" onMouseLeave={() => setHold(false)}>
      <div className="grid lg:min-h-[100svh] lg:grid-cols-12">
        <div className="relative aspect-[16/10] lg:order-2 lg:col-span-8 lg:aspect-auto">
          <Image src={srcs[prev]} alt="" fill sizes="(min-width:1024px) 66vw, 100vw" className="object-cover" />
          <div key={a} className="circle-in absolute inset-0"><Image src={srcs[a]} alt={scenes[a][0]} fill sizes="(min-width:1024px) 66vw, 100vw" className="ken object-cover" /></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--deeper)]/60 to-transparent lg:bg-gradient-to-r rtl:lg:bg-gradient-to-l" />
        </div>
        <div className="flex flex-col justify-center px-5 py-16 md:px-10 lg:order-1 lg:col-span-4">
          <p className="text-xs uppercase tracking-[0.2em] rtl:tracking-normal text-[var(--bronze)]">{t.rooms.eyebrow}</p>
          <ol className="mt-6">
            {scenes.map(([room, line], k) => (
              <li key={room} className="border-t border-[var(--surface)]/15">
                <button onMouseEnter={() => { go(k); setHold(true); }} onClick={() => { go(k); setHold(true); }} aria-current={a === k} className={`block w-full py-4 text-start transition-colors duration-500 ${a === k ? "text-[var(--surface)]" : "text-[var(--surface)]/35"}`}>
                  <span className="display block text-3xl md:text-4xl">{room}</span>
                  <span className={`grid transition-[grid-template-rows] duration-500 ${a === k ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}><span className="overflow-hidden"><span className="block max-w-sm pt-2 text-sm text-[var(--surface)]/75">{line}</span></span></span>
                  {a === k && !hold && <span key={a} className="tour-line mt-3 block h-px bg-[var(--bronze)]" aria-hidden />}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}