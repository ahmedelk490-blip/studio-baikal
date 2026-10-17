import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { StudioStory } from "@/components/StudioStory";
import { Contours } from "@/components/Contours";
import { Btn } from "@/components/Btn";
import { dict, isLang } from "@/data/i18n";
import { pages } from "@/data/pages";

export const instant = false;
type Props = { params: Promise<{ lang: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { lang } = await params; const ar = lang === "ar"; return { title: isLang(lang) ? pages[lang].studio.eyebrow : "Studio", description: ar ? "استوديو بايكال استوديو تصميم داخلي في مصر أسسته شقيقتان: مساحات هادئة وشخصية مستوحاة من الطبيعة." : "Studio Baikal is an interior design studio in Egypt founded by two sisters: calm, timeless, personal spaces inspired by nature.", alternates: { canonical: `/${lang}/studio`, languages: { en: "/en/studio", ar: "/ar/studio" } } }; }

export default async function Page({ params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const s = pages[lang].studio, t = dict[lang];
  return (
    <PageShell lang={lang} dark>
      <section className="relative h-[88svh] overflow-hidden bg-[var(--deep)] text-[var(--surface)]">
        <Image src="/brand/hero-arch.webp" alt="" fill priority sizes="100vw" className="ken object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--deep)] via-[var(--deep)]/40 to-[var(--deep)]/20" />
        <Contours className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 opacity-50" />
        <div className="hero-in absolute inset-x-0 bottom-0 px-5 pb-12 md:px-10 md:pb-16">
          <p className="text-xs uppercase tracking-[0.2em] rtl:tracking-normal text-[var(--bronze)]">{s.eyebrow}</p>
          <h1 className="display mt-4 max-w-4xl text-5xl md:text-8xl">{s.title}</h1>
          <p className="mt-5 max-w-xl text-base text-[var(--surface)]/80">{s.intro}</p>
        </div>
      </section>
      <StudioStory s={s} t={t} />
      <section className="bg-[var(--surface)] px-5 py-16 text-center md:py-20"><Btn href={`/${lang}/contact`} variant="dark">{s.cta}</Btn></section>
    </PageShell>
  );
}