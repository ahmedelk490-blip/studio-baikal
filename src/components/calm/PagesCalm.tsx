"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useFadeIn } from "./useFadeIn";
import { Btn } from "../Btn";
import { Faq } from "../Faq";
import type { Dict, Lang } from "@/data/i18n";
import type { PagesDict } from "@/data/pages";
import type { PublicProject } from "@/lib/content";

/* The calm version's inner pages (NEXT_PUBLIC_HOME=calm), all on the same dark as the calm home:
   the archive as a board of arched covers with type filters, services as two plain columns, the studio
   as a few chapters beside a few photographs. Fades only; nothing holds the page. */
const u = "text-xs uppercase tracking-[0.24em] rtl:tracking-normal";
const BG = "bg-[#0B1013] text-[var(--surface)]";
const CTA = {
  en: { t: "Have a space in mind?", s: "Tell us about it. We reply within one working day, and the first consultation is free.", b: "Book a free consultation" },
  ar: { t: "عندك مساحة في بالك؟", s: "احكِ لنا عنها. نرد عليك خلال يوم عمل واحد، والاستشارة الأولى مجانية.", b: "احجز استشارة مجانية" },
} as const;

/* The one closing every calm inner page shares: a hairline, a short question, one line, one button. */
export function CalmCta({ lang }: { lang: Lang }) {
  const c = CTA[lang], ref = useFadeIn();
  return (
    <div ref={ref} className="mx-auto mt-24 max-w-6xl border-t border-[var(--bronze)]/20 pt-16 md:mt-32 md:pt-24">
      <div data-fade className="mx-auto max-w-2xl text-center">
        <h2 className="display text-4xl md:text-5xl">{c.t}</h2>
        <p className="mx-auto mt-5 max-w-md text-[var(--surface)]/70">{c.s}</p>
        <div className={`mt-10 flex justify-center ${u}`}><Btn href={`/${lang}/contact`}>{c.b}</Btn></div>
      </div>
    </div>
  );
}


function Head({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <div data-fade className="mx-auto max-w-3xl text-center">
      <p className={`${u} eyebrow text-[var(--bronze)]`}>{eyebrow}</p>
      <h1 className="display mt-5 text-4xl leading-[1.1] rtl:leading-[1.3] md:text-6xl">{title}</h1>
      {intro && <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-[var(--surface)]/70 md:text-base">{intro}</p>}
    </div>
  );
}

/* Archive: filters as plain words with a bronze underline, then every home as an arched cover with its
   name and place under it, three to a row (two on phones). The ?type= from the home tiles preselects. */
export function CalmArchive({ rows, lang, p }: { rows: PublicProject[]; lang: Lang; p: PagesDict["projects"] }) {
  const [f, setF] = useState("all");
  const kinds = ["all", ...Array.from(new Set(rows.map((r) => r.kind)))];
  // the ?type= from the home tiles is only known in the browser, so it is read once after hydration
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { const k = new URLSearchParams(location.search).get("type"); if (k && rows.some((r) => r.kind === k)) setF(k); }, [rows]);
  const list = f === "all" ? rows : rows.filter((r) => r.kind === f);
  const ref = useFadeIn([f]);
  return (
    <section className={`${BG} px-5 pb-20 pt-28 md:px-10 md:pb-28 md:pt-36`}>
      <div ref={ref} className="mx-auto max-w-7xl">
        <Head eyebrow={p.eyebrow} title={p.title} intro={p.intro} />
        <div data-fade className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3 md:mt-14" role="tablist">
          {kinds.map((k) => (
            <button key={k} type="button" role="tab" aria-selected={f === k} onClick={() => setF(k)} className={`${u} relative min-h-11 pb-1 transition-colors ${f === k ? "text-[var(--surface)]" : "text-[var(--surface)]/50 [@media(hover:hover)]:hover:text-[var(--surface)]/80"}`}>
              {k === "all" ? p.all : p.filters[k] ?? k}
              <span className={`absolute inset-x-0 bottom-2 h-px bg-[var(--bronze)] transition-transform duration-500 ${f === k ? "scale-x-100" : "scale-x-0"}`} aria-hidden />
            </button>
          ))}
        </div>
        {/* keyed on the filter so the covers fade in afresh on every switch and the list never looks empty */}
        <ul key={f} className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:mt-10 md:grid-cols-3 md:gap-x-8 md:gap-y-14">
          {list.map((r, i) => (
            <li key={r.slug} data-fade style={{ transitionDelay: `${(i % 3) * 90}ms` }}>
              <Link href={`/${lang}/projects/${r.slug}`} className="group block">
                <span className="relative block aspect-[3/4] overflow-hidden rounded-b-xl rounded-t-full ring-1 ring-[var(--bronze)]/35">
                  <Image src={r.cover} alt={r.name} fill sizes="(min-width:768px) 30vw, 48vw" className="object-cover transition-transform duration-[1200ms] ease-out [@media(hover:hover)]:group-hover:scale-105" />
                </span>
                <span className="mt-4 block text-center">
                  <span className="display block text-lg leading-snug transition-colors md:text-2xl [@media(hover:hover)]:group-hover:text-[var(--bronze)]">{r.name}</span>
                  <span className={`${u} mt-1 block text-[var(--bronze)]`}>{r.type} · {r.location}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <CalmCta lang={lang} />
      </div>
    </section>
  );
}

/* Services: the two packages as two quiet columns (who it is for, what you get), the questions under
   them, one button. */
export function CalmServices({ s, lang }: { s: PagesDict["services"]; lang: Lang }) {
  const ref = useFadeIn();
  return (
    <section className={`${BG} px-5 pb-20 pt-28 md:px-10 md:pb-28 md:pt-36`}>
      <div ref={ref} className="mx-auto max-w-6xl">
        <Head eyebrow={s.eyebrow} title={s.title} />
        <div className="mt-14 grid gap-6 md:mt-20 md:grid-cols-2 md:gap-8">
          {s.packages.map((pk, i) => (
            <article key={pk.name} data-fade style={{ transitionDelay: `${i * 120}ms` }} className="rounded-2xl border border-[var(--surface)]/12 p-7 md:p-10">
              <h2 className="display text-3xl md:text-4xl">{pk.name}</h2>
              <p className={`${u} mt-4 text-[var(--bronze)]`}>{s.forLabel}</p>
              <p className="mt-2 text-[var(--surface)]/75">{pk.for}</p>
              <p className={`${u} mt-8 text-[var(--bronze)]`}>{s.included}</p>
              <ul className="mt-3 divide-y divide-[var(--surface)]/10">
                {pk.items.map((it) => <li key={it} className="flex gap-3 py-3 text-sm md:text-base"><span className="mt-2.5 h-px w-4 shrink-0 bg-[var(--bronze)]" aria-hidden />{it}</li>)}
              </ul>
            </article>
          ))}
        </div>
        <div data-fade className="mx-auto mt-20 max-w-3xl md:mt-28">
          <h2 className="display text-center text-3xl md:text-4xl">{s.faqTitle}</h2>
          <div className="mt-8"><Faq items={s.faq} /></div>
        </div>
        <CalmCta lang={lang} />
      </div>
    </section>
  );
}

/* Studio: the name's meaning as a quiet opening, then three chapters, each beside one room, alternating
   sides; the values as three short lines; one button. */
const STUDIO_ROOMS = ["/projects/zayed-160/02.webp", "/projects/october-250/04.webp", "/projects/el-nakhil-villa/01.webp"];
export function CalmStudio({ s, t, lang }: { s: PagesDict["studio"]; t: Dict; lang: Lang }) {
  const ref = useFadeIn();
  return (
    <section className={`${BG} px-5 pb-20 pt-28 md:px-10 md:pb-28 md:pt-36`}>
      <div ref={ref} className="mx-auto max-w-6xl">
        <Head eyebrow={s.eyebrow} title={s.title} intro={s.intro} />
        <div className="mt-16 space-y-16 md:mt-24 md:space-y-28">
          {s.chapters.map(([h, text], i) => (
            <div key={h} data-fade className="grid items-center gap-8 md:grid-cols-2 md:gap-16">
              <div className={`relative aspect-[4/5] overflow-hidden rounded-2xl ${i % 2 ? "md:order-2" : ""}`}>
                <Image src={STUDIO_ROOMS[i % STUDIO_ROOMS.length]} alt="" fill sizes="(min-width:768px) 45vw, 100vw" className="object-cover" />
              </div>
              <div className={i % 2 ? "md:order-1" : ""}>
                <p className={`${u} text-[var(--bronze)]`}>{h}</p>
                <p className="display mt-4 text-2xl leading-[1.35] rtl:leading-[1.6] md:text-3xl">{text}</p>
              </div>
            </div>
          ))}
        </div>
        <div data-fade className="mt-20 border-t border-[var(--surface)]/12 pt-14 md:mt-28">
          <h2 className="display text-center text-3xl md:text-4xl">{s.valuesTitle}</h2>
          <ul className="mx-auto mt-10 grid max-w-4xl gap-8 md:grid-cols-3">
            {t.studio.values.map(([k, v]) => (
              <li key={k} className="text-center"><span className="display block text-xl">{k}</span><span className="mt-2 block text-sm text-[var(--surface)]/65">{v}</span></li>
            ))}
          </ul>
        </div>
        <CalmCta lang={lang} />
      </div>
    </section>
  );
}
