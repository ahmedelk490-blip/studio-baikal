"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { Btn } from "./Btn";
import type { Dict, Lang } from "@/data/i18n";

const srcs = ["/projects/october-250/05.webp", "/projects/el-nakhil-villa/01.webp", "/projects/tagamo3-115/04.webp"];

/* 500 m — expanding panels (light room). Three photo panels; the active one widens to 3x,
   its copy fades in and a bronze timer runs. Autoplays; hover or tap takes over. */
export function Services({ t, lang }: { t: Dict; lang: Lang }) {
  const [a, setA] = useState(0);
  const [hold, setHold] = useState(false);
  const items = t.services.items;
  const sec = useRef<HTMLElement>(null);
  useGSAP(() => { gsap.matchMedia().add("(min-width: 1024px)", () => { ScrollTrigger.create({ trigger: sec.current, start: "top top", end: "+=" + items.length * 45 + "%", pin: true, anticipatePin: 1, onUpdate: (st) => setA(Math.min(items.length - 1, Math.floor(st.progress * items.length))) }); }); }, { scope: sec });
  useEffect(() => { if (hold || matchMedia("(min-width: 1024px)").matches) return; const x = setInterval(() => setA((k) => (k + 1) % items.length), 5000); return () => clearInterval(x); }, [hold, items.length]);
  const u = "text-xs uppercase tracking-[0.16em] rtl:tracking-normal";
  return (
    <section ref={sec} id="services" data-depth={t.gauge.services} data-meters="500 m" className="bg-[var(--surface)] text-[var(--ink)] lg:h-[100svh] lg:overflow-hidden" onMouseLeave={() => setHold(false)}>
      <div className="px-5 py-16 md:px-10 md:py-24 lg:flex lg:h-full lg:flex-col lg:justify-center lg:py-10">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7"><p className="eyebrow text-xs uppercase tracking-[0.2em] rtl:tracking-normal text-[var(--bronze)]">{t.gauge.services}</p><h2 className="display mt-3 text-4xl md:text-6xl">{t.services.title}</h2></div>
          <p className="max-w-sm text-sm text-[var(--muted)] md:col-span-5">{t.services.intro}</p>
        </div>
        <div className="mt-10 flex flex-col gap-3 lg:h-[58vh] lg:flex-row">
          {items.map((it, k) => {
            const [title, d, list] = it as [string, string, string[]];
            const on = a === k;
            return (
              <button key={title} onMouseEnter={() => { setA(k); setHold(true); }} onClick={() => { setA(k); setHold(true); }} aria-current={on}
                className={`relative min-h-[24rem] overflow-hidden text-start text-[var(--surface)] transition-[flex-grow] duration-700 ease-[cubic-bezier(.76,0,.24,1)] lg:min-h-0 lg:basis-0 ${on ? "lg:grow-[3]" : "lg:grow"}`}>
                <Image src={srcs[k]} alt="" fill sizes="(min-width:1024px) 60vw, 100vw" className={`object-cover transition-transform duration-[1600ms] ${on ? "scale-100" : "scale-110"}`} />
                <span className="absolute inset-0 bg-gradient-to-t from-[var(--deep)]/90 via-[var(--deep)]/35 to-[var(--deep)]/10" />
                <span className="relative flex h-full flex-col justify-between p-6 md:p-8">
                  <span>
                    <span className={`${u} text-[var(--bronze)]`}>{t.services.labels[k]}</span>
                    <span className="display mt-3 block text-3xl md:text-4xl">{title}</span>
                  </span>
                  <span className={`block transition-opacity duration-500 ${on ? "opacity-100 delay-300" : "lg:opacity-0"}`}>
                    <span className="block max-w-md text-sm opacity-90">{d}</span>
                    <span className={`${u} mt-5 flex flex-wrap gap-x-4 gap-y-1 opacity-80`}>{list.map((l) => <span key={l}>{l}</span>)}</span>
                    {on && <span key={a} className="svc-progress mt-5 block h-px bg-[var(--bronze)]" aria-hidden />}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-8"><Btn href={`/${lang}#contact`} variant="dark">{t.nav.book}</Btn></div>
      </div>
    </section>
  );
}