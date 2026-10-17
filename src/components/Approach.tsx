"use client";
import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Dict } from "@/data/i18n";
import { MaskReveal } from "./MaskReveal";

const srcs = ["/projects/maadi-285/01.webp", "/projects/october-250/03.webp", "/projects/mountain-view-zayed-80/03.webp", "/projects/ca-dental-clinic/05.webp"];

/* 1,100 m: the descent line. A vertical bronze line draws down the page; steps alternate sides. */
export function Approach({ t }: { t: Dict }) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(() => {
    gsap.from(".ap-line", { scaleY: 0, transformOrigin: "top", ease: "none", scrollTrigger: { trigger: ref.current, start: "top 60%", end: "bottom 80%", scrub: 0.5 } });
    gsap.to(".ap-dot", { top: "100%", ease: "none", scrollTrigger: { trigger: ref.current, start: "top 60%", end: "bottom 80%", scrub: 0.5 } });
    gsap.utils.toArray<HTMLElement>(".ap-step").forEach((el) => gsap.from(el, { opacity: 0, y: 36, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 80%" } }));
  }, { scope: ref });
  return (
    <section ref={ref} data-depth={t.gauge.approach} data-meters="1,100 m" className="relative bg-[var(--surface)] text-[var(--ink)]">
      <div className="px-5 py-24 md:px-10 md:py-32">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <h2 className="display text-5xl md:col-span-7 md:text-7xl">{t.approach.title}</h2>
          <p className="max-w-sm text-sm text-[var(--muted)] md:col-span-5">{t.approach.intro}</p>
        </div>
        <div className="relative mt-16">
          <span className="ap-line absolute start-3 top-0 h-full w-px bg-[var(--bronze)] md:start-1/2" aria-hidden />
          <span className="ap-dot absolute start-3 top-0 z-10 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--bronze)] shadow-[0_0_0_6px_rgba(196,154,92,.2)] rtl:translate-x-1/2 md:start-1/2" aria-hidden />
          <ol className="grid gap-16">
            {t.approach.steps.map(([title, d], k) => (
              <li key={title} className={`ap-step relative grid gap-5 ps-10 md:grid-cols-2 md:ps-0 ${k % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
                <span className="absolute start-3 top-2 h-2 w-2 -translate-x-1/2 rounded-full bg-[var(--bronze)] rtl:translate-x-1/2 md:start-1/2" aria-hidden />
                <div className={k % 2 ? "md:ps-12" : "md:pe-12 md:text-end"}>
                  <p className="text-xs uppercase tracking-[0.2em] rtl:tracking-normal text-[var(--bronze)]">{t.approach.step} {t.approach.words[k]}</p>
                  <h3 className="display mt-2 text-4xl md:text-5xl">{title}</h3>
                  <p className={`mt-3 max-w-sm text-sm text-[var(--muted)] ${k % 2 ? "" : "md:ms-auto"}`}>{d}</p>
                </div>
                <div className={k % 2 ? "md:pe-12" : "md:ps-12"}>
                  <MaskReveal className="relative aspect-[16/9] max-w-lg overflow-hidden"><Image src={srcs[k]} alt="" fill sizes="(min-width:768px) 40vw, 100vw" className="object-cover" /></MaskReveal>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}