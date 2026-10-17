"use client";
import { ReactLenis, type LenisRef } from "lenis/react";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export function Smooth({ children }: { children: React.ReactNode }) {
  const ref = useRef<LenisRef>(null);
  useEffect(() => {
    const tick = (t: number) => ref.current?.lenis?.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    ref.current?.lenis?.on("scroll", ScrollTrigger.update);
    return () => gsap.ticker.remove(tick);
  }, []);
  return <ReactLenis root ref={ref} options={{ autoRaf: false, lerp: 0.09, smoothWheel: true }}>{children}</ReactLenis>;
}