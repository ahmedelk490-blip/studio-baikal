"use client";
import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const scenes = [
  { src: "/projects/tagamo3-115/04.webp", room: "Reception", line: "Where guests slow down. Curved seating, one strong artwork, light from three heights." },
  { src: "/projects/october-250/05.webp", room: "Dining", line: "A table that gathers. Natural wood, soft chairs and a pendant that sets the mood." },
  { src: "/projects/hadayek-el-ahram-200/03.webp", room: "Kitchen", line: "Built for daily rituals. Matte fronts, hidden handles, stone that lasts." },
  { src: "/projects/mountain-view-zayed-80/03.webp", room: "Master bedroom", line: "Walnut, taupe and quiet. A room that feels like a boutique hotel." },
  { src: "/projects/mountain-view-zayed-80/05.webp", room: "Bathroom", line: "Pale stone, black fittings, a bath by the glass. Calm in a small footprint." },
];

/* -300 m: one pinned viewport, five rooms crossfade; the index on the left is live. */
export function Rooms() {
  const sec = useRef<HTMLElement>(null);
  useGSAP(() => {
    gsap.matchMedia().add("(min-width: 1024px)", () => {
      const imgs = gsap.utils.toArray<HTMLElement>(".rt-scene");
      const items = gsap.utils.toArray<HTMLElement>(".rt-item");
      const tl = gsap.timeline({ scrollTrigger: { trigger: sec.current, start: "top top", end: "+=" + scenes.length * 85 + "%", pin: true, scrub: 0.6, anticipatePin: 1,
        onUpdate: (st) => { const k = Math.min(scenes.length - 1, Math.floor(st.progress * scenes.length)); items.forEach((el, j) => el.classList.toggle("is-on", j === k)); } } });
      imgs.forEach((el, k) => { if (k) tl.fromTo(el, { autoAlpha: 0, scale: 1.08 }, { autoAlpha: 1, scale: 1, duration: 1, ease: "none" }, k - 0.35); });
      items[0].classList.add("is-on");
    });
  }, { scope: sec });
  return (
    <section ref={sec} id="rooms" data-depth="Rooms" data-meters="300 m" data-deep="1" className="relative bg-[var(--deeper)] text-[var(--surface)] lg:h-[100svh] lg:overflow-hidden">
      <div className="hidden lg:block">
        {scenes.map((s, k) => (
          <div key={s.src} className="rt-scene absolute inset-0" style={{ opacity: k ? 0 : 1 }}>
            <Image src={s.src} alt={s.room} fill sizes="100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--deeper)]/90 via-[var(--deeper)]/25 to-transparent" />
          </div>
        ))}
        <div className="absolute inset-y-0 left-10 flex w-[42vw] flex-col justify-center">
          <p className="text-xs uppercase tracking-[0.2em] rtl:tracking-normal text-[var(--bronze)]">Every room, our way</p>
          <ol className="mt-6">
            {scenes.map((s) => (
              <li key={s.room} className="rt-item border-t border-[var(--surface)]/15 py-3 text-[var(--surface)]/35 transition-colors duration-500 [&.is-on]:text-[var(--surface)]">
                <span className="display block text-4xl">{s.room}</span>
                <span className="block max-w-sm pt-1 text-sm opacity-0 transition-opacity duration-500 [.is-on>&]:opacity-80">{s.line}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="px-5 py-20 md:px-10 lg:hidden">
        <p className="text-xs uppercase tracking-[0.2em] rtl:tracking-normal text-[var(--bronze)]">Every room, our way</p>
        <ol className="mt-6 grid gap-8">
          {scenes.map((s) => (
            <li key={s.src}>
              <span className="relative block aspect-[4/3] overflow-hidden"><Image src={s.src} alt={s.room} fill sizes="100vw" className="object-cover" /></span>
              <p className="display mt-3 text-3xl">{s.room}</p>
              <p className="mt-1 text-sm text-[var(--surface)]/65">{s.line}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}