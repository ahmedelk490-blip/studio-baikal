import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { Compare } from "@/components/Compare";
import { Packages } from "@/components/Packages";
import { ShapeCycle } from "@/components/ShapeCycle";
import { Faq } from "@/components/Faq";
import { Btn } from "@/components/Btn";
import { BuildLayers } from "@/components/BuildLayers";
import { CalmServices } from "@/components/calm/PagesCalm";
import { extras } from "@/data/extras";
import { JsonLd } from "@/components/JsonLd";
import { dict, isLang } from "@/data/i18n";
import { pages } from "@/data/pages";
import { withSeo } from "@/lib/site";

export const instant = false;
type Props = { params: Promise<{ lang: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { lang } = await params; const ar = lang === "ar"; const meta: Metadata = { title: isLang(lang) ? pages[lang].services.eyebrow : "Services", description: ar ? "خدمات التصميم الداخلي في مصر: باقة الثري دي (مخططات، رندرات، جولة 360°) أو التصميم والتنفيذ الكامل مع إشراف موقعي." : "Interior design services in Egypt: 3D design package (plans, 3D renders, 360° tour) or full design and execution with site supervision.", alternates: { canonical: `/${lang}/services`, languages: { en: "/en/services", ar: "/ar/services" } } }; return isLang(lang) ? withSeo("services", lang, meta) : meta; }

const faqRooms = ["/projects/maadi-180/05.webp", "/projects/october-250/01.webp", "/projects/zayed-160/02.webp", "/projects/tagamo3-115/02.webp"];

/* Services page: the drawing-to-finished slider sweeps by itself in the hero; the two packages scroll
   beside a sticky Baikal arch that cycles their rooms through shape reveals; the FAQ sits in the deep
   next to a round window onto the rooms. */
export default async function Page({ params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const s = pages[lang].services, t = dict[lang];
  const faq = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: s.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) };
  const u = "text-xs uppercase tracking-[0.2em] rtl:tracking-normal";
  const calm = process.env.NEXT_PUBLIC_HOME === "calm";
  if (calm) return <PageShell lang={lang} dark><JsonLd lang={lang} extra={[faq]} /><CalmServices s={s} lang={lang}/></PageShell>;
  return (
    <PageShell lang={lang} dark>
      <JsonLd lang={lang} extra={[faq]} />
      <section className="relative overflow-hidden bg-[var(--deep)] px-5 pb-16 pt-28 text-[var(--surface)] md:px-10 md:pb-20 md:pt-36">
        <div className="hero-in relative grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8"><p className={`${u} eyebrow text-[var(--bronze)]`}>{s.eyebrow}</p><h1 className="display mt-4 text-5xl md:text-8xl">{s.title}</h1></div>
          <p className="max-w-sm text-sm text-[var(--surface)]/75 md:col-span-4">{s.intro}</p>
        </div>
        <div className="relative mt-12"><Compare src="/projects/october-250/01.webp" a={s.drawing} b={s.render} /></div>
      </section>
      <section className="bg-[var(--surface)] px-5 py-16 text-[var(--ink)] md:px-10 md:py-24">
        <Packages packs={s.packages} labels={t.services.labels} forLabel={s.forLabel} included={s.included} />
      </section>
      <BuildLayers c={extras[lang].layers} />
      <section className="bg-[var(--deep)] px-5 py-16 text-[var(--surface)] md:px-10 md:py-24">
        <div className="grid gap-10 md:grid-cols-12">
          {/* the title and its round window stay beside the questions while they are read */}
          <div className="self-start md:sticky md:top-28 md:col-span-4">
            <h2 className="display text-4xl md:text-5xl">{s.faqTitle}</h2>
            <ShapeCycle imgs={faqRooms} every={4200} sizes="(min-width:768px) 22vw, 70vw" className="mt-8 hidden aspect-square w-full max-w-[240px] rounded-full ring-1 ring-[var(--bronze)]/40 md:block" />
          </div>
          <div className="md:col-span-8"><Faq items={s.faq} /></div>
        </div>
        <div className="mt-16 border-t border-[var(--surface)]/10 pt-10"><Btn href={`/${lang}/contact`}>{s.cta}</Btn></div>
      </section>
    </PageShell>
  );
}