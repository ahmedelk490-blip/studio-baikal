import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { Gallery } from "@/components/Gallery";
import { FilmStrip } from "@/components/FilmStrip";
import { MaskReveal } from "@/components/MaskReveal";
import { Contours } from "@/components/Contours";
import { Btn } from "@/components/Btn";
import { projects, getProject, localize } from "@/data/projects";
import { dict, isLang, langs } from "@/data/i18n";

export const instant = false;
type Props = { params: Promise<{ lang: string; slug: string }> };

export function generateStaticParams() { return langs.flatMap((lang) => projects.map((p) => ({ lang, slug: p.slug }))); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const base = getProject(slug);
  if (!base || !isLang(lang)) return {};
  const p = localize(base, lang);
  return { title: `${p.name}, ${p.location}`, description: p.blurb, openGraph: { images: [p.cover] } };
}

/* Three hero treatments rotate by project (full-bleed / split / centred over a contained cover);
   the body is the same calm system: story + details panel, then the uncropped mosaic. */
export default async function ProjectPage({ params }: Props) {
  const { lang, slug } = await params;
  const base = getProject(slug);
  if (!base || !isLang(lang)) notFound();
  const t = dict[lang];
  const p = localize(base, lang);
  const idx = projects.findIndex((x) => x.slug === p.slug);
  const v = idx % 3;
  const next = localize(projects[(idx + 1) % projects.length], lang);
  const f = t.project.facts;
  const facts = [[f.type, p.type], [f.area, p.area], [f.rooms, `${p.images.length}`], [f.year, p.year], [f.style, p.style], [f.scope, p.scope]];
  const cover = p.images.find((i) => i.src === p.cover && i.w >= i.h) ?? p.images.find((i) => i.w >= i.h) ?? p.images[0];
  const u = "text-xs uppercase tracking-[0.2em] rtl:tracking-normal";
  const back = <Link href={`/${lang}/projects`} className={`${u} inline-block py-3 opacity-70`}>{t.project.all}</Link>;
  return (
    <PageShell lang={lang} dark={v !== 1}>
      {v === 0 && (
        <section className="relative h-[92svh] overflow-hidden bg-[var(--deep)] text-[var(--surface)]">
          <Image src={p.cover} alt={`${p.name}, ${p.location}`} fill priority sizes="100vw" className="ken object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--deep)] via-[var(--deep)]/30 to-transparent" />
          <div className="hero-in absolute inset-x-0 bottom-0 px-5 pb-10 md:px-10 md:pb-14">
            {back}
            <h1 className="display text-[12vw] leading-[1.02] rtl:leading-[1.3] md:text-[7vw]">{p.name}</h1>
            <p className="mt-2 text-sm uppercase tracking-[0.18em] rtl:tracking-normal text-[var(--surface)]/80">{p.location}</p>
          </div>
        </section>
      )}
      {v === 1 && (
        <section className="relative overflow-hidden bg-[var(--surface)] px-5 pb-12 pt-24 text-[var(--ink)] md:px-10 md:pt-32">
          <Contours className="pointer-events-none absolute inset-x-0 top-10 h-1/2 opacity-40" />
          <div className="relative grid items-center gap-10 lg:grid-cols-12">
            <div className="hero-in lg:col-span-5">
              {back}
              <p className={`${u} text-[var(--bronze)]`}>{p.type} · {p.area}</p>
              <h1 className="display mt-3 text-6xl leading-[1.02] rtl:leading-[1.3] md:text-8xl">{p.name}</h1>
              <p className="mt-4 text-sm text-[var(--muted)]">{p.location}</p>
              <p className="mt-6 max-w-md text-lg">{p.blurb}</p>
            </div>
            <MaskReveal className="relative lg:col-span-7"><Image src={cover.src} alt={`${p.name}, ${cover.room}`} width={cover.w} height={cover.h} priority sizes="(min-width:1024px) 58vw, 100vw" className="mx-auto h-auto max-h-[80vh] w-auto max-w-full" /></MaskReveal>
          </div>
        </section>
      )}
      {v === 2 && (
        <section className="relative overflow-hidden bg-[var(--deep)] px-5 pb-0 pt-28 text-center text-[var(--surface)] md:px-10 md:pt-36">
          <Contours className="pointer-events-none absolute inset-x-0 top-0 h-2/3 opacity-40" />
          <div className="hero-in relative">
            {back}
            <h1 className="display mx-auto max-w-5xl text-6xl leading-[1.02] rtl:leading-[1.3] md:text-9xl">{p.name}</h1>
            <p className="mt-4 text-sm uppercase tracking-[0.18em] rtl:tracking-normal text-[var(--surface)]/75">{p.location} · {p.style}</p>
          </div>
          <MaskReveal className="relative mx-auto mt-12 max-w-6xl translate-y-16"><Image src={cover.src} alt={`${p.name}, ${cover.room}`} width={cover.w} height={cover.h} priority sizes="(min-width:1024px) 72rem, 100vw" className="h-auto w-full" /></MaskReveal>
        </section>
      )}

      <section className={`bg-[var(--surface)] px-5 text-[var(--ink)] md:px-10 ${v === 2 ? "pt-28 md:pt-32" : "pt-14 md:pt-20"} pb-14 md:pb-20`}>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className={`${u} text-[var(--bronze)]`}>{t.project.story}</p>
            <p className="display mt-4 text-3xl leading-[1.2] rtl:leading-[1.5] md:text-5xl">{p.blurb}</p>
            <p className="mt-6 max-w-2xl text-base text-[var(--muted)] md:text-lg">{p.story}</p>
          </div>
          <aside className="rounded-3xl bg-[var(--deep)] p-6 text-[var(--surface)] md:p-8 lg:col-span-5">
            <dl className="grid grid-cols-2 gap-x-6">
              {facts.map(([k, val]) => (
                <div key={k} className="border-b border-[var(--surface)]/15 py-3">
                  <dt className="text-xs uppercase tracking-[0.16em] rtl:tracking-normal text-[var(--bronze)]">{k}</dt>
                  <dd className="mt-1 text-sm">{val}</dd>
                </div>
              ))}
            </dl>
            <p className={`${u} mt-6 text-[var(--bronze)]`}>{t.project.materials}</p>
            <ul className="mt-3 flex flex-wrap gap-2">{p.materials.map((m) => <li key={m} className="rounded-full border border-[var(--surface)]/25 px-3 py-1.5 text-sm">{m}</li>)}</ul>
          </aside>
        </div>
      </section>

      <section className="bg-[var(--surface)] px-5 pb-20 text-[var(--ink)] md:px-10 md:pb-24">
        {v === 1 ? <FilmStrip images={p.images} name={p.name} t={t} /> : <Gallery images={p.images} name={p.name} t={t} />}
      </section>

      <section className="relative overflow-hidden bg-[var(--deep)] text-[var(--surface)]">
        <Image src={next.cover} alt="" fill sizes="100vw" className="object-cover opacity-35" />
        <div className="relative flex flex-wrap items-end justify-between gap-6 px-5 py-20 md:px-10 md:py-28">
          <Link href={`/${lang}/projects/${next.slug}`} className="group block">
            <p className={`${u} text-[var(--bronze)]`}>{t.project.next}</p>
            <p className="display mt-2 text-5xl transition-transform duration-500 group-hover:translate-x-2 md:text-7xl">{next.name}</p>
            <p className="mt-2 text-sm text-[var(--surface)]/75">{next.location}</p>
          </Link>
          <Btn href={`/${lang}/contact`}>{t.project.start}</Btn>
        </div>
      </section>
    </PageShell>
  );
}