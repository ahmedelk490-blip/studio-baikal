"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Dict, Lang } from "@/data/i18n";
import { Btn } from "./Btn";
import { heroVideo } from "@/data/media";
import { extras } from "@/data/extras";
import { LakeSurface } from "./LakeSurface";

/* Surface — full screen. The film surfaces from dark water under the lake's moving surface (rings from
   the pointer, a finger, or on their own; light playing through the water), and the words stand large
   on the dark band along the bottom: a small pill, the headline, then one line and two pill actions. */
export function Hero({ t, lang }: { t: Dict; lang: Lang }) {
  const ref = useRef<HTMLElement>(null);
  // tablet/desktop: the headline hands over to the second line while the film is on its second room
  const [alt, setAlt] = useState(false);
  useEffect(() => {
    if (!matchMedia("(min-width: 768px) and (prefers-reduced-motion: no-preference)").matches) return;
    const v = ref.current?.querySelector("video");
    if (v) { const on = () => setAlt(v.currentTime >= 4.8 && v.currentTime < 9.4); v.addEventListener("timeupdate", on); return () => v.removeEventListener("timeupdate", on); }
    const id = setInterval(() => setAlt((a) => !a), 5000);
    return () => clearInterval(id);
  }, []);
  useGSAP(() => {
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
      gsap.timeline({ delay: 0.1 })
        .from(".h-film", { scale: 1.2, duration: 2.2, ease: "expo.out" }, 0)
        .from(".h-chip", { opacity: 0, y: 12, duration: 0.8, ease: "power3.out" }, 0.3)
        .from(".h-word", { yPercent: 120, rotateX: -60, opacity: 0, duration: 1.1, ease: "power4.out", stagger: 0.07, transformOrigin: "50% 100%" }, 0.45)
        .from(".h-fade", { opacity: 0, y: 16, duration: 0.8, ease: "power3.out", stagger: 0.08 }, 1.1);
      gsap.to(".h-film", { yPercent: 14, scale: 1.08, ease: "none", scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom top", scrub: true } });
      gsap.to(".h-copy", { y: -60, opacity: 0, ease: "none", scrollTrigger: { trigger: ref.current, start: "25% top", end: "75% top", scrub: true } });
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
    <section ref={ref} data-depth={t.gauge.surface} data-meters="0 m" data-deep="1" className="relative h-[100svh] min-h-[620px] overflow-hidden bg-[#070b0d] text-[var(--surface)]">
      <div className="h-panel absolute inset-0">
        <div className="h-film absolute inset-0">
          {heroVideo.mp4 ? (
            <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline preload="metadata" poster={heroVideo.poster} aria-hidden>
              {heroVideo.mobile && <source src={heroVideo.mobile} type="video/mp4" media="(max-width: 767px)" />}
              {heroVideo.webm && <source src={heroVideo.webm} type="video/webm" />}
              <source src={heroVideo.mp4} type="video/mp4" />
            </video>
          ) : <Image src={heroVideo.poster} alt="" fill priority sizes="100vw" className="object-cover" />}
          {/* the lake: the film seen through its moving surface */}
          {heroVideo.mp4 && <LakeSurface />}
        </div>
        {/* dark only where the words stand (the bottom band), so the room stays bright above */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#070b0d] via-[#070b0d]/45 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#070b0d]/70 to-transparent" />

        <div className="h-copy pointer-events-none absolute inset-x-0 bottom-0 px-5 pb-10 md:px-10 md:pb-12">
          <p className="h-chip inline-flex max-w-full items-center gap-2 text-balance rounded-full border border-[var(--surface)]/25 bg-[#070b0d]/45 px-3.5 py-1.5 text-xs text-[var(--surface)]/90">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--bronze)]" aria-hidden />{extras[lang].heroChip}
          </p>
          <div className="mt-5 grid gap-6 lg:grid-cols-12 lg:items-end">
            <h1 className="display grid text-[14vw] leading-[.98] rtl:leading-[1.3] rtl:text-[11vw] md:text-[10vw] md:rtl:text-[8vw] lg:col-span-8 lg:text-[7.6vw] lg:rtl:text-[6.2vw]" style={{ perspective: "900px" }}>
              <span className="col-start-1 row-start-1">
                <span className="block">{words(t.hero.t1, !alt)}</span>
                <span className="block italic text-[var(--bronze)] rtl:not-italic">{words(t.hero.t2, !alt, -1, 2)}</span>
              </span>
              <span className="col-start-1 row-start-1 max-md:hidden" aria-hidden>
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
      </div>
    </section>
  );
}
