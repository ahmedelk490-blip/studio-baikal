"use client";
import { useState } from "react";
import Image from "next/image";
import { DoorWalk, WindowWalk, PlanTable } from "./ProjectWalks";
import { Popup } from "./Popup";
import type { Img } from "@/data/projects";
import type { Dict } from "@/data/i18n";

/* Picks the walk through the rooms per project (door to door / window / plan table) and owns the popup viewer. */
export function ProjectGallery({ images, name, t, variant, story }: { images: Img[]; name: string; t: Dict; variant: number; story?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      {process.env.NEXT_PUBLIC_HOME === "calm" ? <CalmGallery images={images} name={name} onOpen={setOpen} story={story} />
        : (() => { const W = [DoorWalk, WindowWalk, PlanTable][variant % 3]; return <W images={images} name={name} onOpen={setOpen} label={`${t.project.open} ${t.project.full}`} />; })()}
      <Popup images={images} name={name} t={t} open={open} setOpen={setOpen} />
    </>
  );
}
/* The calm version: the rooms composed on one board, the way a studio lays out a project sheet. A repeating
   rhythm of rows: one wide room, then two side by side, then a tall one beside a wide one. The room's name
   sits in the corner of its own photo on a quiet band. On phones the board is two columns, with the wide
   rooms spanning both. A tap opens the room full screen. */
function CalmGallery({ images, name, onOpen, story }: { images: Img[]; name: string; onOpen: (k: number) => void; story?: string }) {
  // the rhythm: wide (2 cols) · half · half · tall · wide-beside-tall · half · half … repeats every 7;
  // phones give every fourth room the full width too, so the small tiles never run long
  const span = (k: number) => { const r = k % 7; return r === 0 ? "col-span-2 aspect-[16/9]" : r === 3 ? "row-span-2 aspect-[3/4] md:aspect-auto" : r === 4 ? "col-span-2 aspect-[16/10] md:col-span-1 md:aspect-[4/3]" : "aspect-[4/3]"; };
  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:px-10 md:py-16">
      <div className="grid grid-cols-2 gap-3 md:gap-5" style={{ gridAutoFlow: "dense" }}>
        {images.map((im, k) => (
          <figure key={im.src} className={`relative ${span(k)}`}>
            <button type="button" onClick={() => onOpen(k)} className="group relative block h-full w-full overflow-hidden rounded-lg md:rounded-xl" aria-label={`${name}, ${im.room}`}>
              <Image src={im.src} alt={`${name}, ${im.room}`} fill sizes="(min-width:1152px) 576px, 50vw" className="object-cover transition-transform duration-[1200ms] ease-out [@media(hover:hover)]:group-hover:scale-[1.04]" />
              <span className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#05080A]/70 to-transparent" aria-hidden />
              <figcaption className="absolute bottom-3 start-3 flex items-center gap-2 text-[var(--surface)] md:bottom-4 md:start-4">
                <span className="h-px w-5 bg-[var(--bronze)]" aria-hidden /><span className="display text-sm md:text-lg">{im.room}</span>
              </figcaption>
            </button>
          </figure>
        ))}
      </div>
      {story && <p className="display mx-auto mt-12 max-w-3xl text-center text-xl leading-[1.5] text-[var(--surface)]/80 rtl:leading-[1.7] md:mt-16 md:text-2xl">{story}</p>}
    </div>
  );
}
