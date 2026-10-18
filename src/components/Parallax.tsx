"use client";
import { useEffect } from "react";
import { gsap } from "@/lib/gsap";

/* Subtle image parallax for any frame marked data-parallax: its direct img/video drifts ±6% inside
   the frame while it crosses the screen. Mounted once per page from the route template. */
export function Parallax() {
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((fr) => {
        const media = fr.querySelectorAll(":scope > img, :scope > video");
        gsap.fromTo(media, { yPercent: -6, scale: 1.14 }, { yPercent: 6, scale: 1.14, ease: "none", scrollTrigger: { trigger: fr, start: "top bottom", end: "bottom top", scrub: true } });
      });
    });
    return () => mm.revert();
  }, []);
  return null;
}
