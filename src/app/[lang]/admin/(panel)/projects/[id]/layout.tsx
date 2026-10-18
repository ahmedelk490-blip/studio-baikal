import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminDict } from "@/lib/admin-i18n";
import { NavLinks } from "@/components/admin/client";

// Per-request admin page (session + live data): block on the server, no prerendered shell.
export const instant = false;

type Props = { children: React.ReactNode; params: Promise<{ lang: string; id: string }> };

/* One workspace per project: a header (cover, name, status, link to the live page) and tabs for
   Details, Images, SEO and History. Every tab is its own page, so each stays short and focused. */
export default async function ProjectWorkspace({ children, params }: Props) {
  const { lang, id } = await params;
  await requireUser(lang, "projects.view");
  const a = adminDict(lang);
  const p = db().prepare("SELECT id, slug, status, cover, en, ar, (SELECT COUNT(*) FROM project_images WHERE project_id = projects.id) n FROM projects WHERE id = ?").get(Number(id)) as { id: number; slug: string; status: string; cover: string; en: string; ar: string; n: number } | undefined;
  if (!p) notFound();
  const name = (JSON.parse(lang === "ar" ? p.ar : p.en) as { name: string }).name;
  const base = `/${lang}/admin/projects/${p.id}`;
  const tabs: [string, string][] = [[a.details, base], [`${a.images} (${p.n})`, `${base}/images`], ["SEO", `${base}/seo`], [a.revisions, `${base}/history`]];
  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm text-[var(--muted)]"><Link href={`/${lang}/admin/projects`} className="hover:text-[var(--ink)]">{a.projects}</Link> <span aria-hidden>/</span> <span className="text-[var(--ink)]">{name}</span></nav>
      <header className="mt-3 flex flex-wrap items-center gap-4">
        {p.cover ? <Image src={p.cover} alt="" width={96} height={64} className="h-16 w-24 rounded-xl object-cover" /> : <span className="h-16 w-24 rounded-xl bg-[var(--mist)]" />}
        <div className="min-w-0 flex-1">
          <h1 className="display truncate text-3xl md:text-4xl">{name}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
            <span className={`rounded-full px-2.5 py-1 ${p.status === "published" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>{p.status === "published" ? a.published : a.draft}</span>
            <span dir="ltr">/{lang}/projects/{p.slug}</span>
          </p>
        </div>
        {p.status === "published" && <a href={`/${lang}/projects/${p.slug}`} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center rounded-full border border-[var(--ink)]/20 px-4 text-sm hover:border-[var(--ink)]/50">{a.open} ↗</a>}
      </header>
      <nav aria-label={a.projects} className="mt-6 flex gap-1 overflow-x-auto border-b border-[var(--ink)]/10">
        <NavLinks links={tabs} root={base} className="inline-flex min-h-11 shrink-0 items-center border-b-2 px-4 text-sm transition-colors" activeClass="border-[var(--bronze)] font-medium text-[var(--ink)]" idleClass="border-transparent text-[var(--muted)] hover:text-[var(--ink)]" />
      </nav>
      <div className="pt-6">{children}</div>
    </>
  );
}
