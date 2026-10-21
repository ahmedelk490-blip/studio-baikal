"use client";
import { useState } from "react";
import { DoorWalk, WindowWalk, PlanTable } from "./ProjectWalks";
import { Popup } from "./Popup";
import type { Img } from "@/data/projects";
import type { Dict } from "@/data/i18n";

/* Picks the walk through the rooms per project (door to door / window / plan table) and owns the popup viewer. */
export function ProjectGallery({ images, name, t, variant }: { images: Img[]; name: string; t: Dict; variant: number }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      {(() => { const W = [DoorWalk, WindowWalk, PlanTable][variant % 3]; return <W images={images} name={name} onOpen={setOpen} label={`${t.project.open} ${t.project.full}`} />; })()}
      <Popup images={images} name={name} t={t} open={open} setOpen={setOpen} />
    </>
  );
}