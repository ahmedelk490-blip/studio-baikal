"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import type { Dict, Lang } from "@/data/i18n";
import { Btn } from "./Btn";
import { heroVideo } from "@/data/media";
import { extras } from "@/data/extras";

// the rooms waiting behind the arches, one depth after another
const DEPTHS = ["/projects/zayed-160/02.webp", "/projects/el-nakhil-villa/07.webp"];

/* Surface — a dive through the arch. The film fills the screen and a Baikal arch stands in its middle
   with the next room seen through it. The page holds while the scroll carries the camera forward: the
   arch opens until that room is the whole screen, a second arch appears in its middle and opens onto
   the last room; the headline changes at each depth. Before any scroll the film plays and the arch
   breathes, so it is never still. */
export function Hero({ t, lang }: { t: Dict; lang: Lang }) {
  const ref = useRef<HTMLElement>(null);
  const [depth, setDepth] = useState(0);
  const alt = depth >= 1;
  useGSAP(() => {
    // the arches are centred by GSAP (xPercent), so growing them never knocks them off centre; their
    // height is measured so the window always ends above the words, whatever the screen
    gsap.set(".h-arch", { xPercent: -50 });
    const sec = ref.current!, copy = sec.querySelector<HTMLElement>(".h-copy")!;
    const fit = () => { const H = sec.clientHeight, top = H * 0.11, free = copy.getBoundingClientRect().top - sec.getBoundingClientRect().top - top - 18; gsap.set(".h-arch", { top, height: Math.max(110, Math.min(free, H * (innerWidth < 1024 ? 0.5 : 0.46))) }); };
    fit();
    const ro = new ResizeObserver(() => { fit(); ScrollTrigger.refresh(); }); ro.observe(sec); ro.observe(copy);
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
      gsap.timeline({ delay: 0.1 })
        .from(".h-film", { scale: 1.2, duration: 2.2, ease: "expo.out" }, 0)
        .from(".h-arch-0", { scale: 0.6, opacity: 0, duration: 1.6, ease: "expo.out" }, 0.3)
        .from(".h-chip", { opacity: 0, y: 12, duration: 0.8, ease: "power3.out" }, 0.4)
        .from(".h-word", { yPercent: 120, rotateX: -60, opacity: 0, duration: 1.1, ease: "power4.out", stagger: 0.07, transformOrigin: "50% 100%" }, 0.5)
        .from(".h-fade", { opacity: 0, y: 16, duration: 0.8, ease: "power3.out", stagger: 0.08 }, 1.1);
      // an arch box grows from the window in the middle to the whole screen while its room un-zooms
      const open = { width: () => sec.clientWidth, height: () => sec.clientHeight, top: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, ease: "power2.inOut", duration: 1 };
      gsap.timeline({ scrollTrigger: { trigger: ref.current, start: "top top", end: "+=180%", pin: true, scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true, onRefreshInit: fit,
        onUpdate: (st) => setDepth(st.progress < 0.42 ? 0 : st.progress < 0.85 ? 1 : 2) } })
        .to(".h-film", { scale: 1.5, opacity: 0.4, ease: "power2.in", duration: 1 }, 0)
        .to(".h-arch-0", open, 0)
        .fromTo(".h-room-0", { scale: 1.35 }, { scale: 1, ease: "power2.inOut", duration: 1 }, 0)
        .fromTo(".h-arch-1", { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, ease: "power2.out", duration: 0.35 }, 0.9)
        .to(".h-room-0", { scale: 1.4, ease: "power2.in", duration: 1 }, 1.2)
        .to(".h-arch-1", open, 1.2)
        .fromTo(".h-room-1", { scale: 1.35 }, { scale: 1, ease: "power2.inOut", duration: 1 }, 1.2);
    });
    return () => ro.disconnect();
  }, { scope: ref });

  // each word sits in its own mask; the middle span carries the swap (the inner one keeps the intro)
  const words = (s: string, show = true, away = -1, off = 0, intro = true) => s.split(" ").map((w, k) => (
    <span key={k} className="inline-block overflow-hidden px-[0.06em] -mx-[0.06em] py-[0.22em] -my-[0.22em] align-bottom">
      <span className="inline-block transition-transform duration-[900ms] ease-[cubic-bezier(.76,0,.24,1)]" style={{ transform: show ? "none" : `translateY(${away * 150}%)`, transitionDelay: `${(k + off) * 70}ms` }}>
        <span className={`${intro ? "h-word " : ""}inline-block will-change-transform`}>{w}&nbsp;</span>
      </span>
    </span>
  ));
  // an arch box anchored top-centre (clear of the words below); the room inside is always screen-sized, so the box reveals it.
  // Its radii are px in style (not Tailwind's calc(infinity) rounding), so GSAP can open them.
  const arch = (k: number) => (
    <div className={`h-arch h-arch-${k} absolute left-1/2 w-[min(42vw,260px)] overflow-hidden md:w-[min(30vw,320px)] lg:w-[min(22vw,360px)]`}
      style={{ zIndex: 2 + k, opacity: k ? 0 : undefined, borderRadius: "999px 999px 16px 16px", boxShadow: "0 0 0 2px rgba(196,154,92,.9), 0 40px 120px -30px rgba(0,0,0,.85)" }}>
      <div className="absolute left-1/2 top-1/2 h-[100svh] w-screen -translate-x-1/2 -translate-y-1/2">
        <div className={`h-room-${k} absolute inset-0`}><Image src={DEPTHS[k]} alt="" fill sizes="100vw" priority={k === 0} className="object-cover" /></div>
      </div>
    </div>
  );
  const u = "text-xs uppercase tracking-[0.2em] rtl:tracking-normal";
  return (
    <section ref={ref} data-depth={t.gauge.surface} data-meters="0 m" data-deep="1" className="relative h-[100svh] min-h-[620px] overflow-hidden bg-[#070b0d] text-[var(--surface)]">
      <div className="h-film absolute inset-0">
        {heroVideo.mp4 ? (
          <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline preload="metadata" poster={heroVideo.poster} aria-hidden>
            {heroVideo.mobile && <source src={heroVideo.mobile} type="video/mp4" media="(max-width: 767px)" />}
            {heroVideo.webm && <source src={heroVideo.webm} type="video/webm" />}
            <source src={heroVideo.mp4} type="video/mp4" />
          </video>
        ) : <Image src={heroVideo.poster} alt="" fill priority sizes="100vw" className="object-cover" />}
      </div>
      {arch(0)}
      {arch(1)}
      {/* the bronze echo breathing around the first arch's window */}
      <div className="h-arch h-arch-0 pointer-events-none absolute left-1/2 w-[min(42vw,260px)] md:w-[min(30vw,320px)] lg:w-[min(22vw,360px)]" style={{ zIndex: 2 }} aria-hidden>
        <span className="arch-breathe absolute -inset-3 rounded-b-[24px] rounded-t-full border border-[var(--bronze)]/40" />
      </div>

      <div className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-t from-[#070b0d] via-[#070b0d]/25 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-32 bg-gradient-to-b from-[#070b0d]/70 to-transparent" />

      <div className="h-copy pointer-events-none absolute inset-x-0 bottom-0 z-[6] px-5 pb-10 md:px-10 md:pb-12">
        <p className="h-chip max-md:hidden inline-flex max-w-full items-center gap-2 text-balance rounded-full border border-[var(--surface)]/25 bg-[#070b0d]/45 px-3.5 py-1.5 text-xs text-[var(--surface)]/90">
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
