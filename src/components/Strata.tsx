"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import type { Project } from "@/data/projects";
import type { Dict, Lang } from "@/data/i18n";

/* 80 m — the stand: project frames stand one behind the other at an angle; the page pins and the
   wheel walks them past the centre, where each turns upright, steps forward and lights up while its
   name changes below. Phones: a native swipe row. Portrait renders first so 3:4 frames keep the room. */
export function Strata({ projects, t, lang }: { projects: Project[]; t: Dict; lang: Lang }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [f, setF] = useState(0);
  const step = useRef<(d: number) => void>(() => {});
  const router = useRouter();
  // portrait renders only when they are sharp enough (some are 559px wide); else the 1920px cover
  const pick = (p: Project) => p.images.find((i) => i.h > i.w && i.w >= 1000) ?? p.images.find((i) => i.src === p.cover) ?? p.images[0];

  useGSAP(() => {
    const el = track.current!;
    const frames = gsap.utils.toArray<HTMLElement>(".bk-frame");
    const focus = (b: number) => { frames.forEach((fr, k) => fr.classList.toggle("is-focus", k === b)); setF(b); };
    gsap.matchMedia().add({ desk: "(min-width: 768px) and (prefers-reduced-motion: no-preference)", phone: "(max-width: 767px)" }, (ctx) => {
      if (ctx.conditions!.phone) {
        // phones: swipe row that also plays by itself; a touch or an arrow pauses the autoplay for 6 s
        let cur = 0, hold = 0;
        const mark = () => { const c = innerWidth / 2; let b = 0, d = 1e9; frames.forEach((fr, i) => { const r = fr.getBoundingClientRect(); const x = Math.abs((r.left + r.right) / 2 - c); if (x < d) { d = x; b = i; } }); if (b !== cur || !frames[b].classList.contains("is-focus")) { cur = b; focus(b); } };
        const go = (i: number) => { const r = frames[i].getBoundingClientRect(), e = el.getBoundingClientRect(); el.scrollTo({ left: el.scrollLeft + (r.left + r.width / 2) - (e.left + e.width / 2), behavior: "smooth" }); };
        const pause = () => { hold = Date.now() + 6000; };
        step.current = (d) => { pause(); go((cur + d + frames.length) % frames.length); };
        const auto = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : window.setInterval(() => {
          const r = el.getBoundingClientRect();
          if (Date.now() < hold || document.hidden || r.bottom < 0 || r.top > innerHeight) return;
          go((cur + 1) % frames.length);
        }, 3800);
        // a tap while the row is still gliding is eaten by the browser as "stop scrolling", so a short,
        // still press on a frame opens that frame's project ourselves
        let down: { x: number; y: number; t: number; a: HTMLAnchorElement | null } | null = null;
        const press = (e: PointerEvent) => { pause(); down = { x: e.clientX, y: e.clientY, t: Date.now(), a: (e.target as HTMLElement).closest("a.bk-frame") }; };
        const lift = (e: PointerEvent) => {
          const d = down; down = null;
          if (!d?.a || Date.now() - d.t > 500 || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 10) return;
          router.push(d.a.getAttribute("href")!);
        };
        el.addEventListener("scroll", mark, { passive: true }); el.addEventListener("touchstart", pause, { passive: true }); el.addEventListener("pointerdown", press); el.addEventListener("pointerup", lift); mark();
        return () => { clearInterval(auto); step.current = () => {}; el.removeEventListener("scroll", mark); el.removeEventListener("touchstart", pause); el.removeEventListener("pointerdown", press); el.removeEventListener("pointerup", lift); };
      }
      if (!ctx.conditions!.desk) return;
      const FAN = 28, STEP_Z = 30;
      const mid = (fr: HTMLElement) => fr.offsetLeft + fr.offsetWidth / 2;
      const span = () => { const c = el.parentElement!.clientWidth / 2; return { from: c - mid(frames[0]), to: c - mid(frames[frames.length - 1]) }; };
      let focused = -1;
      const curve = () => {
        const w = el.parentElement!.clientWidth, x = Number(gsap.getProperty(el, "x")) || 0;
        let best = 0, bf = -1;
        frames.forEach((fr, i) => {
          const n = ((mid(fr) + x) / w) * 2 - 1;
          const fo = gsap.utils.clamp(0, 1, 1 - Math.abs(n) * 2.1);
          gsap.set(fr, { rotationY: FAN - fo * (FAN - 4), z: -i * STEP_Z + fo * 120, scale: 1 + fo * 0.06, opacity: 0.72 + fo * 0.28 });
          if (fo > bf) { bf = fo; best = i; }
        });
        if (best !== focused) { focused = best; focus(best); }
      };
      gsap.fromTo(el, { x: () => span().from }, { x: () => span().to, ease: "none", immediateRender: true, onUpdate: curve,
        scrollTrigger: { trigger: root.current, start: "top top", end: () => "+=" + Math.max(900, Math.abs(span().to - span().from) * 1.3), pin: true, scrub: 1, invalidateOnRefresh: true, onRefresh: curve, anticipatePin: 1 } });
      gsap.from(".bk-fig", { y: 120, opacity: 0, stagger: 0.05, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: root.current, start: "top 70%" } });
      curve();
      const id = setTimeout(() => ScrollTrigger.refresh(), 300);
      return () => clearTimeout(id);
    });
  }, { scope: root });

  const p = projects[f];
  const u = "text-xs uppercase tracking-[0.18em] rtl:tracking-normal";
  return (
    <section ref={root} id="projects" data-depth={t.gauge.projects} data-meters="80 m" data-deep="1" className="bk-stage relative overflow-hidden bg-[#15130F] text-[var(--surface)] md:h-[100svh]">
      <div className="relative z-[1] flex h-full flex-col pt-24 md:pt-28">
        <div className="flex flex-wrap items-end justify-between gap-4 px-5 md:px-10">
          <div>
            <p className={`${u} flex items-center gap-3 text-[var(--bronze)]`}><span className="h-px w-8 bg-[var(--bronze)]" />{t.gauge.projects}</p>
            <h2 className="display mt-2 text-4xl md:text-6xl">{t.strata.title}</h2>
          </div>
          <p className="max-w-sm text-sm text-[var(--surface)]/65">{t.strata.intro}</p>
        </div>
        <div className="relative flex flex-1 items-center py-8 md:py-0" style={{ perspective: "1350px", perspectiveOrigin: "50% 42%" }}>
          <div ref={track} dir="ltr" className="bk-track flex items-center max-md:w-full max-md:snap-x max-md:snap-mandatory max-md:gap-4 max-md:overflow-x-auto max-md:px-[15vw] max-md:pb-2" style={{ transformStyle: "preserve-3d" }}>
            {projects.map((pr) => {
              const im = pick(pr);
              return (
                <Link key={pr.slug} href={`/${lang}/projects/${pr.slug}`} className="bk-frame group relative shrink-0 max-md:snap-center">
                  <span className="bk-fig relative block overflow-hidden">
                    <Image src={im.src} alt={`${pr.name}, ${im.room}`} fill sizes="(min-width:768px) 330px, 70vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    <span dir={t.dir} className="bk-meta absolute inset-x-0 bottom-0 z-[2] block px-4 pb-3 pt-12">
                      <span className="block text-sm font-semibold">{pr.name}</span>
                      <span className={`${u} block text-[var(--bronze)]`}>{pr.type}</span>
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
        <div dir="ltr" className="relative z-[3] flex items-start justify-center gap-2 px-3 pb-8 md:px-5 md:pb-10">
        <Link href={`/${lang}/projects/${p.slug}`} dir={t.dir} className="group block min-w-0 text-center" aria-live="polite">
          <span className={`${u} mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--bronze)]/70 px-5 transition-colors group-hover:bg-[var(--bronze)] group-hover:text-[#15130F]`}>{t.project.open} {lang === "ar" ? "المشروع" : "project"} <span aria-hidden className="rtl:-scale-x-100">&#8594;</span></span>
        </Link>
        </div>
      </div>
    </section>
  );
}
