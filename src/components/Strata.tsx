"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { Btn } from "./Btn";
import type { Project } from "@/data/projects";
import type { Dict, Lang } from "@/data/i18n";

/* 80 m — project gallery. The page pins and the wheel slides a row of big project photos
   sideways; the one in front is full size and lit, the others sit back, smaller and dimmer.
   Each card uses the project's first landscape render, so 16:9 shows the whole room. */
export function Strata({ projects, t, lang }: { projects: Project[]; t: Dict; lang: Lang }) {
  const sec = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [a, setA] = useState(0);
  const n = projects.length;
  useGSAP(() => {
    const tr = track.current!, s = sec.current!;
    const card = () => tr.children[0] as HTMLElement;
    const step = () => (tr.children[1] as HTMLElement).offsetLeft - card().offsetLeft;
    const center = () => (s.clientWidth - card().offsetWidth) / 2 - card().offsetLeft;
    gsap.matchMedia().add("(min-width: 1024px)", () => { gsap.fromTo(tr, { x: () => center() }, { x: () => center() - (n - 1) * step(), ease: "none", immediateRender: true, scrollTrigger: { trigger: s, start: "top top", end: () => "+=" + n * 45 + "%", pin: true, scrub: 0.7, invalidateOnRefresh: true, anticipatePin: 1,
      onUpdate: (st) => setA(Math.min(n - 1, Math.round(st.progress * (n - 1)))) } }); });
  }, { scope: sec });
  const pick = (p: Project) => p.images.find((i) => i.src === p.cover && i.w / i.h > 1.6) ?? p.images.find((i) => i.w / i.h > 1.6) ?? p.images[0];
  const u = "text-xs uppercase tracking-[0.16em] rtl:tracking-normal";
  return (
    <section ref={sec} id="projects" data-depth={t.gauge.projects} data-meters="80 m" data-deep="1" className="relative h-[100svh] overflow-hidden bg-[#15130F] text-[var(--surface)]">
      <div className="flex h-full flex-col pb-8 pt-24 md:pt-28">
        <div className="flex flex-wrap items-end justify-between gap-4 px-5 md:px-10">
          <div>
            <p className={`${u} text-[var(--bronze)]`}>{t.gauge.projects}</p>
            <h2 className="display mt-2 text-4xl md:text-6xl">{t.strata.title}</h2>
          </div>
          <div className="flex items-center gap-5">
            <span className="text-sm text-[var(--surface)]/60" dir="ltr">{a + 1} / {n}</span>
            <span className="hidden md:block"><Btn href={`/${lang}/projects`} variant="ghost">{t.project.all}</Btn></span>
          </div>
        </div>
        <div dir="ltr" className="relative mt-6 flex flex-1 items-center md:mt-8">
          <div ref={track} dir="ltr" className="flex items-start gap-5 px-5 will-change-transform md:gap-8 md:px-10 max-lg:w-full max-lg:snap-x max-lg:snap-mandatory max-lg:overflow-x-auto max-lg:pb-2">
            {projects.map((p, k) => {
              const im = pick(p);
              const on = k === a;
              return (
                <Link key={p.slug} href={`/${lang}/projects/${p.slug}`} className={`group block w-[80vw] shrink-0 transition-[transform,opacity] duration-700 ease-out sm:w-[62vw] lg:w-[min(58vw,110vh)] ${on ? "scale-100 opacity-100" : "lg:scale-[.9] lg:opacity-45"} max-lg:snap-center`} style={{ transformOrigin: "50% 60%" }}>
                  <span className="relative block aspect-[16/9] overflow-hidden rounded-2xl bg-[var(--deeper)]">
                    <Image src={im.src} alt={`${p.name}, ${im.room}`} fill sizes="(min-width:1024px) 58vw, 80vw" className={`object-cover transition-transform duration-[1600ms] ${on ? "scale-100" : "scale-110"}`} />
                  </span>
                  <span dir={t.dir} className="mt-4 flex items-end justify-between gap-6">
                    <span className="min-w-0">
                      <span className="display block truncate text-2xl md:text-4xl">{p.name}</span>
                      <span className={`${u} mt-1 block truncate text-[var(--surface)]/60`}>{p.type} · <span dir="ltr">{p.area}</span> · {p.location}</span>
                    </span>
                    <span className={`${u} shrink-0 border-b border-[var(--bronze)] pb-1 text-[var(--bronze)] transition-opacity ${on ? "opacity-100" : "opacity-0"}`}>{t.strata.open}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
        <div className="mx-5 mt-4 h-px bg-[var(--surface)]/15 md:mx-10"><div className="h-px origin-left bg-[var(--bronze)] transition-transform duration-500 rtl:origin-right" style={{ transform: `scaleX(${(a + 1) / n})` }} /></div>
      </div>
    </section>
  );
}
