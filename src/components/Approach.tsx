"use client";
import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MaskReveal } from "./MaskReveal";
import type { Dict } from "@/data/i18n";

/* 1,100 m — one wide photo, then four columns under a bronze rule that draws across;
   the columns lift in one after another (the "days on site" screen from the reference). */
export function Approach({ t }: { t: Dict }) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(() => {
    const st = { trigger: ".ap-cols", start: "top 80%" };
    gsap.from(".ap-rule", { scaleX: 0, transformOrigin: "left", duration: 1.4, ease: "expo.inOut", scrollTrigger: st });
    gsap.from(".ap-col", { opacity: 0, y: 36, duration: 0.9, stagger: 0.14, ease: "power3.out", scrollTrigger: st });
  }, { scope: ref });
  const u = "text-xs uppercase tracking-[0.2em] rtl:tracking-normal";
  return (
    <section ref={ref} id="approach" data-depth={t.gauge.approach} data-meters="1,100 m" data-deep="1" className="bg-[var(--deep)] text-[var(--surface)]">
      <div className="relative">
        <MaskReveal className="relative aspect-[4/3] overflow-hidden md:aspect-[21/9]"><Image src="/projects/mountain-view-ivilla-235/09.webp" alt="" fill sizes="100vw" className="object-cover" /></MaskReveal>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--deep)] via-[var(--deep)]/20 to-transparent" />
        <div className="absolute inset-x-5 bottom-8 md:inset-x-10 md:bottom-12">
          <p className={`${u} text-[var(--bronze)]`}>{t.gauge.approach}</p>
          <h2 className="display mt-3 max-w-4xl text-4xl md:text-6xl">{t.approach.title}</h2>
        </div>
      </div>
      <div className="ap-cols px-5 pb-16 pt-10 md:px-10 md:pb-24 md:pt-14">
        <p className="max-w-md text-sm text-[var(--surface)]/70">{t.approach.intro}</p>
        <div className="ap-rule mt-8 h-px bg-[var(--bronze)]" aria-hidden />
        <ol className="grid gap-8 pt-8 sm:grid-cols-2 lg:grid-cols-4">
          {t.approach.steps.map(([title, d], k) => (
            <li key={title} className="ap-col">
              <p className={`${u} text-[var(--bronze)]`}>{t.approach.step} {t.approach.words[k]}</p>
              <h3 className="display mt-3 text-3xl md:text-4xl">{title}</h3>
              <p className="mt-3 max-w-xs text-sm text-[var(--surface)]/70">{d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}