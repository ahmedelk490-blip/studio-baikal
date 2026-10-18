"use client";
import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Dict } from "@/data/i18n";

const SRC = "/projects/el-nakhil-villa/01.webp";

/* 950 m — three acts on one pinned screen, scrubbed by the wheel:
   1. the finished room turns into a white line drawing on black,
   2. the drawing splits into a diptych: drawing on one side, the render sliding in on the other,
   3. a Baikal arch grows from the floor and reveals the whole built room; a 0→100% readout follows. */
export function DrawnToBuilt({ t }: { t: Dict }) {
  const sec = useRef<HTMLElement>(null);
  const pct = useRef<HTMLSpanElement>(null);
  useGSAP(() => {
    const path = sec.current!.querySelector<SVGPathElement>(".arch-p")!;
    const rtl = document.documentElement.dir === "rtl";
    const tl = gsap.timeline({ scrollTrigger: { trigger: sec.current, start: "top top", end: "+=260%", pin: true, scrub: 0.6, anticipatePin: 1,
      onUpdate: (st) => { const p = Math.max(0, (st.progress - 0.62) / 0.38); path.setAttribute("transform", `translate(0.5 1) scale(${0.001 + p * 2.4}) translate(-0.5 -1)`); if (pct.current) pct.current.textContent = `${Math.round(p * 100)}%`; } } });
    tl.to(".d2b-line", { opacity: 1, duration: 0.3, ease: "none" }, 0)
      .to(".cap-1", { opacity: 0, y: -16, duration: 0.08 }, 0.26)
      .fromTo(".d2b-half", { clipPath: rtl ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)" }, { clipPath: rtl ? "inset(0 50% 0 0)" : "inset(0 0 0 50%)", duration: 0.26, ease: "power2.inOut" }, 0.34)
      .fromTo(".cap-2", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.08 }, 0.5)
      .to(".cap-2", { opacity: 0, duration: 0.06 }, 0.66)
      .fromTo(".cap-3", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.08 }, 0.72);
  }, { scope: sec });
  const u = "text-xs uppercase tracking-[0.2em] rtl:tracking-normal";
  return (
    <section ref={sec} data-depth={t.drawn.eyebrow} data-meters="950 m" data-deep="1" className="relative h-[100svh] overflow-hidden bg-[#05080a] text-[var(--surface)]">
      <svg width="0" height="0" aria-hidden className="absolute"><defs><clipPath id="baikal-arch" clipPathUnits="objectBoundingBox"><path className="arch-p" d="M0.5 0.06 C0.33 0.06 0.2 0.22 0.2 0.44 V1 H0.8 V0.44 C0.8 0.22 0.67 0.06 0.5 0.06 Z" transform="translate(0.5 1) scale(0.001) translate(-0.5 -1)" /></clipPath></defs></svg>
      <Image src={SRC} alt="" fill sizes="100vw" className="object-cover" />
      <div className="d2b-line absolute inset-0 opacity-0"><Image src={SRC} alt="" fill sizes="100vw" className="object-cover" style={{ filter: "grayscale(1) contrast(2.4) brightness(1.15) invert(1)" }} /><div className="absolute inset-0 bg-[#05080a]/55" /><div className="cmp-grid absolute inset-0 opacity-60" /></div>
      <div className="d2b-half absolute inset-0" style={{ clipPath: "inset(0 0 0 100%)" }}><Image src={SRC} alt={t.drawn.b} fill sizes="100vw" className="object-cover" /></div>
      <div className="absolute inset-0" style={{ clipPath: "url(#baikal-arch)" }}><Image src={SRC} alt="" fill sizes="100vw" className="object-cover" /></div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#05080a]/80 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-[#05080a]/90 to-transparent" />
      <div className="absolute inset-x-0 top-0 px-5 pt-24 md:px-10 md:pt-28"><p className={`${u} eyebrow text-[var(--bronze)]`}>{t.drawn.eyebrow}</p></div>
      <div className="absolute inset-x-5 bottom-8 md:inset-x-10 md:bottom-12">
        <div className="relative grid text-3xl md:text-5xl">
          <h2 className="cap-1 display col-start-1 row-start-1 max-w-3xl self-end">{t.drawn.title}</h2>
          <h2 className="cap-2 display col-start-1 row-start-1 max-w-3xl self-end opacity-0">{t.drawn.diptych}</h2>
          <h2 className="cap-3 display col-start-1 row-start-1 flex max-w-3xl items-end justify-between gap-6 self-end opacity-0"><span>{t.drawn.b}</span><span className="text-[var(--bronze)]" dir="ltr"><span ref={pct}>0%</span></span></h2>
        </div>
        <p className="mt-3 max-w-md text-sm text-[var(--surface)]/70">{t.drawn.note}</p>
      </div>
    </section>
  );
}