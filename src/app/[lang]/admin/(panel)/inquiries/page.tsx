import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { can } from "@/lib/perm";
import { adminDict } from "@/lib/admin-i18n";
import { updateInquiry } from "../../actions";
import { Notice, btn, btnGhost, card, inp, fmtDate } from "@/components/admin/ui";

// Per-request admin page (session + live data): block on the server, no prerendered shell.
export const instant = false;

type Props = { params: Promise<{ lang: string }>; searchParams: Promise<{ msg?: string; q?: string; st?: string; page?: string }> };
type Row = { id: string; at: string; name: string; whatsapp: string; email: string; size: string; need: string; message: string; source: string; status: string; notes: string; updated_at: string | null };
const STATUSES = ["new", "contacted", "in_progress", "won", "lost", "spam"] as const;
const PER = 20;

/* Inquiries inbox: every form submission from the site, searchable, filterable by status, with
   internal notes, one-tap WhatsApp / email, and a CSV export for authorised roles. */
export default async function Inquiries({ params, searchParams }: Props) {
  const { lang } = await params;
  const sp = await searchParams;
  const u = await requireUser(lang, "inquiries.view");
  const a = adminDict(lang);
  const q = (sp.q ?? "").slice(0, 80), st = STATUSES.includes(sp.st as never) ? sp.st! : "", page = Math.max(1, Number(sp.page) || 1);
  const where: string[] = [], args: string[] = [];
  if (q) { where.push("(name LIKE ? OR whatsapp LIKE ? OR email LIKE ? OR need LIKE ? OR notes LIKE ?)"); args.push(...Array(5).fill(`%${q}%`)); }
  if (st) { where.push("status = ?"); args.push(st); }
  const w = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const d = db();
  const total = (d.prepare(`SELECT COUNT(*) n FROM inquiries ${w}`).get(...args) as { n: number }).n;
  const rows = d.prepare(`SELECT * FROM inquiries ${w} ORDER BY at DESC LIMIT ${PER} OFFSET ${(page - 1) * PER}`).all(...args) as Row[];
  const pages = Math.max(1, Math.ceil(total / PER));
  const qs = (o: Record<string, string | number>) => `?${new URLSearchParams({ q, st, page: String(page), ...Object.fromEntries(Object.entries(o).map(([k, v]) => [k, String(v)])) })}`;
  const edit = can(u.role, "inquiries.edit");
  const wa = (n: string) => { const dgt = n.replace(/\D/g, ""); return dgt.length >= 8 ? `https://wa.me/${dgt.startsWith("0") ? "2" + dgt : dgt}` : null; };
  return (
    <>
      <Notice msg={sp.msg} a={a} lang={lang} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-4xl">{a.inquiries} <span className="text-base text-[var(--muted)]" dir="ltr">({total})</span></h1>
        {can(u.role, "inquiries.export") && <a href={`/api/admin/inquiries${qs({})}`} className={btnGhost}>{a.exportCsv}</a>}
      </div>
      <form className="mt-6 flex flex-wrap gap-3">
        <input name="q" defaultValue={q} placeholder={a.search} aria-label={a.search} className={`${inp} max-w-xs`} />
        <select name="st" defaultValue={st} aria-label={a.status} className={`${inp} max-w-[12rem]`}><option value="">{a.all}</option>{STATUSES.map((s) => <option key={s} value={s}>{a[`st_${s}`]}</option>)}</select>
        <button className={btn}>{a.search}</button>
      </form>
      {rows.length === 0 ? <p className="mt-8 text-sm text-[var(--muted)]">{a.none}</p> : (
        <ul className="mt-6 grid gap-3">
          {rows.map((r) => (
            <li key={r.id}>
              <details className={`${card} group p-0`}>
                <summary className="flex min-h-14 cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-5 py-3">
                  <span><b className="font-medium">{r.name || "—"}</b> <span className="text-sm text-[var(--muted)]" dir="ltr">{r.whatsapp || r.email}</span></span>
                  <span className="flex items-center gap-3 text-xs text-[var(--muted)]"><span className={`rounded-full px-2.5 py-1 ${r.status === "new" ? "bg-[var(--bronze)]/15 text-[#7a5a2c]" : "bg-[var(--mist)]"}`}>{a[`st_${r.status as (typeof STATUSES)[number]}`]}</span>{fmtDate(r.at, lang)}</span>
                </summary>
                <div className="grid gap-5 border-t border-[var(--ink)]/10 px-5 py-4 lg:grid-cols-2">
                  <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                    {([[a.phone, r.whatsapp], [a.email, r.email], [a.size, r.size], [a.need, r.need], [a.source, r.source], ["", r.message]] as [string, string][]).filter(([, v]) => v).map(([k, v], i) => <div key={i} className="contents"><dt className="text-[var(--muted)]">{k}</dt><dd className="break-words">{v}</dd></div>)}
                    <div className="col-span-2 mt-2 flex flex-wrap gap-2">
                      {wa(r.whatsapp) && <a href={wa(r.whatsapp)!} target="_blank" rel="noopener" className={btnGhost}>WhatsApp ↗</a>}
                      {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email) && <a href={`mailto:${r.email}`} className={btnGhost}>Email ↗</a>}
                    </div>
                  </dl>
                  {edit ? (
                    <form key={`${r.status}|${r.updated_at}`} action={updateInquiry} className="grid gap-3">
                      <input type="hidden" name="lang" value={lang} /><input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="q" value={q} /><input type="hidden" name="st" value={st} /><input type="hidden" name="page" value={page} />
                      <label className="grid gap-1.5 text-sm">{a.status}<select name="status" defaultValue={r.status} className={inp}>{STATUSES.map((s) => <option key={s} value={s}>{a[`st_${s}`]}</option>)}</select></label>
                      <label className="grid gap-1.5 text-sm">{a.notes}<textarea name="notes" defaultValue={r.notes} rows={3} maxLength={4000} className={inp} /></label>
                      <div><button className={btn}>{a.save}</button></div>
                    </form>
                  ) : r.notes ? <p className="text-sm"><b>{a.notes}:</b> {r.notes}</p> : null}
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
      {pages > 1 && (
        <nav className="mt-6 flex items-center gap-3 text-sm" aria-label="Pages">
          {page > 1 && <Link href={qs({ page: page - 1 })} className={btnGhost}>{a.prev}</Link>}
          <span dir="ltr">{page} / {pages}</span>
          {page < pages && <Link href={qs({ page: page + 1 })} className={btnGhost}>{a.next}</Link>}
        </nav>
      )}
    </>
  );
}
