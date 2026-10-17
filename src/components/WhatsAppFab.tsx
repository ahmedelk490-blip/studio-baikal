import { contact } from "@/data/projects";

export const WA_PATH = "M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 1.8a8.2 8.2 0 1 1-4.2 15.3l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 0 1 12 3.8Zm-3.3 4.4c-.2 0-.5 0-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.2 5 4.4 2.5 1 3 .8 3.5.7.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.2-.6-.4l-2-1c-.3-.1-.5-.1-.7.1l-1 1.2c-.2.2-.3.2-.6.1a6.7 6.7 0 0 1-3.4-3c-.2-.4 0-.5.2-.7l.5-.6.3-.5v-.5l-.9-2.2c-.2-.5-.4-.5-.7-.5h-.6Z";

/* Round bronze WhatsApp button with a breathing ring and a label that slides out on hover. */
export function WhatsAppFab({ label }: { label: string }) {
  return (
    <a href={contact.whatsapp} target="_blank" rel="noopener" aria-label={label} className="wa-fab group fixed bottom-5 end-5 z-40 flex h-14 items-center rounded-full bg-[var(--bronze)] text-[var(--deep)] shadow-[0_10px_30px_rgba(0,0,0,.35)] lg:bottom-6 lg:end-14">
      <span className="wa-ring" aria-hidden />
      <span className="wa-label max-w-0 overflow-hidden whitespace-nowrap text-xs font-semibold uppercase tracking-[0.16em] rtl:tracking-normal">WhatsApp</span>
      <span className="grid h-14 w-14 place-items-center"><svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d={WA_PATH} /></svg></span>
    </a>
  );
}