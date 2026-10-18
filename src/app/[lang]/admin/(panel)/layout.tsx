import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { can, type Perm } from "@/lib/perm";
import { adminDict } from "@/lib/admin-i18n";
import { NavLinks } from "@/components/admin/client";

type Props = { children: React.ReactNode; params: Promise<{ lang: string }> };
export const instant = false;

/* Signed-in shell. Reading the session is request-time, so it streams in behind Suspense
   (Cache Components); every page below still checks its own permission. */
export default function PanelLayout({ children, params }: Props) {
  return <Suspense fallback={<div className="p-10 text-sm opacity-60">…</div>}><Panel params={params}>{children}</Panel></Suspense>;
}

async function Panel({ children, params }: Props) {
  const { lang } = await params;
  const u = await requireUser(lang);
  const a = adminDict(lang);
  const nav: [string, string, Perm | null][] = [[a.dashboard, "", null], [a.projects, "/projects", "projects.view"], [a.inquiries, "/inquiries", "inquiries.view"], [a.media, "/media", "media.view"], [a.settings, "/settings", "settings.edit"], [a.seo, "/seo", "seo.edit"], [a.redirects, "/redirects", "redirects.edit"], [a.users, "/users", "users.manage"], [a.account, "/account", null]];
  const links = nav.filter(([, , p]) => !p || can(u.role, p));
  const full: [string, string][] = links.map(([l, h]) => [l, `/${lang}/admin${h}`]);
  return (
    <div className="lg:grid lg:min-h-[100svh] lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-[var(--ink)]/10 bg-[var(--deep)] text-[var(--surface)] lg:border-b-0">
        <div className="flex items-center gap-3 px-5 py-4 lg:py-6">
          <Image src="/brand/logo.png" alt="" width={32} height={32} className="h-8 w-8 bg-[var(--surface)] p-0.5" />
          <span className="text-sm font-semibold">{a.brand}</span>
        </div>
        {/* phones: a menu button that opens the pages as a vertical list; desktop: the fixed sidebar */}
        <details className="group px-3 pb-3 lg:hidden">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-lg border border-white/15 px-4 text-sm">
            {a.menu}<span aria-hidden className="transition-transform group-open:rotate-180">▾</span>
          </summary>
          <nav aria-label="Admin" className="mt-2 grid gap-1">
            <NavLinks links={full} root={`/${lang}/admin`} className="flex min-h-11 items-center rounded-lg px-4 text-sm transition-colors" activeClass="bg-white/12 text-[var(--surface)] font-medium" idleClass="text-[var(--surface)]/75 hover:bg-white/10" />
          </nav>
        </details>
        <nav aria-label="Admin" className="hidden flex-col gap-1 px-3 pb-3 lg:flex">
          <NavLinks links={full} root={`/${lang}/admin`} className="relative inline-flex min-h-11 items-center rounded-lg px-3 text-sm transition-colors" activeClass="bg-white/12 font-medium text-[var(--surface)] before:absolute before:inset-y-2 before:start-0 before:w-0.5 before:rounded before:bg-[var(--bronze)]" idleClass="text-[var(--surface)]/75 hover:bg-white/10 hover:text-[var(--surface)]" />
        </nav>
      </aside>
      <div className="min-w-0">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--ink)]/10 bg-white px-5 py-3 md:px-8">
          <p className="text-sm"><b className="font-semibold">{u.name}</b> <span className="text-[var(--muted)]">· {a[`r_${u.role}` as keyof typeof a]}</span></p>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/${lang === "ar" ? "en" : "ar"}/admin`} className="inline-flex min-h-11 items-center rounded-full px-3 text-sm text-[var(--muted)] hover:text-[var(--ink)]">{lang === "ar" ? "English" : "عربي"}</Link>
            <a href={`/${lang}`} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center rounded-full px-3 text-sm text-[var(--muted)] hover:text-[var(--ink)]">{a.viewSite} ↗</a>
            <form action="/api/admin/logout" method="post"><input type="hidden" name="lang" value={lang} /><button className="inline-flex min-h-11 items-center rounded-full border border-[var(--ink)]/15 px-4 text-sm">{a.logout}</button></form>
          </div>
        </header>
        <main className="px-5 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
