"use client";
import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

/* Fixed depth gauge: every [data-depth] section is a tick; the marker follows the scroll,
   the label shows the section you are in; <html class="is-deep"> flips the chrome to light text. */
export function DepthGauge() {
  const ref = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const meters = useRef<HTMLSpanElement>(null);
  useGSAP(() => {
    const secs = Array.from(document.querySelectorAll<HTMLElement>("[data-depth]")); // outside the gauge scope on purpose
    secs.forEach((s) => ScrollTrigger.create({ trigger: s, start: "top 55%", end: "bottom 55%",
      onToggle: (st) => { if (!st.isActive) return; if (label.current) label.current.textContent = s.dataset.depth ?? ""; if (meters.current) meters.current.textContent = s.dataset.meters ?? ""; document.documentElement.classList.toggle("is-deep", s.dataset.deep === "1"); } }));
    document.querySelectorAll<HTMLElement>("main section[data-depth]").forEach((s, i) => { if (i === 0) return; gsap.fromTo(s, { clipPath: "inset(3% 2.5% 0% 2.5% round 32px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none", scrollTrigger: { trigger: s, start: "top bottom", end: "top 30%", scrub: 0.4 } }); });
    document.querySelectorAll<SVGElement>("svg.contours").forEach((el) => gsap.to(el, { yPercent: -22, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: 0.6 } }));
    const id = setTimeout(() => { ScrollTrigger.sort(); ScrollTrigger.refresh(); }, 600);
    gsap.to(".dg-marker", { top: "100%", ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.4 } });
    return () => clearTimeout(id);
  }, { scope: ref });
  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed end-4 top-1/2 z-40 hidden h-[40vh] opacity-70 -translate-y-1/2 text-xs uppercase tracking-[0.2em] rtl:tracking-normal transition-colors duration-500 [html.is-deep_&]:text-[var(--surface)] lg:block">
      <span className="absolute inset-y-0 end-0 w-px bg-current opacity-30" />
      {Array.from({ length: 9 }).map((_, k) => <span key={k} className="absolute end-0 h-px w-2 bg-current opacity-40" style={{ top: `${(k / 8) * 100}%` }} />)}
      <span className="dg-marker absolute end-0 top-0 flex -translate-y-1/2 items-center gap-3 rtl:flex-row-reverse whitespace-nowrap">
        <span ref={label} className="sr-only">Surface</span><span ref={meters} className="sr-only">0 m</span>
        <span className="h-2 w-2 rounded-full bg-[var(--bronze)]" />
      </span>
    </div>
  );
}