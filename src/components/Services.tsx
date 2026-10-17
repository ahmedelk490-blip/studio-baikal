"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

const items = [
  { t: "3D Design Package", d: "Detailed drawings and elevations, furniture layouts and technical plans, photoreal 3D visuals and a full 360° virtual tour. You walk through your space before a single wall is touched.", img: "/projects/october-250/05.webp", list: ["Drawings & elevations", "Furniture layouts", "Photoreal 3D", "360° tour"] },
  { t: "Design & Execution", d: "We bring the design to life with careful coordination, site supervision and attention to every finish, so the final space matches the vision exactly.", img: "/projects/el-nakhil-villa/01.webp", list: ["Technical drawings", "Trusted contractors", "Site supervision", "Handover"] },
  { t: "Exterior & Landscape", d: "Facades, terraces and gardens designed in the same calm language as the interior, so the home reads as one piece.", img: "/projects/tagamo3-115/04.webp", list: ["Facades", "Terraces", "Gardens", "Lighting"] },
];

/* -500 m: three ways to work with us. Columns separated by hairlines; the active one carries the photo. */
export function Services() {
  const [a, setA] = useState(0);
  const [hold, setHold] = useState(false);
  useEffect(() => { if (hold) return; const t = setInterval(() => setA((x) => (x + 1) % items.length), 4500); return () => clearInterval(t); }, [hold]);
  return (
    <section id="services" data-depth="Services" data-meters="500 m" data-deep="1" className="bg-[var(--deep)] text-[var(--surface)]" onMouseLeave={() => setHold(false)}>
      <div className="px-5 py-24 md:px-10 md:py-32">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <h2 className="display text-5xl md:col-span-7 md:text-7xl">Three ways to begin.</h2>
          <p className="max-w-sm text-sm text-[var(--surface)]/70 md:col-span-5">Start with the 3D package, hand us the whole build, or extend the calm outside.</p>
        </div>
        <div className="mt-14 grid gap-px bg-[var(--surface)]/15 md:grid-cols-3">
          {items.map((s, k) => (
            <button key={s.t} onMouseEnter={() => { setA(k); setHold(true); }} onClick={() => { setA(k); setHold(true); }} aria-current={a === k}
              className={`group relative flex min-h-[26rem] flex-col justify-between overflow-hidden bg-[var(--deep)] p-6 text-left transition-colors duration-700 md:p-8 ${a === k ? "text-[var(--surface)]" : "text-[var(--surface)]/55"}`}>
              <Image src={s.img} alt="" fill sizes="(min-width:768px) 33vw, 100vw" className={`object-cover transition-opacity duration-1000 ${a === k ? "ken opacity-35" : "opacity-0"}`} />
              <span className="relative">
                <span className="text-xs uppercase tracking-[0.2em] rtl:tracking-normal text-[var(--bronze)]">{["Package", "Full service", "Outside"][k]}</span>
                <span className="display mt-3 block text-3xl md:text-4xl">{s.t}</span>
              </span>
              <span className="relative">
                <span className="block max-w-xs text-sm opacity-90">{s.d}</span>
                <span className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-xs uppercase tracking-[0.14em] rtl:tracking-normal opacity-80">{s.list.map((l) => <span key={l}>{l}</span>)}</span>
                {a === k && <span key={a} className="svc-progress mt-5 block h-px bg-[var(--bronze)]" aria-hidden />}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}