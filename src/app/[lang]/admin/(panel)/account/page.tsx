import { requireUser } from "@/lib/auth";
import { adminDict } from "@/lib/admin-i18n";
import { PasswordForm } from "@/components/admin/client";
import { btnGhost, card } from "@/components/admin/ui";

// Per-request admin page (session + live data): block on the server, no prerendered shell.
export const instant = false;

type Props = { params: Promise<{ lang: string }> };

export default async function Account({ params }: Props) {
  const { lang } = await params;
  const u = await requireUser(lang);
  const a = adminDict(lang);
  return (
    <>
      <h1 className="display text-4xl">{a.account}</h1>
      <p className="mt-2 text-sm text-[var(--muted)]"><span dir="ltr">{u.email}</span> · {a[`r_${u.role}`]}</p>
      <section className={`${card} mt-6`}><h2 className="mb-4 font-semibold">{a.changePassword}</h2><PasswordForm a={a} /></section>
      <form action="/api/admin/logout" method="post" className="mt-6"><input type="hidden" name="lang" value={lang} /><input type="hidden" name="all" value="1" /><button className={btnGhost}>{a.signOutAll}</button></form>
    </>
  );
}
