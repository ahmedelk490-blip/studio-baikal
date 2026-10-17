"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { Btn } from "./Btn";
import type { Project } from "@/data/projects";
import type { Dict, Lang } from "@/data/i18n";

/* 80 m: project strata. A clean list on solid deep; beside it three rooms of the active project
   cascade in (big + two small), each from a different edge. The page stops here while the wheel walks every project. */
export function Strata({ projects, t, lang }: { projects: Project[]; t: Dict; lang: Lang }) {
  const [a, setA] = useState(0);
  const cur = useRef(0);
  const sec = useRef<HTMLElement>(null);
  const go = (k: number) => { if (k === cur.current) return; cur.current = k; setA(k); };
  useGSAP(() => {
    ScrollTrigger.create({ trigger: sec.current, start: "top top", end: "+=" + projects.length * 32 + "%", pin: true, anticipatePin: 1,
      onUpdate: (st) => go(Math.min(projects.length - 1, Math.floor(st.progress * projects.length))) });
  }, { scope: sec });
  const p = projects[a];
  const land = p.images.filter((i) => i.w >= i.h);
  const shots = [p.images.find((i) => i.src === p.cover) ?? land[0] ?? p.images[0], ...land.filter((i) => i.src !== p.cover)].filter(Boolean).slice(0, 3);
  const u = "text-xs uppercase tracking-[0.16em] rtl:tracking-normal";
  return (
    <section ref={sec} id="projects" data-depth={t.gauge.projects} data-meters="80 m" data-deep="1" className="relative h-[100svh] overflow-hidden bg-[var(--deep)] text-[var(--surface)]">
      <div className="grid h-full content-center gap-5 px-5 pb-6 pt-24 md:px-10 md:pt-28 lg:grid-cols-12 lg:items-center lg:gap-12 lg:pb-10 lg:pt-28">
        <div className="lg:col-span-5">
          <div className="flex items-end justify-between gap-4">
            <h2 className="display text-3xl md:text-5xl">{t.strata.title}</h2>
            <p className="text-xs text-[var(--surface)]/60" dir="ltr">{a + 1} / {projects.length}</p>
          </div>
          <ol className="mt-4 md:mt-6">
            {projects.map((x, k) => (
              <li key={x.slug} className="strata-row">
                <Link href={`/${lang}/projects/${x.slug}`} onMouseEnter={() => go(k)} onFocus={() => go(k)}
                  className={`flex items-baseline justify-between gap-4 py-1 transition-colors duration-500 md:py-1.5 ${k === a ? "text-[var(--surface)]" : "text-[var(--surface)]/40 hover:text-[var(--surface)]/70"}`}>
                  <span className="flex items-baseline gap-3">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors ${k === a ? "bg-[var(--bronze)]" : "bg-transparent"}`} aria-hidden />
                    <span className="text-base font-medium md:text-xl">{x.name}</span>
                  </span>
                  <span className="text-xs" dir="ltr">{x.area}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
        <div className="lg:col-span-7">
          <div key={a} className="cascade grid h-[22svh] grid-cols-3 grid-rows-2 gap-2 md:h-auto md:aspect-[16/10] md:gap-3">
            {shots.map((im, i) => (
              <div key={im.src} className={`relative overflow-hidden rounded-xl bg-[var(--deeper)] ${i === 0 ? "col-span-2 row-span-2" : ""}`} style={{ animationDelay: `${i * 0.12}s` }}>
                <Image src={im.src} alt={`${p.name}, ${im.room}`} fill sizes={i === 0 ? "(min-width:1024px) 38vw, 66vw" : "(min-width:1024px) 18vw, 33vw"} className="object-cover" />
                <span className="absolute bottom-2 start-2 rounded-full bg-[var(--deep)]/70 px-2.5 py-1 text-xs text-[var(--surface)]">{im.room}</span>
              </div>
            ))}
          </div>
          <div key={`c${a}`} className="hero-in mt-4 flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <p className={`${u} text-[var(--bronze)]`}>{p.type} · {p.location}</p>
              <p className="mt-2 hidden max-w-xl text-sm text-[var(--surface)]/75 md:block">{p.blurb}</p>
            </div>
            <div className="hidden lg:block"><Btn href={`/${lang}/projects/${p.slug}`}>{t.strata.open}</Btn></div>
          </div>
        </div>
      </div>
    </section>
  );
}