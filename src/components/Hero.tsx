"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const rooms = [
  { src: "/projects/october-250/01.webp", label: "Reception" },
  { src: "/projects/el-nakhil-villa/01.webp", label: "Classic dining" },
  { src: "/projects/maadi-285/01.webp", label: "Coffee bar" },
  { src: "/projects/maadi-180/05.webp", label: "Home bar" },
];
const EVERY = 4200;

/* Surface: headline + intro sit on the "waterline" above a full-bleed, self-changing room.
   The line is the only ornament; the image is the colour. */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI((x) => (x + 1) % rooms.length), EVERY); return () => clearInterval(t); }, []);
  useGSAP(() => {
    gsap.timeline({ delay: 0.15 })
      .from(".h-line > span", { yPercent: 115, duration: 1.2, ease: "power4.out", stagger: 0.12 })
      .from(".h-fade", { opacity: 0, y: 16, duration: 0.8, ease: "power3.out", stagger: 0.08 }, "-=0.7")
      .from(stage.current, { clipPath: "inset(0 0 100% 0)", duration: 1.3, ease: "expo.inOut" }, "-=0.9");
    gsap.to(".h-img", { yPercent: 14, ease: "none", scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom top", scrub: true } });
    gsap.matchMedia().add("(pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const x = gsap.quickTo(".h-img", "x", { duration: 1.4, ease: "power3.out" });
      const move = (e: MouseEvent) => x((e.clientX / innerWidth - 0.5) * -24);
      addEventListener("mousemove", move);
      return () => removeEventListener("mousemove", move);
    });
  }, { scope: ref });

  return (
    <section ref={ref} data-depth="Surface" data-meters="0 m" className="relative bg-[var(--surface)] pt-24 md:pt-32">
      <div className="px-5 md:px-10">
        <div className="waterline grid gap-6 pb-6 md:grid-cols-12 md:items-end md:pb-8">
          <h1 className="display text-[14vw] leading-[1.02] md:col-span-8 md:text-[8.6vw] lg:text-[7.4vw]">
            <span className="h-line block overflow-hidden"><span className="block">Where design</span></span>
            <span className="h-line block overflow-hidden"><span className="block italic text-[var(--bronze)]">meets depth.</span></span>
          </h1>
          <div className="md:col-span-4 md:pb-3">
            <p className="h-fade max-w-xs text-sm leading-relaxed text-[var(--muted)]">Interior &amp; exterior spaces inspired by nature, rooted in structure. Villas, apartments and clinics, designed and built across Egypt.</p>
            <div className="h-fade mt-5 flex flex-wrap gap-x-6 gap-y-3 text-xs uppercase tracking-[0.2em] rtl:tracking-normal">
              <a href="#contact" className="inline-block border-b border-[var(--ink)] py-2">Book a free consultation</a>
              <a href="#projects" className="inline-block border-b border-transparent py-2 text-[var(--muted)]">See the projects</a>
            </div>
          </div>
        </div>
      </div>
      <div ref={stage} className="relative mt-2 h-[72svh] overflow-hidden bg-[var(--deep)] md:h-[84svh]">
        <div className="h-img absolute -inset-x-[3%] -inset-y-[8%]">
          {rooms.map((r, k) => (
            <Image key={r.src} src={r.src} alt={r.label} fill priority={k === 0} sizes="100vw" className={`object-cover transition-opacity duration-[1400ms] ease-out ${k === i ? "ken opacity-100" : "opacity-0"}`} />
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--deep)]/80 to-transparent" />
        <ol className="absolute bottom-6 left-5 right-5 flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-[0.18em] rtl:tracking-normal text-[var(--surface)] md:left-10 md:right-24 lg:right-32" aria-label="You are in">
          {rooms.map((r, k) => (
            <li key={r.label} className={`relative pb-2 transition-opacity ${k === i ? "opacity-100" : "opacity-45"}`}>
              {r.label}
              {k === i && <span key={i} className="tour-line absolute bottom-0 left-0 h-px w-full bg-[var(--bronze)]" aria-hidden />}
            </li>
          ))}
          <li className="ml-auto hidden items-center gap-2 opacity-70 md:flex"><span className="sink inline-block">&#8595;</span> Descend</li>
        </ol>
      </div>
    </section>
  );
}