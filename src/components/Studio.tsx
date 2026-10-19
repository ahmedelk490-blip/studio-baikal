"use client";
import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Dict } from "@/data/i18n";

/* 1,400 m: the studio, two sisters. Two Baikal arches draw themselves in bronze, each holding a room;
   as the page scrolls they slide together until they are one window. The words sit beside them. */
export function Studio({ t }: { t: Dict }) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(() => {
    gsap.from(".st-t", { opacity: 0, y: 26, duration: 0.9, stagger: 0.1, ease: "power3.out", scrollTrigger: { trigger: ref.current, start: "top 65%" } });
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
      // each arch is 44% of the stage, its centre 26% from its side: 54.5% of its own width brings it to the middle
      gsap.timeline({ scrollTrigger: { trigger: ".st-stage", start: "top 80%", end: "bottom 45%", scrub: 0.7 } })
        .fromTo(".st-line", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.35, ease: "none" }, 0)
        .fromTo(".st-arch", { opacity: 0 }, { opacity: 1, duration: 0.25 }, 0.1)
        .to(".st-a", { xPercent: 54.5, duration: 0.5, ease: "power2.inOut" }, 0.4)
        .to(".st-b", { xPercent: -54.5, duration: 0.5, ease: "power2.inOut" }, 0.4)
        .to(".st-b .st-photo", { opacity: 0, duration: 0.3 }, 0.62)
        .to(".st-a", { scale: 1.08, duration: 0.3, ease: "power2.out" }, 0.75);
    });
  }, { scope: ref });
  // one arch: a photo under an arched mask with a bronze outline drawn as an SVG path
  const arch = (cls: string, src: string) => (
    <div className={`st-arch ${cls} absolute bottom-[8%] h-[78%] w-[44%]`}>
      <div className="st-photo absolute inset-0 overflow-hidden" style={{ borderRadius: "999px 999px 14px 14px" }}>
        <Image src={src} alt="" fill sizes="(min-width:768px) 25vw, 45vw" className="object-cover" />
      </div>
      <svg className="pointer-events-none absolute -inset-2 h-[calc(100%+16px)] w-[calc(100%+16px)] overflow-visible" viewBox="0 0 100 140" preserveAspectRatio="none" aria-hidden>
        <path className="st-line" d="M2 138 V50 A48 48 0 0 1 98 50 V138 Z" fill="none" stroke="#C49A5C" strokeWidth="1.5" vectorEffect="non-scaling-stroke" pathLength={1} strokeDasharray="1" />
      </svg>
    </div>
  );
  return (
    <section ref={ref} id="studio" data-depth={t.gauge.studio} data-meters="1,400 m" data-deep="1" className="bg-[var(--deep)] px-5 py-16 text-[var(--surface)] md:px-10 md:py-24">
      <div className="grid gap-0 bg-[var(--surface)] text-[var(--ink)] md:grid-cols-12">
        <div className="st-stage relative min-h-[78vw] overflow-hidden bg-[#141c21] md:col-span-6 md:min-h-[520px]" dir="ltr">
          {arch("st-a start-[4%] z-[2]", "/brand/hero-arch.webp")}
          {arch("st-b end-[4%] z-[1]", "/projects/zayed-160/02.webp")}
        </div>
        <div className="p-7 md:col-span-6 md:p-14">
          <p className="st-t eyebrow text-xs uppercase tracking-[0.2em] rtl:tracking-normal text-[var(--bronze)]">{t.studio.eyebrow}</p>
          <h2 className="st-t display mt-4 text-4xl md:text-6xl">{t.studio.title}</h2>
          <p className="st-t mt-6 text-base text-[var(--muted)] md:text-lg">{t.studio.text}</p>
          <dl className="mt-10 grid gap-5 sm:grid-cols-3 md:grid-cols-1 xl:grid-cols-3">
            {t.studio.values.map(([v, d]) => (
              <div key={v} className="st-t border-t border-[var(--ink)]/15 pt-4"><dt className="display text-2xl">{v}</dt><dd className="mt-1 text-sm text-[var(--muted)]">{d}</dd></div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}