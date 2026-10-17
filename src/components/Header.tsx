"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Dict, Lang } from "@/data/i18n";
import { pages } from "@/data/pages";

export function Header({ t, lang, dark = false }: { t: Dict; lang: Lang; dark?: boolean }) {
  const [deep, setDeep] = useState(dark);
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const path = usePathname() ?? `/${lang}`;
  const other = `/${t.other}${path.replace(/^\/(en|ar)/, "")}`;
  const n = pages[lang].nav;
  const nav: [string, string][] = [[n.home, `/${lang}`], [n.projects, `/${lang}/projects`], [n.services, `/${lang}/services`], [n.studio, `/${lang}/studio`], [n.contact, `/${lang}/contact`]];
  const on = (h: string) => (h === `/${lang}` ? path === h : path.startsWith(h));
  useEffect(() => { const f = () => setSolid(window.scrollY > 40); f(); addEventListener("scroll", f, { passive: true }); return () => removeEventListener("scroll", f); }, []);
  useEffect(() => {
    const el = document.documentElement;
    const sync = () => setDeep(el.classList.contains("is-deep") || (dark && window.scrollY < 80));
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });
    addEventListener("scroll", sync, { passive: true });
    return () => { obs.disconnect(); removeEventListener("scroll", sync); };
  }, [dark]);
  const light = deep && !open;
  const bg = open ? "bg-[var(--surface)]" : solid ? (light ? "bg-[var(--deep)]" : "bg-[var(--surface)] shadow-[0_1px_0_rgba(16,22,26,.08)]") : light ? "bg-gradient-to-b from-[var(--deep)]/70 to-transparent" : "";
  const u = "text-xs uppercase tracking-[0.2em] rtl:tracking-normal";
  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${light ? "text-[var(--surface)]" : "text-[var(--ink)]"} ${bg}`}>
      <div className="flex h-16 items-center justify-between px-5 md:h-20 md:px-10">
        <Link href={`/${lang}`} aria-label={t.nav.home} className="flex items-center gap-3">
          <Image src="/brand/logo.png" alt="Studio Baikal" width={36} height={36} priority className="h-9 w-9 bg-[var(--surface)] p-0.5" />
          <span className="text-xs font-semibold uppercase tracking-[0.28em] rtl:tracking-normal">{lang === "ar" ? "استوديو بايكال" : "Studio Baikal"}</span>
        </Link>
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
          {nav.slice(0, 4).map(([l, h]) => <Link key={h} href={h} aria-current={on(h) ? "page" : undefined} className={`${u} relative py-2 font-medium transition-opacity ${on(h) ? "opacity-100" : "opacity-80 hover:opacity-100"}`}>{l}{on(h) && <span className="absolute inset-x-0 -bottom-0.5 h-px bg-[var(--bronze)]" />}</Link>)}
          <Link href={other} hrefLang={t.other} className={`${u} px-2 py-3 opacity-80 hover:opacity-100`}>{t.otherLabel}</Link>
          <Link href={`/${lang}/contact`} className={`${u} rounded-full border border-current px-5 py-2.5`}>{t.nav.book}</Link>
        </nav>
        <div className="flex items-center gap-3 lg:hidden">
          <Link href={other} hrefLang={t.other} className={`${u} inline-flex min-h-11 items-center px-2 opacity-80`}>{t.otherLabel}</Link>
          <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={t.nav.menu} className="grid h-11 w-11 place-items-center">
            <span className="relative block h-3 w-6">
              <span className={`absolute left-0 top-0 h-px w-6 bg-current transition ${open ? "translate-y-[6px] rotate-45" : ""}`} />
              <span className={`absolute left-0 top-[6px] h-px w-6 bg-current transition ${open ? "opacity-0" : ""}`} />
              <span className={`absolute left-0 top-[12px] h-px w-6 bg-current transition ${open ? "-translate-y-[6px] -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-[var(--ink)]/10 bg-[var(--surface)] px-5 pb-6 pt-2 lg:hidden" aria-label="Mobile">
          {nav.map(([l, h]) => <Link key={h} href={h} onClick={() => setOpen(false)} className={`display flex items-center justify-between border-b border-[var(--ink)]/10 py-4 text-3xl ${on(h) ? "text-[var(--bronze)]" : ""}`}>{l}<span aria-hidden className="text-base">&#8599;</span></Link>)}
        </nav>
      )}
    </header>
  );
}