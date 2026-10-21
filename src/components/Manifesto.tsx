"use client";
import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { Contours } from "./Contours";
import { ModelStage, type Piece } from "./ModelStage";

// calm matte stoneware, the kind of pieces that dress Baikal's own rooms (CC0, Poly Haven)
const VASES: Piece[] = [
  { src: "/models/ceramic_vase_02/ceramic_vase_02_1k.gltf", h: 0.62, x: 0 },
  { src: "/models/ceramic_vase_01/ceramic_vase_01_1k.gltf", h: 0.9, x: -0.42, z: -0.22 },
  { src: "/models/ceramic_vase_04/ceramic_vase_04_1k.gltf", h: 0.5, x: 0.4, z: 0.12 },
];
import type { Dict } from "@/data/i18n";

/* 20 m: the statement over flowing contour lines, words light up as you read; below it a round
   porthole opens to full screen as it scrolls into view and drops you into the projects. */
export function Manifesto({ t }: { t: Dict }) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(() => {
    gsap.to(".w", { opacity: 1, stagger: 0.05, ease: "none", scrollTrigger: { trigger: ".m-text", start: "top 80%", end: "bottom 45%", scrub: 0.5 } });
    const st = { trigger: ".ph-wrap", start: "top 90%", end: "center center", scrub: 0.6 };
    gsap.to(".ph", { clipPath: "circle(80% at 50% 50%)", ease: "power1.inOut", scrollTrigger: st });
    gsap.to(".ph-img", { scale: 1, ease: "none", scrollTrigger: st });
    gsap.from(".ph-cap > *", { opacity: 0, y: 24, stagger: 0.12, duration: 0.8, scrollTrigger: { trigger: ".ph-wrap", start: "center 70%" } });
  }, { scope: ref });
  return (
    <section ref={ref} data-depth={t.gauge.statement} data-meters="20 m" className="relative overflow-hidden bg-[var(--surface)] text-[var(--ink)]">
      <Contours className="pointer-events-none absolute inset-x-0 top-10 h-[46%] opacity-45" />
      {/* the statement beside three stoneware vases on a lit stage (CC0, turning with the scroll) */}
      <div className="relative mx-auto grid max-w-7xl items-center gap-4 px-5 pt-16 md:px-10 md:pt-24 lg:grid-cols-12 lg:gap-10">
        <ModelStage pieces={VASES} className="mx-auto h-[300px] w-full max-w-[420px] lg:order-2 lg:col-span-5 lg:h-[520px] lg:max-w-none" />
        <p className="m-text display text-center text-3xl leading-[1.22] rtl:leading-[1.5] md:text-5xl lg:col-span-7 lg:text-start lg:text-[3.2rem]">
          {t.statement.text.split(" ").map((w, k) => <span key={k} className="w inline-block opacity-[.14]">{w}&nbsp;</span>)}
        </p>
      </div>
      <div className="ph-wrap relative mt-10 h-[80svh] md:mt-14 md:h-[100svh]">
        <div className="ph absolute inset-0" style={{ clipPath: "circle(22% at 50% 50%)" }}>
          <Image src="/projects/nasr-city-108/02.webp" alt="" fill sizes="100vw" className="ph-img scale-[1.35] object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--deep)] via-[var(--deep)]/25 to-transparent" />
          {/* no words on the photo: one bronze ring with an arrow sinking down to the projects */}
          <div className="ph-cap absolute inset-x-0 bottom-[10%] flex justify-center">
            <a href="#projects" aria-label={t.statement.dive} className="grid h-16 w-16 place-items-center rounded-full border border-[var(--bronze)]/70 bg-[var(--deep)]/30 text-[var(--surface)] md:h-20 md:w-20">
              <svg className="sink" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 4v16M5 13l7 7 7-7" /></svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}