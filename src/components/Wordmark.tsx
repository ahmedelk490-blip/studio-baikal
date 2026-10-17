"use client";
import { useEffect, useRef } from "react";

/* Footer wordmark: letters rise out of the lake floor one by one. */
export function Wordmark() {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("in"); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(el); return () => io.disconnect();
  }, []);
  return (
    <p ref={ref} aria-hidden dir="ltr" className="wordmark display pointer-events-none -mb-[0.28em] select-none whitespace-nowrap px-5 text-[22vw] leading-none text-[var(--surface)]/[.08] md:px-10">
      {"BAIKAL".split("").map((c, k) => <span key={k} className="inline-block overflow-hidden align-bottom"><span className="wm-l inline-block" style={{ transitionDelay: `${k * 80}ms` }}>{c}</span></span>)}
    </p>
  );
}