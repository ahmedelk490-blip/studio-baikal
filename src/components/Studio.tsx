"use client";
import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const values = [["Timeless", "Interiors that stay elegant beyond passing trends."], ["Thoughtful", "Every element considered, so the space feels balanced and intentional."], ["Personal", "Tailored to your lifestyle, personality and way of living."]];

/* -1,400 m: the lit room. A light panel inside the deep; the key visual opens like a door. */
export function Studio() {
  const ref = useRef<HTMLElement>(null);
  useGSAP(() => {
    const st = { trigger: ref.current, start: "top 65%" };
    gsap.from(".st-mask", { clipPath: "inset(0 100% 0 0)", duration: 1.4, ease: "expo.inOut", scrollTrigger: st });
    gsap.from(".st-img", { scale: 1.3, duration: 1.6, ease: "expo.out", scrollTrigger: st });
    gsap.from(".st-t", { opacity: 0, y: 26, duration: 0.9, stagger: 0.1, ease: "power3.out", scrollTrigger: st });
  }, { scope: ref });
  return (
    <section ref={ref} id="studio" data-depth="Studio" data-meters="1,400 m" data-deep="1" className="bg-[var(--deep)] px-5 py-24 text-[var(--surface)] md:px-10 md:py-32">
      <div className="grid gap-0 bg-[var(--surface)] text-[var(--ink)] md:grid-cols-12">
        <div className="st-mask relative min-h-[50vw] overflow-hidden md:col-span-6 md:min-h-0">
          <Image src="/brand/hero-arch.webp" alt="Stone, wood and an arched opening onto a lake at dusk" fill sizes="(min-width:768px) 50vw, 100vw" className="st-img object-cover" />
        </div>
        <div className="p-7 md:col-span-6 md:p-14">
          <p className="st-t text-xs uppercase tracking-[0.2em] rtl:tracking-normal text-[var(--bronze)]">The studio</p>
          <h2 className="st-t display mt-4 text-4xl md:text-6xl">Founded by two sisters. Designed to last.</h2>
          <p className="st-t mt-6 text-base text-[var(--muted)] md:text-lg">Studio Baikal believes great design is more than beautiful spaces. It is about creating environments that reflect the people who live in them. Inspired by the depth, balance and tranquillity of nature, we design interiors that combine timeless aesthetics with everyday function.</p>
          <dl className="mt-10 grid gap-5 sm:grid-cols-3">
            {values.map(([t, d]) => (
              <div key={t} className="st-t border-t border-[var(--ink)]/15 pt-4">
                <dt className="display text-2xl">{t}</dt>
                <dd className="mt-1 text-sm text-[var(--muted)]">{d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}