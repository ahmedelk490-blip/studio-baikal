import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Gallery } from "@/components/Gallery";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { projects, getProject } from "@/data/projects";

export const instant = false;
type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() { return projects.map((p) => ({ slug: p.slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getProject((await params).slug);
  return p ? { title: `${p.name}, ${p.location}`, description: p.blurb, openGraph: { images: [p.cover] } } : {};
}

export default async function ProjectPage({ params }: Props) {
  const p = getProject((await params).slug);
  if (!p) notFound();
  const idx = projects.findIndex((x) => x.slug === p.slug);
  const next = projects[(idx + 1) % projects.length];
  const facts = [["Type", p.type], ["Area", p.area], ["Rooms", `${p.images.length}`], ["Year", p.year], ["Style", p.style], ["Scope", p.scope]];
  return (
    <>
      <Header dark />
      <main className="bg-[var(--surface)] text-[var(--ink)]">
        <section className="relative h-[92svh] overflow-hidden bg-[var(--deep)] text-[var(--surface)]">
          <Image src={p.cover} alt={`${p.name}, ${p.location}`} fill priority sizes="100vw" className="ken object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--deep)] via-[var(--deep)]/30 to-transparent" />
          <div className="hero-in absolute inset-x-0 bottom-0 px-5 pb-10 md:px-10 md:pb-14">
            <Link href="/#projects" className="inline-block whitespace-nowrap py-3 text-xs uppercase tracking-[0.2em] rtl:tracking-normal text-[var(--surface)]/70">All projects</Link>
            <h1 className="display text-[12vw] leading-[1.02] md:text-[7vw]">{p.name}</h1>
            <p className="mt-2 text-sm uppercase tracking-[0.18em] rtl:tracking-normal text-[var(--surface)]/80">{p.location}</p>
          </div>
        </section>

        <section className="px-5 md:px-10">
          <dl className="grid grid-cols-2 border-b border-[var(--ink)]/15 sm:grid-cols-3 md:grid-cols-6">
            {facts.map(([k, v]) => (
              <div key={k} className="border-t border-[var(--ink)]/15 py-5 pr-4">
                <dt className="text-xs uppercase tracking-[0.16em] rtl:tracking-normal text-[var(--bronze)]">{k}</dt>
                <dd className="mt-1 text-sm">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="grid gap-10 py-16 md:grid-cols-12 md:py-24">
            <div className="md:col-span-7">
              <p className="text-xs uppercase tracking-[0.2em] rtl:tracking-normal text-[var(--bronze)]">The story</p>
              <p className="display mt-4 text-3xl leading-[1.25] md:text-5xl">{p.blurb}</p>
              <p className="mt-6 max-w-2xl text-base text-[var(--muted)] md:text-lg">{p.story}</p>
            </div>
            <div className="md:col-span-5 md:pl-10">
              <p className="text-xs uppercase tracking-[0.2em] rtl:tracking-normal text-[var(--bronze)]">Materials</p>
              <ul className="mt-3 border-t border-[var(--ink)]/15">
                {p.materials.map((m) => <li key={m} className="border-b border-[var(--ink)]/15 py-3 text-sm">{m}</li>)}
              </ul>
            </div>
          </div>
        </section>

        <section className="px-5 pb-24 md:px-10 md:pb-32">
          <Gallery images={p.images} name={p.name} />
        </section>

        <section className="bg-[var(--deep)] text-[var(--surface)]">
          <div className="flex flex-wrap items-center justify-between gap-6 px-5 py-14 md:px-10 md:py-20">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] rtl:tracking-normal text-[var(--bronze)]">Next project</p>
              <Link href={`/projects/${next.slug}`} className="display mt-2 block text-4xl md:text-6xl">{next.name}</Link>
            </div>
            <Link href="/#contact" className="inline-block border-b border-[var(--bronze)] py-2 text-xs uppercase tracking-[0.2em] rtl:tracking-normal">Start your project</Link>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  );
}