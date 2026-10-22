"use client";
import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Dict } from "@/data/i18n";

const ROOMS = ["/projects/zayed-160/02.webp", "/projects/october-250/05.webp", "/projects/el-nakhil-villa/01.webp"];
const N = 7;

/* 220 m — three rooms on one pinned screen, each warming as you scroll.
   Room 1 is fitted piece by piece (slices slide in from alternating sides), then its cold copy and
   the slices fade so the warm room shows. Room 2 wipes in from the side, room 3 opens through the
   Baikal arch; each arrives cold and warms by degrees while the Kelvin readout keeps counting down. */
export function LitByDegrees({ t }: { t: Dict }) {
  const sec = useRef<HTMLElement>(null);
  const k = useRef<HTMLSpanElement>(null);
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: sec.current, start: "top top", end: "+=210%", pin: true, scrub: 0.6, anticipatePin: 1,
      onUpdate: (st) => { const p = Math.min(1, Math.max(0, (st.progress - 0.2) / 0.75)); if (k.current) k.current.textContent = `${Math.round(6500 - p * 3800)} K`; } } });
    tl.fromTo(".asm > span", { yPercent: (i: number) => (i % 2 ? 70 : -70), opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.035, duration: 0.2, ease: "power2.out" }, 0)
      .to(".t-a", { opacity: 0, y: -20, duration: 0.05 }, 0.24).fromTo(".t-b", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.05 }, 0.27)
      .to(".asm, .cold-0", { opacity: 0, duration: 0.14 }, 0.26)
      .fromTo(".room-1", { clipPath: "inset(0 0 0 100%)" }, { clipPath: "inset(0 0 0 0%)", duration: 0.16, ease: "power2.inOut" }, 0.45)
      .to(".cold-1", { opacity: 0, duration: 0.12 }, 0.6)
      .fromTo(".room-2", { clipPath: "inset(100% 25% 0 25% round 50% 50% 0 0)" }, { clipPath: "inset(0% 0% 0 0% round 0% 0% 0 0)", duration: 0.18, ease: "power2.inOut" }, 0.76)
      .to(".cold-2", { opacity: 0, duration: 0.1 }, 0.9);
  }, { scope: sec });
  const u = "text-xs uppercase tracking-[0.2em] rtl:tracking-normal";
  const cold = (i: number) => <div className={`cold-${i} cold absolute inset-0 bg-[#0b1620]/45`} />;
  return (
    <section ref={sec} data-depth={t.lit.eyebrow} data-meters="220 m" data-deep="1" className="relative h-[100svh] overflow-hidden bg-[var(--deeper)] text-[var(--surface)]">
      {ROOMS.map((src, i) => (
        <div key={src} className={`room-${i} absolute inset-0`} style={i ? { clipPath: "inset(0 0 0 100%)" } : undefined}>
          <Image src={src} alt={i === 0 ? t.lit.t2 : ""} fill sizes="100vw" className="object-cover" />
          {i === 0 ? <div className="cold-0 cold absolute inset-0" style={{ filter: "grayscale(.45) brightness(.78) contrast(1.05)" }}><Image src={src} alt="" fill sizes="100vw" className="object-cover" /><div className="absolute inset-0 bg-[#0b1620]/25" /></div> : cold(i)}
        </div>
      ))}
      <div className="asm absolute inset-0 flex" dir="ltr" style={{ filter: "grayscale(.45) brightness(.78) contrast(1.05)" }}>
        {Array.from({ length: N }).map((_, i) => <span key={i} className="relative h-full flex-1 overflow-hidden"><span className="absolute inset-y-0 bg-cover bg-center" style={{ width: `${N * 100}%`, left: `-${i * 100}%`, backgroundImage: `url(${ROOMS[0]}?v=2)` }} /><span className="absolute inset-0 bg-[#0b1620]/25" /></span>)}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[var(--deeper)] to-transparent" />
      <div className="absolute inset-x-5 bottom-10 md:inset-x-10 md:bottom-14">
        <p className={`${u} eyebrow text-[var(--bronze)]`}>{t.lit.eyebrow}</p>
        <div className="relative mt-3 grid text-4xl md:text-6xl">
          <h2 className="t-a display col-start-1 row-start-1">{t.lit.t1}</h2>
          <h2 className="t-b display col-start-1 row-start-1 opacity-0">{t.lit.t2}</h2>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <p className="max-w-md text-sm text-[var(--surface)]/75">{t.lit.note}</p>
          <p className="display shrink-0 whitespace-nowrap text-2xl text-[var(--bronze)] sm:text-3xl md:text-5xl" dir="ltr"><span ref={k}>6500 K</span></p>
        </div>
      </div>
    </section>
  );
}
