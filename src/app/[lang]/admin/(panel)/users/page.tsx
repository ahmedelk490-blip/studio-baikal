import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { roles } from "@/lib/perm";
import { adminDict } from "@/lib/admin-i18n";
import { createUser, updateUser } from "../../actions";
import { Notice, btn, btnGhost, card, inp, fmtDate } from "@/components/admin/ui";

// Per-request admin page (session + live data): block on the server, no prerendered shell.
export const instant = false;

type Props = { params: Promise<{ lang: string }>; searchParams: Promise<{ msg?: string }> };
type U = { id: number; email: string; name: string; role: (typeof roles)[number]; active: number; last_login: string | null };

/* Users (super admin only): add people, change roles, disable access, set a new password
   (which also signs that person out everywhere). */
export default async function Users({ params, searchParams }: Props) {
  const { lang } = await params;
  const { msg } = await searchParams;
  const me = await requireUser(lang, "users.manage");
  const a = adminDict(lang);
  const rows = db().prepare("SELECT id, email, name, role, active, last_login FROM users ORDER BY id").all() as U[];
  const roleSel = (def: string, dis = false) => <select name="role" defaultValue={def} disabled={dis} aria-label={a.role} className={inp}>{roles.map((r) => <option key={r} value={r}>{a[`r_${r}`]}</option>)}</select>;
  return (
    <>
      <Notice msg={msg} a={a} lang={lang} />
      <h1 className="display text-4xl">{a.users}</h1>
      <ul className="mt-6 grid gap-3">
        {rows.map((r) => (
          <li key={r.id} className={card}>
            <form action={updateUser} className="grid items-end gap-3 md:grid-cols-[1.4fr_1fr_auto_1fr_auto]">
              <input type="hidden" name="lang" value={lang} /><input type="hidden" name="id" value={r.id} />
              <div className="text-sm"><b className="font-medium">{r.name}</b><br /><span className="text-[var(--muted)]" dir="ltr">{r.email}</span><br /><span className="text-xs text-[var(--muted)]">{a.lastLogin}: {fmtDate(r.last_login, lang)}</span></div>
              <label className="grid gap-1.5 text-sm">{a.role}{roleSel(r.role, r.id === me.id)}{r.id === me.id && <input type="hidden" name="role" value={r.role} />}</label>
              <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={!!r.active} disabled={r.id === me.id} className="h-5 w-5" />{a.active}{r.id === me.id && <input type="hidden" name="active" value="1" />}</label>
              <label className="grid gap-1.5 text-sm">{a.resetPassword}<input name="password" type="password" minLength={10} autoComplete="new-password" className={inp} /></label>
              <button className={btnGhost}>{a.save}</button>
            </form>
          </li>
        ))}
      </ul>
      <form action={createUser} className={`${card} mt-8 grid max-w-3xl gap-4 sm:grid-cols-2`}>
        <h2 className="font-semibold sm:col-span-2">{a.newUser}</h2>
        <input type="hidden" name="lang" value={lang} />
        <label className="grid gap-1.5 text-sm">{a.name}<input name="name" required maxLength={80} className={inp} /></label>
        <label className="grid gap-1.5 text-sm">{a.email}<input name="email" type="email" required dir="ltr" className={inp} /></label>
        <label className="grid gap-1.5 text-sm">{a.role}{roleSel("editor")}</label>
        <label className="grid gap-1.5 text-sm">{a.tempPassword}<input name="password" type="password" required minLength={10} autoComplete="new-password" className={inp} /><span className="text-xs text-[var(--muted)]">{a.pwRule}</span></label>
        <div className="sm:col-span-2"><button className={btn}>{a.create}</button></div>
      </form>
    </>
  );
}
