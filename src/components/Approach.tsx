"use client";
import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MaskReveal } from "./MaskReveal";
import type { Dict } from "@/data/i18n";

const srcs = ["/projects/maadi-285/01.webp", "/projects/october-250/03.webp", "/projects/mountain-view-zayed-80/03.webp", "/projects/ca-dental-clinic/05.webp"];

/* Floor plan in four layers, drawn by scroll in step with the four steps:
   walls (listen) -> doors & windows (concept) -> furniture (visualise) -> dimensions & labels (build). */
const L0 = ["M20 20 H380 V280 H20 Z", "M200 20 V120", "M200 160 V280", "M20 150 H90", "M130 150 H200", "M290 20 V90", "M290 130 V170 H380", "M200 205 H250"];
const L1 = ["M90 150 V110 A40 40 0 0 1 130 150", "M200 120 H240 A40 40 0 0 1 200 160", "M290 90 H325 A35 35 0 0 1 290 130", "M60 16 H140", "M60 24 H140", "M384 190 V250", "M376 190 V250", "M230 284 H330", "M230 276 H330"];
const L2 = ["M40 50 H160 V80 H40 Z", "M40 50 V40 H160 V50", "M75 95 H125 V120 H75 Z", "M82 215 a28 28 0 1 0 56 0 a28 28 0 1 0 -56 0", "M110 175 v8", "M110 247 v8", "M70 215 h8", "M142 215 h8", "M300 190 H370 V270 H300 Z", "M306 196 H332 V212 H306 Z", "M338 196 H364 V212 H338 Z", "M210 30 H280 V45 H225 V110 H210 Z", "M300 30 H370 V60 H300 Z", "M258 240 a14 14 0 1 0 28 0 a14 14 0 1 0 -28 0"];
const L3 = ["M20 296 H380", "M20 291 V300", "M380 291 V300", "M394 20 V280", "M390 20 H398", "M390 280 H398"];

export function Approach({ t }: { t: Dict }) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(() => {
    const build = (trigger: string, start: string, end: string) => gsap.timeline({ scrollTrigger: { trigger: ref.current!.querySelector(trigger), start, end, scrub: 0.6 } })
      .to(".fp0", { strokeDashoffset: 0, duration: 1, stagger: 0.06 })
      .to(".fp1", { strokeDashoffset: 0, duration: 1, stagger: 0.05 })
      .to(".fp2", { strokeDashoffset: 0, duration: 1, stagger: 0.04 })
      .to(".fp3", { strokeDashoffset: 0, duration: 0.6, stagger: 0.04 })
      .to(".fp-t", { opacity: 1, duration: 0.6, stagger: 0.08 }, "<");
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => { build(".fp-steps", "top 65%", "bottom 75%"); });
    mm.add("(max-width: 1023px)", () => { build(".fp-box", "top 85%", "bottom 30%"); });
    gsap.utils.toArray<HTMLElement>(".ap-step").forEach((el) => gsap.from(el, { opacity: 0, y: 36, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 82%" } }));
  }, { scope: ref });
  const P = (d: string, c: string, k: number) => <path key={c + k} d={d} pathLength={1} className={c} strokeDasharray="1" strokeDashoffset="1" />;
  const labels: [string, number, number][] = [[t.rooms.scenes[0][0], 110, 140], [t.rooms.scenes[1][0], 110, 178], [t.rooms.scenes[2][0], 245, 135], [t.rooms.scenes[4][0], 335, 82], [t.rooms.scenes[3][0], 335, 184]];
  return (
    <section ref={ref} id="approach" data-depth={t.gauge.approach} data-meters="1,100 m" className="relative bg-[var(--surface)] text-[var(--ink)]">
      <div className="px-5 py-16 md:px-10 md:py-24">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <h2 className="display text-5xl md:col-span-7 md:text-7xl">{t.approach.title}</h2>
          <p className="max-w-sm text-sm text-[var(--muted)] md:col-span-5">{t.approach.intro}</p>
        </div>
        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <div className="fp-box border border-[var(--ink)]/15 bg-[var(--mist)]/50 p-4 md:p-8 lg:sticky lg:top-24">
              <svg viewBox="0 0 410 310" className="h-auto w-full" aria-hidden>
                <g fill="none" stroke="var(--ink)" strokeWidth="3" strokeLinecap="square">{L0.map((d, k) => P(d, "fp0", k))}</g>
                <g fill="none" stroke="var(--muted)" strokeWidth="1.2">{L1.map((d, k) => P(d, "fp1", k))}</g>
                <g fill="none" stroke="var(--bronze)" strokeWidth="1.4">{L2.map((d, k) => P(d, "fp2", k))}</g>
                <g fill="none" stroke="var(--muted)" strokeWidth="1">{L3.map((d, k) => P(d, "fp3", k))}</g>
                <g fill="var(--ink)" fontSize="13" textAnchor="middle" className="fp-labels">
                  {labels.map(([s, x, y]) => <text key={s} x={x} y={y} className="fp-t" opacity="0">{s}</text>)}
                  <text x="200" y="309" className="fp-t" opacity="0" fill="var(--muted)" fontSize="12">14.6 m</text>
                </g>
              </svg>
            </div>
          </div>
          <ol className="fp-steps grid gap-6 lg:col-span-6">
            {t.approach.steps.map(([title, d], k) => (
              <li key={title} className="ap-step flex flex-col justify-center border-t border-[var(--ink)]/15 pt-6 lg:min-h-[60vh]">
                <p className="text-xs uppercase tracking-[0.2em] rtl:tracking-normal text-[var(--bronze)]">{t.approach.step} {t.approach.words[k]}</p>
                <h3 className="display mt-2 text-4xl md:text-5xl">{title}</h3>
                <p className="mt-3 max-w-md text-sm text-[var(--muted)]">{d}</p>
                <MaskReveal className="relative mt-6 aspect-[16/9] max-w-md overflow-hidden"><Image src={srcs[k]} alt="" fill sizes="(min-width:1024px) 30vw, 100vw" className="object-cover" /></MaskReveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}