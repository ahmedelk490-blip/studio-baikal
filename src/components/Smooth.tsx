"use client";
import { ReactLenis, type LenisRef } from "lenis/react";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export function Smooth({ children }: { children: React.ReactNode }) {
  const ref = useRef<LenisRef>(null);
  const path = usePathname();
  // a new page opens at its top: ScrollTrigger caches the old page's scroll and puts it back when it
  // re-measures, so its memory is cleared and it re-reads the top before and after the refresh
  useEffect(() => {
    const top = () => { ref.current?.lenis?.scrollTo(0, { immediate: true, force: true }); window.scrollTo(0, 0); ScrollTrigger.clearScrollMemory("manual"); ScrollTrigger.update(); };
    top();
    const id = setTimeout(() => { top(); ScrollTrigger.refresh(); top(); }, 400);
    return () => clearTimeout(id);
  }, [path]);
  useEffect(() => {
    const tick = (t: number) => ref.current?.lenis?.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    ref.current?.lenis?.on("scroll", ScrollTrigger.update);
    return () => gsap.ticker.remove(tick);
  }, []);
  return <ReactLenis root ref={ref} options={{ autoRaf: false, lerp: 0.14, smoothWheel: true }}>{children}</ReactLenis>;
}