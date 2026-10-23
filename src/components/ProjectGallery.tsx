"use client";
import { useState } from "react";
import Image from "next/image";
import { DoorWalk, WindowWalk, PlanTable } from "./ProjectWalks";
import { Popup } from "./Popup";
import type { Img } from "@/data/projects";
import type { Dict } from "@/data/i18n";

/* Picks the walk through the rooms per project (door to door / window / plan table) and owns the popup viewer. */
export function ProjectGallery({ images, name, t, variant }: { images: Img[]; name: string; t: Dict; variant: number }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      {process.env.NEXT_PUBLIC_HOME === "calm" ? <CalmGallery images={images} name={name} onOpen={setOpen} />
        : (() => { const W = [DoorWalk, WindowWalk, PlanTable][variant % 3]; return <W images={images} name={name} onOpen={setOpen} label={`${t.project.open} ${t.project.full}`} />; })()}
      <Popup images={images} name={name} t={t} open={open} setOpen={setOpen} />
    </>
  );
}
/* The calm version: the rooms one after another, each large photograph with its name under it; a tap
   opens it full screen. Nothing pinned, nothing to learn. */
function CalmGallery({ images, name, onOpen }: { images: Img[]; name: string; onOpen: (k: number) => void }) {
  return (
    <div className="mx-auto max-w-6xl space-y-14 px-5 py-16 md:space-y-24 md:px-10 md:py-24">
      {images.map((im, k) => (
        <figure key={im.src}>
          <button type="button" onClick={() => onOpen(k)} className="relative block w-full overflow-hidden rounded-xl" style={{ aspectRatio: `${im.w} / ${im.h}` }} aria-label={`${name}, ${im.room}`}>
            <Image src={im.src} alt={`${name}, ${im.room}`} fill sizes="(min-width:1152px) 1152px, 100vw" className="object-cover" />
          </button>
          <figcaption className="mt-4 flex items-center gap-4"><span className="h-px w-8 bg-[var(--bronze)]" aria-hidden /><span className="display text-xl md:text-2xl">{im.room}</span></figcaption>
        </figure>
      ))}
    </div>
  );
}
