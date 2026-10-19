"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Dict, Lang } from "@/data/i18n";
import { Btn } from "./Btn";
import { heroVideo } from "@/data/media";
import { extras } from "@/data/extras";

/* Surface — the opening, played once on its own. First visit: the Baikal mark sits on the navy with a
   bronze line filling under it; the mark flies into its place in the header while the line stands up
   into a column of light. Then (every visit) the column rises and widens into a Baikal arch window onto
   the film, the words rise, and the window opens until the film fills the screen. */
export function HeroBeam({ t, lang }: { t: Dict; lang: Lang }) {
  const ref = useRef<HTMLElement>(null);
  const [intro, setIntro] = useState(true); // the mark + line veil, first visit of the tab only
  const firstVisit = useRef<boolean | null>(null); // decided once, so a dev double-run keeps the answer
  // tablet/desktop: the headline hands over to the second line while the film is on its second room
  const [alt, setAlt] = useState(false);
  useEffect(() => {
    if (!matchMedia("(min-width: 768px) and (prefers-reduced-motion: no-preference)").matches) return;
    const v = ref.current?.querySelector("video");
    if (!v) return;
    const on = () => setAlt(v.currentTime >= 4.8 && v.currentTime < 9.4);
    v.addEventListener("timeupdate", on);
    return () => v.removeEventListener("timeupdate", on);
  }, []);
  useGSAP(() => {
    const sec = ref.current!, win = sec.querySelector<HTMLElement>(".hb-win")!;
    if (firstVisit.current === null) {
      let seen = false;
      try { seen = sessionStorage.getItem("bk-intro") === "1"; sessionStorage.setItem("bk-intro", "1"); } catch {}
      firstVisit.current = !seen;
    }
    const first = firstVisit.current;
    gsap.set(win, { xPercent: -50 });
    const narrow = innerWidth < 768 ? "62vw" : "min(30vw, 380px)";
    gsap.matchMedia().add({ motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
      if (ctx.conditions!.reduce) { gsap.set(win, { width: "100%", height: "100%", borderRadius: 0 }); setIntro(false); return; }
      const tl = gsap.timeline({ delay: 0.15 });
      if (first) {
        // the mark and its filling line; then the mark lands on the header logo
        const mark = sec.querySelector<HTMLElement>(".hb-mark")!, dest = document.querySelector<HTMLElement>("header#top img");
        tl.to(".hb-rule", { scaleX: 1, duration: 1, ease: "power2.inOut" });
        if (dest) { const a = mark.getBoundingClientRect(), b = dest.getBoundingClientRect();
          tl.to(mark, { x: b.left + b.width / 2 - (a.left + a.width / 2), y: b.top + b.height / 2 - (a.top + a.height / 2), scale: b.width / a.width, duration: 0.95, ease: "power3.inOut" }, "+=0.15"); }
        tl.to(".hb-rule", { opacity: 0, duration: 0.35 }, "<")
          .to(".hb-veil", { opacity: 0, duration: 0.6, ease: "power1.out" }, "-=0.35")
          .set(".hb-intro", { display: "none" });
      } else { gsap.set(".hb-intro", { display: "none" }); }
      // the column of light stands up, rises into an arched window, widens, then opens to the full screen
      tl.fromTo(".hb-glow", { scaleY: 0, opacity: 0 }, { scaleY: 1, opacity: 1, duration: 0.8, ease: "power2.out" }, first ? "-=0.5" : 0)
        .to(win, { height: "100%", duration: 1, ease: "power3.inOut" }, "-=0.3")
        .to(win, { width: narrow, duration: 0.9, ease: "power3.inOut" })
        .to(".hb-glow", { opacity: 0, duration: 0.5 }, "<")
        .from(".h-word", { yPercent: 120, rotateX: -60, opacity: 0, duration: 1.1, ease: "power4.out", stagger: 0.07, transformOrigin: "50% 100%" }, "-=0.4")
        .from(".h-fade", { opacity: 0, y: 16, duration: 0.8, ease: "power3.out", stagger: 0.08 }, "-=0.6")
        .to(win, { width: "100%", borderTopLeftRadius: 0, borderTopRightRadius: 0, boxShadow: "0 0 0 0 rgba(196,154,92,0)", duration: 1.6, ease: "power3.inOut" }, "+=0.9")
        .call(() => setIntro(false));
      gsap.to(".hb-film", { yPercent: 12, scale: 1.06, ease: "none", scrollTrigger: { trigger: sec, start: "top top", end: "bottom top", scrub: true } });
    });
  }, { scope: ref });

  const words = (s: string, show = true, away = -1, off = 0, rise = true) => s.split(" ").map((w, k) => (
    <span key={k} className="inline-block overflow-hidden px-[0.06em] -mx-[0.06em] py-[0.22em] -my-[0.22em] align-bottom">
      <span className="inline-block transition-transform duration-[900ms] ease-[cubic-bezier(.76,0,.24,1)]" style={{ transform: show ? "none" : `translateY(${away * 150}%)`, transitionDelay: `${(k + off) * 70}ms` }}>
        <span className={`${rise ? "h-word " : ""}inline-block will-change-transform`}>{w}&nbsp;</span>
      </span>
    </span>
  ));
  const u = "text-xs uppercase tracking-[0.2em] rtl:tracking-normal";
  return (
    <section ref={ref} data-depth={t.gauge.surface} data-meters="0 m" data-deep="1" className="relative h-[100svh] min-h-[620px] overflow-hidden bg-[#0B1013] text-[var(--surface)]">
      {/* the window onto the film: a 2px column at first, an arch, then the whole screen */}
      <div className="hb-win absolute bottom-0 left-1/2 h-0 w-[2px] overflow-hidden" style={{ borderRadius: "999px 999px 0 0", boxShadow: "0 0 0 1.5px rgba(196,154,92,.8), 0 0 140px 30px rgba(220,170,100,.22)" }}>
        <div className="hb-film absolute bottom-0 left-1/2 h-[100svh] min-h-[620px] w-screen -translate-x-1/2">
          {heroVideo.mp4 ? (
            <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline preload="auto" poster={heroVideo.poster} aria-hidden>
              {heroVideo.mobile && <source src={heroVideo.mobile} type="video/mp4" media="(max-width: 767px)" />}
              <source src={heroVideo.mp4} type="video/mp4" />
            </video>
          ) : <Image src={heroVideo.poster} alt="" fill priority sizes="100vw" className="object-cover" />}
        </div>
      </div>
      <div className="hb-glow pointer-events-none absolute bottom-0 left-1/2 h-full w-[2px] origin-bottom -translate-x-1/2 bg-gradient-to-t from-transparent via-[#f0c88c] to-transparent opacity-0" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B1013] via-[#0B1013]/20 to-transparent" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 px-5 pb-10 md:px-10 md:pb-12">
        <p className="h-fade inline-flex max-w-full items-center gap-2 text-balance rounded-full border border-[var(--surface)]/25 bg-[#0B1013]/50 px-3.5 py-1.5 text-xs text-[var(--surface)]/90 max-md:hidden">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--bronze)]" aria-hidden />{extras[lang].heroChip}
        </p>
        <div className="mt-5 grid gap-6 lg:grid-cols-12 lg:items-end">
          <h1 className="display grid text-[13vw] leading-[.98] rtl:leading-[1.3] rtl:text-[10.5vw] md:text-[9vw] md:rtl:text-[7.4vw] lg:col-span-8 lg:text-[6.6vw] lg:rtl:text-[5.6vw]" style={{ perspective: "900px" }}>
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

      {/* first visit only: the mark and its line on a navy veil over everything (the header too) */}
      {intro && (
        <div className="hb-intro fixed inset-0 z-[70]" aria-hidden>
          <div className="hb-veil absolute inset-0 bg-[#0B1013]" />
          <div className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2">
            <div className="hb-mark bg-[var(--surface)] p-2"><Image src="/brand/logo.png" alt="" width={120} height={120} priority className="h-24 w-24 md:h-28 md:w-28" /></div>
            <div className="hb-rule mx-auto mt-6 h-px w-[min(56vw,240px)] origin-left scale-x-0 bg-[var(--bronze)] rtl:origin-right" />
          </div>
        </div>
      )}
    </section>
  );
}
