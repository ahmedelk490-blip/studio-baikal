"use client";
import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Dict, Lang } from "@/data/i18n";
import { Btn } from "./Btn";
import { Contours } from "./Contours";
import { heroVideo } from "@/data/media";

const SRC = "/projects/october-250/01.webp";
const N = 9;

/* Surface, pinned. On load the room fits itself piece by piece (slices slide in, cold and unlit)
   while the headline rises. Then the wheel warms it by degrees: the cold layer lifts, lamps glow,
   a Kelvin readout counts 6500 K -> 2700 K, the copy drifts up and the next section arrives. */
export function Hero({ t, lang }: { t: Dict; lang: Lang }) {
  const ref = useRef<HTMLElement>(null);
  const k = useRef<HTMLSpanElement>(null);
  useGSAP(() => {
    gsap.timeline({ delay: 0.1 })
      .fromTo(".asm > span", { yPercent: (i: number) => (i % 2 ? 80 : -80), opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.07, duration: 0.9, ease: "power3.out" }, 0)
      .from(".h-eyebrow", { opacity: 0, x: lang === "ar" ? 20 : -20, duration: 0.8, ease: "power3.out" }, 0.4)
      .from(".h-word", { yPercent: 120, rotateX: -60, opacity: 0, duration: 1.1, ease: "power4.out", stagger: 0.07, transformOrigin: "50% 100%" }, 0.5)
      .from(".h-rule", { scaleX: 0, duration: 1.2, ease: "expo.inOut" }, 1)
      .from(".h-fade", { opacity: 0, y: 16, duration: 0.8, ease: "power3.out", stagger: 0.08 }, 1.2)
      .set(".asm", { opacity: 0 });
    gsap.timeline({ scrollTrigger: { trigger: ref.current, start: "top top", end: "+=120%", pin: true, scrub: 0.6, anticipatePin: 1,
      onUpdate: (st) => { if (k.current) k.current.textContent = `${Math.round(6500 - st.progress * 3800)} K`; } } })
      .to(".cold", { opacity: 0, ease: "none", duration: 1 }, 0)
      .fromTo(".glow-lamp", { opacity: 0 }, { opacity: 1, duration: 0.5, stagger: 0.08 }, 0.3)
      .to(".h-copy", { yPercent: -18, opacity: 0.15, ease: "none", duration: 1 }, 0)
      .to(".h-stage", { scale: 1.06, ease: "none", duration: 1 }, 0);
    gsap.matchMedia().add("(pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const x = gsap.quickTo(".h-stage", "x", { duration: 1.6, ease: "power3.out" });
      const move = (e: MouseEvent) => x((e.clientX / innerWidth - 0.5) * -24);
      addEventListener("mousemove", move);
      return () => removeEventListener("mousemove", move);
    });
  }, { scope: ref });
  const words = (s: string) => s.split(" ").map((w, i) => <span key={i} className="inline-block overflow-hidden px-[0.06em] -mx-[0.06em] py-[0.22em] -my-[0.22em] align-bottom"><span className="h-word inline-block will-change-transform">{w}&nbsp;</span></span>);
  const u = "text-xs uppercase tracking-[0.2em] rtl:tracking-normal";
  const cold = { filter: "grayscale(.7) brightness(.5) contrast(1.1)" };
  return (
    <section ref={ref} data-depth={t.gauge.surface} data-meters="0 m" data-deep="1" className="relative h-[100svh] overflow-hidden bg-[var(--deeper)] text-[var(--surface)]">
      <div className="h-stage absolute -inset-[4%]">
        {heroVideo.mp4 ? (
          <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline preload="metadata" poster={heroVideo.poster} aria-hidden><source src={heroVideo.mp4} type="video/mp4" /></video>
        ) : (<>
          <Image src={SRC} alt={t.hero.rooms[0]} fill priority sizes="100vw" className="object-cover" />
          <div className="cold absolute inset-0" style={cold}><Image src={SRC} alt="" fill priority sizes="100vw" className="object-cover" /><div className="absolute inset-0 bg-[#0b1620]/55" /></div>
          <div className="asm absolute inset-0 flex" dir="ltr" style={cold}>
            {Array.from({ length: N }).map((_, i) => <span key={i} className="relative h-full flex-1 overflow-hidden"><span className="absolute inset-y-0 bg-cover bg-center" style={{ width: `${N * 100}%`, left: `-${i * 100}%`, backgroundImage: `url(${SRC}?v=2)` }} /><span className="absolute inset-0 bg-[#0b1620]/55" /></span>)}
          </div>
        </>)}
      </div>
      {[[28, 26], [50, 22], [74, 30]].map(([x, y], i) => <span key={i} className="glow-lamp pointer-events-none absolute h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(196,154,92,.42),transparent_60%)]" style={{ left: `${x}%`, top: `${y}%`, opacity: 0 }} aria-hidden />)}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--deep)] via-[var(--deep)]/30 to-[var(--deep)]/25" />
      <Contours className="contours pointer-events-none absolute inset-x-0 bottom-0 h-[42%] opacity-60" />
      <div className="h-copy relative flex h-full flex-col justify-end px-5 pb-24 pt-28 md:px-10 md:pb-20">
        <p className={`h-eyebrow ${u} text-[var(--bronze)]`}>{t.hero.eyebrow}</p>
        <h1 className="display mt-5 max-w-[14ch] text-[13vw] leading-[1.02] rtl:leading-[1.3] rtl:text-[10vw] md:text-[7.6vw] lg:text-[6.6vw] md:rtl:text-[6vw] lg:rtl:text-[5.2vw]" style={{ perspective: "900px" }}>
          <span className="block">{words(t.hero.t1)}</span>
          <span className="block italic text-[var(--bronze)]">{words(t.hero.t2)}</span>
        </h1>
        <span className="h-rule mt-6 block h-px w-full origin-left bg-[var(--bronze)]/70 rtl:origin-right md:w-2/3" aria-hidden />
        <div className="mt-6 grid gap-6 md:grid-cols-12 md:items-end">
          <p className="h-fade max-w-md text-sm leading-relaxed text-[var(--surface)]/80 md:col-span-6">{t.hero.intro}</p>
          <div className={`h-fade flex flex-wrap items-center gap-x-6 gap-y-3 ${u} md:col-span-6 md:justify-end`}>
            <Btn href={`/${lang}/contact`}>{t.hero.cta1}</Btn>
            <Btn href={`/${lang}/projects`} variant="ghost">{t.hero.cta2}</Btn>
          </div>
        </div>
      </div>
      <div className={`absolute inset-x-5 bottom-6 flex items-center justify-between gap-4 ${u} md:inset-x-10`}>
        <span className="flex items-center gap-2 opacity-70"><span className="sink inline-block">&#8595;</span> {t.lit.t2}</span>
        <span className="display text-2xl text-[var(--bronze)] md:text-3xl" dir="ltr"><span ref={k}>6500 K</span></span>
      </div>
    </section>
  );
}