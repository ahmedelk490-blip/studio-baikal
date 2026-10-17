"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/* 3D card: floats by itself, tilts toward a fine pointer, a bronze sheen crosses it. CSS 3D only, no WebGL. */
export function Tilt({ children, className = "", float = 0 }: { children: React.ReactNode; className?: string; float?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const el = ref.current!;
    gsap.matchMedia().add("(pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const rx = gsap.quickTo(el, "rotationX", { duration: 0.7, ease: "power3.out" });
      const ry = gsap.quickTo(el, "rotationY", { duration: 0.7, ease: "power3.out" });
      const gx = gsap.quickTo(el, "--gx", { duration: 0.7, ease: "power3.out" });
      const mv = (e: MouseEvent) => { const r = el.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5; rx(-py * 10); ry(px * 12); gx(px * 100 + 50); };
      const lv = () => { rx(0); ry(0); gx(50); };
      el.addEventListener("mousemove", mv); el.addEventListener("mouseleave", lv);
      return () => { el.removeEventListener("mousemove", mv); el.removeEventListener("mouseleave", lv); };
    });
  }, { scope: ref });
  return (
    <div className="tilt-scene" style={{ perspective: "1200px" }}>
      <div ref={ref} className={`tilt ${className}`} style={{ transformStyle: "preserve-3d", animationDelay: `${float}s`, ["--gx" as string]: "50" }}>
        {children}
        <span className="tilt-sheen" aria-hidden />
      </div>
    </div>
  );
}