"use client";
import { useEffect, useRef } from "react";

/* Photo mask reveal: clip-path wipes up while the image settles from 1.25 to 1 (CSS in globals). */
export function MaskReveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("in"); io.disconnect(); } }, { rootMargin: "0px 0px -12% 0px" });
    io.observe(el); return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`mask ${className}`}>{children}</div>;
}