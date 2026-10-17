"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { Btn } from "./Btn";
import type { Project } from "@/data/projects";
import type { Dict, Lang } from "@/data/i18n";

const SLICES = 7;

/* 80 m: project strata. The page stops here and the wheel walks through every project; each one
   drops in behind the list as vertical blinds. Fits one screen on phone and desktop. */
export function Strata({ projects, t, lang }: { projects: Project[]; t: Dict; lang: Lang }) {
  const [a, setA] = useState(0);
  const [prev, setPrev] = useState(0);
  const cur = useRef(0);
  const sec = useRef<HTMLElement>(null);
  const go = (k: number) => { if (k === cur.current) return; setPrev(cur.current); cur.current = k; setA(k); };
  useGSAP(() => {
    ScrollTrigger.create({ trigger: sec.current, start: "top top", end: "+=" + projects.length * 32 + "%", pin: true, anticipatePin: 1,
      onUpdate: (st) => go(Math.min(projects.length - 1, Math.floor(st.progress * projects.length))) });
  }, { scope: sec });
  const p = projects[a];
  const u = "text-xs uppercase tracking-[0.16em] rtl:tracking-normal";
  return (
    <section ref={sec} id="projects" data-depth={t.gauge.projects} data-meters="80 m" data-deep="1" className="relative h-[100svh] overflow-hidden bg-[var(--deep)] text-[var(--surface)]">
      <div className="absolute inset-0 opacity-60">
        <Image src={projects[prev].cover} alt="" fill sizes="100vw" className="object-cover" />
        <div key={a} dir="ltr" className="absolute inset-0 flex">
          {Array.from({ length: SLICES }).map((_, k) => (
            <span key={k} className="blind relative h-full flex-1 overflow-hidden" style={{ animationDelay: `${k * 0.05}s` }}>
              <span className="absolute inset-y-0 bg-cover bg-center" style={{ width: `${SLICES * 100}%`, left: `-${k * 100}%`, backgroundImage: `url(${p.cover}?v=2)` }} />
            </span>
          ))}
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--deep)] via-[var(--deep)]/75 to-[var(--deep)]/35 rtl:bg-gradient-to-l" />
      <div className="relative grid h-full content-center gap-6 px-5 py-20 md:px-10 lg:grid-cols-12 lg:items-center lg:gap-12">
        <div className="lg:col-span-4">
          <div className="flex items-center justify-between"><p className={`${u} text-[var(--bronze)]`}>{t.gauge.projects}</p><p className="text-xs text-[var(--surface)]/60" dir="ltr">{a + 1} / {projects.length}</p></div>
          <h2 className="display mt-3 text-4xl md:text-6xl">{t.strata.title}</h2>
          <p key={a} className="hero-in mt-4 hidden max-w-sm text-sm text-[var(--surface)]/80 md:block"><span>{p.blurb}</span></p>
          <div className="mt-6 hidden lg:block"><Btn href={`/${lang}/projects/${p.slug}`}>{p.name}</Btn></div>
        </div>
        <ol className="lg:col-span-8">
          {projects.map((x, k) => (
            <li key={x.slug} className="strata-row">
              <Link href={`/${lang}/projects/${x.slug}`} onMouseEnter={() => go(k)} onFocus={() => go(k)}
                className={`grid grid-cols-[1fr_auto] items-baseline gap-x-6 py-1.5 transition-colors duration-500 md:grid-cols-12 md:py-2 ${k === a ? "text-[var(--surface)]" : "text-[var(--surface)]/40"}`}>
                <span className="display block text-xl transition-transform duration-500 md:col-span-6 md:text-3xl" style={{ transform: k === a ? "translateX(0.35em)" : "none" }}>{x.name}</span>
                <span className={`${u} hidden md:col-span-4 md:block`}>{x.location}</span>
                <span className={`${u} text-end md:col-span-2`}>{x.area}</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}