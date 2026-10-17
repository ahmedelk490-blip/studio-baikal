import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { ProjectsIndex } from "@/components/ProjectsIndex";
import { projects, localize } from "@/data/projects";
import { isLang } from "@/data/i18n";
import { pages } from "@/data/pages";

export const instant = false;
type Props = { params: Promise<{ lang: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { lang } = await params; return { title: isLang(lang) ? pages[lang].projects.eyebrow : "Projects" }; }

export default async function Page({ params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const rows = projects.map((p) => ({ ...localize(p, lang), kind: p.type }));
  return <PageShell lang={lang}><ProjectsIndex rows={rows} lang={lang} p={pages[lang].projects} /></PageShell>;
}