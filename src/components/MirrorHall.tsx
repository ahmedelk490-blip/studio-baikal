"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@/data/projects";
import type { Dict, Lang } from "@/data/i18n";

/* Projects — the mirror hall. Every home stands in a Baikal arch along a gentle curve over a dark,
   still floor that reflects it like the lake. The hall turns by itself; the one in front lights up
   and its name settles under the floor. Tap a side arch (or swipe) to turn, the front one to open. */
export function MirrorHall({ projects, t, lang }: { projects: Project[]; t: Dict; lang: Lang }) {
  const [a, setA] = useState(0);
  // how many arches each side are worth drawing at this width (the rest are hidden, not just faded)
  const [span, setSpan] = useState(2);
  const hold = useRef(0);
  const sec = useRef<HTMLElement>(null);
  const router = useRouter();
  const n = projects.length;
  // portrait renders only when sharp enough; else the cover
  const pick = (p: Project) => p.images.find((i) => i.h > i.w && i.w >= 1000) ?? p.images.find((i) => i.src === p.cover) ?? p.images[0];
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
  const rel = (k: number) => { let d = (k - a) % n; if (d > n / 2) d -= n; if (d < -n / 2) d += n; return d; };
  const cur = projects[a];
  const u = "text-xs uppercase tracking-[0.2em] rtl:tracking-normal";
  return (
    <section ref={sec} id="projects" data-depth={t.gauge.projects} data-meters="80 m" data-deep="1" className="relative overflow-hidden bg-[radial-gradient(ellipse_at_50%_30%,#17252c,#05080A_72%)] px-5 py-16 text-[var(--surface)] md:px-10 md:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className={`${u} eyebrow justify-center text-[var(--bronze)]`}>{t.gauge.projects}</p>
        <h2 className="display mt-3 text-4xl md:text-6xl">{t.strata.title}</h2>
        <p className="mx-auto mt-4 max-w-md text-sm text-[var(--surface)]/65">{t.strata.intro}</p>
      </div>

      <div
        className="relative mx-auto mt-10 h-[clamp(300px,calc(72vw+24px),530px)] max-w-[1600px] touch-pan-y select-none overflow-x-clip [--step:31vw] md:[--step:min(19vw,300px)] md:mt-12 md:h-[clamp(300px,calc(32vw+24px),530px)]"
        style={{ perspective: "1500px" }}
        dir="ltr"
        onPointerDown={(e) => { down.current = { x: e.clientX, y: e.clientY }; }}
        onPointerUp={(e) => { const d = down.current; down.current = null; if (!d) return; const dx = e.clientX - d.x; if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - d.y)) go(a + (dx < 0 ? 1 : -1)); }}
      >
        {/* the still floor: a horizon line, slow ripples and the dark water the arches reflect in */}
        <div className="absolute inset-x-0 bottom-0 h-[28%] border-t border-[var(--bronze)]/20 bg-gradient-to-b from-[#0b151a]/40 to-[#05080A]" aria-hidden>
          <div className="ripples absolute inset-0 opacity-30" />
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

      {/* the front home's name, under the floor (never on the photo) */}
      <div key={a} className="hero-in mt-6 text-center md:mt-8">
        <p className="display text-3xl md:text-5xl">{cur.name}</p>
        <p className={`${u} mt-3 text-[var(--bronze)]`}>{cur.type} · {cur.location}</p>
      </div>
    </section>
  );
}
