import Image from "next/image";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { can } from "@/lib/perm";
import { adminDict } from "@/lib/admin-i18n";
import { createProject } from "../../actions";
import { Notice, btn, card, inp, fmtDate } from "@/components/admin/ui";

// Per-request admin page (session + live data): block on the server, no prerendered shell.
export const instant = false;

type Props = { params: Promise<{ lang: string }>; searchParams: Promise<{ msg?: string }> };
type Row = { id: number; slug: string; status: string; featured: number; sort: number; category: string; en: string; ar: string; updated_at: string; thumb: string | null; n: number };

export default async function Projects({ params, searchParams }: Props) {
  const { lang } = await params;
  const { msg } = await searchParams;
  const u = await requireUser(lang, "projects.view");
  const a = adminDict(lang);
  const rows = db().prepare(`SELECT p.id, p.slug, p.status, p.featured, p.sort, p.category, p.en, p.ar, p.updated_at,
    COALESCE(NULLIF(p.cover, ''), (SELECT src FROM project_images WHERE project_id = p.id ORDER BY sort, id LIMIT 1)) thumb,
    (SELECT COUNT(*) FROM project_images WHERE project_id = p.id) n FROM projects p ORDER BY p.sort, p.id`).all() as Row[];
  return (
    <>
      <Notice msg={msg} a={a} lang={lang} />
      <h1 className="display text-4xl">{a.projects}</h1>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--ink)]/10 bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="text-start text-xs text-[var(--muted)]"><tr className="border-b border-[var(--ink)]/10">{["", a.name, a.category, a.status, a.order, a.updated, ""].map((h, k) => <th key={k} className="px-4 py-3 text-start font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((r) => {
              const name = (JSON.parse(lang === "ar" ? r.ar : r.en) as { name: string }).name;
              return (
                <tr key={r.id} className="border-b border-[var(--ink)]/5 last:border-0">
                  <td className="px-4 py-2">{r.thumb ? <Image src={r.thumb} alt="" width={72} height={48} className="h-12 w-[72px] rounded-md object-cover" /> : <span className="block h-12 w-[72px] rounded-md bg-[var(--mist)]" />}</td>
                  <td className="px-4 py-2"><b className="font-medium">{name}</b><br /><span className="text-xs text-[var(--muted)]" dir="ltr">/{r.slug} · {r.n} img</span></td>
                  <td className="px-4 py-2">{r.category}</td>
                  <td className="px-4 py-2"><span className={`rounded-full px-2.5 py-1 text-xs ${r.status === "published" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>{r.status === "published" ? a.published : a.draft}</span>{r.featured ? <span className="ms-2 text-xs text-[var(--bronze)]">★ {a.featured}</span> : null}</td>
                  <td className="px-4 py-2" dir="ltr">{r.sort}</td>
                  <td className="px-4 py-2 text-xs text-[var(--muted)]">{fmtDate(r.updated_at, lang)}</td>
                  <td className="px-4 py-2 text-end"><Link href={`/${lang}/admin/projects/${r.id}`} className="inline-flex min-h-11 items-center rounded-full px-3 text-[var(--bronze)] hover:underline">{a.edit}</Link></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {can(u.role, "projects.edit") && (
        <form id="new" action={createProject} className={`${card} mt-8 grid max-w-2xl gap-4 sm:grid-cols-2`}>
          <h2 className="font-semibold sm:col-span-2">{a.newProject}</h2>
          <input type="hidden" name="lang" value={lang} />
          <label className="grid gap-1.5 text-sm">{a.name} (EN)<input name="name" required maxLength={120} className={inp} /></label>
          <label className="grid gap-1.5 text-sm">{a.slug}<input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="new-cairo-villa" dir="ltr" className={inp} /></label>
          <div className="sm:col-span-2"><button className={btn}>{a.create}</button></div>
        </form>
      )}
    </>
  );
}
