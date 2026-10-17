"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { Btn } from "./Btn";
import type { Project } from "@/data/projects";
import type { Dict, Lang } from "@/data/i18n";

const SLICES = 7;

/* 80 m: project strata. Split, no text on photos: a clean list on solid deep, and a framed photo
   that drops in as vertical blinds. The page stops here while the wheel walks every project. */
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
      <div className="grid h-full content-center gap-5 px-5 pb-6 pt-20 md:px-10 lg:grid-cols-12 lg:items-center lg:gap-12 lg:py-16">
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
          <div className="relative h-[22svh] overflow-hidden rounded-2xl bg-[var(--deeper)] md:h-auto md:aspect-[16/10]">
            <Image src={projects[prev].cover} alt="" fill sizes="(min-width:1024px) 55vw, 100vw" className="object-cover" />
            <div key={a} dir="ltr" className="absolute inset-0 flex">
              {Array.from({ length: SLICES }).map((_, k) => (
                <span key={k} className="blind relative h-full flex-1 overflow-hidden" style={{ animationDelay: `${k * 0.05}s` }}>
                  <span className="absolute inset-y-0 bg-cover bg-center" style={{ width: `${SLICES * 100}%`, left: `-${k * 100}%`, backgroundImage: `url(${p.cover}?v=2)` }} />
                </span>
              ))}
            </div>
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