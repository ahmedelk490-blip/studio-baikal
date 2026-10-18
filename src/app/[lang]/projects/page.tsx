import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { ProjectsIndex } from "@/components/ProjectsIndex";
import { listProjects } from "@/lib/content";
import { isLang } from "@/data/i18n";
import { pages } from "@/data/pages";

export const instant = false;
type Props = { params: Promise<{ lang: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { lang } = await params; const ar = lang === "ar"; return { title: isLang(lang) ? pages[lang].projects.eyebrow : "Projects", description: ar ? "كل مشاريع استوديو بايكال: فيلات وشقق وعيادات في القاهرة والجيزة والشيخ زايد والإسكندرية مع صور كل الغرف." : "All Studio Baikal projects: villas, apartments and clinics across Cairo, Giza, Sheikh Zayed and Alexandria, with every room photographed.", alternates: { canonical: `/${lang}/projects`, languages: { en: "/en/projects", ar: "/ar/projects" } } }; }

export default async function Page({ params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const rows = await listProjects(lang);
  return <PageShell lang={lang}><ProjectsIndex rows={rows} lang={lang} p={pages[lang].projects} /></PageShell>;
}