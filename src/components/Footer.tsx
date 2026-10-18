import Link from "next/link";
import Image from "next/image";
import { Wordmark } from "./Wordmark";
import { contact } from "@/data/projects";
import type { Dict, Lang } from "@/data/i18n";
import { pages } from "@/data/pages";

/* Lake-floor footer (Tama Square layout in Baikal's identity): a bronze line draws across, brand +
   three link columns, one consultation strip, the legal row, then a huge outlined BAIKAL that lights
   up in bronze under the cursor over a faded, mirrored room floor. */
export function Footer({ t, lang }: { t: Dict; lang: Lang }) {
  const n = pages[lang].nav;
  const links = [[n.home, `/${lang}`], [n.projects, `/${lang}/projects`], [n.services, `/${lang}/services`], [n.studio, `/${lang}/studio`], [n.contact, `/${lang}/contact`]];
  const u = "text-xs uppercase tracking-[0.16em] rtl:tracking-normal";
  const col = "text-sm text-[var(--surface)]/70 transition-colors hover:text-[var(--bronze)]";
  return (
    <footer className="ft relative isolate overflow-hidden bg-[var(--deeper)] text-[var(--surface)]">
      <div className="ft-floor pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[34vh]" aria-hidden>
        <Image src="/projects/el-nakhil-villa/01.webp" alt="" fill sizes="100vw" className="object-cover" />
      </div>
      <div className="relative px-5 pt-16 md:px-10 md:pt-20">
        <span className="ft-line block h-px origin-left bg-[var(--bronze)] rtl:origin-right" aria-hidden />
        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:gap-8">
          <div className="col-span-2 lg:col-span-1">
            <Link href={`/${lang}`} aria-label={t.nav.home} className="inline-flex items-center gap-3">
              <Image src="/brand/logo.png" alt="" width={44} height={44} className="h-11 w-11 bg-[var(--surface)] p-1" />
              <span className="text-xs font-semibold uppercase tracking-[0.28em] rtl:tracking-normal">{lang === "ar" ? "استوديو بايكال" : "Studio Baikal"}</span>
            </Link>
            <p className="display mt-6 text-3xl italic leading-[1.3] md:text-4xl">{t.footer.tagline}</p>
            <p className="mt-3 max-w-xs text-sm text-[var(--surface)]/60">{t.footer.sub}</p>
          </div>
          <nav aria-label="Footer">
            <p className={`${u} text-[var(--bronze)]`}>{t.footer.explore}</p>
            <ul className="mt-3">{links.map(([l, h]) => <li key={h}><Link href={h} className={`${col} inline-flex min-h-10 items-center`}>{l}</Link></li>)}</ul>
          </nav>
          <div>
            <p className={`${u} text-[var(--bronze)]`}>{t.footer.where}</p>
            <ul className="mt-3">{t.footer.cities.map((c) => <li key={c} className="flex min-h-10 items-center text-sm text-[var(--surface)]/70">{c}</li>)}</ul>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className={`${u} text-[var(--bronze)]`}>{t.footer.reach}</p>
            <ul className="mt-3">
              <li><a href={contact.phoneHref} dir="ltr" className={`${col} inline-flex min-h-10 items-center`}>{contact.phone}</a></li>
              <li><a href={`mailto:${contact.email}`} className={`${col} inline-flex min-h-10 items-center`}>{contact.email}</a></li>
              <li><a href={contact.instagram} target="_blank" rel="noopener" className={`${col} inline-flex min-h-10 items-center`}>Instagram @studio_baikal</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 rounded-2xl border border-[var(--bronze)]/25 bg-[var(--surface)]/[.04] p-4 md:flex-row md:items-center md:gap-6 md:p-5">
          <p className="flex-1 text-sm leading-relaxed text-[var(--surface)]/75">{t.footer.cta}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href={`/${lang}/contact`} className={`${u} inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--bronze)] px-6 font-semibold text-[var(--deep)] transition-opacity hover:opacity-90`}>{t.nav.book}</Link>
            <a href={contact.whatsapp} target="_blank" rel="noopener" className={`${u} inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--surface)]/35 px-6 transition-colors hover:border-[var(--surface)]`}>{t.footer.wa}</a>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-[var(--surface)]/10 py-4 pe-16 text-xs text-[var(--surface)]/60 md:pe-20">
          <span>© 2026 {t.footer.rights}</span>
          <a href="#top" className="inline-flex min-h-11 items-center gap-2 text-[var(--surface)]/80 transition-colors hover:text-[var(--surface)]">{t.footer.top} <span aria-hidden>&#8593;</span></a>
          <a href="https://qmarketingeg.com/" target="_blank" rel="noopener" className="group inline-flex min-h-11 items-center gap-2 text-[var(--surface)]/75 transition-colors hover:text-[var(--surface)]">
            <span className="relative inline-block h-5 w-5" aria-hidden><span className="absolute inset-0 rounded-full border border-[var(--bronze)]/70" /><span className="absolute -left-0.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[var(--bronze)] transition-transform duration-700 group-hover:rotate-180" style={{ transformOrigin: "12px 0" }} /></span>
            <span>{lang === "ar" ? "تصميم وبرمجة شركة " : "Designed & built by "}<b className="font-semibold">Q Marketing</b></span>
          </a>
        </div>
      </div>
      <Wordmark />
    </footer>
  );
}
