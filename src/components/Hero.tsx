"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Dict, Lang } from "@/data/i18n";
import { Btn } from "./Btn";
import { heroVideo } from "@/data/media";
import { extras } from "@/data/extras";
import { LakeSurface } from "./LakeSurface";

/* Surface — one rounded panel, set in from the edges, with the film playing under the lake's surface
   (rings from the pointer, a finger, or on their own) and the words centred over a soft dark falloff: a small pill, the headline, one line and two pill actions. The panel
   settles in on load and sinks back a little as the page moves on; the next section shows under it. */
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
        .from(".h-panel", { scale: 0.94, borderRadius: 48, duration: 1.6, ease: "expo.out" }, 0)
        .from(".h-film", { scale: 1.2, duration: 2.2, ease: "expo.out" }, 0)
        .from(".h-chip", { opacity: 0, y: 12, duration: 0.8, ease: "power3.out" }, 0.3)
        .from(".h-word", { yPercent: 120, rotateX: -60, opacity: 0, duration: 1.1, ease: "power4.out", stagger: 0.07, transformOrigin: "50% 100%" }, 0.45)
        .from(".h-fade", { opacity: 0, y: 16, duration: 0.8, ease: "power3.out", stagger: 0.08 }, 1.1);
      gsap.to(".h-panel", { scale: 0.92, opacity: 0.55, ease: "none", scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom top", scrub: true } });
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
    <section ref={ref} data-depth={t.gauge.surface} data-meters="0 m" data-deep="1" className="relative bg-[var(--deep)] px-2.5 pb-2.5 pt-[72px] text-[var(--surface)] md:px-4 md:pb-4 md:pt-[84px]">
      <div className="h-panel relative h-[calc(100svh-96px)] min-h-[540px] overflow-hidden rounded-[28px] border border-[var(--surface)]/10 bg-[#0d1418] shadow-[inset_0_1px_0_rgba(255,255,255,.07)] md:h-[calc(92svh-84px)] md:max-h-[940px]">
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
        {/* soft dark falloff so the centred words read on any frame of the film */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_50%_52%,rgba(11,16,19,.72),rgba(11,16,19,.25)_70%,rgba(11,16,19,.55))]" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0b1013]/80 to-transparent" />

        <div className="h-copy relative grid h-full place-items-center px-5 text-center">
          <div className="w-full min-w-0">
            <p className="h-chip mx-auto inline-flex max-w-full items-center gap-2 text-balance rounded-full border border-[var(--surface)]/20 bg-[#0b1013]/40 px-3.5 py-1.5 text-xs text-[var(--surface)]/85">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--bronze)]" aria-hidden />{extras[lang].heroChip}
            </p>
            <h1 className="display mx-auto mt-6 grid max-w-[16ch] text-[12.5vw] leading-[1.02] rtl:leading-[1.3] rtl:text-[10vw] md:text-[7vw] md:rtl:text-[6vw] lg:text-[5.6vw] lg:rtl:text-[4.8vw]" style={{ perspective: "900px" }}>
              <span className="col-start-1 row-start-1">
                <span className="block">{words(t.hero.t1, !alt)}</span>
                <span className="block italic text-[var(--bronze)] rtl:not-italic">{words(t.hero.t2, !alt, -1, 2)}</span>
              </span>
              <span className="col-start-1 row-start-1 max-md:hidden" aria-hidden>
                <span className="block">{words(extras[lang].heroAlt[0], alt, 1, 0, false)}</span>
                <span className="block italic text-[var(--bronze)] rtl:not-italic">{words(extras[lang].heroAlt[1], alt, 1, 2, false)}</span>
              </span>
            </h1>
            <p className="h-fade mx-auto mt-6 max-w-xl text-sm leading-relaxed text-[var(--surface)]/80 md:text-base">{t.hero.intro}</p>
            <div className={`h-fade mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 ${u}`}>
              <Btn href={`/${lang}#contact`}>{t.hero.cta1}</Btn>
              <Btn href={`/${lang}#projects`} variant="ghost">{t.hero.cta2}</Btn>
            </div>
          </div>
        </div>

        <p className={`absolute inset-x-0 bottom-5 hidden items-center justify-center gap-2 opacity-70 ${u} md:flex`} aria-hidden><span className="sink inline-block">&#8595;</span> {t.hero.descend}</p>
      </div>
    </section>
  );
}
