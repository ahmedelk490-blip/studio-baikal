"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLenis } from "lenis/react";
import type { Dict, Lang } from "@/data/i18n";
import { pages } from "@/data/pages";

// the calm version: the menu drops down under the header and scrolls with the page, plain words only
const CALM = process.env.NEXT_PUBLIC_HOME === "calm";
const Globe = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.8 3 2.8 15 0 18M12 3c-2.8 3-2.8 15 0 18" /></svg>;

export function Header({ t, lang, dark = false }: { t: Dict; lang: Lang; dark?: boolean }) {
  const [open, setOpen] = useState(false);
  const path = usePathname() ?? `/${lang}`;
  const other = `/${t.other}${path.replace(/^\/(en|ar)/, "")}`;
  const n = pages[lang].nav;
  const nav: [string, string][] = [[n.home, `/${lang}`], [n.projects, `/${lang}/projects`], [n.services, `/${lang}/services`], [n.studio, `/${lang}/studio`], [n.contact, `/${lang}/contact`]];
  const on = (h: string) => (h === `/${lang}` ? path === h : path.startsWith(h));
  const u = "text-xs uppercase tracking-[0.2em] rtl:tracking-normal";
  const lenis = useLenis();
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open || CALM) return;
    lenis?.stop(); document.documentElement.style.overflow = "hidden";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", esc);
    return () => { lenis?.start(); document.documentElement.style.overflow = ""; removeEventListener("keydown", esc); };
  }, [open, lenis]);
  return (
    <header id="top" className={`${open && !CALM ? "fixed" : "absolute"} inset-x-0 top-0 z-50 ${open ? (CALM ? "bg-[#0B1013] text-[var(--surface)]" : "bg-[var(--surface)] text-[var(--ink)] shadow-lg") : dark ? "bg-gradient-to-b from-[var(--deep)]/70 to-transparent text-[var(--surface)]" : "text-[var(--ink)]"}`}>
      <div className="flex h-16 items-center justify-between px-5 md:h-20 md:px-10">
        <Link href={`/${lang}`} aria-label={t.nav.home} className="flex items-center gap-3">
          <Image src="/brand/logo.png" alt="Studio Baikal" width={36} height={36} priority className="h-9 w-9 bg-[var(--surface)] p-0.5" />
          <span className="text-xs font-semibold uppercase tracking-[0.28em] rtl:tracking-normal">{lang === "ar" ? "استوديو بايكال" : "Studio Baikal"}</span>
        </Link>
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
          {nav.slice(0, 4).map(([l, h]) => <Link key={h} href={h} aria-current={on(h) ? "page" : undefined} className={`${u} relative py-2 font-medium transition-opacity ${on(h) ? "opacity-100" : "opacity-80 hover:opacity-100"}`}>{l}{on(h) && <span className="absolute inset-x-0 -bottom-0.5 h-px bg-[var(--bronze)]" />}</Link>)}
          <Link href={other} hrefLang={t.other} aria-label={t.otherLabel} title={t.otherLabel} className="grid h-9 w-9 place-items-center rounded-full border border-current/30 transition-colors hover:border-current"><Globe /><span className="sr-only">{t.otherLabel}</span></Link>
          <Link href={`/${lang}/contact`} className={`${u} rounded-full border border-current px-5 py-2.5`}>{t.nav.book}</Link>
        </nav>
        <div className="flex items-center gap-3 lg:hidden">
          <Link href={other} hrefLang={t.other} aria-label={t.otherLabel} className="grid h-9 w-9 place-items-center rounded-full border border-current/30"><Globe /></Link>
          <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mnav" aria-label={t.nav.menu} className="grid h-11 w-11 place-items-center">
            <span className="relative block h-3 w-6">
              <span className={`absolute left-0 top-0 h-px w-6 bg-current transition ${open ? "translate-y-[6px] rotate-45" : ""}`} />
              <span className={`absolute left-0 top-[6px] h-px w-6 bg-current transition ${open ? "opacity-0" : ""}`} />
              <span className={`absolute left-0 top-[12px] h-px w-6 bg-current transition ${open ? "-translate-y-[6px] -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </div>
      {/* design-guard-ignore: full-screen mobile menu overlay (top to bottom), not a bottom CTA bar */}
      <nav id="mnav" className={`mnav ${CALM ? "absolute inset-x-0 top-16 bg-[#0B1013] text-[var(--surface)] shadow-[0_30px_60px_-20px_rgba(0,0,0,.6)]" : "fixed inset-x-0 bottom-0 top-16 overflow-y-auto bg-[var(--surface)] text-[var(--ink)]"} flex flex-col px-5 pb-8 pt-2 md:top-20 lg:hidden ${open ? "is-open" : ""}`} aria-label="Mobile" inert={!open}>
        {nav.map(([l, h], k) => <Link key={h} href={h} onClick={() => setOpen(false)} style={{ transitionDelay: open ? `${120 + k * 60}ms` : "0ms" }} className={`mnav-link display flex min-h-16 items-center justify-between border-b ${CALM ? "border-[var(--surface)]/12 text-2xl" : "border-[var(--ink)]/10 text-3xl"} ${on(h) ? "text-[var(--bronze)]" : ""}`}>{CALM ? <span>{l}</span> : <><span><span className="me-3 align-middle text-xs text-[var(--muted)]" dir="ltr">0{k + 1}</span>{l}</span><span aria-hidden className="text-base rtl:-scale-x-100">&#8599;</span></>}</Link>)}
        <div className={`mnav-link ${CALM ? "mt-6" : "mt-auto"} flex flex-wrap items-center justify-between gap-4 pt-8`} style={{ transitionDelay: open ? "460ms" : "0ms" }}>
          <Link href={`/${lang}/contact`} onClick={() => setOpen(false)} className={`${u} inline-flex min-h-11 items-center rounded-full px-6 ${CALM ? "bg-[var(--bronze)] text-[var(--deep)]" : "bg-[var(--ink)] text-[var(--surface)]"}`}>{t.nav.book}</Link>
          <Link href={other} hrefLang={t.other} className={`${u} inline-flex min-h-11 items-center gap-2 ${CALM ? "text-[var(--surface)]/70" : ""}`}><Globe />{t.otherLabel}</Link>
        </div>
      </nav>
    </header>
  );
}