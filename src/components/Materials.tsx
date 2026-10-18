"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import type { Dict } from "@/data/i18n";

const swatches = [["/projects/maadi-285/01.webp", "50% 40%"], ["/projects/maadi-180/01.webp", "50% 50%"], ["/projects/tagamo3-115/04.webp", "40% 75%"], ["/projects/el-nakhil-villa/01.webp", "30% 50%"], ["/projects/maadi-180/05.webp", "25% 50%"], ["/projects/october-250/01.webp", "60% 70%"]];

/* 800 m — the sample lens. A round material sample under a slowly turning bronze ring; the
   texture pans inside it. The list beside it drives the lens and autoplays. */
export function Materials({ t }: { t: Dict }) {
  const [a, setA0] = useState(0);
  const [prev, setPrev] = useState(0);
  const cur = useRef(0);
  const setA = (k: number) => { if (k === cur.current) return; setPrev(cur.current); cur.current = k; setA0(k); };
  const ref = useRef<HTMLElement>(null);
  useGSAP(() => {
    const pick = (st: ScrollTrigger) => setA(Math.min(swatches.length - 1, Math.floor(st.progress * swatches.length)));
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => { ScrollTrigger.create({ trigger: ref.current, start: "top top", end: "+=" + swatches.length * 35 + "%", pin: true, anticipatePin: 1, onUpdate: pick }); });
    mm.add("(max-width: 1023px)", () => { ScrollTrigger.create({ trigger: ref.current, start: "top 55%", end: "bottom 45%", onUpdate: pick }); });
    const sc = { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: 0.5 };
    gsap.to(".lens-ring", { rotate: 260, ease: "none", scrollTrigger: sc });
    gsap.to(".lens-ring2", { rotate: -200, ease: "none", scrollTrigger: sc });
    gsap.fromTo(".lens-disc", { scale: 0.78 }, { scale: 1.04, ease: "none", scrollTrigger: sc });
  }, { scope: ref });
  return (
    <section data-depth={t.gauge.materials} data-meters="800 m" data-deep="1" className="overflow-hidden bg-[#0F1A1E] text-[var(--surface)] lg:h-[100svh]" ref={ref}>
      <div className="grid gap-10 px-5 py-16 md:grid-cols-12 md:items-center md:px-10 md:py-24 lg:h-full lg:py-10">
        <div className="md:col-span-5">
          <h2 className="display text-5xl md:text-6xl">{t.materials.title}</h2>
          <p className="mt-5 max-w-sm text-sm text-[var(--surface)]/70">{t.materials.intro}</p>
          <ol className="mt-10">
            {t.materials.names.map((n, k) => (
              <li key={n} className="strata-row">
                <button onMouseEnter={() => setA(k)} onClick={() => setA(k)} aria-current={a === k} className={`block w-full py-2 text-start transition-colors duration-500 ${a === k ? "text-[var(--surface)]" : "text-[var(--surface)]/40"}`}>
                  <span className="display block text-2xl md:text-3xl">{n}</span>
                  <span className={`grid transition-[grid-template-rows] duration-500 ${a === k ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}><span className="overflow-hidden"><span className="block pt-1 text-sm text-[var(--surface)]/70">{t.materials.notes[k]}</span></span></span>
                </button>
              </li>
            ))}
          </ol>
        </div>
        <div className="md:col-span-7">
          <div className="relative mx-auto aspect-square w-full max-w-[min(520px,70vh)]">
            <div className="lens-ring absolute inset-0"><svg viewBox="0 0 100 100" className="spin h-full w-full" aria-hidden><circle cx="50" cy="50" r="49" fill="none" stroke="var(--bronze)" strokeWidth=".35" strokeDasharray="0.6 2.4" /></svg></div>
            <div className="lens-ring2 absolute -inset-[7%]"><svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden><circle cx="50" cy="50" r="49.5" fill="none" stroke="var(--surface)" strokeOpacity=".18" strokeWidth=".25" strokeDasharray="8 3 1 3" /></svg></div>
            <div className="lens-disc absolute inset-[6%] overflow-hidden rounded-full bg-[var(--deep)]">
              {/* the last sample stays underneath; the new one opens through its own shape */}
              <Image src={swatches[prev][0]} alt="" fill sizes="(min-width:1024px) 40vw, 90vw" className="lens-pan object-cover" style={{ objectPosition: swatches[prev][1] }} />
              <div key={a} className={`rv rv-${(a + 1) % 5} absolute inset-0`}>
                <Image src={swatches[a][0]} alt={t.materials.names[a]} fill sizes="(min-width:1024px) 40vw, 90vw" className="lens-pan object-cover" style={{ objectPosition: swatches[a][1] }} />
              </div>
              <div className="absolute inset-0 rounded-full shadow-[inset_0_0_80px_rgba(5,8,10,.7)]" />
            </div>
            <p key={a} className="hero-in absolute -bottom-2 start-1/2 -translate-x-1/2 whitespace-nowrap rtl:translate-x-1/2"><span className="text-xs uppercase tracking-[0.2em] rtl:tracking-normal text-[var(--bronze)]">{t.materials.names[a]}</span></p>
          </div>
        </div>
      </div>
    </section>
  );
}