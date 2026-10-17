"use client";
import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const text = "We design homes that feel like they have always been yours. Calm materials, honest structure and light that moves through the day. Nothing loud, nothing temporary.";

/* -20 m: the statement. Words surface one by one; two photos sink at different speeds. */
export function Manifesto() {
  const ref = useRef<HTMLElement>(null);
  useGSAP(() => {
    gsap.from(".w", { opacity: 0.1, duration: 0.5, stagger: 0.03, ease: "none", scrollTrigger: { trigger: ".m-text", start: "top 78%" } });
    gsap.to(".m-a", { yPercent: -22, ease: "none", scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true } });
    gsap.to(".m-b", { yPercent: 18, ease: "none", scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true } });
  }, { scope: ref });
  return (
    <section ref={ref} data-depth="Statement" data-meters="20 m" className="bg-[var(--surface)] text-[var(--ink)]">
      <div className="grid gap-10 px-5 py-24 md:grid-cols-12 md:px-10 md:py-40">
        <div className="md:col-span-3">
          <p className="text-xs uppercase tracking-[0.2em] rtl:tracking-normal text-[var(--bronze)]">Studio Baikal</p>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] rtl:tracking-normal text-[var(--muted)]">Interior design studio</p>
          <div className="m-b relative mt-10 hidden aspect-[3/4] w-40 md:block"><Image src="/projects/maadi-180/05.webp" alt="Green glazed tiles in a home bar" fill sizes="160px" className="object-cover" /></div>
        </div>
        <p className="m-text display text-3xl leading-[1.22] md:col-span-7 md:text-5xl lg:text-[3.6rem]">
          {text.split(" ").map((w, k) => <span key={k} className="w inline-block">{w}&nbsp;</span>)}
        </p>
        <div className="md:col-span-2">
          <div className="m-a relative ml-auto aspect-[3/4] w-full max-w-[220px]"><Image src="/projects/maadi-285/01.webp" alt="Walnut coffee bar with warm shelf lighting" fill sizes="220px" className="object-cover" /></div>
        </div>
      </div>
    </section>
  );
}