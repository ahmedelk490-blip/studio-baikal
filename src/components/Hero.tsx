"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Dict, Lang } from "@/data/i18n";
import { Btn } from "./Btn";
import { heroVideo } from "@/data/media";
import { extras } from "@/data/extras";

/* Surface — the portal. The words stand on one side; on the other the Baikal arch is a window onto the
   film, with a thin bronze echo of it breathing around. On desktop the page holds while the arch opens
   until the film fills the screen and the words step aside; on phones the words sit above the arch.
   The film plays inside a full-screen layer clipped to the arch, so opening it is one clip-path. */
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
    const sec = ref.current!, win = sec.querySelector<HTMLElement>(".h-win")!, slot = sec.querySelector<HTMLElement>(".h-slot")!;
    // the arch as a clip on the full-screen film layer, measured from the invisible slot in the layout
    const arch = () => { const s = sec.getBoundingClientRect(), r = slot.getBoundingClientRect(), R = r.width / 2;
      return `inset(${r.top - s.top}px ${s.right - r.right}px ${s.bottom - r.bottom}px ${r.left - s.left}px round ${R}px ${R}px 18px 18px)`; };
    gsap.matchMedia().add({ desk: "(min-width: 1024px)", small: "(max-width: 1023px)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
      gsap.set(win, { clipPath: arch() });
      const fit = () => gsap.set(win, { clipPath: arch() });
      if (ctx.conditions!.reduce) { const ro = new ResizeObserver(fit); ro.observe(sec); ro.observe(slot); return () => ro.disconnect(); }
      gsap.timeline({ delay: 0.1 })
        .from(".h-film", { scale: 1.25, duration: 2.2, ease: "expo.out" }, 0)
        .from(".h-echo", { opacity: 0, scale: 0.9, duration: 1.6, ease: "expo.out" }, 0.2)
        .from(".h-word", { yPercent: 120, rotateX: -60, opacity: 0, duration: 1.1, ease: "power4.out", stagger: 0.07, transformOrigin: "50% 100%" }, 0.4)
        .from(".h-fade", { opacity: 0, y: 16, duration: 0.8, ease: "power3.out", stagger: 0.08 }, 1.1);
      // phones/tablets: no scroll opening, so re-measure whenever the layout settles or changes (fonts, images)
      if (!ctx.conditions!.desk) { const ro = new ResizeObserver(fit); ro.observe(sec); ro.observe(slot); return () => ro.disconnect(); }
      gsap.timeline({ scrollTrigger: { trigger: sec, start: "top top", end: "+=90%", pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true } })
        .fromTo(win, { clipPath: arch }, { clipPath: "inset(0px 0px 0px 0px round 0px 0px 0px 0px)", ease: "power2.inOut" }, 0)
        .to(".h-copy", { opacity: 0, x: lang === "ar" ? 90 : -90, ease: "power1.in" }, 0)
        .to(".h-echo", { opacity: 0, scale: 1.2, ease: "power1.in" }, 0);
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
    <section ref={ref} data-depth={t.gauge.surface} data-meters="0 m" data-deep="1" className="relative overflow-hidden bg-[radial-gradient(ellipse_at_70%_45%,#16232a,#0B1013_65%)] text-[var(--surface)] lg:h-[100svh]">
      {/* the film: a full-screen layer, clipped to the arch until the scroll opens it */}
      <div className="h-win absolute inset-0 z-[1] overflow-hidden" style={{ clipPath: "inset(50% 50% 50% 50%)" }} aria-hidden>
        <div className="h-film absolute inset-0">
          {heroVideo.mp4 ? (
            <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline preload="metadata" poster={heroVideo.poster}>
              {heroVideo.mobile && <source src={heroVideo.mobile} type="video/mp4" media="(max-width: 767px)" />}
              {heroVideo.webm && <source src={heroVideo.webm} type="video/webm" />}
              <source src={heroVideo.mp4} type="video/mp4" />
            </video>
          ) : <Image src={heroVideo.poster} alt="" fill priority sizes="100vw" className="object-cover" />}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--deep)]/55 via-transparent to-[var(--deep)]/25" />
      </div>

      <div className="relative grid min-h-[100svh] content-center gap-8 px-5 pb-12 pt-28 md:px-10 lg:h-full lg:grid-cols-12 lg:items-center lg:gap-10 lg:pb-10">
        <div className="h-copy relative z-[2] lg:col-span-6">
          <h1 className="display grid text-[13vw] leading-[1.02] rtl:leading-[1.3] rtl:text-[10.5vw] md:text-[8vw] md:rtl:text-[6.6vw] lg:text-[5.6vw] lg:rtl:text-[4.6vw]" style={{ perspective: "900px" }}>
            <span className="col-start-1 row-start-1">
              <span className="block">{words(t.hero.t1, !alt)}</span>
              <span className="block italic text-[var(--bronze)] rtl:not-italic">{words(t.hero.t2, !alt, -1, 2)}</span>
            </span>
            <span className="col-start-1 row-start-1 max-md:hidden" aria-hidden>
              <span className="block">{words(extras[lang].heroAlt[0], alt, 1, 0, false)}</span>
              <span className="block italic text-[var(--bronze)] rtl:not-italic">{words(extras[lang].heroAlt[1], alt, 1, 2, false)}</span>
            </span>
          </h1>
          <p className="h-fade mt-6 max-w-md text-sm leading-relaxed text-[var(--surface)]/75 max-lg:hidden">{t.hero.intro}</p>
          <div className={`h-fade mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 ${u} max-lg:hidden`}>
            <Btn href={`/${lang}#contact`}>{t.hero.cta1}</Btn>
            <Btn href={`/${lang}#projects`} variant="ghost">{t.hero.cta2}</Btn>
          </div>
        </div>

        {/* the arch's place in the layout (invisible), and its thin bronze echo */}
        <div className="relative mx-auto h-[46svh] w-full max-w-[420px] lg:col-span-5 lg:col-start-8 lg:h-[74svh] lg:max-w-none">
          <div className="h-slot absolute inset-0" />
          <div className="h-echo pointer-events-none absolute -inset-3 z-[2] md:-inset-4" aria-hidden><span className="arch-breathe absolute inset-0 rounded-b-[26px] rounded-t-full border border-[var(--bronze)]/40" /></div>
        </div>

        {/* phones/tablets: the words that sat beside the arch on desktop come under it */}
        <div className="h-fade relative z-[2] lg:hidden">
          <p className="max-w-md text-sm leading-relaxed text-[var(--surface)]/75">{t.hero.intro}</p>
          <div className={`mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 ${u}`}>
            <Btn href={`/${lang}#contact`}>{t.hero.cta1}</Btn>
            <Btn href={`/${lang}#projects`} variant="ghost">{t.hero.cta2}</Btn>
          </div>
        </div>
      </div>

      <p className={`absolute bottom-6 end-10 z-[2] hidden items-center gap-2 opacity-70 ${u} lg:flex lg:pe-20`} aria-hidden><span className="sink inline-block">&#8595;</span> {t.hero.descend}</p>
    </section>
  );
}
