"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/* Magnetic CTA: the button leans toward the pointer (fine pointers only). */
export function Magnetic({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useGSAP(() => {
    const el = ref.current!;
    gsap.matchMedia().add("(pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const x = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
      const y = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });
      const mv = (e: MouseEvent) => { const r = el.getBoundingClientRect(); x((e.clientX - r.left - r.width / 2) * 0.35); y((e.clientY - r.top - r.height / 2) * 0.35); };
      const lv = () => { x(0); y(0); };
      el.addEventListener("mousemove", mv); el.addEventListener("mouseleave", lv);
      return () => { el.removeEventListener("mousemove", mv); el.removeEventListener("mouseleave", lv); };
    });
  }, { scope: ref });
  return <span ref={ref} className={`inline-block ${className}`}>{children}</span>;
}