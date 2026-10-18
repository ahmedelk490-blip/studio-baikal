import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { can } from "@/lib/perm";
import { adminDict } from "@/lib/admin-i18n";
import { Notice, card, btnGhost, fmtDate } from "@/components/admin/ui";

// Per-request admin page (session + live data): block on the server, no prerendered shell.
export const instant = false;

type Props = { params: Promise<{ lang: string }>; searchParams: Promise<{ msg?: string; denied?: string }> };

/* Dashboard: real counts from the database, the latest inquiries and the audit trail. */
export default async function Dashboard({ params, searchParams }: Props) {
  const { lang } = await params;
  const sp = await searchParams;
  const u = await requireUser(lang);
  const a = adminDict(lang);
  const d = db();
  const n = (sql: string) => (d.prepare(sql).get() as { n: number }).n;
  const stats: [string, number, string][] = [
    [a.statsPublished, n("SELECT COUNT(*) n FROM projects WHERE status='published'"), "/projects"],
    [a.statsDrafts, n("SELECT COUNT(*) n FROM projects WHERE status='draft'"), "/projects"],
    ...(can(u.role, "inquiries.view") ? [[a.statsNew, n("SELECT COUNT(*) n FROM inquiries WHERE status='new'"), "/inquiries?st=new"] as [string, number, string]] : []),
    [a.statsMedia, n("SELECT COUNT(*) n FROM media"), "/media"],
  ];
  const leads = can(u.role, "inquiries.view") ? (d.prepare("SELECT id, at, name, whatsapp, need, status FROM inquiries ORDER BY at DESC LIMIT 6").all() as { id: string; at: string; name: string; whatsapp: string; need: string; status: string }[]) : [];
  const log = can(u.role, "audit.view") ? (d.prepare("SELECT a.at, a.action, a.target, u.name FROM audit a LEFT JOIN users u ON u.id = a.user_id ORDER BY a.id DESC LIMIT 10").all() as { at: string; action: string; target: string; name: string | null }[]) : [];
  return (
    <>
      <Notice msg={sp.denied ? "denied" : sp.msg} a={a} lang={lang} />
      <h1 className="display text-4xl">{a.dashboard}</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([l, v, h]) => <Link key={l} href={`/${lang}/admin${h}`} className={`${card} transition-colors hover:border-[var(--bronze)]`}><p className="text-sm text-[var(--muted)]">{l}</p><p className="display mt-2 text-4xl" dir="ltr">{v}</p></Link>)}
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {can(u.role, "projects.edit") && <Link href={`/${lang}/admin/projects#new`} className={btnGhost}>+ {a.newProject}</Link>}
        {can(u.role, "media.upload") && <Link href={`/${lang}/admin/media`} className={btnGhost}>+ {a.upload}</Link>}
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        {can(u.role, "inquiries.view") && (
          <section className={card}>
            <h2 className="font-semibold">{a.recentInquiries}</h2>
            {leads.length === 0 ? <p className="mt-4 text-sm text-[var(--muted)]">{a.none}</p> : (
              <ul className="mt-3 divide-y divide-[var(--ink)]/10">{leads.map((l) => (
                <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                  <span><b className="font-medium">{l.name || "—"}</b> <span className="text-[var(--muted)]" dir="ltr">{l.whatsapp}</span><br /><span className="text-[var(--muted)]">{l.need}</span></span>
                  <span className="text-end text-xs text-[var(--muted)]">{a[`st_${l.status}` as keyof typeof a]}<br />{fmtDate(l.at, lang)}</span>
                </li>))}</ul>
            )}
          </section>
        )}
        {can(u.role, "audit.view") && (
          <section className={card}>
            <h2 className="font-semibold">{a.activity}</h2>
            {log.length === 0 ? <p className="mt-4 text-sm text-[var(--muted)]">{a.none}</p> : (
              <ul className="mt-3 divide-y divide-[var(--ink)]/10">{log.map((r, k) => (
                <li key={k} className="flex flex-wrap justify-between gap-2 py-2.5 text-sm"><span><b className="font-medium">{r.name ?? "—"}</b> · <span dir="ltr">{r.action}</span> <span className="text-[var(--muted)]" dir="ltr">{r.target}</span></span><span className="text-xs text-[var(--muted)]">{fmtDate(r.at, lang)}</span></li>
              ))}</ul>
            )}
          </section>
        )}
      </div>
    </>
  );
}
