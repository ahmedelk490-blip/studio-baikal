import Link from "next/link";
import { Credit } from "./Credit";
import { contact } from "@/data/projects";

const links = [["Projects", "/#projects"], ["Rooms", "/#rooms"], ["Services", "/#services"], ["Studio", "/#studio"], ["Contact", "/#contact"]];

export function Footer() {
  return (
    <footer className="bg-[var(--deeper)] text-[var(--surface)]">
      <div className="grid gap-10 border-t border-[var(--surface)]/15 px-5 py-14 md:grid-cols-12 md:px-10">
        <div className="md:col-span-5">
          <p className="display text-3xl italic">Where design meets depth.</p>
          <p className="mt-3 max-w-xs text-sm text-[var(--surface)]/60">Interior &amp; exterior spaces inspired by nature, rooted in structure. Egypt.</p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-1 text-xs uppercase tracking-[0.16em] rtl:tracking-normal md:col-span-4">
          {links.map(([l, h]) => <Link key={h} href={h} className="py-2 text-[var(--surface)]/75">{l}</Link>)}
        </nav>
        <div className="text-sm md:col-span-3">
          <a href={contact.phoneHref} className="block py-2">{contact.phone}</a>
          <a href={`mailto:${contact.email}`} className="block py-2">{contact.email}</a>
          <a href={contact.instagram} target="_blank" rel="noopener" className="block py-2">Instagram @studio_baikal</a>
        </div>
      </div>
      <div className="border-t border-[var(--surface)]/10 px-5 py-5 text-center text-xs text-[var(--surface)]/60"><Credit /></div>
    </footer>
  );
}