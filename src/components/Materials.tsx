"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { Dict } from "@/data/i18n";

const swatches = [["/projects/maadi-285/01.webp", "50% 40%"], ["/projects/maadi-180/01.webp", "50% 50%"], ["/projects/tagamo3-115/04.webp", "40% 75%"], ["/projects/el-nakhil-villa/01.webp", "30% 50%"], ["/projects/maadi-180/05.webp", "25% 50%"], ["/projects/october-250/01.webp", "60% 70%"]];

/* 800 m — the sample lens. A round material sample under a slowly turning bronze ring; the
   texture pans inside it. The list beside it drives the lens and autoplays. */
export function Materials({ t }: { t: Dict }) {
  const [a, setA] = useState(0);
  const [hold, setHold] = useState(false);
  useEffect(() => { if (hold) return; const x = setInterval(() => setA((k) => (k + 1) % swatches.length), 2800); return () => clearInterval(x); }, [hold]);
  return (
    <section data-depth={t.gauge.materials} data-meters="800 m" data-deep="1" className="overflow-hidden bg-[#0F1A1E] text-[var(--surface)]" onMouseLeave={() => setHold(false)}>
      <div className="grid gap-12 px-5 py-24 md:grid-cols-12 md:items-center md:px-10 md:py-32">
        <div className="md:col-span-5">
          <h2 className="display text-5xl md:text-7xl">{t.materials.title}</h2>
          <p className="mt-5 max-w-sm text-sm text-[var(--surface)]/70">{t.materials.intro}</p>
          <ol className="mt-10">
            {t.materials.names.map((n, k) => (
              <li key={n} className="strata-row">
                <button onMouseEnter={() => { setA(k); setHold(true); }} onClick={() => { setA(k); setHold(true); }} aria-current={a === k} className={`block w-full py-3 text-start transition-colors duration-500 ${a === k ? "text-[var(--surface)]" : "text-[var(--surface)]/40"}`}>
                  <span className="display block text-2xl md:text-3xl">{n}</span>
                  <span className={`grid transition-[grid-template-rows] duration-500 ${a === k ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}><span className="overflow-hidden"><span className="block pt-1 text-sm text-[var(--surface)]/70">{t.materials.notes[k]}</span></span></span>
                </button>
              </li>
            ))}
          </ol>
        </div>
        <div className="md:col-span-7">
          <div className="relative mx-auto aspect-square w-full max-w-[560px]">
            <svg viewBox="0 0 100 100" className="spin absolute inset-0 h-full w-full" aria-hidden><circle cx="50" cy="50" r="49" fill="none" stroke="var(--bronze)" strokeWidth=".35" strokeDasharray="0.6 2.4" /></svg>
            <div className="absolute inset-[6%] overflow-hidden rounded-full bg-[var(--deep)]">
              {swatches.map(([src, pos], k) => (
                <div key={src} className={`absolute inset-0 transition-opacity duration-700 ${a === k ? "opacity-100" : "opacity-0"}`}>
                  <Image src={src} alt={t.materials.names[k]} fill sizes="560px" className="lens-pan object-cover" style={{ objectPosition: pos }} />
                </div>
              ))}
              <div className="absolute inset-0 rounded-full shadow-[inset_0_0_80px_rgba(5,8,10,.7)]" />
            </div>
            <p key={a} className="hero-in absolute -bottom-2 start-1/2 -translate-x-1/2 whitespace-nowrap rtl:translate-x-1/2"><span className="text-xs uppercase tracking-[0.2em] rtl:tracking-normal text-[var(--bronze)]">{t.materials.names[a]}</span></p>
          </div>
        </div>
      </div>
    </section>
  );
}