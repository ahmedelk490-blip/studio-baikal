import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { can } from "@/lib/perm";
import { adminDict } from "@/lib/admin-i18n";
import { Revisions } from "@/components/admin/Revisions";
import { Notice } from "@/components/admin/ui";

// Per-request admin page (session + live data): block on the server, no prerendered shell.
export const instant = false;

type Props = { params: Promise<{ lang: string; id: string }>; searchParams: Promise<{ msg?: string }> };

/* History tab: earlier saved versions of this project, what differs from now, and restore. */
export default async function History({ params, searchParams }: Props) {
  const { lang, id } = await params;
  const { msg } = await searchParams;
  const u = await requireUser(lang, "projects.view");
  const a = adminDict(lang);
  const p = db().prepare("SELECT id, slug, status, featured, sort, category, area, year, cover, en, ar, seo FROM projects WHERE id = ?").get(Number(id)) as Record<string, unknown> | undefined;
  if (!p) notFound();
  const { id: pid, ...current } = p;
  return (
    <>
      <Notice msg={msg} a={a} lang={lang} />
      <Revisions entity="project" id={Number(pid)} current={current} lang={lang} a={a} canRestore={can(u.role, "projects.edit")} />
    </>
  );
}
