"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Dict, Lang } from "@/data/i18n";
import type { Project } from "@/data/projects";
import { Btn } from "../Btn";

/* Second home version (NEXT_PUBLIC_HOME=v2): light and editorial, no video, no WebGL. Each section has
   its own interaction: a hero with pointer depth and masked type, a project index that reveals the
   home you point at, a material explorer, a detail that opens into its room, and a typographic chapter
   rail. Content comes from the dictionary and the projects data; only the copy below is new. */

const COPY = {
  en: {
    open: "Open project", tap: "Tap a name to see the home", materialsLabel: "Choose a material",
    detail: { eyebrow: "From the detail to the room", title: "Every room starts with one thing done right", note: "Scroll: the joinery opens out into the whole room it belongs to" },
    chapters: ["Projects", "Materials", "Detail", "Studio", "Contact"],
  },
  ar: {
    open: "افتح المشروع", tap: "اضغط على الاسم لترى البيت", materialsLabel: "اختر خامة",
    detail: { eyebrow: "من التفصيلة إلى الغرفة", title: "كل غرفة تبدأ بشيء واحد مصنوع بإتقان", note: "مرّر الصفحة: تتسع التفصيلة لتكشف الغرفة كاملة" },
    chapters: ["المشاريع", "الخامات", "التفاصيل", "الاستوديو", "تواصل"],
  },
} as const;
const HERO_IMG = "/projects/el-nakhil-villa/01.webp";
const DETAIL = { slug: "el-nakhil-villa", src: "/projects/el-nakhil-villa/01.webp", focus: "64% 60%" };
const SWATCHES: [string, string][] = [["/projects/maadi-285/01.webp", "50% 40%"], ["/projects/maadi-180/01.webp", "50% 50%"], ["/projects/tagamo3-115/04.webp", "40% 75%"], ["/projects/el-nakhil-villa/01.webp", "30% 50%"], ["/projects/maadi-180/05.webp", "25% 50%"], ["/projects/october-250/01.webp", "60% 70%"]];
const u = "text-xs uppercase tracking-[0.2em] rtl:tracking-normal";
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Hero: the photo sits in its own rounded frame beside the words (never under them); the pointer moves
   the room and a closer arch-shaped crop of it in opposite directions, so the frame reads as depth. The
   lines rise out of masks. "See the projects" grows the frame to the whole screen, then lands on the
   index. */
export function HeroV2({ t, lang }: { t: Dict; lang: Lang }) {
  const sec = useRef<HTMLElement>(null), frame = useRef<HTMLDivElement>(null), cover = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const s = sec.current!;
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches || reduced()) return;
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    const tick = () => {
      x += (tx - x) * 0.08; y += (ty - y) * 0.08;
      s.style.setProperty("--px", x.toFixed(4)); s.style.setProperty("--py", y.toFixed(4));
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.001 ? requestAnimationFrame(tick) : 0;
    };
    const move = (e: PointerEvent) => { const r = s.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width - 0.5; ty = (e.clientY - r.top) / r.height - 0.5; if (!raf) raf = requestAnimationFrame(tick); };
    s.addEventListener("pointermove", move);
    return () => { s.removeEventListener("pointermove", move); cancelAnimationFrame(raf); };
  }, []);
  // the CTA grows the photo frame over the whole screen, jumps to the index under it, then lifts
  const enter = (e: React.MouseEvent) => {
    const target = document.getElementById("index");
    if (!target) return;
    e.preventDefault();
    if (reduced()) { target.scrollIntoView(); return; }
    const c = cover.current!, r = frame.current!.getBoundingClientRect();
    c.style.transition = "none"; c.style.visibility = "visible"; c.style.opacity = "1";
    c.style.clipPath = `inset(${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px round 24px)`;
    requestAnimationFrame(() => requestAnimationFrame(() => { c.style.transition = "clip-path .75s cubic-bezier(.76,0,.24,1)"; c.style.clipPath = "inset(0px 0px 0px 0px round 0px)"; }));
    setTimeout(() => {
      window.scrollTo({ top: target.getBoundingClientRect().top + scrollY, behavior: "instant" as ScrollBehavior });
      c.style.transition = "opacity .6s ease"; c.style.opacity = "0";
      setTimeout(() => { c.style.visibility = "hidden"; }, 650);
    }, 820);
  };
  return (
    <section ref={sec} data-depth={t.gauge.surface} data-meters="0 m" data-deep="1" className="relative grid min-h-[100svh] grid-cols-[minmax(0,1fr)] bg-[var(--deep)] text-[var(--surface)] lg:grid-cols-12">
      <div className="relative order-2 px-5 pb-12 pt-8 md:px-10 lg:order-1 lg:col-span-5 lg:flex lg:flex-col lg:justify-end lg:pb-16 lg:pt-28">
        <p className={`${u} eyebrow lr-fade text-[var(--bronze)]`}>{t.hero.eyebrow}</p>
        <h1 className="display mt-6 text-[12vw] leading-[1.04] rtl:text-[10vw] rtl:leading-[1.3] md:text-[8vw] md:rtl:text-[7vw] lg:text-[5vw] lg:rtl:text-[4.3vw]">
          <span className="lr block overflow-hidden py-[0.1em]"><span style={{ "--i": 0 } as React.CSSProperties}>{t.hero.t1}</span></span>
          <span className="lr block overflow-hidden py-[0.1em]"><span style={{ "--i": 1 } as React.CSSProperties} className="italic text-[var(--bronze)] rtl:not-italic">{t.hero.t2}</span></span>
        </h1>
        <p className="lr-fade mt-6 max-w-md text-sm leading-relaxed text-[var(--surface)]/80 md:text-base">{t.hero.intro}</p>
        <div className={`lr-fade mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 ${u}`}>
          <Btn href={`/${lang}#contact`}>{t.hero.cta1}</Btn>
          <span onClickCapture={enter}><Btn href={`/${lang}#index`} variant="ghost">{t.hero.cta2}</Btn></span>
        </div>
      </div>
      <div ref={frame} className="hv-frame-in relative order-1 mx-2.5 mt-[72px] h-[54svh] overflow-hidden rounded-3xl md:mx-4 md:h-[60svh] lg:order-2 lg:col-span-7 lg:mx-0 lg:my-4 lg:me-4 lg:mt-[88px] lg:h-auto">
        {/* the pointer shifts the framing of the room inside its frame (object-position), never its size */}
        <Image src={HERO_IMG} alt="" fill priority sizes="(min-width:1024px) 58vw, 100vw" className="object-cover" style={{ objectPosition: "calc(50% + var(--px, 0) * -14%) calc(50% + var(--py, 0) * -10%)" }} />
        {/* a closer crop of the same room in a Baikal arch, floating nearer than the room behind it */}
        <div className="hv-front absolute bottom-[7%] start-[7%] h-[44%] w-[32%] overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,.7)] ring-1 ring-[var(--bronze)]/70 md:w-[26%]" style={{ borderRadius: "999px 999px 14px 14px" }}>
          <div className="absolute inset-0 bg-no-repeat" style={{ backgroundImage: `url(${HERO_IMG})`, backgroundSize: "330%", backgroundPosition: "72% 62%" }} />
        </div>
      </div>
      {/* the full-screen copy of the photo the CTA grows into */}
      <div ref={cover} className="pointer-events-none fixed inset-0 z-[80]" style={{ visibility: "hidden" }} aria-hidden>
        <Image src={HERO_IMG} alt="" fill sizes="100vw" className="object-cover" />
      </div>
    </section>
  );
}

/* Project index: real names as a typographic list. With a mouse (wide screens) pointing at or focusing
   a name opens its photo in the frame beside the list through an upward wipe; on touch each name is a
   button that unfolds its photo, line and link in place. Every row leads to its real project page. */
export function ProjectIndex({ projects, t, lang }: { projects: Project[]; t: Dict; lang: Lang }) {
  const c = COPY[lang];
  const [a, setA] = useState(0), [prev, setPrev] = useState(0), [open, setOpen] = useState<number | null>(0);
  const show = (k: number) => { if (k === a) return; setPrev(a); setA(k); };
  if (!projects.length) return null;
  const cur = projects[a];
  return (
    <section id="index" className="bg-[var(--surface)] px-5 py-20 text-[var(--ink)] md:px-10 md:py-28">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className={`${u} eyebrow text-[var(--bronze)]`}>{t.gauge.projects}</p>
          <h2 className="display mt-4 text-4xl md:text-6xl">{t.strata.title}</h2>
          <p className="mt-4 max-w-md text-sm text-[var(--muted)]">{t.strata.intro}</p>
        </div>
        <Link href={`/${lang}/projects`} className="inline-flex min-h-11 items-center gap-2 text-sm text-[var(--muted)] transition-colors [@media(hover:hover)]:hover:text-[var(--ink)]">{t.project.all} <span aria-hidden>{lang === "ar" ? "←" : "→"}</span></Link>
      </div>

      {/* pointer + wide screen: list beside a sticky frame */}
      <div className="fine-only mt-14">
        <div className="grid grid-cols-12 gap-10">
          <ol className="col-span-7">
            {projects.map((p, k) => (
              <li key={p.slug} className="border-t border-[var(--ink)]/15 last:border-b">
                <Link href={`/${lang}/projects/${p.slug}`} onMouseEnter={() => show(k)} onFocus={() => show(k)}
                  className={`group grid grid-cols-12 items-baseline gap-4 py-5 transition-colors duration-300 ${a === k ? "text-[var(--ink)]" : "text-[var(--ink)]/40"}`}>
                  <span className={`display col-span-7 text-3xl transition-transform duration-500 xl:text-5xl ${a === k ? "translate-x-3 rtl:-translate-x-3" : ""}`}>{p.name}</span>
                  <span className="col-span-3 text-sm">{p.location}</span>
                  <span className={`${u} col-span-2 text-end`}>{p.type}</span>
                </Link>
              </li>
            ))}
          </ol>
          <div className="col-span-5">
            <div className="sticky top-28">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-[var(--deep)]">
                {projects[prev]?.cover && <Image src={projects[prev].cover} alt="" fill sizes="40vw" className="object-cover" />}
                {cur.cover && <div key={a} className="wipe-up absolute inset-0"><Image src={cur.cover} alt={cur.name} fill sizes="40vw" className="object-cover" /></div>}
              </div>
              <p key={`b${a}`} className="hero-in mt-5 max-w-md text-sm text-[var(--muted)]">{cur.blurb}</p>
            </div>
          </div>
        </div>
      </div>

      {/* touch or narrow: each name unfolds its home in place */}
      <div className="touch-only mt-10">
        <p className={`${u} text-[var(--muted)]`}>{c.tap}</p>
        <ol className="mt-4">
          {projects.map((p, k) => {
            const on = open === k;
            return (
              <li key={p.slug} className="border-t border-[var(--ink)]/15 last:border-b">
                <button type="button" onClick={() => setOpen(on ? null : k)} aria-expanded={on} className="flex min-h-14 w-full items-center justify-between gap-4 py-4 text-start">
                  <span><span className="display block text-2xl">{p.name}</span><span className="mt-1 block text-xs text-[var(--muted)]">{p.type} · {p.location}</span></span>
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--ink)]/20 transition-transform duration-500 ${on ? "rotate-45 border-[var(--bronze)] text-[var(--bronze)]" : ""}`} aria-hidden>+</span>
                </button>
                <div className={`grid transition-[grid-template-rows] duration-500 ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    {p.cover && <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[var(--deep)]"><Image src={p.cover} alt={p.name} fill sizes="100vw" className="object-cover" /></div>}
                    {p.blurb && <p className="mt-3 text-sm text-[var(--muted)]">{p.blurb}</p>}
                    <Link href={`/${lang}/projects/${p.slug}`} className="mb-5 mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--ink)]">{c.open} <span aria-hidden>{lang === "ar" ? "←" : "→"}</span></Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/* Material explorer: a real tab list. Choosing a material opens its room through a growing circle over
   the last one, with its name and use under the photo; left alone it moves on by itself while visible.
   Arrow keys move between tabs. */
export function MaterialExplorer({ t, lang }: { t: Dict; lang: Lang }) {
  const names = t.materials.names, notes = t.materials.notes, n = Math.min(names.length, SWATCHES.length);
  const [a, setA] = useState(0), [prev, setPrev] = useState(0);
  const hold = useRef(0), sec = useRef<HTMLElement>(null), tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const pick = (k: number) => { hold.current = Date.now() + 9000; setA((cur) => { if (cur !== k) setPrev(cur); return k; }); };
  useEffect(() => {
    if (reduced()) return;
    let seen = false;
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; }, { threshold: 0.35 });
    io.observe(sec.current!);
    const id = setInterval(() => { if (seen && !document.hidden && Date.now() > hold.current) setA((cur) => { setPrev(cur); return (cur + 1) % n; }); }, 4500);
    return () => { clearInterval(id); io.disconnect(); };
  }, [n]);
  const key = (e: React.KeyboardEvent, k: number) => {
    const fwd = lang === "ar" ? "ArrowLeft" : "ArrowRight", back = lang === "ar" ? "ArrowRight" : "ArrowLeft";
    const d = e.key === "ArrowDown" || e.key === fwd ? 1 : e.key === "ArrowUp" || e.key === back ? -1 : 0;
    if (!d) return;
    e.preventDefault(); const to = (k + d + n) % n; pick(to); tabs.current[to]?.focus();
  };
  return (
    <section ref={sec} id="materials" className="bg-[#15130F] px-5 py-20 text-[var(--surface)] md:px-10 md:py-28">
      <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <p className={`${u} eyebrow text-[var(--bronze)]`}>{t.gauge.materials}</p>
          <h2 className="display mt-4 text-4xl md:text-6xl">{t.materials.title}</h2>
          <p className="mt-4 max-w-md text-sm text-[var(--surface)]/65">{t.materials.intro}</p>
          <div role="tablist" aria-label={COPY[lang].materialsLabel} aria-orientation="vertical" className="mt-8">
            {names.slice(0, n).map((m, k) => (
              <button key={m} ref={(el) => { tabs.current[k] = el; }} role="tab" id={`mt-${k}`} aria-selected={a === k} aria-controls="mt-panel" tabIndex={a === k ? 0 : -1}
                onClick={() => pick(k)} onKeyDown={(e) => key(e, k)}
                className={`flex min-h-12 w-full items-center gap-4 border-t border-[var(--surface)]/12 py-3 text-start transition-colors duration-300 last:border-b ${a === k ? "text-[var(--surface)]" : "text-[var(--surface)]/45 [@media(hover:hover)]:hover:text-[var(--surface)]/80"}`}>
                <span className={`h-2 w-2 shrink-0 rounded-full transition-colors ${a === k ? "bg-[var(--bronze)]" : "bg-[var(--surface)]/25"}`} aria-hidden />
                <span className="display text-2xl md:text-3xl">{m}</span>
              </button>
            ))}
          </div>
        </div>
        <div role="tabpanel" id="mt-panel" aria-labelledby={`mt-${a}`} className="lg:col-span-7">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-[var(--deep)]">
            <Image src={SWATCHES[prev][0]} alt="" fill sizes="(min-width:1024px) 55vw, 100vw" className="object-cover" style={{ objectPosition: SWATCHES[prev][1] }} />
            <div key={a} className="circle-in absolute inset-0"><Image src={SWATCHES[a][0]} alt={names[a]} fill sizes="(min-width:1024px) 55vw, 100vw" className="object-cover" style={{ objectPosition: SWATCHES[a][1] }} /></div>
          </div>
          <div key={`n${a}`} className="hero-in mt-5">
            <p className={`${u} text-[var(--bronze)]`}>{names[a]}</p>
            <p className="mt-1 max-w-md text-sm text-[var(--surface)]/75">{notes[a]}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Detail to room: one real photo of one real project. It starts as a tight frame on a detail and, as the
   page scrolls past (no pinning), the frame opens and the photo eases back until the whole room shows. */
export function DetailReveal({ projects, lang }: { projects: Project[]; lang: Lang }) {
  const c = COPY[lang].detail, p = projects.find((x) => x.slug === DETAIL.slug);
  const sec = useRef<HTMLElement>(null);
  useGSAP(() => {
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
      gsap.timeline({ scrollTrigger: { trigger: ".dr-frame", start: "top 90%", end: "bottom 40%", scrub: 0.6 } })
        .fromTo(".dr-frame", { clipPath: "inset(16% 28% 16% 28% round 24px)" }, { clipPath: "inset(0% 0% 0% 0% round 24px)", ease: "none" }, 0)
        .fromTo(".dr-img", { scale: 2.1 }, { scale: 1, ease: "none" }, 0);
    });
  }, { scope: sec });
  return (
    <section ref={sec} id="detail" className="bg-[#EDE6DA] px-5 py-20 text-[var(--ink)] md:px-10 md:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <p className={`${u} eyebrow text-[var(--bronze)]`}>{c.eyebrow}</p>
        <h2 className="display mt-4 text-4xl md:text-6xl">{c.title}</h2>
        <p className="mx-auto mt-4 max-w-md text-sm text-[var(--muted)]">{c.note}</p>
      </div>
      <div className="dr-frame relative mx-auto mt-12 h-[62svh] max-w-6xl overflow-hidden rounded-3xl bg-[var(--deep)] md:h-[72svh]">
        <Image src={DETAIL.src} alt={p ? `${p.name}, ${p.location}` : ""} fill sizes="(min-width:1200px) 1150px, 100vw" className="dr-img object-cover" style={{ objectPosition: DETAIL.focus, transformOrigin: DETAIL.focus }} />
      </div>
      {p && (
        <Link href={`/${lang}/projects/${p.slug}`} className="mx-auto mt-5 flex min-h-11 max-w-6xl items-center justify-between gap-4 text-sm">
          <span><b className="font-semibold">{p.name}</b> <span className="text-[var(--muted)]">· {p.location}</span></span>
          <span className="text-[var(--bronze)]">{COPY[lang].open} <span aria-hidden>{lang === "ar" ? "←" : "→"}</span></span>
        </Link>
      )}
    </section>
  );
}

/* Typographic chapter rail (wide screens only): the section names stand at the edge of the page; the
   chapter you are reading grows and turns bronze. A plain list of links, so it always works. */
const IDS = ["index", "materials", "detail", "studio", "contact"];
export function ChapterRail({ lang }: { lang: Lang }) {
  const names = COPY[lang].chapters;
  const [a, setA] = useState(-1);
  useEffect(() => {
    const els = IDS.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver((es) => { for (const e of es) if (e.isIntersecting) setA(IDS.indexOf(e.target.id)); }, { rootMargin: "-45% 0px -50% 0px" });
    els.forEach((el) => io.observe(el));
    const top = () => { if (scrollY < innerHeight * 0.6) setA(-1); };
    addEventListener("scroll", top, { passive: true });
    return () => { io.disconnect(); removeEventListener("scroll", top); };
  }, []);
  return (
    <nav aria-label={lang === "ar" ? "أقسام الصفحة" : "Page chapters"} className={`fixed end-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-4 transition-opacity duration-500 xl:flex ${a < 0 ? "pointer-events-none opacity-0" : "opacity-100"}`}>
      {IDS.map((id, k) => (
        <a key={id} href={`#${id}`} aria-current={a === k ? "true" : undefined}
          className={`display block origin-right text-sm text-[var(--bronze)] transition-[transform,opacity] duration-500 rtl:origin-left ${a === k ? "scale-[1.7] opacity-100" : "opacity-45 [@media(hover:hover)]:hover:opacity-80"}`}>{names[k]}</a>
      ))}
    </nav>
  );
}
