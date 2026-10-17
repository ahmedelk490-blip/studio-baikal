"use client";
import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Dict } from "@/data/i18n";

const SRC = "/projects/el-nakhil-villa/01.webp";

/* 950 m — drawn to built. The page pins; the wheel grows a Baikal arch (SVG clip-path) over the
   finished render so the drafted version shows through outside it, and a 0→100% "built" readout
   runs off the same scroll progress. The shape of the mask sells it, never a fade. */
export function DrawnToBuilt({ t }: { t: Dict }) {
  const sec = useRef<HTMLElement>(null);
  const pct = useRef<HTMLSpanElement>(null);
  useGSAP(() => {
    const path = sec.current!.querySelector<SVGPathElement>(".arch-p")!;
    const bar = sec.current!.querySelector<HTMLElement>(".d2b-bar")!;
    const st = { trigger: sec.current, start: "top top", end: "+=160%", pin: true, scrub: 0.6, anticipatePin: 1,
      onUpdate: (self: { progress: number }) => {
        const s = 0.14 + self.progress * 2.1;
        path.setAttribute("transform", `translate(0.5 1) scale(${s}) translate(-0.5 -1)`);
        if (pct.current) pct.current.textContent = `${Math.round(self.progress * 100)}%`;
        bar.style.transform = `scaleX(${self.progress})`;
      } };
    gsap.timeline({ scrollTrigger: st })
      .fromTo(".d2b-built", { scale: 1.12 }, { scale: 1, ease: "none" }, 0)
      .to(".d2b-drawn", { opacity: 0.35, ease: "none" }, 0);
  }, { scope: sec });
  const u = "text-xs uppercase tracking-[0.2em] rtl:tracking-normal";
  return (
    <section ref={sec} data-depth={t.drawn.eyebrow} data-meters="950 m" data-deep="1" className="relative h-[100svh] overflow-hidden bg-[var(--deep)] text-[var(--surface)]">
      <svg width="0" height="0" aria-hidden className="absolute"><defs><clipPath id="baikal-arch" clipPathUnits="objectBoundingBox"><path className="arch-p" d="M0.5 0.06 C0.33 0.06 0.2 0.22 0.2 0.44 V1 H0.8 V0.44 C0.8 0.22 0.67 0.06 0.5 0.06 Z" transform="translate(0.5 1) scale(0.14) translate(-0.5 -1)" /></clipPath></defs></svg>
      <div className="d2b-drawn absolute inset-0">
        <Image src={SRC} alt="" fill sizes="100vw" className="cmp-draw object-cover" />
        <div className="cmp-grid absolute inset-0" />
        <div className="absolute inset-0 bg-[var(--deep)]/35" />
      </div>
      <div className="absolute inset-0" style={{ clipPath: "url(#baikal-arch)" }}>
        <Image src={SRC} alt={t.drawn.b} fill sizes="100vw" className="d2b-built object-cover" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[var(--deep)]/80 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[var(--deep)]/85 to-transparent" />
      <div className="absolute inset-x-0 top-0 px-5 pt-24 md:px-10 md:pt-28">
        <p className={`${u} text-[var(--bronze)]`}>{t.drawn.eyebrow}</p>
        <h2 className="display mt-3 max-w-3xl text-3xl md:text-5xl">{t.drawn.title}</h2>
      </div>
      <div className="absolute inset-x-5 bottom-8 md:inset-x-10 md:bottom-10">
        <div className="flex items-end justify-between gap-6">
          <div><p className={`${u} opacity-70`}>{t.drawn.a}</p><p className="display mt-1 text-2xl md:text-4xl">{t.drawn.b}</p></div>
          <p className="display text-4xl text-[var(--bronze)] md:text-6xl" dir="ltr"><span ref={pct}>0%</span></p>
        </div>
        <div className="mt-4 h-px bg-[var(--surface)]/20"><div className="d2b-bar h-px origin-left bg-[var(--bronze)] rtl:origin-right" style={{ transform: "scaleX(0)" }} /></div>
        <p className="mt-3 max-w-md text-sm text-[var(--surface)]/70">{t.drawn.note}</p>
      </div>
    </section>
  );
}