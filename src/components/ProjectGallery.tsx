"use client";
import { useState } from "react";
import { ArchSlider } from "./ArchSlider";
import { Gallery } from "./Gallery";
import { FilmStrip } from "./FilmStrip";
import { Popup } from "./Popup";
import type { Img } from "@/data/projects";
import type { Dict } from "@/data/i18n";

/* Picks the layout per project (arch slider / film strip / mosaic) and owns the popup viewer. */
export function ProjectGallery({ images, name, t, variant }: { images: Img[]; name: string; t: Dict; variant: number }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      {variant === 0 ? <ArchSlider images={images} name={name} t={t} onOpen={setOpen} /> : variant === 1 ? <FilmStrip images={images} name={name} t={t} /> : <Gallery images={images} name={name} t={t} />}
      <Popup images={images} name={name} t={t} open={open} setOpen={setOpen} />
    </>
  );
}