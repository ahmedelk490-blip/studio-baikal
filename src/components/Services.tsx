"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { Dict, Lang } from "@/data/i18n";

const srcs = ["/projects/october-250/05.webp", "/projects/el-nakhil-villa/01.webp", "/projects/tagamo3-115/04.webp"];

/* 500 m: three ways to begin. Hairline columns; the active one carries the photo. */
export function Services({ t, lang }: { t: Dict; lang: Lang }) {
  const [a, setA] = useState(0);
  const [hold, setHold] = useState(false);
  const items = t.services.items;
  useEffect(() => { if (hold) return; const x = setInterval(() => setA((k) => (k + 1) % items.length), 4500); return () => clearInterval(x); }, [hold, items.length]);
  return (
    <section id="services" data-depth={t.gauge.services} data-meters="500 m" data-deep="1" className="bg-[var(--deep)] text-[var(--surface)]" onMouseLeave={() => setHold(false)}>
      <div className="px-5 py-24 md:px-10 md:py-32">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <h2 className="display text-5xl md:col-span-7 md:text-7xl">{t.services.title}</h2>
          <p className="max-w-sm text-sm text-[var(--surface)]/70 md:col-span-5">{t.services.intro}</p>
        </div>
        <div className="mt-14 grid gap-px bg-[var(--surface)]/15 md:grid-cols-3">
          {items.map((it, k) => { const [title, d, list] = it as [string, string, string[]]; return (
            <button key={title} onMouseEnter={() => { setA(k); setHold(true); }} onClick={() => { setA(k); setHold(true); }} aria-current={a === k}
              className={`group relative flex min-h-[26rem] flex-col justify-between overflow-hidden bg-[var(--deep)] p-6 text-start transition-colors duration-700 md:p-8 ${a === k ? "text-[var(--surface)]" : "text-[var(--surface)]/55"}`}>
              <Image src={srcs[k]} alt="" fill sizes="(min-width:768px) 33vw, 100vw" className={`object-cover transition-opacity duration-1000 ${a === k ? "ken opacity-35" : "opacity-0"}`} />
              <span className="relative">
                <span className="text-xs uppercase tracking-[0.2em] rtl:tracking-normal text-[var(--bronze)]">{t.services.labels[k]}</span>
                <span className="display mt-3 block text-3xl md:text-4xl">{title}</span>
              </span>
              <span className="relative">
                <span className="block max-w-xs text-sm opacity-90">{d}</span>
                <span className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-xs uppercase tracking-[0.14em] rtl:tracking-normal opacity-80">{(list as string[]).map((l) => <span key={l}>{l}</span>)}</span>
                {a === k && <span key={a} className="svc-progress mt-5 block h-px bg-[var(--bronze)]" aria-hidden />}
              </span>
            </button>
          ); })}
        </div>
        <a href={`/${lang}#contact`} className="mt-8 inline-block border-b border-[var(--bronze)] py-2 text-xs uppercase tracking-[0.2em] rtl:tracking-normal">{t.nav.book}</a>
      </div>
    </section>
  );
}