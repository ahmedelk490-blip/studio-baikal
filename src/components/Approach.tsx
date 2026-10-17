"use client";
import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Dict } from "@/data/i18n";

const shots = ["/projects/maadi-285/01.webp", "/projects/october-250/03.webp", "/projects/mountain-view-zayed-80/03.webp", "/projects/ca-dental-clinic/05.webp"];

/* 1,100 m — the stand (from Abaq): four framed renders stand behind each other at one angle in a
   3D stage; the page pins and each step brings its render to the front, upright and lit, while the
   step text below changes. Renders are never cropped (object-contain in a fixed 16:10 frame). */
export function Approach({ t }: { t: Dict }) {
  const ref = useRef<HTMLElement>(null);
  const N = shots.length;
  useGSAP(() => {
    const cards = gsap.utils.toArray<HTMLElement>(".st-card");
    const items = gsap.utils.toArray<HTMLElement>(".st-step");
    const place = (k: number) => cards.forEach((c, i) => { const d = i - k; gsap.to(c, { xPercent: d * 9, z: -Math.abs(d) * 140, rotateY: d === 0 ? 0 : (d > 0 ? -14 : 14), scale: d === 0 ? 1 : 0.92, opacity: d < 0 ? 0 : 1 - Math.abs(d) * 0.22, filter: `brightness(${d === 0 ? 1 : 0.55})`, duration: 0.7, ease: "power3.out", overwrite: true }); items.forEach((el, j) => el.classList.toggle("is-on", j === k)); });
    place(0);
    gsap.set(cards, { transformOrigin: "50% 100%" });
    ScrollTrigger_create();
    function ScrollTrigger_create() {
      gsap.timeline({ scrollTrigger: { trigger: ref.current, start: "top top", end: "+=" + N * 60 + "%", pin: true, anticipatePin: 1, onUpdate: (st) => place(Math.min(N - 1, Math.floor(st.progress * N))) } });
    }
  }, { scope: ref });
  const u = "text-xs uppercase tracking-[0.2em] rtl:tracking-normal";
  return (
    <section ref={ref} id="approach" data-depth={t.gauge.approach} data-meters="1,100 m" data-deep="1" className="relative h-[100svh] overflow-hidden bg-[var(--deep)] text-[var(--surface)]">
      <div className="flex h-full flex-col px-5 pb-6 pt-24 md:px-10 md:pt-28">
        <div className="grid gap-4 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7"><p className={`${u} text-[var(--bronze)]`}>{t.gauge.approach}</p><h2 className="display mt-2 text-3xl md:text-5xl">{t.approach.title}</h2></div>
          <p className="hidden max-w-sm text-sm text-[var(--surface)]/70 md:col-span-5 md:block">{t.approach.intro}</p>
        </div>
        <div className="relative mt-4 flex-1" style={{ perspective: "1400px" }}>
          {shots.map((s, i) => (
            <div key={s} className="st-card absolute inset-x-0 bottom-0 top-0 mx-auto max-w-5xl will-change-transform" style={{ transformStyle: "preserve-3d" }}>
              <div className="relative h-full overflow-hidden rounded-2xl bg-[var(--deeper)] shadow-[0_30px_80px_rgba(0,0,0,.45)]">
                <Image src={s} alt={t.approach.steps[i][0]} fill sizes="(min-width:1024px) 64rem, 100vw" className="object-contain" />
              </div>
            </div>
          ))}
        </div>
        <ol className="mt-5 grid grid-cols-4 gap-3 border-t border-[var(--surface)]/15 pt-4">
          {t.approach.steps.map(([title, d], k) => (
            <li key={title} className="st-step min-w-0 text-[var(--surface)]/35 transition-colors duration-500 [&.is-on]:text-[var(--surface)]">
              <p className={`${u} truncate text-[var(--bronze)]`}>{t.approach.step} {t.approach.words[k]}</p>
              <p className="display mt-1 truncate text-lg md:text-2xl">{title}</p>
              <p className="mt-1 hidden text-xs text-[var(--surface)]/70 lg:[.is-on>&]:block">{d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}