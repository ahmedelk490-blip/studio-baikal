import { cacheTag } from "next/cache";
import type { Metadata } from "next";
import { db } from "./db";
import { contact as base } from "@/data/projects";
import { dict, type Lang } from "@/data/i18n";

/* Site-wide settings edited in /admin/settings (contact, WhatsApp greeting, Instagram, footer text).
   Stored as one JSON row; anything missing falls back to the original copy in src/data. Cached and
   tagged "settings" so the whole site picks up a save on the next request. */
type Pair = { en: string; ar: string };
export type SiteSettings = { phone: string; email: string; whatsapp: string; waText: Pair; instagram: string; footer: { en: { tagline: string; sub: string }; ar: { tagline: string; sub: string } } };
export type Contact = { phone: string; phoneHref: string; email: string; whatsapp: string; instagram: string };

export const siteDefaults: SiteSettings = {
  phone: base.phone, email: base.email, whatsapp: "201110004623", instagram: base.instagram,
  waText: { en: "Hi Studio Baikal, I'd like a free consultation", ar: "مرحبًا استوديو بايكال، أرغب في استشارة مجانية" },
  footer: { en: { tagline: dict.en.footer.tagline, sub: dict.en.footer.sub }, ar: { tagline: dict.ar.footer.tagline, sub: dict.ar.footer.sub } },
};

export function readSettings(): SiteSettings {
  const row = db().prepare("SELECT v FROM settings WHERE k = 'site'").get() as { v: string } | undefined;
  const s = row ? (JSON.parse(row.v) as Partial<SiteSettings>) : {};
  const d = siteDefaults;
  return {
    phone: s.phone || d.phone, email: s.email || d.email, whatsapp: s.whatsapp || d.whatsapp, instagram: s.instagram || d.instagram,
    waText: { en: s.waText?.en || d.waText.en, ar: s.waText?.ar || d.waText.ar },
    footer: { en: { tagline: s.footer?.en?.tagline || d.footer.en.tagline, sub: s.footer?.en?.sub || d.footer.en.sub }, ar: { tagline: s.footer?.ar?.tagline || d.footer.ar.tagline, sub: s.footer?.ar?.sub || d.footer.ar.sub } },
  };
}
export async function getSite(): Promise<SiteSettings> {
  "use cache";
  cacheTag("settings");
  return readSettings();
}
const digits = (s: string) => s.replace(/\D/g, "");
export function contactOf(s: SiteSettings, lang: Lang): Contact {
  return { phone: s.phone, phoneHref: `tel:+${digits(s.phone)}`, email: s.email, instagram: s.instagram, whatsapp: `https://wa.me/${digits(s.whatsapp)}?text=${encodeURIComponent(s.waText[lang])}` };
}
export async function getContact(lang: Lang) { return contactOf(await getSite(), lang); }

/* Per-page SEO for the fixed pages, edited in /admin/seo. Empty fields keep the built-in copy. */
export const seoPages = ["home", "projects", "services", "studio", "contact"] as const;
export type SeoPage = (typeof seoPages)[number];
type SeoRow = { title: string; description: string; image: string; noindex: number };
export async function getPageSeo(page: SeoPage, lang: Lang): Promise<SeoRow | null> {
  "use cache";
  cacheTag("seo");
  const r = db().prepare("SELECT title, description, image, noindex FROM page_seo WHERE page = ? AND lang = ?").get(page, lang) as SeoRow | undefined;
  // node:sqlite rows have a null prototype; cached values must be plain objects
  return r ? { title: r.title, description: r.description, image: r.image, noindex: r.noindex } : null;
}
export async function withSeo(page: SeoPage, lang: Lang, meta: Metadata): Promise<Metadata> {
  const s = await getPageSeo(page, lang);
  if (!s) return meta;
  return {
    ...meta,
    ...(s.title ? { title: page === "home" ? { absolute: s.title } : s.title } : {}),
    ...(s.description ? { description: s.description } : {}),
    ...(s.image ? { openGraph: { ...(meta.openGraph ?? {}), images: [s.image] } } : {}),
    ...(s.noindex ? { robots: { index: false, follow: true } } : {}),
  };
}
