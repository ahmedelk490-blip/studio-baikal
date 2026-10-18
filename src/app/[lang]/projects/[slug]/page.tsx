import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { ProjectGallery } from "@/components/ProjectGallery";
import { MaskReveal } from "@/components/MaskReveal";
import { Btn } from "@/components/Btn";
import { Clip } from "@/components/Clip";
import { JsonLd } from "@/components/JsonLd";
import { projectVideo } from "@/data/media";
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
  return { title: `${p.name}, ${p.location}`, description: `${p.blurb} ${p.type} · ${p.area} · ${p.style}.`, alternates: { canonical: `/${lang}/projects/${slug}`, languages: { en: `/en/projects/${slug}`, ar: `/ar/projects/${slug}` } }, openGraph: { images: [p.cover] } };
}

/* One calm, organised layout for every project: split hero (text beside the cover or walkthrough clip,
   never over it), story + details panel, the autoplaying arch slider, then a split "next project" row. */
export default async function ProjectPage({ params }: Props) {
  const { lang, slug } = await params;
  const base = getProject(slug);
  if (!base || !isLang(lang)) notFound();
  const t = dict[lang];
  const p = localize(base, lang);
  const idx = projects.findIndex((x) => x.slug === p.slug);
  const next = localize(projects[(idx + 1) % projects.length], lang);
  const f = t.project.facts;
  const facts = [[f.type, p.type], [f.area, p.area], [f.rooms, `${p.images.length}`], [f.year, p.year], [f.style, p.style], [f.scope, p.scope]];
  const cover = p.images.find((i) => i.src === p.cover && i.w >= i.h) ?? p.images.find((i) => i.w >= i.h) ?? p.images[0];
  const video = projectVideo[p.slug];
  const crumbs = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Studio Baikal", item: `https://baikalstudio.com/${lang}` }, { "@type": "ListItem", position: 2, name: t.project.all, item: `https://baikalstudio.com/${lang}/projects` }, { "@type": "ListItem", position: 3, name: p.name, item: `https://baikalstudio.com/${lang}/projects/${p.slug}` }] };
  const u = "text-xs uppercase tracking-[0.2em] rtl:tracking-normal";
  const back = <Link href={`/${lang}/projects`} className={`${u} inline-block py-3 opacity-70`}>{t.project.all}</Link>;
  return (
    <PageShell lang={lang}>
      <JsonLd lang={lang} extra={[crumbs]} />
      <section className="relative overflow-hidden bg-[var(--surface)] px-5 pb-12 pt-24 text-[var(--ink)] md:px-10 md:pb-16 md:pt-32">
        <div className="relative grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="hero-in lg:col-span-5">
            {back}
            <p className={`${u} eyebrow mt-2 text-[var(--bronze)]`}>{p.type} · <span dir="ltr">{p.area}</span></p>
            <h1 className="display mt-3 text-5xl leading-[1.05] rtl:leading-[1.3] md:text-7xl">{p.name}</h1>
            <p className="mt-4 text-sm text-[var(--muted)]">{p.location}</p>
            <p className="mt-6 max-w-md text-lg leading-relaxed">{p.blurb}</p>
          </div>
          <MaskReveal className="relative overflow-hidden rounded-2xl lg:col-span-7">
            {video
              ? <Clip src={video} poster={cover.src} alt={`${p.name}, ${cover.room}`} priority className="aspect-[16/10] w-full" sizes="(min-width:1024px) 58vw, 100vw" />
              : <Image src={cover.src} alt={`${p.name}, ${cover.room}`} width={cover.w} height={cover.h} priority sizes="(min-width:1024px) 58vw, 100vw" className="h-auto max-h-[78vh] w-full object-contain" />}
          </MaskReveal>
        </div>
      </section>

      <section className="border-t border-[var(--ink)]/10 bg-[var(--surface)] px-5 pb-14 pt-14 text-[var(--ink)] md:px-10 md:pb-20 md:pt-20">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className={`${u} eyebrow text-[var(--bronze)]`}>{t.project.story}</p>
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
        <ProjectGallery images={p.images} name={p.name} t={t} variant={0} />
      </section>

      {/* next project: text beside its cover in a Baikal arch (no text over the photo) */}
      <section className="bg-[var(--deep)] px-5 py-16 text-[var(--surface)] md:px-10 md:py-24">
        <div className="grid items-center gap-10 md:grid-cols-12">
          <Link href={`/${lang}/projects/${next.slug}`} className="group order-2 block md:order-1 md:col-span-7">
            <p className={`${u} eyebrow text-[var(--bronze)]`}>{t.project.next}</p>
            <p className="display mt-3 text-5xl transition-colors duration-500 group-hover:text-[var(--bronze)] md:text-7xl">{next.name}</p>
            <p className="mt-3 text-sm text-[var(--surface)]/70">{next.location}</p>
          </Link>
          <Link href={`/${lang}/projects/${next.slug}`} aria-label={next.name} className="group relative order-1 mx-auto block aspect-[4/5] w-full max-w-xs overflow-hidden rounded-b-2xl rounded-t-full ring-1 ring-[var(--bronze)]/35 md:order-2 md:col-span-5">
            <Image src={next.cover} alt={next.name} fill sizes="(min-width:768px) 30vw, 80vw" className="object-cover transition-transform duration-[1200ms] group-hover:scale-105" />
          </Link>
        </div>
        <div className="mt-12 border-t border-[var(--surface)]/10 pt-8"><Btn href={`/${lang}/contact`}>{t.project.start}</Btn></div>
      </section>
    </PageShell>
  );
}