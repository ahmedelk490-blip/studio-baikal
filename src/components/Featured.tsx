import Image from "next/image";
import Link from "next/link";
import { Reveal } from "./Reveal";
import { MaskReveal } from "./MaskReveal";
import type { Project } from "@/data/projects";
import type { Dict, Lang } from "@/data/i18n";

/* 150 m: featured homes as a photo bento with spec rows + one text card (the Zenith Realty shape). */
export function Featured({ projects, t, lang }: { projects: Project[]; t: Dict; lang: Lang }) {
  const pick = ["el-nakhil-villa", "maadi-285", "tagamo3-115"].map((s) => projects.find((p) => p.slug === s)!);
  const u = "text-xs uppercase tracking-[0.16em] rtl:tracking-normal";
  const Spec = ({ p }: { p: Project }) => (
    <dl className="mt-3 grid grid-cols-4 gap-2 border-t border-[var(--ink)]/15 pt-3">
      {[[t.featured.specs.type, p.type], [t.featured.specs.area, p.area], [t.featured.specs.rooms, String(p.images.length)], [t.featured.specs.year, p.year]].map(([k, v]) => (
        <div key={k}><dt className={`${u} text-[var(--muted)]`}>{k}</dt><dd className="mt-0.5 text-sm">{v}</dd></div>
      ))}
    </dl>
  );
  return (
    <section data-depth={t.gauge.featured} data-meters="150 m" className="bg-[var(--mist)] text-[var(--ink)]">
      <div className="px-5 py-16 md:px-10 md:py-24">
        <Reveal className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className={`${u} text-[var(--bronze)]`}>{t.featured.eyebrow}</p>
            <h2 className="display mt-3 text-5xl md:text-7xl">{t.featured.title}</h2>
          </div>
          <p className="max-w-sm text-sm text-[var(--muted)] md:col-span-5">{t.featured.intro}</p>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-12">
          <Reveal className="md:col-span-7" delay={1}>
            <Link href={`/${lang}/projects/${pick[0].slug}`} className="group block">
              <MaskReveal className="relative aspect-[16/9] overflow-hidden"><Image src={pick[0].cover} alt={pick[0].name} fill sizes="(min-width:768px) 58vw, 100vw" className="object-cover" /></MaskReveal>
              <span className="mt-4 flex items-baseline justify-between gap-4"><span className="display text-3xl">{pick[0].name}</span><span className={`${u} text-[var(--muted)]`}>{pick[0].location}</span></span>
              <Spec p={pick[0]} />
            </Link>
          </Reveal>
          <Reveal className="flex flex-col justify-between bg-[var(--deep)] p-7 text-[var(--surface)] md:col-span-5 md:p-10" delay={2}>
            <div>
              <p className={`${u} text-[var(--bronze)]`}>{t.featured.card.eyebrow}</p>
              <p className="display mt-4 text-3xl md:text-4xl">{t.featured.card.title}</p>
              <p className="mt-4 max-w-sm text-sm text-[var(--surface)]/70">{t.featured.card.text}</p>
            </div>
            <a href={`/${lang}#services`} className={`${u} mt-10 inline-block w-fit border-b border-[var(--bronze)] py-2`}>{t.featured.card.link}</a>
          </Reveal>
          {pick.slice(1).map((p, k) => (
            <Reveal key={p.slug} className="md:col-span-6" delay={(k + 1) as 1 | 2}>
              <Link href={`/${lang}/projects/${p.slug}`} className="group block">
                <MaskReveal className="relative aspect-[16/9] overflow-hidden"><Image src={p.cover} alt={p.name} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" /></MaskReveal>
                <span className="mt-4 flex items-baseline justify-between gap-4"><span className="display text-3xl">{p.name}</span><span className={`${u} text-[var(--muted)]`}>{p.location}</span></span>
                <Spec p={p} />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}