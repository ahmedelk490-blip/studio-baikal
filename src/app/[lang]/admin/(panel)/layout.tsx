import Image from "next/image";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { can, type Perm } from "@/lib/perm";
import { adminDict, type AdminDict } from "@/lib/admin-i18n";
import { NavLinks } from "@/components/admin/client";

type Props = { children: React.ReactNode; params: Promise<{ lang: string }> };
// Signed-in shell: per-request (session), so it blocks on the server instead of streaming a shell.
export const instant = false;

/* Grouped sidebar (Content / Clients / Website / Team) with the open page highlighted, a top bar
   with the user, language switch, site link and sign-out. Pages still check their own permission. */
type Item = [label: string, href: string, perm: Perm | null];
const groups = (a: AdminDict): [string, Item[]][] => [
  ["", [[a.dashboard, "", null]]],
  [a.g_content, [[a.projects, "/projects", "projects.view"], [a.media, "/media", "media.view"]]],
  [a.g_clients, [[a.inquiries, "/inquiries", "inquiries.view"]]],
  [a.g_site, [[a.settings, "/settings", "settings.edit"], [a.seo, "/seo", "seo.edit"], [a.redirects, "/redirects", "redirects.edit"]]],
  [a.g_team, [[a.users, "/users", "users.manage"], [a.account, "/account", null]]],
];

export default async function PanelLayout({ children, params }: Props) {
  const { lang } = await params;
  const u = await requireUser(lang);
  const a = adminDict(lang);
  const fresh = can(u.role, "inquiries.view") ? (db().prepare("SELECT COUNT(*) n FROM inquiries WHERE status = 'new'").get() as { n: number }).n : 0;
  const root = `/${lang}/admin`;
  const visible = groups(a).map(([g, items]) => [g, items.filter(([, , p]) => !p || can(u.role, p)).map(([l, h]): [string, string] => [h === "/inquiries" && fresh ? `${l} · ${fresh}` : l, `${root}${h}`])] as const).filter(([, items]) => items.length);
  const menu = (cls: string, active: string, idle: string) => visible.map(([g, items]) => (
    <div key={g || "home"} className="grid gap-0.5">
      {g && <p className="px-3 pb-1 pt-4 text-xs uppercase tracking-[0.14em] rtl:tracking-normal text-[var(--surface)]/40">{g}</p>}
      <NavLinks links={items} root={root} className={cls} activeClass={active} idleClass={idle} />
    </div>
  ));
  return (
    <div className="lg:grid lg:min-h-[100svh] lg:grid-cols-[248px_1fr]">
      <aside className="bg-[var(--deep)] text-[var(--surface)] lg:sticky lg:top-0 lg:h-[100svh] lg:overflow-y-auto">
        <Link href={root} className="flex items-center gap-3 px-5 py-4 lg:py-6">
          <Image src="/brand/logo.png" alt="" width={32} height={32} className="h-8 w-8 bg-[var(--surface)] p-0.5" />
          <span className="text-sm font-semibold">{a.brand}</span>
        </Link>
        {/* phones: one menu button that opens the grouped list; desktop: the fixed sidebar */}
        <details className="group px-3 pb-3 lg:hidden">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-lg border border-white/15 px-4 text-sm">
            {a.menu}<span aria-hidden className="transition-transform group-open:rotate-180">▾</span>
          </summary>
          <nav aria-label="Admin" className="mt-1 grid">{menu("flex min-h-11 items-center rounded-lg px-3 text-sm transition-colors", "bg-white/12 font-medium text-[var(--surface)]", "text-[var(--surface)]/75 hover:bg-white/10")}</nav>
        </details>
        <nav aria-label="Admin" className="hidden px-3 pb-6 lg:grid">
          {menu("relative flex min-h-11 items-center rounded-lg px-3 text-sm transition-colors", "bg-white/12 font-medium text-[var(--surface)] before:absolute before:inset-y-2 before:start-0 before:w-0.5 before:rounded before:bg-[var(--bronze)]", "text-[var(--surface)]/75 hover:bg-white/10 hover:text-[var(--surface)]")}
        </nav>
      </aside>
      <div className="min-w-0">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--ink)]/10 bg-white px-5 py-3 md:px-8">
          <p className="text-sm"><b className="font-semibold">{u.name}</b> <span className="text-[var(--muted)]">· {a[`r_${u.role}` as keyof AdminDict]}</span></p>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/${lang === "ar" ? "en" : "ar"}/admin`} className="inline-flex min-h-11 items-center rounded-full px-3 text-sm text-[var(--muted)] hover:text-[var(--ink)]">{lang === "ar" ? "English" : "عربي"}</Link>
            <a href={`/${lang}`} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center rounded-full px-3 text-sm text-[var(--muted)] hover:text-[var(--ink)]">{a.viewSite} ↗</a>
            <form action="/api/admin/logout" method="post"><input type="hidden" name="lang" value={lang} /><button className="inline-flex min-h-11 items-center rounded-full border border-[var(--ink)]/15 px-4 text-sm">{a.logout}</button></form>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1400px] px-5 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
