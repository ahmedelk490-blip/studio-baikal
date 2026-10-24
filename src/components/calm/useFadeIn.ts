"use client";
import { useEffect, useRef } from "react";

/* Fades [data-fade] blocks in once as they reach the screen. Measured on scroll and resize rather than
   with an IntersectionObserver: the site's smooth scroll (Lenis) can leave the observer silent on wide
   screens, and the measurement is cheap (a few rects per frame, only while blocks remain). */
export function useFadeIn(deps: unknown[] = []) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const left = new Set(ref.current?.querySelectorAll<HTMLElement>("[data-fade]") ?? []);
    // checked every frame while blocks remain: the smooth scroll (Lenis) moves the page without a
    // reliable scroll event, so waiting for one leaves wide screens dark
    let raf = 0, dead = false;
    const tick = () => {
      if (dead) return;
      const line = innerHeight * 0.9;
      for (const el of left) {
        const r = el.getBoundingClientRect();
        if ((r.top < line && r.bottom > 0) || r.bottom < 0) { el.classList.add("calm-in"); left.delete(el); }
      }
      if (left.size) raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { dead = true; cancelAnimationFrame(raf); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}
