"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Dict, Lang } from "@/data/i18n";
import { Btn } from "./Btn";
import { extras } from "@/data/extras";

const ROOM = "/projects/el-nakhil-villa/01.webp";

/* Surface — the scale model. A Baikal home stands as an architect's rendered model on a travertine
   plinth (hero-scene.ts: real CC0 furniture, PBR surfaces, studio light and ambient occlusion), cut open
   so every room shows, with drawing lines round it, and turns gently. Scrolling dives the camera into the
   entrance corridor (travertine and walnut, a line of light) and walks it to the walnut door; the door
   swings open and the finished room takes over (the photo). The scene draws only while it moves. */
export function HeroModel({ t, lang }: { t: Dict; lang: Lang }) {
  const ref = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const prog = useRef(0); // the walk through the model (0 = overview, 1 = door open), set by the scroll
  const kick = useRef(() => {});
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [intro, setIntro] = useState(true);
  const firstVisit = useRef<boolean | null>(null);

  useEffect(() => {
    const el = stage.current!;
    let stop = () => {}, dead = false;
    (async () => {
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      let sc: Awaited<ReturnType<typeof import("./hero-scene").buildScene>>;
      try { const { buildScene } = await import("./hero-scene"); sc = await buildScene(el, { lang, phone: innerWidth < 768, reduce }); }
      catch { setFailed(true); return; }
      if (dead) { sc.dispose(); return; }
      let visible = true, raf = 0;
      // turn while the overview shows; once the camera is in, draw only when the scroll moves it
      const loop = () => { sc.draw(); raf = visible && !reduce && sc.get() < 0.3 ? requestAnimationFrame(loop) : 0; };
      kick.current = () => { sc.set(prog.current); if (raf) return; if (visible && !reduce && prog.current < 0.3) loop(); else if (visible) sc.draw(); };
      const seen = new IntersectionObserver(([x]) => { visible = x.isIntersecting; if (visible) kick.current(); });
      seen.observe(el);
      const ro = new ResizeObserver(() => { sc.fit(); sc.draw(); }); ro.observe(el);
      sc.set(prog.current); sc.draw(); setReady(true); el.dataset.ready = "1"; if (!reduce) loop();
      stop = () => { cancelAnimationFrame(raf); seen.disconnect(); ro.disconnect(); sc.dispose(); };
    })();
    return () => { dead = true; stop(); };
  }, [lang]);

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
        <div ref={stage} className={`absolute inset-0 transition-opacity duration-1000 [&>canvas]:block [&>canvas]:h-full [&>canvas]:w-full ${ready ? "opacity-100" : "opacity-0"}`} aria-hidden />
      </div>
      <div className="hm-photo absolute inset-0 opacity-0" style={failed ? { opacity: 1 } : undefined}>
        <Image src={ROOM} alt={x.grow.eyebrow} fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1013] via-[#0B1013]/30 to-transparent" />
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
      <div className="hm-after pointer-events-none absolute inset-x-0 bottom-0 px-5 pb-10 md:px-10 md:pb-14">
        <p className={`${u} text-[var(--bronze)] opacity-0`}>{x.grow.eyebrow}</p>
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
