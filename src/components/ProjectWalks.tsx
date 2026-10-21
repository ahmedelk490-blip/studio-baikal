"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Img } from "@/data/projects";

/* Three ways through a project's rooms, one per project in turn, all driven by the scroll (the page holds
   while you walk) and all opening the popup viewer on a tap:
   A DoorWalk   - each room opens out of an arched doorway in the middle of the one before, as if walking in;
   B WindowWalk - one Baikal arch window stands still while the rooms pass behind it, the current one
                  washing the wall around the window;
   C PlanTable  - the photos lie on an architect's table like drawings; each stands up to full size in
                  front of you, then lies back down as the next one rises. */
type P = { images: Img[]; name: string; onOpen: (k: number) => void; label: string };
const u = "text-xs uppercase tracking-[0.2em] rtl:tracking-normal";
const MOTION = { motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" };

function Caption({ images, k, name, onOpen, label, light = false }: P & { k: number; light?: boolean }) {
  return (
    <div className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-4 px-5 pb-6 pe-24 md:px-10 md:pb-8 md:pe-28 ${light ? "text-[var(--ink)]" : "text-[var(--surface)] [text-shadow:0_2px_14px_rgba(5,8,10,.8)]"}`}>
      <div key={k} className="hero-in">
        <p className={`${u} text-[var(--bronze)]`}>{name} · {k + 1} / {images.length}</p>
        <p className="display mt-1 text-2xl md:text-4xl">{images[k].room}</p>
      </div>
      <button type="button" onClick={() => onOpen(k)} aria-label={`${label}: ${images[k].room}`}
        className={`pointer-events-auto grid h-12 w-12 shrink-0 place-items-center rounded-full border transition-colors ${light ? "border-[var(--ink)]/30 [@media(hover:hover)]:hover:border-[var(--bronze)]" : "border-[var(--surface)]/50 bg-[#05080A]/40 [@media(hover:hover)]:hover:border-[var(--bronze)]"}`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>
      </button>
    </div>
  );
}

export function DoorWalk(p: P) {
  const { images } = p, n = images.length;
  const sec = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(0);
  useGSAP(() => {
    gsap.matchMedia().add(MOTION, (c) => {
      if (c.conditions!.reduce) return;
      const doors = gsap.utils.toArray<HTMLElement>(".dw-door"), rooms = gsap.utils.toArray<HTMLElement>(".dw-room");
      const phone = innerWidth < 768, r = phone ? 220 : 420;
      gsap.set(doors.slice(1), { width: phone ? "44vw" : "17vw", height: phone ? "38svh" : "50svh", borderTopLeftRadius: r, borderTopRightRadius: r, borderBottomLeftRadius: 6, borderBottomRightRadius: 6, opacity: 0 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: sec.current, start: "top top", end: `+=${(n - 1) * 85}%`, pin: true, scrub: 0.6, anticipatePin: 1,
        onUpdate: (s) => setK(Math.min(n - 1, Math.floor(s.progress * (n - 1) + 0.35))) } });
      for (let i = 1; i < n; i++) {
        tl.to(doors[i], { opacity: 1, duration: 0.12 }, i - 1)
          .to(doors[i], { width: "100%", height: "100%", borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, ease: "power2.inOut", duration: 0.88 }, i - 0.88)
          .to(rooms[i - 1], { scale: 1.22, ease: "power1.in", duration: 1 }, i - 1);
      }
    });
  }, { scope: sec });
  return (
    <div ref={sec} className="relative h-[100svh] overflow-hidden bg-[#05080A]">
      {images.map((im, i) => (
        <div key={im.src} className="dw-door absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 overflow-hidden ring-1 ring-[var(--bronze)]/50" style={{ zIndex: i + 1 }}>
          <div className="dw-room absolute left-1/2 top-1/2 h-[100svh] w-[100vw] -translate-x-1/2 -translate-y-1/2">
            <Image src={im.src} alt={`${p.name}, ${im.room}`} fill sizes="100vw" loading="eager" className="object-cover" />
          </div>
        </div>
      ))}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#05080A]/80 to-transparent" style={{ zIndex: n + 1 }} />
      <div className="absolute inset-0" style={{ zIndex: n + 2 }}><Caption {...p} k={k} /></div>
    </div>
  );
}

export function WindowWalk(p: P) {
  const { images } = p, n = images.length;
  const sec = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(0);
  useGSAP(() => {
    gsap.matchMedia().add(MOTION, (c) => {
      if (c.conditions!.reduce) return;
      gsap.timeline({ scrollTrigger: { trigger: sec.current, start: "top top", end: `+=${(n - 1) * 70}%`, pin: true, scrub: 0.7, anticipatePin: 1,
        onUpdate: (s) => setK(Math.min(n - 1, Math.round(s.progress * (n - 1)))) } })
        .to(".ww-strip", { xPercent: (-100 * (n - 1)) / n, ease: "none" }, 0);
    });
  }, { scope: sec });
  return (
    <div ref={sec} className="relative h-[100svh] overflow-hidden bg-[var(--surface)]">
      {/* the current room washes the wall round the window */}
      {images.map((im, i) => (
        <div key={im.src} className="absolute inset-0 transition-opacity duration-700" style={{ opacity: i === k ? 0.22 : 0 }} aria-hidden>
          <Image src={im.src} alt="" fill sizes="50vw" className="scale-110 object-cover" />
        </div>
      ))}
      <div className="absolute inset-0 bg-[var(--surface)]/40" aria-hidden />
      {/* rooms listed beside the window (wide screens) */}
      <ol className="absolute start-10 top-1/2 z-10 hidden -translate-y-1/2 space-y-2 lg:block">
        {images.map((im, i) => (
          <li key={im.src} className={`text-sm transition-colors duration-500 ${i === k ? "text-[var(--ink)]" : "text-[var(--ink)]/35"}`}>
            <span className={`me-3 inline-block h-px align-middle transition-all duration-500 ${i === k ? "w-8 bg-[var(--bronze)]" : "w-3 bg-[var(--ink)]/30"}`} />{im.room}
          </li>
        ))}
      </ol>
      <div className="absolute left-1/2 top-[44%] z-10 h-[58svh] w-[76vw] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-b-lg rounded-t-full shadow-[0_40px_80px_-30px_rgba(20,16,10,.45)] ring-1 ring-[var(--bronze)]/50 md:h-[72svh] md:w-[min(36vw,560px)]" dir="ltr">
        <div className="ww-strip flex h-full" style={{ width: `${n * 100}%` }}>
          {images.map((im) => (
            <div key={im.src} className="relative h-full" style={{ width: `${100 / n}%` }}>
              <Image src={im.src} alt={`${p.name}, ${im.room}`} fill sizes="(min-width:768px) 36vw, 76vw" loading="eager" className="object-cover" />
            </div>
          ))}
        </div>
      </div>
      <Caption {...p} k={k} light />
    </div>
  );
}

export function PlanTable(p: P) {
  const { images } = p, n = images.length;
  const sec = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(0);
  useGSAP(() => {
    gsap.matchMedia().add(MOTION, (c) => {
      if (c.conditions!.reduce) { gsap.set(".pt-board", { opacity: (i: number) => (i === 0 ? 1 : 0) }); return; }
      const boards = gsap.utils.toArray<HTMLElement>(".pt-board");
      gsap.set(boards, { rotateX: 78, yPercent: 38, scale: 0.55, opacity: 0, transformOrigin: "50% 100%" });
      const tl = gsap.timeline({ scrollTrigger: { trigger: sec.current, start: "top top", end: `+=${n * 70}%`, pin: true, scrub: 0.7, anticipatePin: 1,
        onUpdate: (s) => setK(Math.min(n - 1, Math.floor(s.progress * n))) } });
      boards.forEach((b, i) => {
        tl.to(b, { rotateX: 0, yPercent: 0, scale: 1, opacity: 1, ease: "power2.out", duration: 0.45 }, i);
        if (i < n - 1) tl.to(b, { rotateX: 78, yPercent: 38, scale: 0.55, opacity: 0, ease: "power2.in", duration: 0.4 }, i + 0.6);
      });
    });
  }, { scope: sec });
  return (
    <div ref={sec} className="relative h-[100svh] overflow-hidden bg-[#E9E3D8]">
      {/* the table: every drawing laid flat, the one standing up marked in bronze */}
      <div className="absolute inset-x-0 bottom-[-6%] flex justify-center" style={{ perspective: "1200px" }} aria-hidden>
        <div className="grid w-[150vw] grid-cols-5 gap-3 md:w-[92vw] md:grid-cols-6" style={{ transform: "rotateX(64deg)", transformOrigin: "50% 100%" }}>
          {images.map((im, i) => (
            <div key={im.src} className={`relative aspect-[4/3] overflow-hidden rounded-sm bg-white p-1.5 shadow-[0_10px_20px_-8px_rgba(40,30,20,.35)] transition-[opacity,box-shadow] duration-500 ${i === k ? "opacity-30 ring-2 ring-[var(--bronze)]" : "opacity-100"}`}>
              <div className="relative h-full w-full"><Image src={im.src} alt="" fill sizes="20vw" className="object-cover" /></div>
            </div>
          ))}
        </div>
      </div>
      {/* the drawing that stands up */}
      <div className="absolute inset-x-0 top-[9%] flex justify-center" style={{ perspective: "1400px" }}>
        <div className="relative h-[52svh] w-[88vw] md:h-[66svh] md:w-[min(64vw,1000px)]">
          {images.map((im, i) => (
            <div key={im.src} className="pt-board absolute inset-0 overflow-hidden rounded-md bg-white p-2 shadow-[0_50px_90px_-30px_rgba(30,22,14,.55)]" style={{ zIndex: i + 1 }}>
              <div className="relative h-full w-full overflow-hidden rounded-sm"><Image src={im.src} alt={`${p.name}, ${im.room}`} fill sizes="(min-width:768px) 64vw, 88vw" loading="eager" className="object-cover" /></div>
            </div>
          ))}
        </div>
      </div>
      <Caption {...p} k={k} light />
    </div>
  );
}
