"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@/data/projects";
import type { Dict, Lang } from "@/data/i18n";

/* Projects — the mirror hall. Every home stands in a Baikal arch along a gentle curve over a dark,
   still floor that reflects it like the lake. The hall turns on its own; arrows either side, a swipe or
   a tap on a side arch turn it too. The one in front lights up with its name on the floor; tap to open. */
export function MirrorHall({ projects, t, lang }: { projects: Project[]; t: Dict; lang: Lang }) {
  const [a, setA] = useState(0);
  // how many arches each side are worth drawing at this width (the rest are hidden, not just faded)
  const [span, setSpan] = useState(2);
  const sec = useRef<HTMLElement>(null);
  const router = useRouter();
  const n = projects.length;
  // portrait renders only when sharp enough; else the cover
  const pick = (p: Project) => p.images.find((i) => i.h > i.w && i.w >= 1000) ?? p.images.find((i) => i.src === p.cover) ?? p.images[0];
  // the hall turns on its own; an arrow, a swipe or a tap on a side arch takes over for 7 s
  const hold = useRef(0);
  const go = (k: number) => { hold.current = Date.now() + 7000; setA(((k % n) + n) % n); };
  useEffect(() => {
    const fit = () => setSpan(innerWidth < 768 ? 1 : 2);
    fit(); addEventListener("resize", fit);
    let seen = false, fetched = false;
    const io = new IntersectionObserver(([e]) => {
      seen = e.isIntersecting;
      // fetch every project page as the hall comes near, so the front arch opens at once
      if (seen && !fetched) { fetched = true; projects.forEach((p) => router.prefetch(`/${lang}/projects/${p.slug}`)); }
    }, { rootMargin: "300px 0px" });
    io.observe(sec.current!);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const id = reduce ? 0 : window.setInterval(() => { if (seen && !document.hidden && Date.now() > hold.current) setA((k) => (k + 1) % n); }, 3600);
    return () => { clearInterval(id); io.disconnect(); removeEventListener("resize", fit); };
  }, [n, lang, projects, router]);
  // stage height tracks the arch size (arch = 1.433 x its width, standing on the top 72%), so no width cuts it
  // swipe on the stage turns the hall one step
  const down = useRef<{ x: number; y: number } | null>(null);
  // offset of each arch from the front one, wrapping round so the hall never runs out
  const rel = (k: number) => { let d = (k - a) % n; if (d > n / 2) d -= n; if (d < -n / 2) d += n; return d; };
  const cur = projects[a];
  const u = "text-xs uppercase tracking-[0.2em] rtl:tracking-normal";
  return (
    <section ref={sec} id="projects" data-depth={t.gauge.projects} data-meters="80 m" data-deep="1" className="relative overflow-hidden bg-[radial-gradient(ellipse_at_50%_30%,#17252c,#05080A_72%)] px-5 py-16 text-[var(--surface)] md:px-10 md:py-24">
      {/* section head: tag, title and line on one side, the way to every project on the other */}
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className={`${u} eyebrow text-[var(--bronze)]`}>{t.gauge.projects}</p>
          <h2 className="display mt-4 text-4xl md:text-6xl">{t.strata.title}</h2>
          <p className="mt-4 max-w-md text-sm text-[var(--surface)]/65">{t.strata.intro}</p>
        </div>
        <Link href={`/${lang}/projects`} className="inline-flex min-h-11 items-center gap-2 text-sm text-[var(--surface)]/75 transition-colors [@media(hover:hover)]:hover:text-[var(--surface)]">{t.project.all} <span aria-hidden>{lang === "ar" ? "←" : "→"}</span></Link>
      </div>
      <div
        className="relative mx-auto mt-10 h-[clamp(300px,calc(72vw+24px),530px)] max-w-[1600px] touch-pan-y select-none [--step:31vw] md:[--step:min(19vw,300px)] md:mt-12 md:h-[clamp(300px,calc(32vw+24px),530px)]"
        // no clipping on the 3D stage itself (overflow or clip-path here makes GPU Chrome drop the arches);
        // the section clips, and only arches that fit on screen are drawn
        style={{ perspective: "1500px" }}
        dir="ltr"
        onPointerDown={(e) => { down.current = { x: e.clientX, y: e.clientY }; }}
        onPointerUp={(e) => { const d = down.current; down.current = null; if (!d) return; const dx = e.clientX - d.x; if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - d.y)) go(a + (dx < 0 ? 1 : -1)); }}
      >
        {/* arrows either side of the hall (the stage is left-to-right: left goes back, right goes on) */}
        {([-1, 1] as const).map((dir) => (
          <button key={dir} type="button" onClick={() => go(a + dir)} aria-label={dir < 0 ? (lang === "ar" ? "المشروع السابق" : "Previous project") : (lang === "ar" ? "المشروع التالي" : "Next project")}
            className={`absolute top-[36%] z-40 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-[var(--bronze)]/60 bg-[#05080A]/60 text-[var(--surface)] transition-colors [@media(hover:hover)]:hover:border-[var(--bronze)] [@media(hover:hover)]:hover:bg-[#05080A]/85 md:h-14 md:w-14 ${dir < 0 ? "left-0 md:left-2" : "right-0 md:right-2"}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={dir < 0 ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} /></svg>
          </button>
        ))}
        {/* the still floor: a horizon line, slow ripples and the dark water the arches reflect in */}
        <div className="absolute inset-x-0 bottom-0 h-[28%] border-t border-[var(--bronze)]/20 bg-gradient-to-b from-[#0b151a]/40 to-[#05080A]" aria-hidden>
          <div className="ripples absolute inset-0 opacity-30" />
        </div>
        {/* the front home's name and kind, on the floor right under its arch */}
        <div key={a} className="hero-in pointer-events-none absolute inset-x-0 bottom-[28%] z-30 flex translate-y-full justify-center pt-3 text-center">
          <span className="w-max max-w-[88vw] rounded-2xl bg-[#05080A]/70 px-4 py-2">
            <span className="display block text-xl md:text-2xl">{cur.name}</span>
            <span className={`${u} mt-1 block text-[var(--bronze)]`}>{cur.type} · {cur.location}</span>
          </span>
        </div>
        {projects.map((p, k) => {
          const d = rel(k), ad = Math.abs(d), im = pick(p), front = d === 0;
          return (
            <Link key={p.slug} href={`/${lang}/projects/${p.slug}`} aria-label={p.name} tabIndex={ad > span ? -1 : 0}
              onClick={(e) => { if (!front) { e.preventDefault(); go(k); } }}
              className="absolute bottom-[28%] left-1/2 block w-[36vw] max-w-[250px] transition-[transform,opacity,filter] duration-[1000ms] ease-[cubic-bezier(.65,0,.25,1)] md:w-[16vw]"
              style={{
                transform: `translateX(-50%) translateX(calc(${d} * var(--step))) translateZ(${-ad * 140}px) rotateY(${-d * 16}deg)`,
                opacity: ad > span ? 0 : 1 - ad * 0.16, zIndex: 20 - ad, pointerEvents: ad > span ? "none" : "auto", visibility: ad > span ? "hidden" : "visible",
                filter: front ? "none" : "brightness(.62)",
              }}>
              <span className="mirror-arch relative block aspect-[3/4.3] overflow-hidden rounded-b-lg rounded-t-full ring-1 ring-[var(--bronze)]/35">
                <Image src={im.src} alt={`${p.name}, ${im.room}`} fill sizes="(min-width:768px) 18vw, 50vw" className="object-cover" />
                <span className={`absolute inset-0 rounded-b-lg rounded-t-full transition-shadow duration-700 ${front ? "shadow-[inset_0_0_0_1.5px_var(--bronze)]" : ""}`} />
              </span>
            </Link>
          );
        })}
      </div>

    </section>
  );
}
