"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import type { Dict } from "@/data/i18n";

const IMGS = ["/brand/hero-arch.webp", "/projects/maadi-180/05.webp", "/projects/october-250/05.webp", "/projects/el-nakhil-villa/01.webp"];

/* How we work — the colonnade. Four columns, one per step, each holding a faint arch outline. The page
   holds on this section and each stretch of scroll moves the lit Baikal arch window to the next column,
   showing that step's room while the step's name and line change beside the title. A tap goes there. */
export function Colonnade({ t }: { t: Dict }) {
  const ap = t.approach, n = ap.steps.length;
  const [a, setA] = useState(0);
  const sec = useRef<HTMLElement>(null);
  const st = useRef<ScrollTrigger | null>(null);
  useGSAP(() => {
    st.current = ScrollTrigger.create({ trigger: sec.current, start: "top top", end: "+=" + n * 45 + "%", pin: true, anticipatePin: 1,
      onUpdate: (s) => setA(Math.min(n - 1, Math.floor(s.progress * n))) });
    return () => { st.current = null; };
  }, { scope: sec });
  // a tap scrolls to the middle of that step's stretch, so the pin and the choice agree
  const pick = (k: number) => { setA(k); const s = st.current; if (s) window.scrollTo({ top: s.start + ((s.end - s.start) * (k + 0.5)) / n, behavior: "smooth" }); };
  const u = "text-xs uppercase tracking-[0.2em] rtl:tracking-normal";
  return (
    <section ref={sec} id="approach" data-depth={t.gauge.approach} data-meters="1,100 m" data-deep="1" className="flex min-h-[100svh] flex-col justify-center bg-[#15130F] px-5 py-12 text-[var(--surface)] md:px-10 lg:py-12">
      <div className="grid gap-8 md:grid-cols-12 md:items-end">
        <div className="md:col-span-7">
          <p className={`${u} eyebrow text-[var(--bronze)]`}>{t.gauge.approach}</p>
          <h2 className="display mt-3 text-4xl md:text-6xl">{ap.title}</h2>
          <p className="mt-4 max-w-md text-sm text-[var(--surface)]/65">{ap.intro}</p>
        </div>
        <div key={a} className="hero-in md:col-span-5" aria-live="polite">
          <p className={`${u} text-[var(--bronze)]`}>{ap.step} {ap.words[a]}</p>
          <p className="display mt-2 text-3xl md:text-4xl">{ap.steps[a][0]}</p>
          <p className="mt-2 max-w-sm text-sm text-[var(--surface)]/70">{ap.steps[a][1]}</p>
        </div>
      </div>

      <div className="relative mt-8 grid h-[38svh] min-h-[260px] grid-cols-4 border-y border-[var(--surface)]/12 md:mt-12 md:h-[50svh]">
        {ap.steps.map(([name], k) => (
          <button key={name} onClick={() => pick(k)} aria-current={a === k} aria-label={name}
            className="relative border-s border-[var(--surface)]/12 first:border-s-0">
            {/* the empty arch of this column */}
            <span className="absolute inset-x-2 bottom-12 top-4 rounded-b-lg rounded-t-full border border-[var(--surface)]/10 md:inset-x-4" aria-hidden />
            <span className={`absolute inset-x-1 bottom-3 text-center text-xs transition-colors duration-500 md:uppercase md:tracking-[0.2em] rtl:tracking-normal ${a === k ? "text-[var(--bronze)]" : "text-[var(--surface)]/45"}`}>{name}</span>
          </button>
        ))}
        {/* the lit window gliding between the columns */}
        <div className="col-win pointer-events-none absolute bottom-12 top-4 w-1/4 px-2 md:px-4" style={{ insetInlineStart: `${(a / n) * 100}%` }} aria-hidden>
          <div className="relative h-full overflow-hidden rounded-b-lg rounded-t-full ring-1 ring-[var(--bronze)]/50 shadow-[0_30px_80px_-20px_rgba(196,154,92,.35)]">
            {IMGS.map((s, k) => <Image key={s} src={s} alt="" fill sizes="(min-width:768px) 25vw, 30vw" className={`object-cover transition-[opacity,transform] duration-1000 ${k === a ? "scale-100 opacity-100" : "scale-110 opacity-0"}`} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
