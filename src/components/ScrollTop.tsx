"use client";
import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { ScrollTrigger } from "@/lib/gsap";

/* New page = top of page, even with smooth scroll and pinned sections on the previous one. */
export function ScrollTop() {
  const path = usePathname();
  useLayoutEffect(() => {
    try { history.scrollRestoration = "manual"; } catch {}
    const top = () => { window.scrollTo(0, 0); document.documentElement.scrollTop = 0; document.body.scrollTop = 0; };
    top(); const ids = [50, 150, 350].map((ms) => setTimeout(top, ms)); const r = setTimeout(() => ScrollTrigger.refresh(), 450);
    return () => { ids.forEach(clearTimeout); clearTimeout(r); };
  }, [path]);
  return null;
}
