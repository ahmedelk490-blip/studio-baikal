"use client";
import { useEffect, useRef, useState } from "react";
import { ShapeCycle } from "./ShapeCycle";
import { Ticks } from "./Ticks";

const sets = [
  ["/projects/october-250/05.webp", "/projects/tagamo3-115/04.webp", "/projects/maadi-285/01.webp"],
  ["/projects/el-nakhil-villa/01.webp", "/projects/hadayek-el-ahram-200/03.webp", "/projects/mountain-view-zayed-80/03.webp"],
];
type Pack = { name: string; for: string; items: string[] };

/* Services — the two paths. Desktop: a sticky Baikal arch on one side keeps cycling the rooms of the
   package you are reading and swaps to the other package's rooms as you scroll into it; the package
   text and its drawn ticks scroll beside it. Phones: each package carries its own arch. */
export function Packages({ packs, labels, forLabel, included }: { packs: Pack[]; labels: string[]; forLabel: string; included: string }) {
  const [a, setA] = useState(0);
  const refs = useRef<(HTMLElement | null)[]>([]);
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setA(Number((e.target as HTMLElement).dataset.k)); }), { rootMargin: "-45% 0px -45% 0px" });
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);
  const u = "text-xs uppercase tracking-[0.2em] rtl:tracking-normal";
  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
      <div className="hidden lg:col-span-5 lg:block">
        <div className="sticky top-28">
          <ShapeCycle imgs={sets[a % sets.length]} sizes="40vw" className="mx-auto aspect-[4/5] w-full max-w-[min(100%,64svh)] rounded-b-2xl rounded-t-full ring-1 ring-[var(--bronze)]/30" />
          <p key={a} className={`hero-in mt-5 text-center ${u} text-[var(--bronze)]`}><span>{labels[a]}</span></p>
        </div>
      </div>
      <div className="lg:col-span-7">
        {packs.map((pk, k) => (
          <article key={pk.name} data-k={k} ref={(el) => { refs.current[k] = el; }} className="border-t border-[var(--ink)]/15 py-12 first:border-t-0 first:pt-0 lg:flex lg:min-h-[78svh] lg:flex-col lg:justify-center lg:py-16">
            <ShapeCycle imgs={sets[k % sets.length]} sizes="90vw" className="mx-auto mb-8 aspect-[4/5] w-full max-w-sm rounded-b-2xl rounded-t-full lg:hidden" />
            <p className={`eyebrow ${u} text-[var(--bronze)]`}>{labels[k]}</p>
            <h2 className="display mt-3 text-4xl md:text-6xl">{pk.name}</h2>
            <p className="mt-4 max-w-xl text-sm text-[var(--muted)]"><span className="font-semibold text-[var(--ink)]">{forLabel}: </span>{pk.for}</p>
            <p className={`${u} mt-8 text-[var(--muted)]`}>{included}</p>
            <Ticks items={pk.items} />
          </article>
        ))}
      </div>
    </div>
  );
}
