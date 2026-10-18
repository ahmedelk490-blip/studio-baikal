"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Reveal } from "./Reveal";
import { useParallax } from "./Parallax";
import { projectVideo } from "@/data/media";
import type { Project } from "@/data/projects";
import type { Dict, Lang } from "@/data/i18n";

/* Plays only while on screen (preload none until then), so three clips cost nothing up front. */
function Tile({ p, lang, big = false }: { p: Project; lang: Lang; big?: boolean }) {
  const v = useRef<HTMLVideoElement>(null);
  const frame = useRef<HTMLSpanElement>(null);
  useParallax(frame);
  useEffect(() => {
    const el = v.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.preload = "auto"; el.play().catch(() => {}); } else el.pause(); }, { threshold: 0.25 });
    io.observe(el); return () => io.disconnect();
  }, []);
  const u = "text-xs uppercase tracking-[0.16em] rtl:tracking-normal";
  return (
    <Link href={`/${lang}/projects/${p.slug}`} className="group block">
      <span ref={frame} className={`relative block overflow-hidden rounded-2xl bg-[var(--deep)] ${big ? "aspect-[16/10]" : "aspect-[16/9]"}`}>
        <Image src={p.cover} alt={`${p.name}, ${p.location}`} fill sizes={big ? "(min-width:1024px) 58vw, 100vw" : "(min-width:1024px) 38vw, 100vw"} className="object-cover" />
        <video ref={v} className="absolute inset-0 h-full w-full object-cover" muted loop playsInline preload="none" poster={`${p.cover}?v=2`} aria-hidden><source src={projectVideo[p.slug]} type="video/mp4" /></video>
        <span className={`${u} absolute start-3 top-3 flex items-center gap-2 rounded-full bg-[var(--deep)]/70 px-3 py-1.5 text-[var(--surface)]`}><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--bronze)]" />{lang === "ar" ? "مشهد حي" : "In motion"}</span>
      </span>
      <span className="mt-3 flex items-baseline justify-between gap-4">
        <span className="display text-2xl transition-colors group-hover:text-[var(--bronze)] md:text-3xl">{p.name}</span>
        <span className={`${u} shrink-0 text-[var(--muted)]`}><span dir="ltr">{p.area}</span> · {p.type}</span>
      </span>
      <span className="mt-1 block text-sm text-[var(--muted)]">{p.location}</span>
    </Link>
  );
}

/* 150 m — three homes in motion: one large clip and two stacked, on a light room.
   Real walkthrough clips of our own projects, so the section moves by itself. */
export function Featured({ projects, t, lang }: { projects: Project[]; t: Dict; lang: Lang }) {
  const pick = ["el-nakhil-villa", "october-250", "tagamo3-115"].map((s) => projects.find((p) => p.slug === s)!).filter(Boolean);
  const u = "text-xs uppercase tracking-[0.16em] rtl:tracking-normal";
  return (
    <section data-depth={t.gauge.featured} data-meters="150 m" className="bg-[var(--mist)] text-[var(--ink)]">
      <div className="px-5 py-16 md:px-10 md:py-24">
        <Reveal className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className={`${u} eyebrow text-[var(--bronze)]`}>{t.featured.eyebrow}</p>
            <h2 className="display mt-3 text-4xl md:text-6xl">{t.featured.title}</h2>
          </div>
          <p className="max-w-sm text-sm text-[var(--muted)] md:col-span-5">{t.featured.intro}</p>
        </Reveal>
        <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:gap-6">
          <Reveal className="lg:col-span-7"><Tile p={pick[0]} lang={lang} big /></Reveal>
          <div className="grid gap-8 lg:col-span-5 lg:gap-6">
            <Reveal delay={1}><Tile p={pick[1]} lang={lang} /></Reveal>
            <Reveal delay={2}><Tile p={pick[2]} lang={lang} /></Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
