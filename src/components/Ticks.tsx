"use client";
import { useEffect, useRef } from "react";

/* Deliverables list: rows slide in one after another and each tick draws itself. */
export function Ticks({ items }: { items: string[] }) {
  const ref = useRef<HTMLUListElement>(null);
  useEffect(() => { const el = ref.current; if (!el) return; const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("in"); io.disconnect(); } }, { threshold: 0.25 }); io.observe(el); return () => io.disconnect(); }, []);
  return (
    <ul ref={ref} className="ticks mt-4">
      {items.map((it, k) => (
        <li key={it} className="flex items-start gap-3 border-t border-current/15 py-3" style={{ transitionDelay: `${k * 110}ms` }}>
          <svg width="20" height="20" viewBox="0 0 24 24" className="mt-0.5 shrink-0 text-[var(--bronze)]" aria-hidden><circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" strokeWidth="1.2" opacity=".45" /><path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" pathLength={1} className="tick" style={{ transitionDelay: `${k * 110 + 250}ms` }} /></svg>
          <span className="text-sm">{it}</span>
        </li>
      ))}
    </ul>
  );
}