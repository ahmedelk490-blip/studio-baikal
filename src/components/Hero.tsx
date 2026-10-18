"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Dict, Lang } from "@/data/i18n";
import { Btn } from "./Btn";
import { heroVideo } from "@/data/media";
import { extras } from "@/data/extras";

const srcs = ["/projects/october-250/01.webp", "/projects/el-nakhil-villa/01.webp", "/projects/maadi-285/01.webp", "/projects/maadi-180/05.webp"];
const EVERY = 4200;
const bubbles = Array.from({ length: 14 }, (_, k) => ({ x: (k * 67) % 100, d: 9 + (k % 5) * 2.2, s: 3 + (k % 3) * 2, delay: (k * 1.37) % 9 }));

/* Surface, full screen: a self-changing room under moving light, the headline rising word by word
   on the waterline, and a live depth HUD that slides when the room changes. */
export function Hero({ t, lang }: { t: Dict; lang: Lang }) {
  const ref = useRef<HTMLElement>(null);
  const [i, setI] = useState(0);
  // tablet/desktop: the headline hands over to the brand line while the film is on its second room
  const [alt, setAlt] = useState(false);
  useEffect(() => {
    if (!matchMedia("(min-width: 768px) and (prefers-reduced-motion: no-preference)").matches) return;
    const v = ref.current?.querySelector("video");
    if (v) { const on = () => setAlt(v.currentTime >= 4.8 && v.currentTime < 9.4); v.addEventListener("timeupdate", on); return () => v.removeEventListener("timeupdate", on); }
    const id = setInterval(() => setAlt((a) => !a), 5000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => { const x = setInterval(() => setI((k) => (k + 1) % srcs.length), EVERY); return () => clearInterval(x); }, []);
  useGSAP(() => {
    gsap.timeline({ delay: 0.1 })
      .from(".h-stage", { scale: 1.25, duration: 2.2, ease: "expo.out" }, 0)
      .from(".h-veil", { opacity: 1, duration: 1.6, ease: "power2.out" }, 0.2)
      .from(".h-word", { yPercent: 120, rotateX: -60, opacity: 0, duration: 1.1, ease: "power4.out", stagger: 0.07, transformOrigin: "50% 100%" }, 0.6)
      .from(".h-fade", { opacity: 0, y: 16, duration: 0.8, ease: "power3.out", stagger: 0.08 }, 1.3)
      .from(".h-hud > *", { opacity: 0, x: 20, duration: 0.7, ease: "power3.out", stagger: 0.06 }, 1.4);
    gsap.to(".h-stage", { yPercent: 16, ease: "none", scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom top", scrub: true } });
    gsap.to(".h-copy", { yPercent: -10, opacity: 0.2, ease: "none", scrollTrigger: { trigger: ref.current, start: "40% top", end: "bottom top", scrub: true } });
    gsap.matchMedia().add("(pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const x = gsap.quickTo(".h-stage", "x", { duration: 1.6, ease: "power3.out" });
      const y = gsap.quickTo(".h-stage", "y", { duration: 1.6, ease: "power3.out" });
      const move = (e: MouseEvent) => { x((e.clientX / innerWidth - 0.5) * -30); y((e.clientY / innerHeight - 0.5) * -16); };
      addEventListener("mousemove", move);
      return () => removeEventListener("mousemove", move);
    });
  }, { scope: ref });

  // each word sits in its own mask; the middle span carries the swap (the inner one keeps the intro)
  const words = (s: string, show = true, away = -1, off = 0, intro = true) => s.split(" ").map((w, k) => (
    <span key={k} className="inline-block overflow-hidden px-[0.06em] -mx-[0.06em] py-[0.22em] -my-[0.22em] align-bottom">
      <span className="inline-block transition-transform duration-[900ms] ease-[cubic-bezier(.76,0,.24,1)]" style={{ transform: show ? "none" : `translateY(${away * 150}%)`, transitionDelay: `${(k + off) * 70}ms` }}>
        <span className={`${intro ? "h-word " : ""}inline-block will-change-transform`}>{w}&nbsp;</span>
      </span>
    </span>
  ));
  const u = "text-xs uppercase tracking-[0.2em] rtl:tracking-normal";
  return (
    <section ref={ref} data-depth={t.gauge.surface} data-meters="0 m" data-deep="1" className="relative min-h-[100svh] overflow-hidden bg-[var(--deep)] text-[var(--surface)]">
      <div className="h-stage absolute -inset-[6%]">
        {heroVideo.mp4 ? (
          <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline preload="metadata" poster={heroVideo.poster} aria-hidden>
            {heroVideo.mobile && <source src={heroVideo.mobile} type="video/mp4" media="(max-width: 767px)" />}
            {heroVideo.webm && <source src={heroVideo.webm} type="video/webm" />}
            <source src={heroVideo.mp4} type="video/mp4" />
          </video>
        ) : srcs.map((s, k) => <Image key={s} src={s} alt={t.hero.rooms[k]} fill priority={k === 0} sizes="100vw" className={`object-cover transition-opacity duration-[1600ms] ease-out ${k === i ? "ken opacity-100" : "opacity-0"}`} />)}
      </div>
      <div className="caustic caustic-a" aria-hidden /><div className="caustic caustic-b" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--deep)] via-[var(--deep)]/35 to-[var(--deep)]/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--deep)]/70 via-transparent to-transparent rtl:bg-gradient-to-l" />
      <div className="h-veil pointer-events-none absolute inset-0 bg-[var(--deep)] opacity-0" />
      <ul className="bubbles pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {bubbles.map((b, k) => <li key={k} style={{ left: `${b.x}%`, width: b.s, height: b.s, animationDuration: `${b.d}s`, animationDelay: `-${b.delay}s` }} />)}
      </ul>

      <div className="h-copy relative flex min-h-[100svh] flex-col justify-end px-5 pb-28 pt-28 md:px-10 md:pb-24">
        <h1 className="display mt-5 grid max-w-[14ch] text-[14vw] leading-[1.02] rtl:leading-[1.3] rtl:text-[11vw] md:text-[8vw] lg:text-[7vw] md:rtl:text-[6.4vw] lg:rtl:text-[5.4vw] md:max-w-[19ch]" style={{ perspective: "900px" }}>
          <span className="col-start-1 row-start-1">
            <span className="block">{words(t.hero.t1, !alt)}</span>
            <span className="block italic text-[var(--bronze)] lg:ps-[8vw]">{words(t.hero.t2, !alt, -1, 2)}</span>
          </span>
          <span className="col-start-1 row-start-1 max-md:hidden" aria-hidden>
            <span className="block">{words(extras[lang].heroAlt[0], alt, 1, 0, false)}</span>
            <span className="block italic text-[var(--bronze)] lg:ps-[8vw]">{words(extras[lang].heroAlt[1], alt, 1, 2, false)}</span>
          </span>
        </h1>
        <div className="mt-6 grid gap-6 md:grid-cols-12 md:items-end">
          <p className="h-fade max-w-md text-sm leading-relaxed text-[var(--surface)]/80 md:col-span-6">{t.hero.intro}</p>
          <div className={`h-fade flex flex-wrap items-center gap-x-6 gap-y-3 ${u} md:col-span-6 md:justify-end`}>
            <Btn href={`/${lang}#contact`}>{t.hero.cta1}</Btn>
            <Btn href={`/${lang}#projects`} variant="ghost">{t.hero.cta2}</Btn>
          </div>
        </div>
      </div>

      {/* live depth HUD */}
      <div className="h-hud pointer-events-none absolute end-6 top-1/2 hidden -translate-y-1/2 flex-col items-end gap-3 text-end lg:flex" aria-hidden>
        <span className={`${u} text-[var(--surface)]/60`}>Lake Baikal · 53°N 108°E</span>
        <span className="relative block h-48 w-px bg-[var(--surface)]/30">
          {[0, 1, 2, 3].map((k) => <span key={k} className="absolute end-0 h-px w-3 bg-[var(--surface)]/50" style={{ top: `${(k / 3) * 100}%` }} />)}
          <span className="absolute end-0 h-2 w-2 translate-x-1/2 rounded-full bg-[var(--bronze)] transition-[top] duration-700 ease-out" style={{ top: `${(i / 3) * 100}%`, transform: "translate(50%,-50%)" }} />
        </span>
        <span className={`${u} text-[var(--bronze)]`}>{i * 4} m</span>
      </div>

      {/* the film names no room, so only the descend cue sits on the bottom edge */}
      <p className={`absolute inset-x-5 bottom-6 hidden items-center justify-end gap-2 opacity-70 ${u} md:inset-x-10 md:flex md:pe-20`} aria-hidden><span className="sink inline-block">&#8595;</span> {t.hero.descend}</p>
    </section>
  );
}