"use client";
import { useEffect, useRef, useState } from "react";
import type { Extras } from "@/data/extras";

/* Built in layers: one wall section as five real 3D slabs (CSS 3D, no WebGL). It plays by itself
   while on screen: the slabs sit stacked, lift apart, then each layer rises and lights in turn while
   its name leads the list beside it; then they settle and start again. Tapping a name jumps there. */
const SLABS = [
  // top -> bottom, matching the copy order: finish, plaster, services, insulation, structure
  { t: 8, top: "repeating-linear-gradient(90deg,#6e4b2f 0 34px,#5b3c24 34px 36px),linear-gradient(180deg,rgba(255,255,255,.06),rgba(0,0,0,.12))", side: "#4a3020" },
  { t: 10, top: "linear-gradient(135deg,#efe9df,#ddd5c7)", side: "#bfb5a5" },
  { t: 14, top: "repeating-linear-gradient(0deg,transparent 0 46px,rgba(196,154,92,.75) 46px 48px),repeating-linear-gradient(90deg,transparent 0 70px,rgba(243,240,234,.35) 70px 71px),#1d2a31", side: "#131c21" },
  { t: 24, top: "repeating-linear-gradient(45deg,#cfae72 0 6px,#bf9b5d 6px 12px)", side: "#9c7d47" },
  { t: 34, top: "radial-gradient(circle at 30% 20%,rgba(255,255,255,.12),transparent 40%),repeating-linear-gradient(0deg,transparent 0 58px,rgba(40,40,40,.35) 58px 60px),#8b8780", side: "#6a6660" },
];
const GAP = 64, GAP_PHONE = 34;
// play order: stacked, open, light each layer top to bottom, open, back to stacked
const STEPS: { open: boolean; on: number }[] = [{ open: false, on: -1 }, { open: true, on: -1 }, ...SLABS.map((_, k) => ({ open: true, on: k })), { open: true, on: -1 }];

export function BuildLayers({ c }: { c: Extras["layers"] }) {
  const [s, setS] = useState(0);
  const sec = useRef<HTMLElement>(null);
  const hold = useRef(0);
  const [gap, setGap] = useState(GAP);
  useEffect(() => {
    if (innerWidth < 768) setGap(GAP_PHONE);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setS(1); return; }
    let seen = false;
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; }, { threshold: 0.3 });
    io.observe(sec.current!);
    const id = setInterval(() => { if (seen && !document.hidden && Date.now() > hold.current) setS((k) => (k + 1) % STEPS.length); }, 1700);
    return () => { clearInterval(id); io.disconnect(); };
  }, []);
  const { open, on } = STEPS[s];
  const pick = (k: number) => { hold.current = Date.now() + 7000; setS(2 + k); };
  // z of each slab: stacked = sum of the slabs under it; open adds a gap per level
  const z = SLABS.map((_, k) => { const below = SLABS.slice(k + 1); return below.reduce((a, b) => a + b.t, 0) + (open ? below.length * gap : 0) + (on === k ? gap * 0.55 : 0); });
  const u = "text-xs uppercase tracking-[0.2em] rtl:tracking-normal";
  return (
    <section ref={sec} id="layers" className="overflow-hidden bg-[#15130F] px-5 py-16 text-[var(--surface)] md:px-10 md:py-24">
      <div className="grid items-center gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className={`${u} eyebrow text-[var(--bronze)]`}>{c.eyebrow}</p>
          <h2 className="display mt-3 text-4xl md:text-6xl">{c.title}</h2>
          <p className="mt-5 max-w-md text-sm text-[var(--surface)]/70">{c.intro}</p>
          <ol className="mt-8">
            {c.items.map((l, k) => (
              <li key={l.name} className="border-t border-[var(--surface)]/15">
                <button onClick={() => pick(k)} onMouseEnter={() => pick(k)} aria-current={on === k} className={`flex w-full items-baseline gap-4 py-3 text-start transition-colors duration-500 ${on === k ? "text-[var(--surface)]" : "text-[var(--surface)]/45"}`}>
                  <span className={`mt-2 inline-block h-2 w-2 shrink-0 rounded-full transition-colors duration-500 ${on === k ? "bg-[var(--bronze)]" : "bg-[var(--surface)]/25"}`} aria-hidden />
                  <span>
                    <span className="display block text-2xl md:text-3xl">{l.name}</span>
                    <span className={`grid transition-[grid-template-rows] duration-500 ${on === k ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}><span className="overflow-hidden"><span className="block pt-1 text-sm text-[var(--surface)]/70">{l.note}</span></span></span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
        <div className="relative grid h-[380px] place-items-center md:h-[560px] lg:col-span-7" style={{ perspective: "1700px" }} aria-hidden>
          {/* soft floor light under the stack (static) */}
          <div className="absolute inset-x-[15%] bottom-[8%] h-24 rounded-[50%] bg-[radial-gradient(closest-side,rgba(196,154,92,.22),transparent)]" />
          <div className="relative h-[var(--s)] w-[var(--s)] [--s:clamp(160px,46vw,300px)]" style={{ transformStyle: "preserve-3d", transform: "translateY(22%) rotateX(58deg) rotateZ(-38deg)" }}>
            {SLABS.map((sl, k) => (
              <div key={k} className="absolute inset-0 transition-[transform,opacity] duration-[1100ms] ease-[cubic-bezier(.65,0,.25,1)]"
                style={{ transformStyle: "preserve-3d", transform: `translateZ(${z[k]}px)`, opacity: on === -1 || on === k ? 1 : 0.4 }}>
                <div className="absolute inset-0 transition-shadow duration-700" style={{ background: sl.top, boxShadow: on === k ? "0 0 0 1.5px var(--bronze), 0 0 40px rgba(196,154,92,.35)" : "0 0 0 1px rgba(243,240,234,.12)" }} />
                {/* the two edges facing the viewer give each slab its thickness */}
                <div className="absolute left-0 top-full w-full origin-top" style={{ height: sl.t, background: sl.side, transform: "rotateX(-90deg)" }} />
                <div className="absolute left-full top-0 h-full origin-left" style={{ width: sl.t, background: sl.side, filter: "brightness(.8)", transform: "rotateY(90deg)" }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
