import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Gallery } from "@/components/Gallery";
import { WhatsAppFab } from "@/components/WhatsAppFab";
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
  const u = "text-xs uppercase tracking-[0.2em] rtl:tracking-normal";
  return (
    <>
      <Header t={t} lang={lang} dark />
      <main className="bg-[var(--surface)] text-[var(--ink)]">
        <section className="relative h-[92svh] overflow-hidden bg-[var(--deep)] text-[var(--surface)]">
          <Image src={p.cover} alt={`${p.name}, ${p.location}`} fill priority sizes="100vw" className="ken object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--deep)] via-[var(--deep)]/30 to-transparent" />
          <div className="hero-in absolute inset-x-0 bottom-0 px-5 pb-10 md:px-10 md:pb-14">
            <Link href={`/${lang}#projects`} className={`${u} block w-fit whitespace-nowrap py-3 text-[var(--surface)]/70`}>{t.project.all}</Link>
            <h1 className="display text-[12vw] leading-[1.02] rtl:leading-[1.3] md:text-[7vw]">{p.name}</h1>
            <p className="mt-2 text-sm uppercase tracking-[0.18em] rtl:tracking-normal text-[var(--surface)]/80">{p.location}</p>
          </div>
        </section>
        <section className="px-5 md:px-10">
          <dl className="grid grid-cols-2 border-b border-[var(--ink)]/15 sm:grid-cols-3 md:grid-cols-6">
            {facts.map(([k, v]) => (
              <div key={k} className="border-t border-[var(--ink)]/15 py-5 pe-4">
                <dt className="text-xs uppercase tracking-[0.16em] rtl:tracking-normal text-[var(--bronze)]">{k}</dt>
                <dd className="mt-1 text-sm">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="grid gap-10 py-16 md:grid-cols-12 md:py-24">
            <div className="md:col-span-7">
              <p className={`${u} text-[var(--bronze)]`}>{t.project.story}</p>
              <p className="display mt-4 text-3xl leading-[1.25] rtl:leading-[1.35] md:text-5xl">{p.blurb}</p>
              <p className="mt-6 max-w-2xl text-base text-[var(--muted)] md:text-lg">{p.story}</p>
            </div>
            <div className="md:col-span-5 md:ps-10">
              <p className={`${u} text-[var(--bronze)]`}>{t.project.materials}</p>
              <ul className="mt-3 border-t border-[var(--ink)]/15">{p.materials.map((m) => <li key={m} className="border-b border-[var(--ink)]/15 py-3 text-sm">{m}</li>)}</ul>
            </div>
          </div>
        </section>
        <section className="px-5 pb-24 md:px-10 md:pb-32"><Gallery images={p.images} name={p.name} t={t} /></section>
        <section className="bg-[var(--deep)] text-[var(--surface)]">
          <div className="flex flex-wrap items-center justify-between gap-6 px-5 py-14 md:px-10 md:py-20">
            <div>
              <p className={`${u} text-[var(--bronze)]`}>{t.project.next}</p>
              <Link href={`/${lang}/projects/${next.slug}`} className="display mt-2 block text-4xl md:text-6xl">{next.name}</Link>
            </div>
            <Link href={`/${lang}#contact`} className={`${u} inline-block border-b border-[var(--bronze)] py-2`}>{t.project.start}</Link>
          </div>
        </section>
      </main>
      <Footer t={t} lang={lang} />
      <WhatsAppFab label={t.contact.fab} />
    </>
  );
}