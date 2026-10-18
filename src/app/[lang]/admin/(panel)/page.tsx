import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { can } from "@/lib/perm";
import { adminDict } from "@/lib/admin-i18n";
import { Notice, card, fmtDate, PageHead, actLabel } from "@/components/admin/ui";

// Per-request admin page (session + live data): block on the server, no prerendered shell.
export const instant = false;

type Props = { params: Promise<{ lang: string }>; searchParams: Promise<{ msg?: string; denied?: string }> };

/* Dashboard: greeting, quick actions for the everyday jobs, the real numbers (each one a link),
   then the latest inquiries and the activity log side by side. Only what the role may open shows. */
export default async function Dashboard({ params, searchParams }: Props) {
  const { lang } = await params;
  const sp = await searchParams;
  const u = await requireUser(lang);
  const a = adminDict(lang);
  const d = db();
  const n = (sql: string) => (d.prepare(sql).get() as { n: number }).n;
  const root = `/${lang}/admin`;
  const quick = ([
    [can(u.role, "projects.edit"), `+ ${a.newProject}`, `${root}/projects?new=1`],
    [can(u.role, "media.upload"), `↑ ${a.upload}`, `${root}/media`],
    [can(u.role, "inquiries.view"), a.inquiries, `${root}/inquiries?st=new`],
    [can(u.role, "settings.edit"), a.settings, `${root}/settings`],
  ] as [boolean, string, string][]).filter(([ok]) => ok);
  const stats = ([
    [true, a.statsPublished, n("SELECT COUNT(*) n FROM projects WHERE status='published'"), `${root}/projects?st=published`],
    [true, a.statsDrafts, n("SELECT COUNT(*) n FROM projects WHERE status='draft'"), `${root}/projects?st=draft`],
    [can(u.role, "inquiries.view"), a.statsNew, can(u.role, "inquiries.view") ? n("SELECT COUNT(*) n FROM inquiries WHERE status='new'") : 0, `${root}/inquiries?st=new`],
    [true, a.statsMedia, n("SELECT COUNT(*) n FROM media"), `${root}/media`],
  ] as [boolean, string, number, string][]).filter(([ok]) => ok);
  const leads = can(u.role, "inquiries.view") ? (d.prepare("SELECT id, at, name, whatsapp, need, status FROM inquiries ORDER BY at DESC LIMIT 6").all() as { id: string; at: string; name: string; whatsapp: string; need: string; status: string }[]) : [];
  const log = can(u.role, "audit.view") ? (d.prepare("SELECT a.at, a.action, a.target, u.name FROM audit a LEFT JOIN users u ON u.id = a.user_id ORDER BY a.id DESC LIMIT 10").all() as { at: string; action: string; target: string; name: string | null }[]) : [];
  return (
    <>
      <Notice msg={sp.denied ? "denied" : sp.msg} a={a} lang={lang} />
      <PageHead title={`${a.hello}، ${u.name}`.replace(/، /, lang === "ar" ? "، " : ", ")} desc={a.d_dashboard}>
        {quick.map(([, l, h]) => <Link key={h} href={h} className="inline-flex min-h-11 items-center rounded-full border border-[var(--ink)]/20 bg-white px-4 text-sm transition-colors hover:border-[var(--bronze)]">{l}</Link>)}
      </PageHead>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([, l, v, h]) => (
          <Link key={l} href={h} className={`${card} group transition-colors hover:border-[var(--bronze)]`}>
            <p className="text-sm text-[var(--muted)]">{l}</p>
            <p className="display mt-2 text-4xl" dir="ltr">{v}</p>
            <p className="mt-2 text-xs text-[var(--bronze)] opacity-0 transition-opacity group-hover:opacity-100">{a.open} →</p>
          </Link>
        ))}
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        {can(u.role, "inquiries.view") && (
          <section className={card}>
            <div className="flex items-center justify-between"><h2 className="font-semibold">{a.recentInquiries}</h2><Link href={`${root}/inquiries`} className="text-sm text-[var(--bronze)] hover:underline">{a.all} →</Link></div>
            {leads.length === 0 ? <p className="mt-4 text-sm text-[var(--muted)]">{a.none}</p> : (
              <ul className="mt-3 divide-y divide-[var(--ink)]/10">{leads.map((l) => (
                <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                  <span><b className="font-medium">{l.name || "—"}</b> <span className="text-[var(--muted)]" dir="ltr">{l.whatsapp}</span><br /><span className="text-[var(--muted)]">{l.need}</span></span>
                  <span className="text-end text-xs text-[var(--muted)]"><span className={`rounded-full px-2 py-0.5 ${l.status === "new" ? "bg-[var(--bronze)]/15 text-[#7a5a2c]" : "bg-[var(--mist)]"}`}>{a[`st_${l.status}` as keyof typeof a]}</span><br />{fmtDate(l.at, lang)}</span>
                </li>))}</ul>
            )}
          </section>
        )}
        {can(u.role, "audit.view") && (
          <section className={card}>
            <h2 className="font-semibold">{a.activity}</h2>
            {log.length === 0 ? <p className="mt-4 text-sm text-[var(--muted)]">{a.none}</p> : (
              <ul className="mt-3 divide-y divide-[var(--ink)]/10">{log.map((r, k) => (
                <li key={k} className="flex flex-wrap justify-between gap-2 py-2.5 text-sm"><span className="min-w-0"><b className="font-medium">{r.name ?? "—"}</b> {actLabel(r.action, lang)} <span className="inline-block max-w-[16rem] truncate align-bottom text-[var(--muted)]" dir="ltr" title={r.target}>{r.target.split("/").pop()}</span></span><span className="text-xs text-[var(--muted)]">{fmtDate(r.at, lang)}</span></li>
              ))}</ul>
            )}
          </section>
        )}
      </div>
    </>
  );
}
