// the static build (output: export) needs this; it is what the file is anyway
export const dynamic = "force-static";
import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/en/admin", "/ar/admin", "/api/", "/refs/"] }], sitemap: "https://baikalstudio.com/sitemap.xml" };
}