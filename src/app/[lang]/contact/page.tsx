import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { ContactWizard } from "@/components/ContactWizard";
import { dict, isLang } from "@/data/i18n";
import { pages } from "@/data/pages";

export const instant = false;
type Props = { params: Promise<{ lang: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { lang } = await params; const ar = lang === "ar"; return { title: isLang(lang) ? pages[lang].contact.eyebrow : "Contact", description: ar ? "احجز استشارة تصميم داخلي مجانية مع استوديو بايكال. ثلاثة أسئلة ثم نتصل بك خلال يوم عمل." : "Book a free interior design consultation with Studio Baikal. Three questions, then we call you within one working day.", alternates: { canonical: `/${lang}/contact`, languages: { en: "/en/contact", ar: "/ar/contact" } } }; }

export default async function Page({ params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return <PageShell lang={lang} dark><ContactWizard t={dict[lang]} p={pages[lang].contact} /></PageShell>;
}