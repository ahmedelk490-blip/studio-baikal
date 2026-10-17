"use client";
import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Dict } from "@/data/i18n";

/* 1,400 m: the lit room. A light panel inside the deep; the key visual opens like a door. */
export function Studio({ t }: { t: Dict }) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(() => {
    const st = { trigger: ref.current, start: "top 65%" };
    gsap.from(".st-mask", { clipPath: "inset(0 100% 0 0)", duration: 1.4, ease: "expo.inOut", scrollTrigger: st });
    gsap.from(".st-img", { scale: 1.3, duration: 1.6, ease: "expo.out", scrollTrigger: st });
    gsap.from(".st-t", { opacity: 0, y: 26, duration: 0.9, stagger: 0.1, ease: "power3.out", scrollTrigger: st });
  }, { scope: ref });
  return (
    <section ref={ref} id="studio" data-depth={t.gauge.studio} data-meters="1,400 m" data-deep="1" className="bg-[var(--deep)] px-5 py-24 text-[var(--surface)] md:px-10 md:py-32">
      <div className="grid gap-0 bg-[var(--surface)] text-[var(--ink)] md:grid-cols-12">
        <div className="st-mask relative min-h-[50vw] overflow-hidden md:col-span-6 md:min-h-0">
          <Image src="/brand/hero-arch.webp" alt="" fill sizes="(min-width:768px) 50vw, 100vw" className="st-img object-cover" />
        </div>
        <div className="p-7 md:col-span-6 md:p-14">
          <p className="st-t text-xs uppercase tracking-[0.2em] rtl:tracking-normal text-[var(--bronze)]">{t.studio.eyebrow}</p>
          <h2 className="st-t display mt-4 text-4xl md:text-6xl">{t.studio.title}</h2>
          <p className="st-t mt-6 text-base text-[var(--muted)] md:text-lg">{t.studio.text}</p>
          <dl className="mt-10 grid gap-5 sm:grid-cols-3">
            {t.studio.values.map(([v, d]) => (
              <div key={v} className="st-t border-t border-[var(--ink)]/15 pt-4"><dt className="display text-2xl">{v}</dt><dd className="mt-1 text-sm text-[var(--muted)]">{d}</dd></div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}