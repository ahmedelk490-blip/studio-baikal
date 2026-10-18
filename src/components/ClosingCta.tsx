import Image from "next/image";
import { Btn } from "./Btn";
import type { Extras } from "@/data/extras";

/* The last word on a page that would otherwise stop at a list: one wide, warm room that drifts slowly
   (ken) under a deep fade, with the invitation and a single button on the dark part of the frame. */
export function ClosingCta({ c, href, src }: { c: Extras["cta"]; href: string; src: string }) {
  return (
    <section id="start" className="relative flex min-h-[80svh] items-end overflow-hidden bg-[var(--deep)] text-[var(--surface)]">
      <Image src={src} alt="" fill sizes="100vw" className="ken object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--deep)] via-[var(--deep)]/55 to-[var(--deep)]/10" />
      <div className="relative w-full px-5 pb-14 md:px-10 md:pb-20">
        <p className="eyebrow text-xs uppercase tracking-[0.2em] rtl:tracking-normal text-[var(--bronze)]">{c.eyebrow}</p>
        <h2 className="display mt-3 max-w-3xl text-4xl md:text-7xl">{c.title}</h2>
        <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <p className="max-w-md text-sm text-[var(--surface)]/80">{c.note}</p>
          <Btn href={href}>{c.btn}</Btn>
        </div>
      </div>
    </section>
  );
}
