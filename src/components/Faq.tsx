"use client";
import { useState } from "react";

export function Faq({ items }: { items: [string, string][] }) {
  const [o, setO] = useState(0);
  return (
    <ol>
      {items.map(([q, a], k) => (
        <li key={q} className="border-t border-[var(--surface)]/15 last:border-b">
          <button onClick={() => setO(o === k ? -1 : k)} aria-expanded={o === k} className="flex w-full items-center justify-between gap-6 py-6 text-start">
            <span className="display text-2xl md:text-3xl">{q}</span><span className={`faq-x ${o === k ? "on" : ""}`} aria-hidden />
          </button>
          <div className={`grid transition-[grid-template-rows] duration-500 ${o === k ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}><div className="overflow-hidden"><p className="max-w-2xl pb-6 text-sm text-[var(--surface)]/75">{a}</p></div></div>
        </li>
      ))}
    </ol>
  );
}