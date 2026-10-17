"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Project } from "@/data/projects";
import type { Dict, Lang } from "@/data/i18n";

const SLICES = 7;

/* 80 m — project strata. Rows like rock layers; the active home drops in behind them as
   vertical blinds (staggered clip-path), over the previous one. */
export function Strata({ projects, t, lang }: { projects: Project[]; t: Dict; lang: Lang }) {
  const [a, setA] = useState(0);
  const [prev, setPrev] = useState(0);
  const cur = useRef(0);
  const [hold, setHold] = useState(false);
  const go = (k: number) => { if (k === cur.current) return; setPrev(cur.current); cur.current = k; setA(k); };
  useEffect(() => { if (hold) return; const x = setInterval(() => go((cur.current + 1) % projects.length), 3600); return () => clearInterval(x); }, [hold, projects.length]);
  const u = "text-xs uppercase tracking-[0.16em] rtl:tracking-normal";
  return (
    <section id="projects" data-depth={t.gauge.projects} data-meters="80 m" data-deep="1" className="relative overflow-hidden bg-[var(--deep)] text-[var(--surface)]" onMouseLeave={() => setHold(false)}>
      <div className="absolute inset-0 opacity-60">
        <Image src={projects[prev].cover} alt="" fill sizes="100vw" className="object-cover" />
        <div key={a} dir="ltr" className="absolute inset-0 flex">
          {Array.from({ length: SLICES }).map((_, k) => (
            <span key={k} className="blind relative h-full flex-1 overflow-hidden" style={{ animationDelay: `${k * 0.06}s` }}>
              <span className="absolute inset-y-0 bg-cover bg-center" style={{ width: `${SLICES * 100}%`, left: `-${k * 100}%`, backgroundImage: `url(${projects[a].cover})` }} />
            </span>
          ))}
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--deep)] via-[var(--deep)]/50 to-[var(--deep)]" />
      <div className="relative px-5 pb-20 pt-24 md:px-10 md:pb-28 md:pt-32">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <h2 className="display text-5xl md:col-span-7 md:text-7xl">{t.strata.title}</h2>
          <p className="max-w-sm text-sm text-[var(--surface)]/70 md:col-span-5">{t.strata.intro}</p>
        </div>
        <ol className="mt-14">
          {projects.map((x, k) => (
            <li key={x.slug} className="strata-row">
              <Link href={`/${lang}/projects/${x.slug}`} onMouseEnter={() => { go(k); setHold(true); }} onFocus={() => { go(k); setHold(true); }}
                className={`group grid items-baseline gap-x-6 gap-y-1 py-5 transition-colors duration-500 md:grid-cols-12 md:py-6 ${k === a ? "text-[var(--surface)]" : "text-[var(--surface)]/45"}`}>
                <span className="display block text-3xl transition-transform duration-500 md:col-span-5 md:text-5xl" style={{ transform: k === a ? "translateX(0.4em)" : "none" }}>{x.name}</span>
                <span className={`${u} md:col-span-3`}>{x.location}</span>
                <span className={`${u} flex flex-wrap gap-x-5 md:col-span-3`}><span>{x.type}</span><span>{x.area}</span><span>{x.images.length} {t.strata.rooms}</span><span>{x.year}</span></span>
                <span className={`${u} hidden text-end md:col-span-1 md:block ${k === a ? "text-[var(--bronze)]" : ""}`}>{k === a ? t.strata.open : ""}</span>
              </Link>
            </li>
          ))}
        </ol>
        <p key={a} className="hero-in mt-8 max-w-md text-sm text-[var(--surface)]/75"><span>{projects[a].blurb}</span></p>
      </div>
    </section>
  );
}