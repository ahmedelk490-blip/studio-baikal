"use client";
import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const steps = [
  { t: "Listen", d: "A free consultation about how you live, what you love and what the space must do.", img: "/projects/maadi-285/01.webp" },
  { t: "Concept", d: "Mood, materials and layout options that set the direction for the whole home.", img: "/projects/october-250/03.webp" },
  { t: "Visualise", d: "Photoreal 3D and a 360° tour, refined with you until every corner feels right.", img: "/projects/mountain-view-zayed-80/03.webp" },
  { t: "Build", d: "Technical drawings, trusted contractors and on-site supervision until handover.", img: "/projects/ca-dental-clinic/05.webp" },
];
const words = ["one", "two", "three", "four"];

/* -1,100 m: the descent line. A vertical bronze line draws down the page; steps alternate sides. */
export function Approach() {
  const ref = useRef<HTMLElement>(null);
  useGSAP(() => {
    gsap.from(".ap-line", { scaleY: 0, transformOrigin: "top", ease: "none", scrollTrigger: { trigger: ref.current, start: "top 60%", end: "bottom 80%", scrub: 0.5 } });
    gsap.utils.toArray<HTMLElement>(".ap-step").forEach((el) => gsap.from(el, { opacity: 0, y: 36, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 80%" } }));
  }, { scope: ref });
  return (
    <section ref={ref} data-depth="Approach" data-meters="1,100 m" data-deep="1" className="relative bg-[var(--deep)] text-[var(--surface)]">
      <div className="px-5 py-24 md:px-10 md:py-32">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <h2 className="display text-5xl md:col-span-7 md:text-7xl">From first conversation to final handover.</h2>
          <p className="max-w-sm text-sm text-[var(--surface)]/70 md:col-span-5">Four steps. No surprises, no guessing; you see the home before it is built.</p>
        </div>
        <div className="relative mt-16">
          <span className="ap-line absolute left-3 top-0 h-full w-px bg-[var(--bronze)] md:left-1/2" aria-hidden />
          <ol className="grid gap-16">
            {steps.map((s, k) => (
              <li key={s.t} className={`ap-step relative grid gap-5 pl-10 md:grid-cols-2 md:pl-0 ${k % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
                <span className="absolute left-3 top-2 h-2 w-2 -translate-x-1/2 rounded-full bg-[var(--bronze)] md:left-1/2" aria-hidden />
                <div className={k % 2 ? "md:pl-12" : "md:pr-12 md:text-right"}>
                  <p className="text-xs uppercase tracking-[0.2em] rtl:tracking-normal text-[var(--bronze)]">Step {words[k]}</p>
                  <h3 className="display mt-2 text-4xl md:text-5xl">{s.t}</h3>
                  <p className={`mt-3 max-w-sm text-sm text-[var(--surface)]/70 ${k % 2 ? "" : "md:ml-auto"}`}>{s.d}</p>
                </div>
                <div className={k % 2 ? "md:pr-12" : "md:pl-12"}>
                  <span className="relative block aspect-[16/10] max-w-md overflow-hidden"><Image src={s.img} alt="" fill sizes="(min-width:768px) 40vw, 100vw" className="object-cover" /></span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}