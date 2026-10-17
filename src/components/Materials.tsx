"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const swatches = [
  { n: "Walnut", src: "/projects/maadi-285/01.webp", pos: "50% 40%" },
  { n: "Travertine", src: "/projects/maadi-180/01.webp", pos: "50% 50%" },
  { n: "Boucle", src: "/projects/tagamo3-115/04.webp", pos: "40% 75%" },
  { n: "Brass & black steel", src: "/projects/el-nakhil-villa/01.webp", pos: "30% 50%" },
  { n: "Green glazed tile", src: "/projects/maadi-180/05.webp", pos: "25% 50%" },
  { n: "Linen & rattan", src: "/projects/october-250/01.webp", pos: "60% 70%" },
];

/* -800 m: the sediment. Six edge-to-edge material squares; one glows at a time. */
export function Materials() {
  const ref = useRef<HTMLElement>(null);
  const [a, setA] = useState(0);
  useEffect(() => { const t = setInterval(() => setA((x) => (x + 1) % swatches.length), 2200); return () => clearInterval(t); }, []);
  useGSAP(() => { gsap.from(".sw", { opacity: 0, y: 40, duration: 0.9, stagger: 0.08, ease: "power3.out", scrollTrigger: { trigger: ref.current, start: "top 70%" } }); }, { scope: ref });
  return (
    <section ref={ref} data-depth="Materials" data-meters="800 m" data-deep="1" className="bg-[#0F1A1E] text-[var(--surface)]">
      <div className="grid gap-6 px-5 pt-24 md:grid-cols-12 md:items-end md:px-10 md:pt-32">
        <h2 className="display text-5xl md:col-span-7 md:text-7xl">Materials we return to.</h2>
        <p className="max-w-sm text-sm text-[var(--surface)]/70 md:col-span-5">Natural, tactile and made to age well. Every project starts from this palette and adds one surprise.</p>
      </div>
      <ul className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {swatches.map((s, k) => (
          <li key={s.n} className="sw relative">
            <span className="relative block aspect-square overflow-hidden">
              <Image src={s.src} alt={s.n} fill sizes="(min-width:1024px) 16vw, (min-width:640px) 33vw, 50vw" className={`object-cover transition-[filter,transform] duration-700 ${a === k ? "brightness-110" : "brightness-[.55]"}`} style={{ objectPosition: s.pos, transform: "scale(2.2)" }} />
            </span>
            <span className="absolute bottom-3 left-3 text-xs uppercase tracking-[0.16em] rtl:tracking-normal">{s.n}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}