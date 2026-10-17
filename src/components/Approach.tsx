"use client";
import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MaskReveal } from "./MaskReveal";
import type { Dict } from "@/data/i18n";

const srcs = ["/projects/maadi-285/01.webp", "/projects/october-250/03.webp", "/projects/mountain-view-zayed-80/03.webp", "/projects/ca-dental-clinic/05.webp"];

/* Floor plan in four layers, drawn by scroll in step with the four steps:
   walls (listen) -> doors & windows (concept) -> furniture (visualise) -> dimensions & labels (build). */
const L0 = ["M20 20 H380 V280 H20 Z", "M200 20 V105", "M200 140 V280", "M290 20 V150", "M20 150 H105", "M155 150 H200", "M200 150 H218", "M254 150 H300", "M336 150 H380"];
const L1 = ["M218 150 V186 A36 36 0 0 0 254 150", "M336 150 V186 A36 36 0 0 1 300 150", "M50 16 H160", "M50 24 H160", "M215 16 H275", "M215 24 H275", "M50 276 H160", "M50 284 H160", "M376 190 V262", "M384 190 V262"];
const L2 = ["M45 34 H165 V58 H45 Z", "M45 44 H165", "M85 72 H125 V92 H85 Z", "M86 222 a24 24 0 1 0 48 0 a24 24 0 1 0 -48 0", "M110 190 v6", "M110 248 v6", "M78 222 h6", "M136 222 h6", "M208 28 H282 V42 H222 V100 H208 Z", "M236 66 H272 V88 H236 Z", "M300 30 H370 V58 H300 Z", "M352 96 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0", "M300 200 H370 V272 H300 Z", "M306 206 H332 V220 H306 Z", "M338 206 H364 V220 H338 Z", "M232 244 a13 13 0 1 0 26 0 a13 13 0 1 0 -26 0"];
const L3 = ["M20 298 H380", "M20 293 V303", "M380 293 V303", "M396 20 V280", "M391 20 H401", "M391 280 H401"];

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
  const labels: [string, number, number][] = [[t.rooms.scenes[0][0], 110, 124], [t.rooms.scenes[1][0], 110, 180], [t.rooms.scenes[2][0], 245, 130], [t.rooms.scenes[4][0], 335, 132], [t.rooms.scenes[3][0], 248, 216]];
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
              <svg viewBox="0 0 410 318" className="h-auto w-full" aria-hidden>
                <g fill="none" stroke="var(--ink)" strokeWidth="3" strokeLinecap="square">{L0.map((d, k) => P(d, "fp0", k))}</g>
                <g fill="none" stroke="var(--muted)" strokeWidth="1.2">{L1.map((d, k) => P(d, "fp1", k))}</g>
                <g fill="none" stroke="var(--bronze)" strokeWidth="1.4">{L2.map((d, k) => P(d, "fp2", k))}</g>
                <g fill="none" stroke="var(--muted)" strokeWidth="1">{L3.map((d, k) => P(d, "fp3", k))}</g>
                <g fill="var(--ink)" fontSize="12" textAnchor="middle" className="fp-labels">
                  {labels.map(([s, x, y]) => <text key={s} x={x} y={y} className="fp-t" opacity="0">{s}</text>)}
                  <text x="200" y="314" className="fp-t" opacity="0" fill="var(--muted)" fontSize="12">14.6 m</text>
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