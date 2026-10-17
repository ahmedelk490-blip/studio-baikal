import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { Contours } from "@/components/Contours";
import { Compare } from "@/components/Compare";
import { MaskReveal } from "@/components/MaskReveal";
import { Ticks } from "@/components/Ticks";
import { Faq } from "@/components/Faq";
import { Btn } from "@/components/Btn";
import { JsonLd } from "@/components/JsonLd";
import { dict, isLang } from "@/data/i18n";
import { pages } from "@/data/pages";

export const instant = false;
type Props = { params: Promise<{ lang: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { lang } = await params; const ar = lang === "ar"; return { title: isLang(lang) ? pages[lang].services.eyebrow : "Services", description: ar ? "خدمات التصميم الداخلي في مصر: باقة الثري دي (مخططات، رندرات، جولة 360°) أو التصميم والتنفيذ الكامل مع إشراف موقعي." : "Interior design services in Egypt: 3D design package (plans, 3D renders, 360° tour) or full design and execution with site supervision.", alternates: { canonical: `/${lang}/services`, languages: { en: "/en/services", ar: "/ar/services" } } }; }

const imgs = ["/projects/october-250/05.webp", "/projects/el-nakhil-villa/01.webp"];

/* Services page: drawing-to-finished slider hero, two package columns with drawn ticks, FAQ in the deep. */
export default async function Page({ params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const s = pages[lang].services, t = dict[lang];
  const faq = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: s.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) };
  const u = "text-xs uppercase tracking-[0.2em] rtl:tracking-normal";
  return (
    <PageShell lang={lang} dark>
      <JsonLd lang={lang} extra={[faq]} />
      <section className="relative overflow-hidden bg-[var(--deep)] px-5 pb-16 pt-28 text-[var(--surface)] md:px-10 md:pb-20 md:pt-36">
        <Contours className="pointer-events-none absolute inset-x-0 top-0 h-1/2 opacity-40" />
        <div className="hero-in relative grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8"><p className={`${u} text-[var(--bronze)]`}>{s.eyebrow}</p><h1 className="display mt-4 text-5xl md:text-8xl">{s.title}</h1></div>
          <p className="max-w-sm text-sm text-[var(--surface)]/75 md:col-span-4">{s.intro}</p>
        </div>
        <div className="relative mt-12"><Compare src="/projects/october-250/01.webp" a={s.drawing} b={s.render} /></div>
      </section>
      <section className="bg-[var(--surface)] px-5 py-16 text-[var(--ink)] md:px-10 md:py-24">
        <div className="grid gap-px bg-[var(--ink)]/15 md:grid-cols-2">
          {s.packages.map((pk, k) => (
            <div key={pk.name} className="bg-[var(--surface)] p-2 md:p-10">
              <MaskReveal className="relative aspect-[16/9] overflow-hidden"><Image src={imgs[k]} alt="" fill sizes="(min-width:768px) 45vw, 100vw" className="object-cover" /></MaskReveal>
              <p className={`${u} mt-8 text-[var(--bronze)]`}>{t.services.labels[k]}</p>
              <h2 className="display mt-3 text-4xl md:text-5xl">{pk.name}</h2>
              <p className="mt-3 text-sm text-[var(--muted)]"><span className="font-semibold text-[var(--ink)]">{s.forLabel}: </span>{pk.for}</p>
              <p className={`${u} mt-8 text-[var(--muted)]`}>{s.included}</p>
              <Ticks items={pk.items} />
            </div>
          ))}
        </div>
      </section>
      <section className="bg-[var(--deep)] px-5 py-16 text-[var(--surface)] md:px-10 md:py-24">
        <div className="grid gap-10 md:grid-cols-12">
          <h2 className="display text-4xl md:col-span-4 md:text-6xl">{s.faqTitle}</h2>
          <div className="md:col-span-8"><Faq items={s.faq} /></div>
        </div>
        <div className="mt-12"><Btn href={`/${lang}/contact`}>{s.cta}</Btn></div>
      </section>
    </PageShell>
  );
}