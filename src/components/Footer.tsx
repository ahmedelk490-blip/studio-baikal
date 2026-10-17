import Link from "next/link";
import Image from "next/image";
import { Credit } from "./Credit";
import { Wordmark } from "./Wordmark";
import { contact } from "@/data/projects";
import type { Dict, Lang } from "@/data/i18n";
import { pages } from "@/data/pages";

/* Lake-floor footer: a huge wordmark bleeding off the bottom, four columns above it, bronze hairlines. */
export function Footer({ t, lang }: { t: Dict; lang: Lang }) {
  const n = pages[lang].nav;
  const links = [[n.home, `/${lang}`], [n.projects, `/${lang}/projects`], [n.services, `/${lang}/services`], [n.studio, `/${lang}/studio`], [n.contact, `/${lang}/contact`]];
  const u = "text-xs uppercase tracking-[0.16em] rtl:tracking-normal";
  const other = `/${t.other}`;
  return (
    <footer className="relative overflow-hidden bg-[var(--deeper)] text-[var(--surface)]">
      <div className="grid gap-10 border-t border-[var(--bronze)]/40 px-5 py-16 md:grid-cols-12 md:px-10 md:py-20">
        <div className="md:col-span-4">
          <Image src="/brand/logo.png" alt="Studio Baikal" width={48} height={48} className="h-12 w-12 bg-[var(--surface)] p-1" />
          <p className="display mt-6 text-3xl italic md:text-4xl">{t.footer.tagline}</p>
          <p className="mt-3 max-w-xs text-sm text-[var(--surface)]/60">{t.footer.sub}</p>
        </div>
        <nav aria-label="Footer" className="md:col-span-2">
          <p className={`${u} text-[var(--bronze)]`}>{t.footer.explore}</p>
          <ul className="mt-3">{links.map(([l, h]) => <li key={h}><Link href={h} className="block py-2 text-sm text-[var(--surface)]/80">{l}</Link></li>)}</ul>
        </nav>
        <div className="md:col-span-3">
          <p className={`${u} text-[var(--bronze)]`}>{t.footer.where}</p>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 md:grid-cols-1 lg:grid-cols-2">{t.footer.cities.map((c) => <li key={c} className="py-2 text-sm text-[var(--surface)]/80">{c}</li>)}</ul>
        </div>
        <div className="md:col-span-3">
          <p className={`${u} text-[var(--bronze)]`}>{t.footer.reach}</p>
          <a href={contact.phoneHref} dir="ltr" className="mt-3 block w-fit py-2 text-sm">{contact.phone}</a>
          <a href={`mailto:${contact.email}`} className="block w-fit py-2 text-sm">{contact.email}</a>
          <a href={contact.whatsapp} target="_blank" rel="noopener" className="block w-fit py-2 text-sm">WhatsApp</a>
          <p className={`${u} mt-6 text-[var(--bronze)]`}>{t.footer.follow}</p>
          <a href={contact.instagram} target="_blank" rel="noopener" className="block w-fit py-2 text-sm">Instagram @studio_baikal</a>
          <Link href={other} hrefLang={t.other} className={`${u} mt-4 inline-block border-b border-[var(--surface)]/40 py-2`}>{t.footer.lang}</Link>
        </div>
      </div>
      <Wordmark />
      <div className="relative flex flex-wrap items-center justify-between gap-3 border-t border-[var(--surface)]/10 px-5 py-5 text-xs text-[var(--surface)]/60 md:px-10">
        <span>© 2026 {t.footer.rights}</span>
        <Credit />
      </div>
    </footer>
  );
}