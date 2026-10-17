"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Project } from "@/data/projects";
import type { Dict, Lang } from "@/data/i18n";

/* 80 m: project strata. Rows like rock layers; the active row lights a full-bleed photo behind it. */
export function Strata({ projects, t, lang }: { projects: Project[]; t: Dict; lang: Lang }) {
  const [a, setA] = useState(0);
  const [hold, setHold] = useState(false);
  useEffect(() => { if (hold) return; const x = setInterval(() => setA((k) => (k + 1) % projects.length), 3600); return () => clearInterval(x); }, [hold, projects.length]);
  const u = "text-xs uppercase tracking-[0.16em] rtl:tracking-normal";
  return (
    <section id="projects" data-depth={t.gauge.projects} data-meters="80 m" data-deep="1" className="relative overflow-hidden bg-[var(--deep)] text-[var(--surface)]" onMouseLeave={() => setHold(false)}>
      <div className="absolute inset-0">
        {projects.map((x, k) => <Image key={x.slug} src={x.cover} alt="" fill sizes="100vw" className={`object-cover transition-opacity duration-1000 ${k === a ? "ken opacity-60" : "opacity-0"}`} />)}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--deep)] via-[var(--deep)]/55 to-[var(--deep)]" />
      </div>
      <div className="relative px-5 pb-20 pt-24 md:px-10 md:pb-28 md:pt-32">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <h2 className="display text-5xl md:col-span-7 md:text-7xl">{t.strata.title}</h2>
          <p className="max-w-sm text-sm text-[var(--surface)]/70 md:col-span-5">{t.strata.intro}</p>
        </div>
        <ol className="mt-14">
          {projects.map((x, k) => (
            <li key={x.slug} className="strata-row">
              <Link href={`/${lang}/projects/${x.slug}`} onMouseEnter={() => { setA(k); setHold(true); }} onFocus={() => { setA(k); setHold(true); }}
                className={`grid items-baseline gap-x-6 gap-y-1 py-5 transition-colors duration-500 md:grid-cols-12 md:py-6 ${k === a ? "text-[var(--surface)]" : "text-[var(--surface)]/45"}`}>
                <span className="display block text-3xl md:col-span-5 md:text-5xl">{x.name}</span>
                <span className={`${u} md:col-span-3`}>{x.location}</span>
                <span className={`${u} flex flex-wrap gap-x-5 md:col-span-3`}><span>{x.type}</span><span>{x.area}</span><span>{x.images.length} {t.strata.rooms}</span><span>{x.year}</span></span>
                <span className={`${u} hidden text-end md:col-span-1 md:block ${k === a ? "text-[var(--bronze)]" : ""}`}>{k === a ? t.strata.open : ""}</span>
              </Link>
            </li>
          ))}
        </ol>
        <p className="mt-8 max-w-md text-sm text-[var(--surface)]/70">{projects[a].blurb}</p>
      </div>
    </section>
  );
}