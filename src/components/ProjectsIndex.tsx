"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Contours } from "./Contours";
import type { Img, Project } from "@/data/projects";
import type { Lang } from "@/data/i18n";
import type { PagesDict } from "@/data/pages";

type Row = Project & { kind: string };

/* A cover that plays through the home's rooms by itself (landscape renders only, never cropped badly). */
function Cycle({ images, offset }: { images: Img[]; offset: number }) {
  const [k, setK] = useState(0);
  useEffect(() => {
    let iv: ReturnType<typeof setInterval>;
    const t0 = setTimeout(() => { iv = setInterval(() => setK((x) => (x + 1) % images.length), 3200); }, offset * 450);
    return () => { clearTimeout(t0); clearInterval(iv); };
  }, [images.length, offset]);
  return (
    <div className="relative aspect-[16/9] overflow-hidden bg-[var(--mist)]">
      {images.map((im, j) => <Image key={im.src} src={im.src} alt={im.room} fill sizes="(min-width:768px) 58vw, 100vw" className={`object-cover transition-[opacity,transform] duration-[1200ms] ease-out ${j === k ? "scale-100 opacity-100" : "scale-105 opacity-0"}`} />)}
      <span className="room-tag absolute bottom-3 start-3 rounded-full bg-[var(--deep)]/70 px-3 py-1.5 text-xs uppercase tracking-[0.14em] rtl:tracking-normal text-[var(--surface)]">{images[k]?.room}</span>
      <span className="absolute bottom-4 end-4 flex gap-1.5">{images.map((im, j) => <span key={im.src} className={`h-1.5 rounded-full bg-[var(--surface)] transition-all duration-500 ${j === k ? "w-6" : "w-1.5 opacity-50"}`} />)}</span>
    </div>
  );
}

/* Projects page: an archive with type filters; each home is a wide row whose cover plays through its rooms. */
export function ProjectsIndex({ rows, lang, p }: { rows: Row[]; lang: Lang; p: PagesDict["projects"] }) {
  const [f, setF] = useState("all");
  const kinds = ["all", ...Array.from(new Set(rows.map((r) => r.kind)))];
  const list = f === "all" ? rows : rows.filter((r) => r.kind === f);
  const u = "text-xs uppercase tracking-[0.16em] rtl:tracking-normal";
  return (
    <section className="bg-[var(--surface)] text-[var(--ink)]">
      <div className="relative overflow-hidden px-5 pb-10 pt-28 md:px-10 md:pt-36">
        <Contours className="pointer-events-none absolute inset-x-0 top-16 h-[70%] opacity-40" />
        <div className="hero-in relative grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8"><p className={`${u} text-[var(--bronze)]`}>{p.eyebrow}</p><h1 className="display mt-4 text-5xl md:text-8xl">{p.title}</h1></div>
          <p className="max-w-sm text-sm text-[var(--muted)] md:col-span-4">{p.intro}</p>
        </div>
        <div className="relative mt-10 flex flex-wrap gap-2">
          {kinds.map((k) => (
            <button key={k} onClick={() => setF(k)} aria-pressed={f === k} className={`rounded-full border px-5 py-2.5 text-sm transition-colors ${f === k ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--surface)]" : "border-[var(--ink)]/20 hover:border-[var(--ink)]/50"}`}>
              {k === "all" ? p.all : p.filters[k] ?? k} <span className="opacity-60">({k === "all" ? rows.length : rows.filter((r) => r.kind === k).length})</span>
            </button>
          ))}
        </div>
      </div>
      <ol key={f} className="px-5 pb-20 md:px-10">
        {list.map((r, i) => (
          <li key={r.slug} className="hero-in border-t border-[var(--ink)]/15 py-10 md:py-14">
            <Link href={`/${lang}/projects/${r.slug}`} className="group grid items-center gap-8 md:grid-cols-12 md:gap-12">
              <div className={`md:col-span-7 ${i % 2 ? "md:order-2" : ""}`}><Cycle images={r.images.filter((im) => im.w >= im.h).slice(0, 4)} offset={i} /></div>
              <div className="md:col-span-5">
                <p className={`${u} text-[var(--bronze)]`}>{r.type} · {r.style}</p>
                <h2 className="display mt-3 text-4xl transition-colors group-hover:text-[var(--bronze)] md:text-6xl">{r.name}</h2>
                <p className="mt-2 text-sm text-[var(--muted)]">{r.location}</p>
                <p className="mt-5 max-w-md text-base">{r.blurb}</p>
                <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 border-t border-[var(--ink)]/15 pt-4">
                  {[[r.area], [`${r.images.length}`], [r.year]].map(([v], j) => <dd key={j} className="text-sm font-semibold">{v}</dd>)}
                </dl>
                <span className="btn btn-dark mt-7"><span className="btn-roll"><span>{p.view}</span><span aria-hidden>{p.view}</span></span><span className="btn-ico" aria-hidden /></span>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}