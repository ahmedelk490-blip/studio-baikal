"use client";
import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MaskReveal } from "./MaskReveal";
import type { Dict } from "@/data/i18n";

const HERO = "/projects/mountain-view-ivilla-235/05.webp";
const steps = ["/projects/maadi-285/01.webp", "/projects/october-250/03.webp", "/projects/mountain-view-zayed-80/03.webp", "/projects/ca-dental-clinic/05.webp"];

/* 1,100 m — the "days on site" screen: one wide photo that drifts slower than the page, the title
   on its floor; then four columns split by hairlines, each with a bronze step label, title, text
   and its own small photo that unmasks as you reach it. A bronze rule draws across the top. */
export function Approach({ t }: { t: Dict }) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(() => {
    gsap.to(".ap-hero", { yPercent: 18, ease: "none", scrollTrigger: { trigger: ".ap-head", start: "top bottom", end: "bottom top", scrub: true } });
    gsap.from(".ap-title > *", { opacity: 0, y: 24, stagger: 0.1, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: ".ap-head", start: "top 60%" } });
    const st = { trigger: ".ap-cols", start: "top 78%" };
    gsap.from(".ap-rule", { scaleX: 0, transformOrigin: "left", duration: 1.4, ease: "expo.inOut", scrollTrigger: st });
    gsap.from(".ap-col", { opacity: 0, y: 36, duration: 0.9, stagger: 0.14, ease: "power3.out", scrollTrigger: st });
  }, { scope: ref });
  const u = "text-xs uppercase tracking-[0.2em] rtl:tracking-normal";
  return (
    <section ref={ref} id="approach" data-depth={t.gauge.approach} data-meters="1,100 m" data-deep="1" className="bg-[var(--deep)] text-[var(--surface)]">
      <div className="ap-head relative h-[62svh] overflow-hidden md:h-[70svh]">
        <div className="ap-hero absolute -inset-y-[18%] inset-x-0"><Image src={HERO} alt="" fill sizes="100vw" className="object-cover" /></div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--deep)] via-[var(--deep)]/35 to-[var(--deep)]/10" />
        <div className="ap-title absolute inset-x-5 bottom-8 md:inset-x-10 md:bottom-12">
          <p className={`${u} text-[var(--bronze)]`}>{t.gauge.approach}</p>
          <h2 className="display mt-3 max-w-4xl text-4xl md:text-6xl">{t.approach.title}</h2>
          <p className="mt-4 max-w-md text-sm text-[var(--surface)]/75">{t.approach.intro}</p>
        </div>
      </div>
      <div className="ap-cols px-5 pb-16 pt-6 md:px-10 md:pb-24 md:pt-8">
        <div className="ap-rule h-px bg-[var(--bronze)]" aria-hidden />
        <ol className="grid gap-px bg-[var(--surface)]/12 sm:grid-cols-2 lg:grid-cols-4">
          {t.approach.steps.map(([title, d], k) => (
            <li key={title} className="ap-col flex flex-col justify-between gap-8 bg-[var(--deep)] py-8 pe-6 ps-0 sm:ps-6 first:ps-0">
              <div>
                <p className={`${u} text-[var(--bronze)]`}>{t.approach.step} {t.approach.words[k]}</p>
                <h3 className="display mt-3 text-3xl md:text-4xl">{title}</h3>
                <p className="mt-3 max-w-xs text-sm text-[var(--surface)]/70">{d}</p>
              </div>
              <MaskReveal className="relative aspect-[16/10] overflow-hidden rounded-xl"><Image src={steps[k]} alt="" fill sizes="(min-width:1024px) 22vw, (min-width:640px) 45vw, 90vw" className="object-cover" /></MaskReveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}