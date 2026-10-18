"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { PagesDict } from "@/data/pages";

const opts = [
  { src: "/projects/zayed-160/07.webp", sw: ["#5a3b27", "#efebe4", "#141414"] },
  { src: "/projects/maadi-285/05.webp", sw: ["#8a8580", "#e9e4dc", "#b08d57"] },
  { src: "/projects/hadayek-el-ahram-200/03.webp", sw: ["#ece4d6", "#1d1d1d", "#3a3a3a"] },
  { src: "/projects/mountain-view-ivilla-235/03.webp", sw: ["#c9a77c", "#f4f1ec", "#a7a9ab"] },
];

/* State-driven palette configurator: choosing a palette swaps the kitchen render and re-writes the
   cabinetry / stone / trim / lighting table (each value lifts in). Cycles by itself until touched. */
export function Configurator({ c }: { c: PagesDict["config"] }) {
  const [a, setA] = useState(0);
  const [hold, setHold] = useState(false);
  useEffect(() => { if (hold) return; const x = setInterval(() => setA((k) => (k + 1) % opts.length), 3800); return () => clearInterval(x); }, [hold]);
  const o = c.options[a];
  const u = "text-xs uppercase tracking-[0.16em] rtl:tracking-normal";
  return (
    <section data-depth={c.eyebrow} data-meters="650 m" data-deep="1" className="bg-[var(--deep)] text-[var(--surface)]">
      <div className="grid gap-10 px-5 py-16 md:px-10 md:py-24 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <p className={`${u} eyebrow text-[var(--bronze)]`}>{c.eyebrow}</p>
          <h2 className="display mt-3 text-4xl md:text-6xl">{c.title}</h2>
          <p className="mt-4 max-w-md text-sm text-[var(--surface)]/75">{c.intro}</p>
          <div role="radiogroup" aria-label={c.eyebrow} className="mt-8 grid gap-2">
            {c.options.map((op, k) => (
              <button key={op.name} role="radio" aria-checked={a === k} onClick={() => { setA(k); setHold(true); }}
                className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-start transition-colors ${a === k ? "border-[var(--bronze)] bg-[var(--surface)]/5" : "border-[var(--surface)]/15 hover:border-[var(--surface)]/40"}`}>
                <span className="display text-xl md:text-2xl">{op.name}</span>
                <span className="flex">{opts[k].sw.map((col) => <span key={col} className="-ms-1.5 h-6 w-6 rounded-full border-2 border-[var(--deep)] first:ms-0" style={{ background: col }} />)}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="lg:col-span-7">
          <div className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-[var(--deeper)]">
            {opts.map((op, k) => <Image key={op.src} src={op.src} alt={`${c.room}, ${c.options[k].name}`} fill sizes="(min-width:1024px) 58vw, 100vw" className={`object-cover transition-[opacity,transform] duration-700 ${k === a ? "scale-100 opacity-100" : "scale-105 opacity-0"}`} />)}
            <span className={`${u} absolute start-4 top-4 rounded-full bg-[var(--deep)]/70 px-3 py-1.5`}>{c.room} · {o.name}</span>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-[var(--surface)]/15 md:grid-cols-4">
            {c.fields.map((f, j) => (
              <div key={f} className="bg-[var(--deep)] p-4">
                <dt className={`${u} text-[var(--surface)]/55`}>{f}</dt>
                <dd key={a} className="cfg-swap mt-1 text-sm font-semibold" style={{ animationDelay: `${j * 80}ms` }}>{o.spec[j]}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
