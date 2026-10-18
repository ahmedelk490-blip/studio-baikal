"use client";
import { useEffect, useRef } from "react";

/* Footer wordmark: an outlined BAIKAL whose letters rise out of the lake floor; a second bronze
   outline is lit only inside a soft circle that follows the pointer (centred on touch screens).
   It also draws the footer's top line once the footer is on screen. */
export function Wordmark() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const ft = el.closest("footer");
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("in"); ft?.classList.add("in"); io.disconnect(); } }, { threshold: 0.15 });
    io.observe(el);
    const move = (e: PointerEvent) => { const r = el.getBoundingClientRect(); el.style.setProperty("--mx", `${e.clientX - r.left}px`); el.style.setProperty("--my", `${e.clientY - r.top}px`); };
    const fine = matchMedia("(hover: hover)").matches;
    if (fine) ft?.addEventListener("pointermove", move);
    return () => { io.disconnect(); ft?.removeEventListener("pointermove", move); };
  }, []);
  const word = (cls: string) => (
    <span className={`absolute inset-x-0 bottom-0 ${cls}`}>
      {"BAIKAL".split("").map((c, k) => <span key={k} className="inline-block overflow-hidden align-bottom"><span className="wm-l inline-block" style={{ transitionDelay: `${k * 80}ms` }}>{c}</span></span>)}
    </span>
  );
  return (
    <div ref={ref} aria-hidden dir="ltr" style={{ fontFamily: "var(--font-display), Georgia, serif" }} className="wordmark display pointer-events-none relative -mb-[0.2em] h-[0.92em] select-none whitespace-nowrap px-5 text-center text-[22vw] leading-none md:px-10">
      {word("wm-base")}
      {word("wm-lit")}
    </div>
  );
}
