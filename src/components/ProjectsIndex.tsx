"use client";
import Link from "next/link";
import { useState } from "react";
import { MaskReveal } from "./MaskReveal";
import { ShapeCycle } from "./ShapeCycle";
import type { Project } from "@/data/projects";
import type { Lang } from "@/data/i18n";
import type { PagesDict } from "@/data/pages";

type Row = Project & { kind: string };
type Facts = { area: string; rooms: string; year: string };

/* Projects page. Hero: title beside a Baikal arch that keeps cycling every project's cover through
   the shape reveals. Archive: type filters, then one wide row per home whose frame opens with a mask
   reveal on scroll and then plays through that home's rooms by itself, each row on its own rhythm.
   No text sits on the photos; facts are labelled beside them. */
export function ProjectsIndex({ rows, lang, p, facts }: { rows: Row[]; lang: Lang; p: PagesDict["projects"]; facts: Facts }) {
  const [f, setF] = useState("all");
  const kinds = ["all", ...Array.from(new Set(rows.map((r) => r.kind)))];
  const list = f === "all" ? rows : rows.filter((r) => r.kind === f);
  const u = "text-xs uppercase tracking-[0.18em] rtl:tracking-normal";
  const covers = rows.map((r) => r.cover).filter(Boolean).slice(0, 8);
  return (
    <section className="bg-[var(--surface)] text-[var(--ink)]">
      <div className="px-5 pb-10 pt-28 md:px-10 md:pt-36">
        <div className="grid items-end gap-10 md:grid-cols-12">
          <div className="hero-in md:col-span-7 lg:col-span-8">
            <p className={`${u} eyebrow text-[var(--bronze)]`}>{p.eyebrow}</p>
            <h1 className="display mt-4 text-5xl md:text-7xl lg:text-8xl">{p.title}</h1>
            <p className="mt-6 max-w-md text-sm text-[var(--muted)]">{p.intro}</p>
          </div>
          {covers.length > 0 && <ShapeCycle imgs={covers} every={3000} sizes="(min-width:768px) 30vw, 70vw" className="mx-auto aspect-[4/5] w-full max-w-[16rem] rounded-b-2xl rounded-t-full ring-1 ring-[var(--bronze)]/35 md:col-span-5 md:max-w-xs lg:col-span-4" />}
        </div>
        <div className="mt-12 flex flex-wrap gap-2" role="group" aria-label={p.all}>
          {kinds.map((k) => (
            <button key={k} onClick={() => setF(k)} aria-pressed={f === k} className={`min-h-11 rounded-full border px-5 text-sm transition-colors ${f === k ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--surface)]" : "border-[var(--ink)]/20 hover:border-[var(--ink)]/50"}`}>
              {k === "all" ? p.all : p.filters[k] ?? k} <span className="opacity-60" dir="ltr">({k === "all" ? rows.length : rows.filter((r) => r.kind === k).length})</span>
            </button>
          ))}
        </div>
      </div>
      <ol key={f} className="px-5 pb-20 md:px-10">
        {list.map((r, i) => {
          const imgs = r.images.filter((im) => im.w >= im.h).slice(0, 5).map((im) => im.src);
          return (
            <li key={r.slug} className="hero-in border-t border-[var(--ink)]/15 py-10 md:py-14">
              <Link href={`/${lang}/projects/${r.slug}`} className="group grid items-center gap-8 md:grid-cols-12 md:gap-12">
                <MaskReveal className={`relative overflow-hidden rounded-2xl md:col-span-7 ${i % 2 ? "md:order-2" : ""}`}>
                  <ShapeCycle imgs={imgs.length ? imgs : [r.cover]} every={3200 + (i % 3) * 450} sizes="(min-width:768px) 58vw, 100vw" className="aspect-[16/9] w-full transition-transform duration-700 group-hover:scale-[1.015]" />
                </MaskReveal>
                <div className="md:col-span-5">
                  <p className={`${u} eyebrow text-[var(--bronze)]`}>{r.type} · {r.style}</p>
                  <h2 className="display mt-3 text-4xl transition-colors group-hover:text-[var(--bronze)] md:text-6xl">{r.name}</h2>
                  <p className="mt-2 text-sm text-[var(--muted)]">{r.location}</p>
                  <p className="mt-5 max-w-md text-base">{r.blurb}</p>
                  <dl className="mt-6 grid max-w-sm grid-cols-3 gap-4 border-t border-[var(--ink)]/15 pt-4">
                    {([[facts.area, r.area], [facts.rooms, `${r.images.length}`], [facts.year, r.year]] as [string, string][]).map(([k, v]) => (
                      <div key={k}><dt className="text-xs text-[var(--muted)]">{k}</dt><dd className="mt-1 text-sm font-semibold" dir="ltr">{v}</dd></div>
                    ))}
                  </dl>
                  <span className="btn btn-dark mt-7"><span className="btn-roll"><span>{p.view}</span><span aria-hidden>{p.view}</span></span><span className="btn-ico" aria-hidden /></span>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
