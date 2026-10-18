"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Dict, Lang } from "@/data/i18n";
import { Btn } from "./Btn";
import { extras } from "@/data/extras";

// each room as the real render and as its line drawing
const ROOMS = [
  ["/projects/october-250/05.webp", "/brand/drawing-october.webp"],
  ["/projects/zayed-160/02.webp", "/brand/drawing-zayed.webp"],
  ["/projects/el-nakhil-villa/01.webp", "/brand/drawing-nakhil.webp"],
];

/* Surface, variant B — the light finds the room. The screen is the room drawn in pale lines on navy;
   a warm circle of light roams by itself (and follows the pointer or a finger) and wherever it falls
   the drawing becomes the real room. Every few seconds the next room is drawn. No WebGL: the render
   sits under a radial mask whose centre is two CSS variables. */
export function HeroLight({ t, lang }: { t: Dict; lang: Lang }) {
  const ref = useRef<HTMLElement>(null);
  const [i, setI] = useState(0);
  const alt = i % 2 === 1;
  useEffect(() => { const x = setInterval(() => setI((k) => (k + 1) % ROOMS.length), 7000); return () => clearInterval(x); }, []);
  useGSAP(() => {
    const sec = ref.current!;
    const light = { x: 0.5, y: 0.45 }, aim = { x: 0.62, y: 0.4 };
    let free = true, last = 0;
    const apply = () => { sec.style.setProperty("--lx", `${(light.x * 100).toFixed(2)}%`); sec.style.setProperty("--ly", `${(light.y * 100).toFixed(2)}%`); };
    // the light eases towards its aim; left alone it wanders between a few points in the room
    const tick = (now: number) => { light.x += (aim.x - light.x) * 0.045; light.y += (aim.y - light.y) * 0.045; apply(); if (free && now - last > 2.6) { last = now; aim.x = 0.2 + Math.random() * 0.6; aim.y = 0.25 + Math.random() * 0.45; } };
    gsap.ticker.add(tick);
    let idle = 0;
    const move = (e: PointerEvent) => { const r = sec.getBoundingClientRect(); aim.x = (e.clientX - r.left) / r.width; aim.y = (e.clientY - r.top) / r.height; free = false; clearTimeout(idle); idle = window.setTimeout(() => { free = true; }, 2500); };
    sec.addEventListener("pointermove", move); sec.addEventListener("pointerdown", move);
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
      gsap.timeline({ delay: 0.1 })
        .from(".hl-size", { "--r": "0px", duration: 2.4, ease: "expo.out" } as gsap.TweenVars, 0)
        .from(".h-chip", { opacity: 0, y: 12, duration: 0.8, ease: "power3.out" }, 0.5)
        .from(".h-word", { yPercent: 120, rotateX: -60, opacity: 0, duration: 1.1, ease: "power4.out", stagger: 0.07, transformOrigin: "50% 100%" }, 0.6)
        .from(".h-fade", { opacity: 0, y: 16, duration: 0.8, ease: "power3.out", stagger: 0.08 }, 1.2);
      gsap.to(".hl-stage", { yPercent: 14, scale: 1.06, ease: "none", scrollTrigger: { trigger: sec, start: "top top", end: "bottom top", scrub: true } });
    });
    return () => { gsap.ticker.remove(tick); sec.removeEventListener("pointermove", move); sec.removeEventListener("pointerdown", move); clearTimeout(idle); };
  }, { scope: ref });

  const words = (s: string, show = true, away = -1, off = 0, intro = true) => s.split(" ").map((w, k) => (
    <span key={k} className="inline-block overflow-hidden px-[0.06em] -mx-[0.06em] py-[0.22em] -my-[0.22em] align-bottom">
      <span className="inline-block transition-transform duration-[900ms] ease-[cubic-bezier(.76,0,.24,1)]" style={{ transform: show ? "none" : `translateY(${away * 150}%)`, transitionDelay: `${(k + off) * 70}ms` }}>
        <span className={`${intro ? "h-word " : ""}inline-block will-change-transform`}>{w}&nbsp;</span>
      </span>
    </span>
  ));
  const u = "text-xs uppercase tracking-[0.2em] rtl:tracking-normal";
  const mask = "radial-gradient(circle var(--r,min(34vw,330px)) at var(--lx,50%) var(--ly,45%), #000 0, #000 55%, transparent 100%)";
  return (
    <section ref={ref} data-depth={t.gauge.surface} data-meters="0 m" data-deep="1" className="hl-size relative h-[100svh] min-h-[620px] overflow-hidden bg-[#0B1013] text-[var(--surface)]" style={{ "--lx": "50%", "--ly": "45%" } as React.CSSProperties}>
      <div className="hl-stage absolute inset-0">
        {ROOMS.map(([real, draw], k) => (
          <div key={real} className={`absolute inset-0 transition-opacity duration-[1400ms] ${k === i ? "opacity-100" : "opacity-0"}`}>
            <Image src={draw} alt="" fill priority={k === 0} sizes="100vw" className="object-cover opacity-80" />
            {/* the real room, visible only inside the light */}
            <div className="absolute inset-0" style={{ WebkitMaskImage: mask, maskImage: mask }}>
              <Image src={real} alt={k === 0 ? t.hero.rooms[0] : ""} fill priority={k === 0} sizes="100vw" className="object-cover" />
            </div>
          </div>
        ))}
        {/* the glow of the lamp itself */}
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(circle var(--r,min(34vw,330px)) at var(--lx,50%) var(--ly,45%), rgba(255,214,160,.18), rgba(255,214,160,.05) 60%, transparent 100%)" }} />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B1013] via-[#0B1013]/30 to-transparent" />

      <div className="h-copy pointer-events-none absolute inset-x-0 bottom-0 px-5 pb-10 md:px-10 md:pb-12">
        <p className="h-chip inline-flex max-w-full items-center gap-2 text-balance rounded-full border border-[var(--surface)]/25 bg-[#0B1013]/50 px-3.5 py-1.5 text-xs text-[var(--surface)]/90">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--bronze)]" aria-hidden />{extras[lang].heroChip}
        </p>
        <div className="mt-5 grid gap-6 lg:grid-cols-12 lg:items-end">
          <h1 className="display grid text-[13vw] leading-[.98] rtl:leading-[1.3] rtl:text-[10.5vw] md:text-[9vw] md:rtl:text-[7.4vw] lg:col-span-8 lg:text-[6.6vw] lg:rtl:text-[5.6vw]" style={{ perspective: "900px" }}>
            <span className="col-start-1 row-start-1">
              <span className="block">{words(t.hero.t1, !alt)}</span>
              <span className="block italic text-[var(--bronze)] rtl:not-italic">{words(t.hero.t2, !alt, -1, 2)}</span>
            </span>
            <span className="col-start-1 row-start-1" aria-hidden>
              <span className="block">{words(extras[lang].heroAlt[0], alt, 1, 0, false)}</span>
              <span className="block italic text-[var(--bronze)] rtl:not-italic">{words(extras[lang].heroAlt[1], alt, 1, 2, false)}</span>
            </span>
          </h1>
          <div className="h-fade pointer-events-auto lg:col-span-4 lg:pb-3">
            <p className="max-w-md text-sm leading-relaxed text-[var(--surface)]/85">{t.hero.intro}</p>
            <div className={`mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 ${u}`}>
              <Btn href={`/${lang}#contact`}>{t.hero.cta1}</Btn>
              <Btn href={`/${lang}#projects`} variant="ghost">{t.hero.cta2}</Btn>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
