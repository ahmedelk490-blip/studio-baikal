"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Btn } from "../Btn";
import { heroVideo } from "@/data/media";
import type { Dict, Lang } from "@/data/i18n";

/* The calm home (NEXT_PUBLIC_HOME=calm): fewer sections, big still photographs, quiet type, one bronze
   accent on near-black (two tones, so the sections still part), and motion that only fades things in. Nothing holds the page while you scroll
   (the project hall turns by itself). Built after the client's references: one film with the mark in the
   middle, a short word, the projects, what we design by type, services in plain rows, the four steps,
   the studio in a bronze-lined frame, then the contact form. */
const COPY = {
  en: {
    intro: "Studio Baikal", scroll: "Scroll",
    spaces: { eyebrow: "What we design", title: "Homes, villas and clinics", all: "All projects", view: "View projects",
      items: [["Villa", "Villas"], ["Apartment", "Apartments"], ["Clinic", "Clinics & workspaces"]] },
    book: "Book a free consultation",
  },
  ar: {
    intro: "استوديو بايكال", scroll: "مرّر",
    spaces: { eyebrow: "ما نصممه", title: "بيوت وفيلات وعيادات", all: "كل المشاريع", view: "شاهد المشاريع",
      items: [["Villa", "فيلات"], ["Apartment", "شقق"], ["Clinic", "عيادات ومساحات عمل"]] },
    book: "احجز استشارة مجانية",
  },
} as const;
const COVERS: Record<string, string> = { Villa: "/projects/el-nakhil-villa/01.webp", Apartment: "/projects/october-250/04.webp", Clinic: "/projects/ca-dental-clinic/04.webp" };
const u = "text-xs uppercase tracking-[0.24em] rtl:tracking-normal";

// fade a block in once as it comes into view (and leave it alone after)
function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const els = ref.current?.querySelectorAll<HTMLElement>("[data-fade]") ?? [];
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("calm-in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -12% 0px" });
    // anything already above the screen (a reload mid-page, a jump to #projects) is simply shown
    els.forEach((el) => { if (el.getBoundingClientRect().bottom < 0) el.classList.add("calm-in"); else io.observe(el); });
    return () => io.disconnect();
  }, []);
  return ref;
}

export function CalmHero({ t, lang }: { t: Dict; lang: Lang }) {
  const c = COPY[lang];
  return (
    <section data-depth={t.gauge.surface} className="relative grid h-[100svh] min-h-[600px] place-items-center overflow-hidden bg-[#0B1013] text-[var(--surface)]">
      <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline preload="auto" poster={heroVideo.poster} aria-hidden>
        {heroVideo.mobile && <source src={heroVideo.mobile} type="video/mp4" media="(max-width: 767px)" />}
        <source src={heroVideo.mp4} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-[#0B1013]/55" aria-hidden />
      <div className="calm-hero relative flex flex-col items-center px-6 text-center">
        <span className="h-px w-24 bg-[var(--bronze)]" aria-hidden />
        <h1 className="display mt-8 max-w-3xl text-4xl leading-[1.1] rtl:leading-[1.35] md:text-6xl">
          {t.hero.t1} <span className="italic text-[var(--bronze)] rtl:not-italic">{t.hero.t2}</span>
        </h1>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-[var(--surface)]/80">{t.hero.intro}</p>
        <div className={`mt-9 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 ${u}`}>
          <Btn href={`/${lang}#contact`}>{t.hero.cta1}</Btn>
          <Btn href={`/${lang}#projects`} variant="ghost">{t.hero.cta2}</Btn>
        </div>
      </div>
      <a href="#projects" className={`absolute bottom-5 left-1/2 flex min-h-11 min-w-11 -translate-x-1/2 flex-col items-center gap-2 p-2 text-[var(--surface)]/60 ${u}`}>
        {c.scroll}<span className="calm-line block h-10 w-px bg-[var(--bronze)]" aria-hidden />
      </a>
    </section>
  );
}

export function CalmIntro({ t, lang }: { t: Dict; lang: Lang }) {
  const ref = useFadeIn();
  return (
    <section id="intro" data-depth={t.gauge.statement} className="bg-[#0B1013] px-5 max-md:hidden py-20 text-[var(--surface)] md:px-10 md:py-32">
      <div ref={ref} className="mx-auto max-w-5xl text-center">
        <p data-fade className={`${u} text-[var(--bronze)]`}>{COPY[lang].intro}</p>
        <p data-fade className="display mx-auto mt-6 max-w-4xl text-2xl leading-[1.35] rtl:leading-[1.6] md:text-4xl">{t.statement.text}</p>
        <div data-fade className="relative mx-auto mt-14 aspect-[16/9] w-full overflow-hidden rounded-2xl md:mt-20">
          <Image src="/projects/nasr-city-108/02.webp" alt="" fill sizes="(min-width:1024px) 1024px, 100vw" className="calm-zoom object-cover" />
        </div>
      </div>
    </section>
  );
}

export function CalmSpaces({ t, lang, counts }: { t: Dict; lang: Lang; counts: Record<string, number> }) {
  const c = COPY[lang].spaces, ref = useFadeIn();
  return (
    <section data-depth={t.gauge.rooms} className="bg-[#111619] px-5 py-20 text-[var(--surface)] md:px-10 md:py-28">
      <div ref={ref} className="mx-auto max-w-7xl">
        <div data-fade className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className={`${u} text-[var(--bronze)]`}>{c.eyebrow}</p>
            <h2 className="display mt-4 text-4xl md:text-6xl">{c.title}</h2>
          </div>
          <Link href={`/${lang}/projects`} className={`inline-flex min-h-11 items-center gap-3 border border-[var(--surface)]/40 px-6 py-3 transition-colors [@media(hover:hover)]:hover:border-[var(--bronze)] ${u}`}>
            {c.all} <span aria-hidden>{lang === "ar" ? "←" : "→"}</span>
          </Link>
        </div>
        <div className="mt-12 grid gap-5 md:mt-16 md:grid-cols-3">
          {c.items.map(([kind, label]) => (
            <Link key={kind} data-fade href={`/${lang}/projects?type=${kind}`} className="group relative block aspect-[4/5] overflow-hidden rounded-2xl">
              <Image src={COVERS[kind]} alt={label} fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover transition-transform duration-[1200ms] ease-out [@media(hover:hover)]:group-hover:scale-105" />
              <span className="absolute inset-0 bg-gradient-to-t from-[#05080A]/85 via-[#05080A]/10 to-transparent" aria-hidden />
              <span className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 p-7 text-center">
                <span className="display text-3xl">{label}</span>
                <span className={`${u} text-[var(--surface)]/75`}>{c.view} ({counts[kind] ?? 0}) <span aria-hidden>{lang === "ar" ? "←" : "→"}</span></span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CalmServices({ t, lang }: { t: Dict; lang: Lang }) {
  const s = t.services, ref = useFadeIn();
  return (
    <section id="services" data-depth={t.gauge.services} className="bg-[#0B1013] px-5 py-20 text-[var(--surface)] md:px-10 md:py-28">
      <div ref={ref} className="mx-auto max-w-6xl">
        <div data-fade className="max-w-2xl">
          <p className={`${u} text-[var(--bronze)]`}>{t.gauge.services}</p>
          <h2 className="display mt-4 text-4xl md:text-6xl">{s.title}</h2>
          <p className="mt-4 text-[var(--surface)]/70">{s.intro}</p>
        </div>
        <ul className="mt-12 border-t border-[var(--bronze)]/40 md:mt-16">
          {(s.items as unknown as [string, string, string[]][]).map(([name, text, tags]) => (
            <li key={name} data-fade className="grid gap-4 border-b border-[var(--bronze)]/40 py-9 md:grid-cols-12 md:gap-10 md:py-12">
              <h3 className="display text-2xl md:col-span-4 md:text-3xl">{name}</h3>
              <p className="leading-relaxed text-[var(--surface)]/75 md:col-span-5">{text}</p>
              <ul className="flex flex-wrap content-start gap-2 md:col-span-3">
                {tags.map((g) => <li key={g} className="rounded-full border border-[var(--surface)]/20 px-3 py-1.5 text-sm text-[var(--surface)]/75">{g}</li>)}
              </ul>
            </li>
          ))}
        </ul>
        <div data-fade className={`mt-12 ${u}`}><Btn href={`/${lang}#contact`}>{COPY[lang].book}</Btn></div>
      </div>
    </section>
  );
}

export function CalmSteps({ t }: { t: Dict }) {
  const a = t.approach, ref = useFadeIn();
  return (
    <section id="approach" data-depth={t.gauge.approach} className="bg-[#111619] px-5 py-20 text-[var(--surface)] md:px-10 md:py-28">
      <div ref={ref} className="mx-auto max-w-7xl">
        <div data-fade className="mx-auto max-w-2xl text-center">
          <p className={`${u} text-[var(--bronze)]`}>{t.gauge.approach}</p>
          <h2 className="display mt-4 text-4xl md:text-5xl">{a.title}</h2>
          <p className="mt-4 text-[var(--surface)]/70">{a.intro}</p>
        </div>
        <ol className="relative mt-14 grid gap-10 md:mt-20 md:grid-cols-4 md:gap-8">
          <span className="absolute inset-x-0 top-[7px] hidden h-px bg-[var(--bronze)]/50 md:block" aria-hidden />
          {a.steps.map(([name, text], i) => (
            <li key={name} data-fade className="relative" style={{ transitionDelay: `${i * 120}ms` }}>
              <span className="relative block h-[15px] w-[15px] rounded-full border border-[var(--bronze)] bg-[#111619]" aria-hidden><span className="absolute inset-[4px] rounded-full bg-[var(--bronze)]" /></span>
              <p className={`${u} mt-6 text-[var(--bronze)]`}>{a.step} {a.words[i]}</p>
              <h3 className="display mt-2 text-2xl">{name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--surface)]/70">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function CalmStudio({ t, lang }: { t: Dict; lang: Lang }) {
  const s = t.studio, ref = useFadeIn();
  return (
    <section id="studio" data-depth={t.gauge.studio} className="overflow-hidden bg-[#0B1013] px-5 py-20 text-[var(--surface)] md:px-10 md:py-28">
      <div ref={ref} className="mx-auto grid max-w-6xl items-center gap-14 md:grid-cols-2 md:gap-20">
        {/* the photograph inside a thin bronze frame set off from it */}
        <div data-fade className="relative mx-auto w-full max-w-md">
          <span className="absolute -inset-4 border border-[var(--bronze)]/60 md:-inset-6" aria-hidden />
          <div className="relative aspect-[4/5] overflow-hidden"><Image src="/projects/zayed-160/02.webp" alt="" fill sizes="(min-width:768px) 40vw, 90vw" className="object-cover" /></div>
        </div>
        <div data-fade>
          <p className={`${u} text-[var(--bronze)]`}>{s.eyebrow}</p>
          <h2 className="display mt-4 text-4xl leading-[1.12] rtl:leading-[1.35] md:text-5xl">{s.title}</h2>
          <p className="mt-6 leading-relaxed text-[var(--surface)]/75">{s.text}</p>
          <ul className="mt-8 space-y-4 border-t border-[var(--surface)]/15 pt-8">
            {s.values.map(([k, v]) => (
              <li key={k} className="flex gap-4"><span className="mt-2.5 h-px w-6 shrink-0 bg-[var(--bronze)]" aria-hidden /><span><span className="display text-lg">{k}</span><span className="block text-sm text-[var(--surface)]/65">{v}</span></span></li>
            ))}
          </ul>
          <div className={`mt-10 ${u}`}><Btn href={`/${lang}/studio`} variant="ghost">{s.eyebrow}</Btn></div>
        </div>
      </div>
    </section>
  );
}
