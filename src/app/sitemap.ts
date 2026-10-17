import type { MetadataRoute } from "next";
import { projects } from "@/data/projects";

const base = "https://baikalstudio.com";
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/projects", "/services", "/studio", "/contact", ...projects.map((p) => `/projects/${p.slug}`)];
  return pages.flatMap((p) => ["en", "ar"].map((l) => ({ url: `${base}/${l}${p}`, lastModified: new Date("2026-10-18"), changeFrequency: "monthly" as const, priority: p === "" ? 1 : p.startsWith("/projects/") ? 0.7 : 0.8, alternates: { languages: { en: `${base}/en${p}`, ar: `${base}/ar${p}` } } })));
}