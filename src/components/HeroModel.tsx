"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Dict, Lang } from "@/data/i18n";
import { Btn } from "./Btn";
import { extras } from "@/data/extras";

// the finished room behind the model's door: October Home's living room
const ROOM = "/projects/october-250/04.webp";
const ROOM_NAME = { en: "October Home · 6th of October City", ar: "بيت أكتوبر · مدينة 6 أكتوبر" };
const FRAMES = 150, INTRO = 30; // rendered in Blender (scripts/hero-render): 30 opening frames, 120 for the walk

/* Surface — the scale model. A Baikal home stands as an architect's model on a dark plinth, cut open so
   every room shows, with drawing lines round it. It is path-traced offline in Blender Cycles (real bounce
   light, a warm sun through the arch, Poly Haven CC0 furniture and surfaces) and played here as frames:
   the model comes forward on its own when the page opens, then the scroll walks the camera down into the
   entrance corridor to the walnut door; the door swings open and the finished room takes over (the photo). */
export function HeroModel({ t, lang }: { t: Dict; lang: Lang }) {
  const ref = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const prog = useRef(0); // the walk through the model (0 = overview, 1 = door open), set by the scroll
  const kick = useRef(() => {});
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [intro, setIntro] = useState(true);
  const firstVisit = useRef<boolean | null>(null);

  useEffect(() => {
    const cv = canvas.current!, ctx = cv.getContext("2d")!;
    // portrait screens get the phone render (model above the words), the rest the wide one (model beside them)
    let set = innerWidth / innerHeight < 1 ? "phone" : "desk";
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const imgs: (HTMLImageElement | null)[] = Array(FRAMES).fill(null);
    let want = 0, shown = -1, introLoaded = 0, introDone = false, dead = false, raf = 0;
    const nearest = (i: number) => { for (let d = 0; d < FRAMES; d++) { if (imgs[i - d]) return i - d; if (imgs[i + d]) return i + d; } return -1; };
    const draw = (force = false) => {
      const k = nearest(want); if (k < 0 || (k === shown && !force)) return;
      const im = imgs[k]!, W = cv.width, H = cv.height, s = Math.max(W / im.naturalWidth, H / im.naturalHeight);
      const w = im.naturalWidth * s, h = im.naturalHeight * s;
      ctx.drawImage(im, (W - w) / 2, (H - h) / 2, w, h); shown = k;
    };
    const fit = () => { const d = Math.min(2, devicePixelRatio || 1); cv.width = cv.clientWidth * d; cv.height = cv.clientHeight * d; draw(true); };
    // on load the model comes forward and settles by itself (the first frames), then the scroll takes over
    const play = () => {
      if (reduce) { want = INTRO - 1; introDone = true; draw(); return; }
      const t0 = performance.now() + (firstVisit.current ? 2300 : 150);
      const step = (now: number) => {
        if (dead || introDone) return;
        const t = Math.min(1, Math.max(0, (now - t0) / 1600));
        want = Math.round(t * (INTRO - 1)); draw();
        if (t < 1) raf = requestAnimationFrame(step); else introDone = true;
      };
      raf = requestAnimationFrame(step);
    };
    kick.current = () => {
      if (!introDone && prog.current === 0) return;
      introDone = true; want = INTRO - 1 + Math.round(prog.current * (FRAMES - INTRO)); draw();
    };
    // the opening frames first, then the walk coarse to fine, so any scroll position has a frame near it
    const order: number[] = [], queued = new Set<number>();
    const push = (i: number) => { if (!queued.has(i)) { queued.add(i); order.push(i); } };
    let next = 0, count = FRAMES;
    const pump = () => {
      if (dead || next >= order.length) return;
      const i = order[next++], im = new window.Image(); im.decoding = "async";
      im.onload = () => {
        if (dead) return; imgs[i] = im;
        if (i === 0) { setReady(true); draw(true); }
        if (i < INTRO && ++introLoaded === Math.min(INTRO, count)) play();
        if (introDone) draw();
        pump();
      };
      im.onerror = () => {
        // no phone render yet: fall back to the wide one; nothing at all: the finished room photo instead
        if (i === 0) { setFailed(true); gsap.set(ref.current!.querySelector(".hm-photo"), { opacity: 1, clipPath: "none" }); }
        pump();
      };
      im.src = `/hero-frames/${set}/${String(i + 1).padStart(4, "0")}.webp`;
    };
    // the manifest says how many frames each render has (a render may still be in progress)
    fetch("/hero-frames/manifest.json").then((r) => r.json()).catch(() => ({})).then((m: Record<string, number>) => {
      if (dead) return;
      if (!m[set] && m.desk) set = "desk";
      count = Math.min(FRAMES, m[set] || 0);
      if (!count) { setFailed(true); gsap.set(ref.current!.querySelector(".hm-photo"), { opacity: 1, clipPath: "none" }); return; }
      for (let i = 0; i < Math.min(INTRO, count); i++) push(i);
      for (const st of [8, 4, 2, 1]) for (let i = INTRO; i < count; i += st) push(i);
      for (let k = 0; k < 6; k++) pump();
    });
    const ro = new ResizeObserver(fit); ro.observe(cv); fit();
    return () => { dead = true; cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  useGSAP(() => {
    const sec = ref.current!;
    if (firstVisit.current === null) {
      let seen = false;
      try { seen = sessionStorage.getItem("bk-intro") === "1"; sessionStorage.setItem("bk-intro", "1"); } catch {}
      firstVisit.current = !seen;
    }
    const first = firstVisit.current;
    gsap.matchMedia().add({ motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
      if (ctx.conditions!.reduce) { setIntro(false); return; }
      const tl = gsap.timeline({ delay: 0.15 });
      if (first) {
        // the Baikal mark and its filling line; then the mark lands on the header logo
        const mark = sec.querySelector<HTMLElement>(".hm-mark")!, dest = document.querySelector<HTMLElement>("header#top img");
        tl.to(".hm-rule", { scaleX: 1, duration: 1, ease: "power2.inOut" });
        if (dest) { const a = mark.getBoundingClientRect(), b = dest.getBoundingClientRect();
          tl.to(mark, { x: b.left + b.width / 2 - (a.left + a.width / 2), y: b.top + b.height / 2 - (a.top + a.height / 2), scale: b.width / a.width, duration: 0.95, ease: "power3.inOut" }, "+=0.15"); }
        tl.to(".hm-rule", { opacity: 0, duration: 0.35 }, "<").to(".hm-veil", { opacity: 0, duration: 0.6 }, "-=0.35").set(".hm-intro", { display: "none" });
      } else gsap.set(".hm-intro", { display: "none" });
      tl.fromTo(".hm-rise", { y: 60, scale: 0.92 }, { y: 0, scale: 1, duration: 1.6, ease: "power3.out" }, first ? "-=0.5" : 0)
        .from(".h-word", { yPercent: 120, opacity: 0, duration: 1.1, ease: "power4.out", stagger: 0.07 }, "-=1.3")
        .from(".h-fade", { opacity: 0, y: 16, duration: 0.8, ease: "power3.out", stagger: 0.08 }, "-=0.7")
        .call(() => setIntro(false));
      // the walk: the page holds while the camera goes in; the finished room takes over when the door opens
      const dive = { p: 0 }, door = innerWidth < 768 ? "inset(20% 28% 16% 28%)" : "inset(18% 38% 16% 38%)";
      gsap.timeline({ scrollTrigger: { trigger: sec, start: "top top", end: "+=190%", pin: true, scrub: 0.8, anticipatePin: 1 } })
        .to(dive, { p: 1, ease: "none", duration: 0.86, onUpdate: () => { prog.current = dive.p; kick.current(); } }, 0)
        .to(".hm-bar", { scaleY: 1, ease: "none", duration: 1 }, 0)
        .to(".hm-copy", { opacity: 0, y: -40, duration: 0.2, ease: "power1.in" }, 0.04)
        // the room opens out of the doorway (the door's place on screen at that moment) to the full screen
        .fromTo(".hm-photo", { opacity: 0, clipPath: door }, { opacity: 1, duration: 0.03 }, 0.8)
        .to(".hm-photo", { clipPath: "inset(0% 0% 0% 0%)", duration: 0.14, ease: "power2.inOut" }, 0.81)
        .fromTo(".hm-photo img", { scale: 1.25 }, { scale: 1, duration: 0.15, ease: "power2.out" }, 0.8)
        .fromTo(".hm-after > *", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.1, stagger: 0.03 }, 0.88);
    });
  }, { scope: ref });

  const words = (s: string) => s.split(" ").map((w, k) => (
    <span key={k} className="inline-block overflow-hidden px-[0.06em] -mx-[0.06em] py-[0.22em] -my-[0.22em] align-bottom">
      <span className="h-word inline-block">{w}&nbsp;</span>
    </span>
  ));
  const x = extras[lang];
  const u = "text-xs uppercase tracking-[0.2em] rtl:tracking-normal";
  return (
    <section ref={ref} data-depth={t.gauge.surface} data-meters="0 m" data-deep="1" className="relative h-[100svh] min-h-[620px] overflow-hidden bg-[radial-gradient(ellipse_at_62%_42%,#1d2a30,#0B1013_70%)] text-[var(--surface)]">
      {/* the model; without WebGL the finished room shows instead */}
      <div className="hm-rise absolute inset-0">
        <canvas ref={canvas} className={`absolute inset-0 block h-full w-full transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`} aria-hidden />
      </div>
      <div className="hm-photo absolute inset-0 opacity-0" style={failed ? { opacity: 1 } : undefined}>
        <Image src={ROOM} alt={ROOM_NAME[lang]} fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1013]/85 via-[#0B1013]/10 via-40% to-transparent" />
      </div>

      {/* the opening words beside the model; they lift away as the camera goes in */}
      <div className="hm-copy pointer-events-none absolute inset-x-0 bottom-0 px-5 pb-10 md:px-10 md:pb-12 lg:inset-y-0 lg:flex lg:w-[46%] lg:flex-col lg:justify-center lg:pb-0">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1013] via-[#0B1013]/75 to-transparent lg:hidden" aria-hidden />
        <div className="relative">
          <h1 className="display text-[12vw] leading-[.98] rtl:leading-[1.3] rtl:text-[10vw] md:text-[8vw] md:rtl:text-[7vw] lg:text-[5vw] lg:rtl:text-[4.4vw]">
            <span className="block">{words(t.hero.t1)}</span>
            <span className="block italic text-[var(--bronze)] rtl:not-italic">{words(t.hero.t2)}</span>
          </h1>
          <p className="h-fade mt-5 max-w-md text-sm leading-relaxed text-[var(--surface)]/80">{t.hero.intro}</p>
          <div className={`h-fade pointer-events-auto mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 ${u}`}>
            <Btn href={`/${lang}#contact`}>{t.hero.cta1}</Btn>
            <Btn href={`/${lang}#projects`} variant="ghost">{t.hero.cta2}</Btn>
          </div>
          <p className={`h-fade mt-10 flex items-center gap-3 text-[var(--surface)]/60 max-lg:hidden ${u}`}>
            <span className="block h-8 w-px bg-gradient-to-b from-[var(--bronze)] to-transparent" aria-hidden />{x.enter}
          </p>
        </div>
      </div>

      {/* how far in: a hairline on the far side that fills as the camera walks */}
      <div className="pointer-events-none absolute end-6 top-1/2 h-40 w-px -translate-y-1/2 bg-[var(--surface)]/15 max-md:hidden" aria-hidden>
        <div className="hm-bar h-full w-full origin-top scale-y-0 bg-[var(--bronze)]" />
      </div>

      {/* through the door: the finished room and the studio's promise */}
      <div className="hm-after pointer-events-none absolute inset-x-0 bottom-0 px-5 pb-10 [text-shadow:0_2px_18px_rgba(11,16,19,.9)] md:px-10 md:pb-14">
        <p className={`${u} text-[var(--bronze)] opacity-0`}>{ROOM_NAME[lang]}</p>
        <p className="display mt-3 max-w-4xl text-[10vw] leading-[1.02] opacity-0 rtl:leading-[1.3] md:text-[6vw] lg:text-[4.6vw]">
          {x.heroAlt[0]} <span className="italic text-[var(--bronze)] rtl:not-italic">{x.heroAlt[1]}</span>
        </p>
      </div>

      {intro && (
        <div className="hm-intro fixed inset-0 z-[70]" aria-hidden>
          <div className="hm-veil absolute inset-0 bg-[#0B1013]" />
          <div className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2">
            <div className="hm-mark bg-[var(--surface)] p-2"><Image src="/brand/logo.png" alt="" width={120} height={120} priority className="h-24 w-24 md:h-28 md:w-28" /></div>
            <div className="hm-rule mx-auto mt-6 h-px w-[min(56vw,240px)] origin-left scale-x-0 bg-[var(--bronze)] rtl:origin-right" />
          </div>
        </div>
      )}
    </section>
  );
}
