"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import type { Dict } from "@/data/i18n";

/* Landscape renders only, so object-cover in a 16:9 frame shows the whole room. */
const shots = ["/projects/october-250/04.webp", "/projects/october-250/05.webp", "/projects/tagamo3-115/04.webp", "/projects/el-nakhil-villa/01.webp"];

/* 1,100 m — pinned split: the four steps on one side, one room per step on the other.
   Each new step wipes its room in over the last (arch-slide), a bronze bar tracks progress. */
export function Approach({ t }: { t: Dict }) {
  const ref = useRef<HTMLElement>(null);
  const N = shots.length;
  const [a, setA] = useState(0);
  const [prev, setPrev] = useState(0);
  const cur = useRef(0);
  const go = (k: number) => { if (k === cur.current) return; setPrev(cur.current); cur.current = k; setA(k); };
  useGSAP(() => {
    ScrollTrigger.create({ trigger: ref.current, start: "top top", end: "+=" + N * 50 + "%", pin: true, anticipatePin: 1, onUpdate: (st) => go(Math.min(N - 1, Math.floor(st.progress * N))) });
  }, { scope: ref });
  const u = "text-xs uppercase tracking-[0.2em] rtl:tracking-normal";
  return (
    <section ref={ref} id="approach" data-depth={t.gauge.approach} data-meters="1,100 m" data-deep="1" className="relative h-[100svh] overflow-hidden bg-[var(--deep)] text-[var(--surface)]">
      <div className="grid h-full content-center gap-6 px-5 py-16 md:px-10 lg:grid-cols-12 lg:items-center lg:gap-12">
        <div className="lg:order-2 lg:col-span-7">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-[var(--deeper)]">
            <Image src={shots[prev]} alt="" fill sizes="(min-width:1024px) 55vw, 100vw" className="object-cover" />
            <div key={a} className="arch-slide absolute inset-0"><Image src={shots[a]} alt={t.approach.steps[a][0]} fill sizes="(min-width:1024px) 55vw, 100vw" className="object-cover" /></div>
          </div>
        </div>
        <div className="lg:order-1 lg:col-span-5">
          <p className={`${u} text-[var(--bronze)]`}>{t.gauge.approach}</p>
          <h2 className="display mt-2 text-3xl md:text-4xl lg:text-5xl">{t.approach.title}</h2>
          <ol className="mt-5 md:mt-7">
            {t.approach.steps.map(([title, d], k) => (
              <li key={title} className="border-t border-[var(--surface)]/15">
                <button onClick={() => go(k)} aria-current={a === k} className={`flex w-full items-baseline gap-4 py-2.5 text-start transition-colors duration-500 md:py-3 ${a === k ? "text-[var(--surface)]" : "text-[var(--surface)]/35 hover:text-[var(--surface)]/70"}`}>
                  <span className={`${u} w-24 shrink-0 ${a === k ? "text-[var(--bronze)]" : ""}`}>{t.approach.step} {t.approach.words[k]}</span>
                  <span className="min-w-0">
                    <span className="display block text-2xl md:text-3xl">{title}</span>
                    <span className={`grid transition-[grid-template-rows] duration-500 ${a === k ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}><span className="overflow-hidden"><span className="block pt-1 text-sm text-[var(--surface)]/70">{d}</span></span></span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <div className="mt-3 h-px bg-[var(--surface)]/15"><div className="h-px bg-[var(--bronze)] transition-[width] duration-500" style={{ width: `${((a + 1) / N) * 100}%` }} /></div>
        </div>
      </div>
    </section>
  );
}