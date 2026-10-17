import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { ContactWizard } from "@/components/ContactWizard";
import { dict, isLang } from "@/data/i18n";
import { pages } from "@/data/pages";

export const instant = false;
type Props = { params: Promise<{ lang: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { lang } = await params; return { title: isLang(lang) ? pages[lang].contact.eyebrow : "Contact" }; }

export default async function Page({ params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return <PageShell lang={lang} dark><ContactWizard t={dict[lang]} p={pages[lang].contact} /></PageShell>;
}