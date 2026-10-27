import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { ContactWizard } from "@/components/ContactWizard";
import { Contact } from "@/components/Contact";
import { dict, isLang } from "@/data/i18n";
import { pages } from "@/data/pages";
import { getContact, withSeo } from "@/lib/site";

export const instant = false;
type Props = { params: Promise<{ lang: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { lang } = await params; const ar = lang === "ar"; const meta: Metadata = { title: isLang(lang) ? pages[lang].contact.eyebrow : "Contact", description: ar ? "احجز استشارة تصميم داخلي مجانية مع استوديو بايكال. ثلاثة أسئلة ثم نتصل بك خلال يوم عمل." : "Book a free interior design consultation with Studio Baikal. Three questions, then we call you within one working day.", alternates: { canonical: `/${lang}/contact`, languages: { en: "/en/contact", ar: "/ar/contact" } } }; return isLang(lang) ? withSeo("contact", lang, meta) : meta; }

export default async function Page({ params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  // the calm look books through the same dark form as its home (type, service, area, then name and number)
  if (process.env.NEXT_PUBLIC_HOME === "calm") return <PageShell lang={lang} dark><div className="bg-[#0B1013] pt-16 md:pt-20"><Contact t={dict[lang]} contact={await getContact(lang)} /></div></PageShell>;
  return <PageShell lang={lang} dark><ContactWizard t={dict[lang]} p={pages[lang].contact} contact={await getContact(lang)} /></PageShell>;
}