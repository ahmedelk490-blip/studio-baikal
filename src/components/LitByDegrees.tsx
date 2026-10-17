"use client";
import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Dict } from "@/data/i18n";

const SRC = "/projects/zayed-160/02.webp";
const N = 7;

/* 220 m — two acts on one pinned screen. Act one: the room is fitted piece by piece (vertical
   slices slide in from alternating sides). Act two: the cold, unlit room warms by degrees
   (cold layer fades, a Kelvin readout counts down 6500 K -> 2700 K). */
export function LitByDegrees({ t }: { t: Dict }) {
  const sec = useRef<HTMLElement>(null);
  const k = useRef<HTMLSpanElement>(null);
  useGSAP(() => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: sec.current, start: "top top", end: "+=200%", pin: true, scrub: 0.6, anticipatePin: 1,
      onUpdate: (st) => { const p = Math.max(0, (st.progress - 0.5) / 0.5); if (k.current) k.current.textContent = `${Math.round(6500 - p * 3800)} K`; } } });
    tl.fromTo(".asm > span", { yPercent: (i: number) => (i % 2 ? 70 : -70), opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.07, duration: 0.45, ease: "power2.out" }, 0)
      .to(".t-a", { opacity: 0, y: -20, duration: 0.1 }, 0.42).fromTo(".t-b", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.1 }, 0.5)
      .to(".cold", { opacity: 0, duration: 0.45, ease: "none" }, 0.52)
      .fromTo(".glow-lamp", { opacity: 0 }, { opacity: 1, duration: 0.3, stagger: 0.05 }, 0.65);
  }, { scope: sec });
  const u = "text-xs uppercase tracking-[0.2em] rtl:tracking-normal";
  return (
    <section ref={sec} data-depth={t.lit.eyebrow} data-meters="220 m" data-deep="1" className="relative h-[100svh] overflow-hidden bg-[var(--deeper)] text-[var(--surface)]">
      <Image src={SRC} alt={t.lit.t2} fill sizes="100vw" className="object-cover" />
      <div className="cold absolute inset-0" style={{ filter: "grayscale(.7) brightness(.5) contrast(1.1)" }}><Image src={SRC} alt="" fill sizes="100vw" className="object-cover" /><div className="absolute inset-0 bg-[#0b1620]/55" /></div>
      <div className="asm absolute inset-0 flex" dir="ltr" style={{ filter: "grayscale(.7) brightness(.5) contrast(1.1)" }}>
        {Array.from({ length: N }).map((_, i) => <span key={i} className="relative h-full flex-1 overflow-hidden"><span className="absolute inset-y-0 bg-cover bg-center" style={{ width: `${N * 100}%`, left: `-${i * 100}%`, backgroundImage: `url(${SRC}?v=2)` }} /><span className="absolute inset-0 bg-[#0b1620]/55" /></span>)}
      </div>
      {[[30, 28], [62, 24], [78, 40]].map(([x, y], i) => <span key={i} className="glow-lamp pointer-events-none absolute h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(196,154,92,.45),transparent_60%)]" style={{ left: `${x}%`, top: `${y}%`, opacity: 0 }} aria-hidden />)}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[var(--deeper)] to-transparent" />
      <div className="absolute inset-x-5 bottom-10 md:inset-x-10 md:bottom-14">
        <p className={`${u} text-[var(--bronze)]`}>{t.lit.eyebrow}</p>
        <div className="relative mt-3 h-[2.4em] text-4xl md:text-6xl">
          <h2 className="t-a display absolute inset-x-0 top-0">{t.lit.t1}</h2>
          <h2 className="t-b display absolute inset-x-0 top-0 opacity-0">{t.lit.t2}</h2>
        </div>
        <div className="mt-4 flex items-end justify-between gap-6">
          <p className="max-w-md text-sm text-[var(--surface)]/75">{t.lit.note}</p>
          <p className="display text-3xl text-[var(--bronze)] md:text-5xl" dir="ltr"><span ref={k}>6500 K</span></p>
        </div>
      </div>
    </section>
  );
}