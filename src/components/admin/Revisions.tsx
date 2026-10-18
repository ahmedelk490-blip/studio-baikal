import { db } from "@/lib/db";
import type { AdminDict } from "@/lib/admin-i18n";
import { restoreRevision } from "@/app/[lang]/admin/actions";
import { ConfirmButton } from "./client";
import { btnGhost, card, fmtDate } from "./ui";

/* History panel: the last saved versions of a project or of the site settings, with the fields that
   differ from what is live now, and a restore button (the current state is kept before restoring). */
type Rev = { id: number; at: string; note: string; data: string; name: string | null };

const flat = (o: unknown, pre = "", out: Record<string, string> = {}) => {
  if (typeof o === "string" && /^[{[]/.test(o)) { try { return flat(JSON.parse(o), pre, out); } catch {} }
  if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) flat(v, pre ? `${pre}.${k}` : k, out);
  else out[pre] = String(o ?? "");
  return out;
};

export function Revisions({ entity, id, current, lang, a, canRestore }: { entity: "project" | "settings"; id: string | number; current: unknown; lang: string; a: AdminDict; canRestore: boolean }) {
  const revs = db().prepare("SELECT r.id, r.at, r.note, r.data, u.name FROM revisions r LEFT JOIN users u ON u.id = r.user_id WHERE r.entity = ? AND r.entity_id = ? ORDER BY r.id DESC LIMIT 12").all(entity, String(id)) as Rev[];
  const now = flat(current);
  return (
    <section className="mt-10">
      <h2 className="display text-3xl">{a.revisions}</h2>
      {revs.length === 0 ? <p className="mt-3 text-sm text-[var(--muted)]">{a.none}</p> : (
        <ol className="mt-4 grid gap-3">
          {revs.map((r) => {
            const old = flat(r.data);
            const diff = Array.from(new Set([...Object.keys(old), ...Object.keys(now)])).filter((k) => (old[k] ?? "") !== (now[k] ?? ""));
            return (
              <li key={r.id} className={`${card} flex flex-wrap items-start justify-between gap-4 p-4`}>
                <div className="min-w-0 text-sm">
                  <p><b className="font-medium">{fmtDate(r.at, lang)}</b> · {r.name ?? "—"} <span className="text-[var(--muted)]" dir="ltr">#{r.id} {r.note}</span></p>
                  <p className="mt-1 text-xs text-[var(--muted)]">{diff.length ? <>{a.changed}: <span dir="ltr">{diff.slice(0, 8).join(", ")}{diff.length > 8 ? ` +${diff.length - 8}` : ""}</span></> : a.noChange}</p>
                </div>
                {canRestore && diff.length > 0 && (
                  <form action={restoreRevision}><input type="hidden" name="lang" value={lang} /><input type="hidden" name="id" value={r.id} /><ConfirmButton label={a.restore} ask={`${a.restore} #${r.id}?`} className={btnGhost} /></form>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
