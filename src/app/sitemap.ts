// the static build (output: export) needs this; it is what the file is anyway
export const dynamic = "force-static";
import type { MetadataRoute } from "next";
import { listProjects } from "@/lib/content";

const base = "https://baikalstudio.com";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["", "/projects", "/services", "/studio", "/contact", ...(await listProjects("en")).map((p) => `/projects/${p.slug}`)];
  return pages.flatMap((p) => ["en", "ar"].map((l) => ({ url: `${base}/${l}${p}`, lastModified: new Date("2026-10-18"), changeFrequency: "monthly" as const, priority: p === "" ? 1 : p.startsWith("/projects/") ? 0.7 : 0.8, alternates: { languages: { en: `${base}/en${p}`, ar: `${base}/ar${p}` } } })));
}