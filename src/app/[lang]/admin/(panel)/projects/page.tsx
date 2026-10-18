import Image from "next/image";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { can } from "@/lib/perm";
import { adminDict } from "@/lib/admin-i18n";
import { createProject } from "../../actions";
import { Notice, btn, btnGhost, card, inp, fmtDate, PageHead } from "@/components/admin/ui";

// Per-request admin page (session + live data): block on the server, no prerendered shell.
export const instant = false;

type Props = { params: Promise<{ lang: string }>; searchParams: Promise<{ msg?: string; q?: string; st?: string; new?: string }> };
type Row = { id: number; slug: string; status: string; featured: number; category: string; en: string; ar: string; updated_at: string; thumb: string | null; n: number };

/* Projects: one card per project (main image, status, photo count) with direct buttons to its
   Details and Images; search and a status filter on top; "New project" folded away until needed. */
export default async function Projects({ params, searchParams }: Props) {
  const { lang } = await params;
  const sp = await searchParams;
  const u = await requireUser(lang, "projects.view");
  const a = adminDict(lang);
  const q = (sp.q ?? "").trim().toLowerCase().slice(0, 60), st = sp.st === "published" || sp.st === "draft" ? sp.st : "";
  const all = db().prepare(`SELECT p.id, p.slug, p.status, p.featured, p.category, p.en, p.ar, p.updated_at,
    COALESCE(NULLIF(p.cover, ''), (SELECT src FROM project_images WHERE project_id = p.id ORDER BY sort, id LIMIT 1)) thumb,
    (SELECT COUNT(*) FROM project_images WHERE project_id = p.id) n FROM projects p ORDER BY p.sort, p.id`).all() as Row[];
  const rows = all.filter((r) => (!st || r.status === st) && (!q || `${r.slug} ${r.en} ${r.ar}`.toLowerCase().includes(q)));
  const chip = (v: string, label: string, n: number) => (
    <Link href={`/${lang}/admin/projects?${new URLSearchParams({ q, st: v })}`} aria-current={st === v ? "page" : undefined} className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm ${st === v ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--surface)]" : "border-[var(--ink)]/20 hover:border-[var(--ink)]/50"}`}>{label} <span className="ms-1 opacity-60" dir="ltr">({n})</span></Link>
  );
  return (
    <>
      <Notice msg={sp.msg} a={a} lang={lang} />
      <PageHead title={a.projects} desc={a.d_projects}>
        {can(u.role, "projects.edit") && (
          <details id="new" open={sp.new === "1"} className="group relative">
            <summary className={`${btn} cursor-pointer list-none`}>+ {a.newProject}</summary>
            <form action={createProject} className={`${card} absolute end-0 z-20 mt-2 grid w-[min(92vw,26rem)] gap-3 shadow-xl`}>
              <input type="hidden" name="lang" value={lang} />
              <label className="grid gap-1.5 text-sm">{a.name} (EN)<input name="name" required maxLength={120} className={inp} /></label>
              <label className="grid gap-1.5 text-sm">{a.slug}<input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="new-cairo-villa" dir="ltr" className={inp} /></label>
              <button className={btn}>{a.create}</button>
            </form>
          </details>
        )}
      </PageHead>
      <div className="flex flex-wrap items-center gap-2">
        {chip("", a.all, all.length)}
        {chip("published", a.published, all.filter((r) => r.status === "published").length)}
        {chip("draft", a.drafts, all.filter((r) => r.status === "draft").length)}
        <form className="ms-auto flex gap-2"><input type="hidden" name="st" value={st} /><input name="q" defaultValue={q} placeholder={a.searchProjects} aria-label={a.searchProjects} className={`${inp} w-56`} /></form>
      </div>
      {rows.length === 0 ? <p className="mt-8 text-sm text-[var(--muted)]">{a.none}</p> : (
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((r) => {
            const name = (JSON.parse(lang === "ar" ? r.ar : r.en) as { name: string }).name;
            const base = `/${lang}/admin/projects/${r.id}`;
            return (
              <li key={r.id} className={`${card} flex flex-col overflow-hidden p-0`}>
                <Link href={base} className="relative block bg-[var(--mist)]">
                  {r.thumb ? <Image src={r.thumb} alt="" width={640} height={400} className="aspect-[16/10] w-full object-cover" /> : <span className="block aspect-[16/10]" />}
                  <span className={`absolute start-3 top-3 rounded-full px-2.5 py-1 text-xs ${r.status === "published" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>{r.status === "published" ? a.published : a.draft}</span>
                  {r.featured ? <span className="absolute end-3 top-3 rounded-full bg-[var(--bronze)] px-2.5 py-1 text-xs text-[var(--deep)]">★ {a.featured}</span> : null}
                </Link>
                <div className="flex flex-1 flex-col gap-1 p-4">
                  <Link href={base} className="display text-2xl hover:text-[var(--bronze)]">{name}</Link>
                  <p className="text-xs text-[var(--muted)]">{r.category} · <span dir="ltr">{r.n}</span> {a.roomsShort} · {fmtDate(r.updated_at, lang)}</p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-3">
                    <Link href={base} className={btnGhost}>{a.editDetails}</Link>
                    <Link href={`${base}/images`} className={btnGhost}>{a.manageImages} <span className="ms-1 opacity-60" dir="ltr">({r.n})</span></Link>
                    {r.status === "published" && <a href={`/${lang}/projects/${r.slug}`} target="_blank" rel="noopener" className={btnGhost}>{a.viewSite2} ↗</a>}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
