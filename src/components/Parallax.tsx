"use client";
import { useEffect, type RefObject } from "react";
import { gsap } from "@/lib/gsap";

/* Subtle image parallax: the frame's direct img/video drifts ±6% inside it while it crosses the screen.
   A hook, so it only runs after the owning component has hydrated (no SSR attribute mismatch). */
export function useParallax(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const fr = ref.current; if (!fr) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(fr.querySelectorAll(":scope > img, :scope > video"), { yPercent: -6, scale: 1.14 }, { yPercent: 6, scale: 1.14, ease: "none", scrollTrigger: { trigger: fr, start: "top bottom", end: "bottom top", scrub: true } });
    });
    return () => mm.revert();
  }, [ref]);
}
