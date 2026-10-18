import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminDict } from "@/lib/admin-i18n";
import { createRedirect, deleteRedirect } from "../../actions";
import { ConfirmButton } from "@/components/admin/client";
import { Notice, btn, card, inp, fmtDate } from "@/components/admin/ui";

// Per-request admin page (session + live data): block on the server, no prerendered shell.
export const instant = false;

type Props = { params: Promise<{ lang: string }>; searchParams: Promise<{ msg?: string }> };
type R = { id: number; src: string; dest: string; code: number; hits: number; created_at: string };

/* Redirects: old or short links that should land somewhere else. Applied before any page renders;
   loops, system paths and the language homes are refused when saving. */
export default async function Redirects({ params, searchParams }: Props) {
  const { lang } = await params;
  const { msg } = await searchParams;
  await requireUser(lang, "redirects.edit");
  const a = adminDict(lang);
  const rows = db().prepare("SELECT * FROM redirects ORDER BY id DESC").all() as R[];
  return (
    <>
      <Notice msg={msg} a={a} lang={lang} />
      <h1 className="display text-4xl">{a.redirects}</h1>
      <form action={createRedirect} className={`${card} mt-6 grid gap-4 md:grid-cols-[1fr_1fr_auto_auto] md:items-end`}>
        <input type="hidden" name="lang" value={lang} />
        <label className="grid gap-1.5 text-sm">{a.from}<input name="src" required placeholder="/old-page" dir="ltr" className={inp} /></label>
        <label className="grid gap-1.5 text-sm">{a.to}<input name="dest" required placeholder="/en/projects" dir="ltr" className={inp} /></label>
        <label className="grid gap-1.5 text-sm">{a.code}<select name="code" defaultValue="301" className={inp}><option value="301">301</option><option value="302">302</option><option value="307">307</option><option value="308">308</option></select></label>
        <button className={btn}>{a.create}</button>
      </form>
      {rows.length === 0 ? <p className="mt-6 text-sm text-[var(--muted)]">{a.none}</p> : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--ink)]/10 bg-white">
          <table className="w-full min-w-[640px] text-sm" dir="ltr">
            <thead className="text-xs text-[var(--muted)]"><tr className="border-b border-[var(--ink)]/10">{[a.from, a.to, a.code, a.hits, a.date, ""].map((h, k) => <th key={k} className="px-4 py-3 text-start font-medium">{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-[var(--ink)]/5 last:border-0">
                  <td className="px-4 py-2 font-mono text-xs">{r.src}</td><td className="px-4 py-2 font-mono text-xs">{r.dest}</td><td className="px-4 py-2">{r.code}</td><td className="px-4 py-2">{r.hits}</td>
                  <td className="px-4 py-2 text-xs text-[var(--muted)]">{fmtDate(r.created_at, lang)}</td>
                  <td className="px-4 py-2 text-end"><form action={deleteRedirect}><input type="hidden" name="lang" value={lang} /><input type="hidden" name="id" value={r.id} /><ConfirmButton label={a.delete} ask={`${a.delete} ${r.src}?`} className="inline-flex min-h-11 items-center text-red-700 hover:underline" /></form></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
