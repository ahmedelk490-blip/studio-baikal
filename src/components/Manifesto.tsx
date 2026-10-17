"use client";
import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Dict } from "@/data/i18n";

/* 20 m — the porthole. Sticky stage: the statement lights up word by word, then a small round
   window at the bottom grows until the whole screen is underwater and you are in the projects. */
export function Manifesto({ t }: { t: Dict }) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(() => {
    gsap.timeline({ scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom bottom", scrub: 0.6 } })
      .to(".w", { opacity: 1, stagger: 0.04, duration: 0.3, ease: "none" })
      .to(".ph", { clipPath: "circle(80% at 50% 62%)", duration: 1.2, ease: "power2.inOut" }, ">-0.1")
      .to(".ph-img", { scale: 1, duration: 1.2, ease: "power2.out" }, "<")
      .to(".m-copy", { opacity: 0, y: -80, duration: 0.6 }, "<0.2")
      .from(".ph-cap > *", { opacity: 0, y: 24, stagger: 0.1, duration: 0.4 }, "-=0.45");
  }, { scope: ref });
  const u = "text-xs uppercase tracking-[0.2em] rtl:tracking-normal";
  return (
    <section ref={ref} data-depth={t.gauge.statement} data-meters="20 m" className="relative h-[260vh] bg-[var(--surface)] text-[var(--ink)]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="m-copy relative mx-auto flex h-full max-w-5xl flex-col items-center px-5 pt-[15vh] text-center">
          <p className={`${u} text-[var(--bronze)]`}>{t.statement.a} · {t.statement.b}</p>
          <p className="display mt-6 text-3xl leading-[1.22] rtl:leading-[1.5] md:text-5xl lg:text-[3.4rem]">
            {t.statement.text.split(" ").map((w, k) => <span key={k} className="w inline-block opacity-[.12]">{w}&nbsp;</span>)}
          </p>
        </div>
        <div className="ph absolute inset-0" style={{ clipPath: "circle(10% at 50% 82%)" }}>
          <Image src="/projects/el-nakhil-villa/01.webp" alt="" fill sizes="100vw" className="ph-img scale-[1.35] object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--deep)] via-[var(--deep)]/30 to-transparent" />
          <div className="ph-cap absolute inset-x-0 bottom-[12vh] px-5 text-center text-[var(--surface)]">
            <p className={`${u} text-[var(--bronze)]`}>80 m</p>
            <p className="display mt-3 text-4xl md:text-6xl">{t.statement.dive}</p>
          </div>
        </div>
      </div>
    </section>
  );
}