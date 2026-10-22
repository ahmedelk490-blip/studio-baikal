"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { Btn } from "./Btn";
import type { Dict, Lang } from "@/data/i18n";

const srcs = ["/projects/october-250/05.webp", "/projects/el-nakhil-villa/01.webp", "/projects/tagamo3-115/04.webp"];

/* 500 m — expanding panels on desktop (the active one widens to 3x, its copy fades in, a bronze timer runs);
   phones get a pinned slide through one shape-changing window instead. */
export function Services({ t, lang }: { t: Dict; lang: Lang }) {
  const [a, setA] = useState(0);
  const [hold, setHold] = useState(false);
  const items = t.services.items;
  const sec = useRef<HTMLElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  // phones/tablets: a tap on a name scrolls the pinned slide to that service
  const take = (k: number) => { const st = tl.current?.scrollTrigger; if (st) window.scrollTo({ top: st.start + ((st.end - st.start) * k) / (items.length - 1) + 2, behavior: "smooth" }); };
  useGSAP(() => {
    // phones/tablets: the block pins under the header; scrolling slides the three rooms through one window
    // whose shape turns arch -> circle -> rounded frame, with a light parallax inside each room
    gsap.matchMedia().add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", () => {
      // three openings of one arched double door: open on a room, close, the next room waits behind,
      // open again. The name changes while the doors are shut, so the switch is never seen half-done.
      const n = items.length;
      const leaves = (deg: number) => [{ target: ".svc-leaf-l", rotationY: -deg }, { target: ".svc-leaf-r", rotationY: deg }];
      const t2 = gsap.timeline({ scrollTrigger: { trigger: ".svc-phone", start: "top 72px", end: "+=" + n * 60 + "%", pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true, onUpdate: (st) => setA(Math.min(n - 1, Math.floor(st.progress * n))) } });
      for (let k = 0; k < n; k++) {
        if (k) { t2.set(`.svc-pane-${k}`, { opacity: 1 }, k); }
        for (const l of leaves(108)) t2.to(l.target, { rotationY: l.rotationY, ease: "power2.inOut", duration: 0.45 }, k);
        if (k < n - 1) for (const l of leaves(0)) t2.to(l.target, { rotationY: 0, ease: "power2.inOut", duration: 0.2 }, k + 0.8);
      }
      t2.fromTo(".svc-par img", { objectPosition: "35% 50%" }, { objectPosition: "65% 50%", ease: "none", duration: n }, 0);
      tl.current = t2;
      return () => { tl.current = null; };
    });
    gsap.matchMedia().add("(min-width: 1024px)", () => { ScrollTrigger.create({ trigger: sec.current, start: "top top", end: "+=" + items.length * 35 + "%", pin: true, anticipatePin: 1, onUpdate: (st) => setA(Math.min(items.length - 1, Math.floor(st.progress * items.length))) }); }); 
  }, { scope: sec });
  const u = "text-xs uppercase tracking-[0.16em] rtl:tracking-normal";
  return (
    <section ref={sec} id="services" data-depth={t.gauge.services} data-meters="500 m" className="bg-[var(--surface)] text-[var(--ink)] lg:h-[100svh] lg:overflow-hidden" onMouseLeave={() => setHold(false)}>
      <div className="px-5 py-16 md:px-10 md:py-24 lg:flex lg:h-full lg:flex-col lg:justify-center lg:py-10">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7"><p className="eyebrow text-xs uppercase tracking-[0.2em] rtl:tracking-normal text-[var(--bronze)]">{t.gauge.services}</p><h2 className="display mt-3 text-4xl md:text-6xl">{t.services.title}</h2></div>
          <p className="max-w-sm text-sm text-[var(--muted)] md:col-span-5">{t.services.intro}</p>
        </div>
        {/* phones/tablets: names on top, one window the rooms slide through (its shape changes per
            service), the words under it; the 3D package room is drawn first and swept into the render */}
        <div className="svc-phone mt-8 bg-[var(--surface)] pb-2 lg:hidden">
          <div className="flex gap-2">
            {items.map((it, k) => (
              <button key={k} onClick={() => take(k)} aria-current={a === k} className={`min-h-11 flex-1 rounded-full border px-2 text-xs transition-colors duration-500 ${a === k ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--surface)]" : "border-[var(--ink)]/20 text-[var(--ink)]/70"}`}>{t.services.labels[k]}</button>
            ))}
          </div>
          {/* one Baikal arch with a walnut double door; each room waits behind it */}
          <div className="svc-win relative mx-auto mt-5 h-[44svh] max-h-[460px] w-full max-w-[420px] overflow-hidden bg-[var(--deep)]" style={{ borderRadius: "999px 999px 18px 18px", boxShadow: "0 0 0 2px rgba(196,154,92,.75)", perspective: "1100px" }}>
            {srcs.map((src, k) => (
              <div key={src} className={`svc-pane-${k} absolute inset-0`} style={k ? { opacity: 0 } : undefined}>
                <div className="svc-par absolute inset-0"><Image src={src} alt="" fill sizes="100vw" className="object-cover" /></div>
                {k === 0 && <div className="draw-sweep absolute inset-0"><Image src="/brand/drawing-october.webp" alt="" fill sizes="100vw" className="object-cover" /></div>}
              </div>
            ))}
            {(["l", "r"] as const).map((side) => (
              <div key={side} className={`svc-leaf-${side} absolute inset-y-0 w-1/2 ${side === "l" ? "left-0 origin-left" : "right-0 origin-right"}`} style={{ backfaceVisibility: "hidden", background: "repeating-linear-gradient(90deg,#6b4a2f 0 22px,#5c3e26 22px 23px),linear-gradient(180deg,rgba(255,255,255,.08),rgba(0,0,0,.25))", boxShadow: "inset 0 0 0 10px rgba(0,0,0,.12), inset 0 0 0 11px rgba(196,154,92,.35)" }} aria-hidden>
                <span className={`absolute top-1/2 h-16 w-[3px] -translate-y-1/2 rounded-full bg-[var(--bronze)] ${side === "l" ? "right-3" : "left-3"}`} />
              </div>
            ))}
          </div>
          <div key={a} className="hero-in mt-5 min-h-[11rem]">
            <span className={`${u} text-[var(--bronze)]`}>{t.services.labels[a]}</span>
            <span className="display mt-1 block text-3xl">{(items[a] as [string, string, string[]])[0]}</span>
            <span className="mt-2 block text-sm text-[var(--muted)]">{(items[a] as [string, string, string[]])[1]}</span>
          </div>
        </div>
        <div className="mt-10 hidden gap-3 lg:flex lg:h-[58vh] lg:flex-row">
          {items.map((it, k) => {
            const [title, d, list] = it as [string, string, string[]];
            const on = a === k;
            return (
              <button key={title} onMouseEnter={() => { setA(k); setHold(true); }} onClick={() => { setA(k); setHold(true); }} aria-current={on}
                className={`relative min-h-[24rem] overflow-hidden text-start text-[var(--surface)] transition-[flex-grow] duration-700 ease-[cubic-bezier(.76,0,.24,1)] lg:min-h-0 lg:basis-0 ${on ? "lg:grow-[3]" : "lg:grow"}`}>
                <Image src={srcs[k]} alt="" fill sizes="(min-width:1024px) 60vw, 100vw" className={`object-cover transition-transform duration-[1600ms] ${on ? "scale-100" : "scale-110"}`} />
                <span className="absolute inset-0 bg-gradient-to-t from-[var(--deep)]/90 via-[var(--deep)]/40 to-[var(--deep)]/55" />
                <span className="relative flex h-full flex-col justify-between p-6 md:p-8">
                  <span>
                    <span className={`${u} text-[var(--bronze)]`}>{t.services.labels[k]}</span>
                    <span className="display mt-3 block text-3xl md:text-4xl">{title}</span>
                  </span>
                  <span className={`block transition-opacity duration-500 ${on ? "opacity-100 delay-300" : "lg:opacity-0"}`}>
                    <span className="block max-w-md text-sm opacity-90">{d}</span>
                    <span className={`${u} mt-5 flex flex-wrap gap-x-4 gap-y-1 opacity-80`}>{list.map((l) => <span key={l}>{l}</span>)}</span>
                    {on && <span key={a} className="svc-progress mt-5 block h-px bg-[var(--bronze)]" aria-hidden />}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-8"><Btn href={`/${lang}#contact`} variant="dark">{t.nav.book}</Btn></div>
      </div>
    </section>
  );
}