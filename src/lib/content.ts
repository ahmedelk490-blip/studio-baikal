import { cacheTag } from "next/cache";
import { db, type ProjectText } from "./db";
import type { Project } from "@/data/projects";
import type { Lang } from "@/data/i18n";

/* Public reads. Cached and tagged "projects", so pages stay static and fast, and every save in /admin
   (updateTag("projects")) shows on the site on the next request. Only published projects leave here. */
type Row = { id: number; slug: string; category: string; area: string; year: string; cover: string; en: string; ar: string; seo: string };
export type PublicProject = Project & { kind: string; seo: { title?: string; description?: string } };

function shape(r: Row, lang: Lang): PublicProject {
  const t = JSON.parse(lang === "ar" ? r.ar : r.en) as ProjectText;
  const imgs = db().prepare("SELECT src, room_en, room_ar, w, h FROM project_images WHERE project_id = ? ORDER BY sort, id").all(r.id) as { src: string; room_en: string; room_ar: string; w: number; h: number }[];
  const images = imgs.map((i) => ({ src: i.src, room: (lang === "ar" ? i.room_ar : i.room_en) || i.room_en, w: i.w, h: i.h }));
  const seo = JSON.parse(r.seo || "{}") as Record<string, Record<string, string>>;
  return { slug: r.slug, ...t, area: r.area, year: r.year, cover: r.cover || images[0]?.src || "", images, kind: r.category, seo: seo[lang] ?? {} };
}
const COLS = "id, slug, category, area, year, cover, en, ar, seo";

export async function listProjects(lang: Lang): Promise<PublicProject[]> {
  "use cache";
  cacheTag("projects");
  return (db().prepare(`SELECT ${COLS} FROM projects WHERE status = 'published' ORDER BY sort, id`).all() as Row[]).map((r) => shape(r, lang));
}
export async function findProject(slug: string, lang: Lang): Promise<{ p: PublicProject; next: PublicProject } | null> {
  "use cache";
  cacheTag("projects");
  const list = await listProjects(lang);
  const i = list.findIndex((x) => x.slug === slug);
  return i < 0 ? null : { p: list[i], next: list[(i + 1) % list.length] };
}
