"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { ShapeCycle } from "./ShapeCycle";
import type { Dict } from "@/data/i18n";
import type { PagesDict } from "@/data/pages";

const imgs = ["/projects/october-250/01.webp", "/projects/maadi-180/05.webp", "/projects/el-nakhil-villa/01.webp"];
const valueRooms = [
  ["/projects/el-nakhil-villa/01.webp", "/projects/october-250/01.webp", "/projects/maadi-285/01.webp"],
  ["/projects/maadi-180/05.webp", "/projects/tagamo3-115/04.webp", "/projects/zayed-160/02.webp"],
  ["/projects/hadayek-el-ahram-200/03.webp", "/projects/mountain-view-zayed-80/03.webp", "/projects/october-250/05.webp"],
];

function Values({ items }: { items: string[][] }) {
  const ref = useRef<HTMLUListElement>(null);
  useEffect(() => { const el = ref.current; if (!el) return; const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("in"); io.disconnect(); } }, { threshold: 0.3 }); io.observe(el); return () => io.disconnect(); }, []);
  return (
    <ul ref={ref} className="vals mt-12 grid gap-12 md:grid-cols-3">
      {items.map(([v, d], k) => (
        <li key={v} className="text-center">
          <span className="relative mx-auto grid h-48 w-48 place-items-center md:h-56 md:w-56">
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden><circle cx="50" cy="50" r="48" fill="none" stroke="var(--bronze)" strokeWidth=".7" pathLength={1} className="val-c" style={{ transitionDelay: `${k * 250}ms` }} /></svg>
            <svg viewBox="0 0 100 100" className="spin absolute -inset-3 h-[calc(100%+1.5rem)] w-[calc(100%+1.5rem)]" aria-hidden><circle cx="50" cy="50" r="49" fill="none" stroke="var(--surface)" strokeOpacity=".2" strokeWidth=".3" strokeDasharray="1 3" /></svg>
            {/* a round window onto the rooms that hold this value; it keeps changing by itself */}
            <ShapeCycle imgs={valueRooms[k % valueRooms.length]} every={3600 + k * 600} sizes="240px" className="absolute inset-[7%] rounded-full" />
          </span>
          <h3 className="display mt-6 text-3xl md:text-4xl">{v}</h3>
          <p className="mx-auto mt-3 max-w-xs text-sm text-[var(--surface)]/75">{d}</p>
        </li>
      ))}
    </ul>
  );
}

/* Studio page body: each chapter opens through an arch (the brand motif) as you scroll; values are drawn circles. */
export function StudioStory({ s, t }: { s: PagesDict["studio"]; t: Dict }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    gsap.utils.toArray<HTMLElement>(".arch-mask").forEach((el) => {
      gsap.fromTo(el, { clipPath: "inset(100% 0% 0% 0% round 999px 999px 0px 0px)" }, { clipPath: "inset(0% 0% 0% 0% round 999px 999px 0px 0px)", ease: "none", scrollTrigger: { trigger: el, start: "top 92%", end: "center 55%", scrub: 0.5 } });
      gsap.fromTo(el.querySelector("img"), { scale: 1.3 }, { scale: 1, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.5 } });
    });
  }, { scope: ref });
  const u = "text-xs uppercase tracking-[0.2em] rtl:tracking-normal";
  return (
    <div ref={ref}>
      <section className="bg-[var(--surface)] px-5 py-16 text-[var(--ink)] md:px-10 md:py-24">
        <ol className="grid gap-16 md:gap-24">
          {s.chapters.map(([h, txt], k) => (
            <li key={h} className="grid items-center gap-10 md:grid-cols-12">
              <div className={`md:col-span-5 ${k % 2 ? "md:order-2" : ""}`}>
                <div className="arch-mask relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden"><Image src={imgs[k]} alt="" fill sizes="(min-width:768px) 40vw, 90vw" className="object-cover" /></div>
              </div>
              <div className="md:col-span-7 md:px-10">
                <p className={`${u} text-[var(--bronze)]`}>{h}</p>
                <p className="display mt-4 text-2xl leading-[1.3] rtl:leading-[1.6] md:text-4xl">{txt}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section className="bg-[var(--deep)] px-5 py-16 text-[var(--surface)] md:px-10 md:py-24">
        <h2 className="display text-center text-4xl md:text-6xl">{s.valuesTitle}</h2>
        <Values items={t.studio.values} />
      </section>
    </div>
  );
}