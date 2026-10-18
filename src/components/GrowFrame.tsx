"use client";
import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Extras } from "@/data/extras";

/* A pause between sections: one finished room stands small in a Baikal arch, and as the page scrolls
   the arch opens until the room fills the screen; then its line settles in under it. */
export function GrowFrame({ c, src }: { c: Extras["grow"]; src: string }) {
  const sec = useRef<HTMLElement>(null);
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add({ phone: "(max-width: 767px)", desk: "(min-width: 768px)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
      if (ctx.conditions!.reduce) return;
      const start = ctx.conditions!.phone ? "inset(18% 16% 22% 16% round 300px 300px 14px 14px)" : "inset(14% 37% 14% 37% round 420px 420px 16px 16px)";
      gsap.timeline({ scrollTrigger: { trigger: sec.current, start: "top top", end: "+=120%", pin: true, scrub: 0.6, anticipatePin: 1 } })
        .fromTo(".gf-win", { clipPath: start }, { clipPath: "inset(0% 0% 0% 0% round 0px 0px 0px 0px)", ease: "power2.inOut", duration: 1 }, 0)
        .fromTo(".gf-img", { scale: 1.3 }, { scale: 1, ease: "power2.inOut", duration: 1 }, 0)
        .fromTo(".gf-shade", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.7)
        .fromTo(".gf-copy > *", { opacity: 0, y: 24 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.25 }, 0.78);
    });
  }, { scope: sec });
  return (
    <section ref={sec} id="frame" className="relative h-[100svh] overflow-hidden bg-[var(--surface)]">
      <div className="gf-win absolute inset-0 overflow-hidden">
        <Image src={src} alt={c.eyebrow} fill sizes="100vw" className="gf-img object-cover" />
        <div className="gf-shade absolute inset-0 bg-gradient-to-t from-[var(--deep)]/85 via-[var(--deep)]/15 to-transparent" />
      </div>
      <div className="gf-copy absolute inset-x-5 bottom-10 text-[var(--surface)] md:inset-x-10 md:bottom-14">
        <p className="eyebrow text-xs uppercase tracking-[0.2em] rtl:tracking-normal text-[var(--bronze)]">{c.eyebrow}</p>
        <p className="display mt-3 max-w-3xl text-3xl md:text-6xl">{c.line}</p>
      </div>
    </section>
  );
}
