import { getContact } from "@/lib/site";
import { WA_PATH } from "./wa-path";
import type { Lang } from "@/data/i18n";


/* Round bronze WhatsApp button with a breathing ring and a label that slides out on hover. */
export async function WhatsAppFab({ label, lang }: { label: string; lang: Lang }) {
  const contact = await getContact(lang);
  return (
    <a href={contact.whatsapp} target="_blank" rel="noopener" aria-label={label} className="wa-fab group fixed bottom-3 end-3 z-40 flex h-11 items-center rounded-full bg-[var(--bronze)] text-[var(--deep)] shadow-[0_6px_18px_rgba(0,0,0,.3)] lg:bottom-5 lg:end-5">
      <span className="wa-ring" aria-hidden />
      <span className="wa-label max-w-0 overflow-hidden whitespace-nowrap text-xs font-semibold uppercase tracking-[0.16em] rtl:tracking-normal">WhatsApp</span>
      <span className="grid h-11 w-11 place-items-center"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d={WA_PATH} /></svg></span>
    </a>
  );
}