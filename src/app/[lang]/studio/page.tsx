import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { StudioStory } from "@/components/StudioStory";
import { ShapeCycle } from "@/components/ShapeCycle";
import { Btn } from "@/components/Btn";
import { dict, isLang } from "@/data/i18n";
import { pages } from "@/data/pages";
import { withSeo } from "@/lib/site";

export const instant = false;
type Props = { params: Promise<{ lang: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { lang } = await params; const ar = lang === "ar"; const meta: Metadata = { title: isLang(lang) ? pages[lang].studio.eyebrow : "Studio", description: ar ? "استوديو بايكال استوديو تصميم داخلي في مصر أسسته شقيقتان: مساحات هادئة وشخصية مستوحاة من الطبيعة." : "Studio Baikal is an interior design studio in Egypt founded by two sisters: calm, timeless, personal spaces inspired by nature.", alternates: { canonical: `/${lang}/studio`, languages: { en: "/en/studio", ar: "/ar/studio" } } }; return isLang(lang) ? withSeo("studio", lang, meta) : meta; }

export default async function Page({ params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const s = pages[lang].studio, t = dict[lang];
  return (
    <PageShell lang={lang} dark>
      <section className="relative h-[88svh] overflow-hidden bg-[var(--deep)] text-[var(--surface)]">
        <Image src="/brand/hero-arch.webp" alt="" fill priority sizes="100vw" className="ken object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--deep)] via-[var(--deep)]/40 to-[var(--deep)]/20" />
        <div className="hero-in absolute inset-x-0 bottom-0 px-5 pb-12 md:px-10 md:pb-16">
          <p className="eyebrow text-xs uppercase tracking-[0.2em] rtl:tracking-normal text-[var(--bronze)]">{s.eyebrow}</p>
          <h1 className="display mt-4 max-w-4xl text-5xl md:text-8xl">{s.title}</h1>
          <p className="mt-5 max-w-xl text-base text-[var(--surface)]/80">{s.intro}</p>
        </div>
      </section>
      <StudioStory s={s} t={t} />
      {/* two-column close: the invitation on one side, a Baikal arch cycling finished rooms on the other */}
      <section className="bg-[var(--surface)] px-5 py-16 text-[var(--ink)] md:px-10 md:py-24">
        <div className="grid items-center gap-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="eyebrow text-xs uppercase tracking-[0.2em] rtl:tracking-normal text-[var(--bronze)]">{t.nav.book}</p>
            <h2 className="display mt-3 text-4xl md:text-6xl">{s.cta}</h2>
            <p className="mt-4 max-w-md text-sm text-[var(--muted)]">{t.footer.cta}</p>
            <div className="mt-8"><Btn href={`/${lang}/contact`} variant="dark">{t.nav.book}</Btn></div>
          </div>
          <ShapeCycle imgs={["/projects/october-250/01.webp", "/projects/el-nakhil-villa/01.webp", "/projects/maadi-180/05.webp", "/projects/zayed-160/02.webp"]} sizes="(min-width:768px) 36vw, 90vw" className="mx-auto aspect-[4/5] w-full max-w-sm rounded-b-2xl rounded-t-full ring-1 ring-[var(--bronze)]/30 md:col-span-5" />
        </div>
      </section>
    </PageShell>
  );
}