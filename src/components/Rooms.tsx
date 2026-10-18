"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import type { Dict } from "@/data/i18n";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";

const srcs = ["/projects/tagamo3-115/04.webp", "/projects/october-250/05.webp", "/projects/hadayek-el-ahram-200/03.webp", "/projects/mountain-view-zayed-80/03.webp", "/projects/mountain-view-zayed-80/05.webp"];

/* 300 m: the page stops on this section and the wheel walks through all five rooms. The list sits on
   the dark ground; the room stands in an arch frame beside it and every room opens through its own
   shape (arch, circle, diamond, side wipe, centre split) over the last one. Hover jumps to a room. */
export function Rooms({ t }: { t: Dict }) {
  const scenes = t.rooms.scenes;
  const [a, setA] = useState(0);
  const [prev, setPrev] = useState(0);
  const cur = useRef(0);
  const sec = useRef<HTMLElement>(null);
  const go = (k: number) => { if (k === cur.current) return; setPrev(cur.current); cur.current = k; setA(k); };
  const stRef = useRef<ScrollTrigger | null>(null);
  const [tick, setTick] = useState(0); // a tap on the current room replays its reveal
  // a tap moves the pinned scroll to that room too, so the snap agrees with the choice instead of undoing it
  const pick = (k: number) => { go(k); setTick((x) => x + 1); const st = stRef.current, n = scenes.length - 1; if (st && n > 0) window.scrollTo({ top: st.start + ((st.end - st.start) * k) / n + 1, behavior: "smooth" }); };
  useGSAP(() => {
    // equal scroll per room, and the page settles on the nearest room instead of stopping between two
    const n = scenes.length - 1;
    stRef.current = ScrollTrigger.create({ trigger: sec.current, start: "top top", end: "+=" + scenes.length * 60 + "%", pin: true, anticipatePin: 1,
      snap: { snapTo: 1 / n, duration: { min: 0.2, max: 0.6 }, delay: 0.08, ease: "power2.inOut" },
      onUpdate: (st) => go(Math.round(st.progress * n)) });
  }, { scope: sec });
  return (
    <section ref={sec} id="rooms" data-depth={t.gauge.rooms} data-meters="300 m" data-deep="1" className="relative h-[100svh] overflow-hidden bg-[var(--deeper)] text-[var(--surface)]">
      {/* the room you are on, faint and full-bleed behind everything; crossfades with each change */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {srcs.map((s, k) => <Image key={s} src={s} alt="" fill sizes="100vw" className={`object-cover transition-opacity duration-[1200ms] ${k === a ? "opacity-35" : "opacity-0"}`} />)}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--deeper)] via-[var(--deeper)]/80 to-[var(--deeper)]/50 lg:bg-gradient-to-r lg:from-[var(--deeper)] lg:via-[var(--deeper)]/85 lg:to-[var(--deeper)]/40 rtl:lg:bg-gradient-to-l" />
      </div>
      <div className="relative grid h-full grid-rows-[minmax(0,1fr)_auto] gap-6 px-5 pb-8 pt-24 md:px-10 lg:grid-cols-12 lg:grid-rows-1 lg:items-center lg:gap-12 lg:pb-10 lg:pt-28">
        <div className="relative mx-auto h-full w-full max-w-[min(100%,46svh)] overflow-hidden rounded-b-2xl rounded-t-full bg-[var(--deep)] lg:order-2 lg:col-span-7 lg:max-w-[min(100%,74svh)]">
          <Image src={srcs[prev]} alt="" fill sizes="(min-width:1024px) 50vw, 90vw" className="object-cover" />
          <div key={`${a}-${tick}`} className={`rv rv-${a % 5} absolute inset-0`}><Image src={srcs[a]} alt={scenes[a][0]} fill sizes="(min-width:1024px) 50vw, 90vw" className="ken object-cover" /></div>
          <div className="pointer-events-none absolute inset-0 rounded-b-2xl rounded-t-full ring-1 ring-inset ring-[var(--bronze)]/40" />
        </div>
        <div className="lg:order-1 lg:col-span-5">
          <p className="eyebrow text-xs uppercase tracking-[0.2em] rtl:tracking-normal text-[var(--bronze)]">{t.rooms.eyebrow}</p>
          <ol className="mt-3">
            {scenes.map(([room, line], k) => (
              <li key={room} className="border-t border-[var(--surface)]/15">
                <button onMouseEnter={() => go(k)} onClick={() => pick(k)} aria-current={a === k} className={`block w-full py-2 text-start transition-colors duration-500 md:py-2.5 ${a === k ? "text-[var(--surface)]" : "text-[var(--surface)]/35"}`}>
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
