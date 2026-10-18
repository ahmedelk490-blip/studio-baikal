import { NextResponse, type NextRequest } from "next/server";
import { findRedirect } from "@/lib/redirects";

/* 1) Redirects managed in /admin/redirects win first.
   2) English is the default: old site URLs and un-prefixed paths land on their /en page.
   Static files, _next, api and uploads never reach this (see matcher). */
const legacy: Record<string, string> = { "/interior-design-services": "/en/services", "/project-stories": "/en/projects", "/about-us": "/en/studio", "/contact-us": "/en/contact" };
const langless = /^\/(projects(\/[^/.]+)?|services|studio|contact|admin)?$/;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const r = findRedirect(pathname);
  if (r) return NextResponse.redirect(new URL(r.dest, request.url), r.code);
  if (legacy[pathname]) return NextResponse.redirect(new URL(legacy[pathname], request.url), 307);
  if (langless.test(pathname)) return NextResponse.redirect(new URL(pathname === "/" ? "/en" : `/en${pathname}`, request.url), 307);
  return NextResponse.next();
}
export const config = { matcher: ["/((?!_next/|api/|uploads/|refs/|video/|brand/|icon|apple-icon|favicon|robots\\.txt|sitemap\\.xml|.*\\.(?:webp|png|jpe?g|gif|svg|ico|mp4|webm|txt|xml|json|css|js|woff2?|map)$).*)"] };
