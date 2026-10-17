"use client";
import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Dict } from "@/data/i18n";

const srcs = ["/projects/tagamo3-115/04.webp", "/projects/october-250/05.webp", "/projects/hadayek-el-ahram-200/03.webp", "/projects/mountain-view-zayed-80/03.webp", "/projects/mountain-view-zayed-80/05.webp"];

/* 300 m: one pinned viewport, five rooms crossfade; the index on the side is live. */
export function Rooms({ t }: { t: Dict }) {
  const sec = useRef<HTMLElement>(null);
  const scenes = t.rooms.scenes;
  useGSAP(() => {
    gsap.matchMedia().add("(min-width: 1024px)", () => {
      const imgs = gsap.utils.toArray<HTMLElement>(".rt-scene");
      const items = gsap.utils.toArray<HTMLElement>(".rt-item");
      const tl = gsap.timeline({ scrollTrigger: { trigger: sec.current, start: "top top", end: "+=" + scenes.length * 85 + "%", pin: true, scrub: 0.6, anticipatePin: 1,
        onUpdate: (st) => { const k = Math.min(scenes.length - 1, Math.floor(st.progress * scenes.length)); items.forEach((el, j) => el.classList.toggle("is-on", j === k)); } } });
      imgs.forEach((el, k) => { if (k) tl.fromTo(el, { clipPath: "circle(0% at 68% 50%)", scale: 1.15 }, { clipPath: "circle(150% at 68% 50%)", scale: 1, duration: 1, ease: "none" }, k - 0.35); });
      items[0].classList.add("is-on");
    });
  }, { scope: sec });
  return (
    <section ref={sec} id="rooms" data-depth={t.gauge.rooms} data-meters="300 m" data-deep="1" className="relative bg-[var(--deeper)] text-[var(--surface)] lg:h-[100svh] lg:overflow-hidden">
      <div className="hidden lg:block">
        {srcs.map((s, k) => (
          <div key={s} className="rt-scene absolute inset-0" style={{ clipPath: k ? "circle(0% at 68% 50%)" : undefined }}>
            <Image src={s} alt={scenes[k][0]} fill sizes="100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--deeper)]/90 via-[var(--deeper)]/25 to-transparent rtl:bg-gradient-to-l" />
          </div>
        ))}
        <div className="absolute inset-y-0 start-10 flex w-[42vw] flex-col justify-center">
          <p className="text-xs uppercase tracking-[0.2em] rtl:tracking-normal text-[var(--bronze)]">{t.rooms.eyebrow}</p>
          <ol className="mt-6">
            {scenes.map(([room, line]) => (
              <li key={room} className="rt-item border-t border-[var(--surface)]/15 py-3 text-[var(--surface)]/35 transition-colors duration-500 [&.is-on]:text-[var(--surface)]">
                <span className="display block text-4xl">{room}</span>
                <span className="block max-w-sm pt-1 text-sm opacity-0 transition-opacity duration-500 [.is-on>&]:opacity-80">{line}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="px-5 py-20 md:px-10 lg:hidden">
        <p className="text-xs uppercase tracking-[0.2em] rtl:tracking-normal text-[var(--bronze)]">{t.rooms.eyebrow}</p>
        <ol className="mt-6 grid gap-8">
          {scenes.map(([room, line], k) => (
            <li key={room}>
              <span className="relative block aspect-[4/3] overflow-hidden"><Image src={srcs[k]} alt={room} fill sizes="100vw" className="object-cover" /></span>
              <p className="display mt-3 text-3xl">{room}</p>
              <p className="mt-1 text-sm text-[var(--surface)]/65">{line}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}