import { NextResponse, type NextRequest } from "next/server";

/* English is the default. Old site URLs and un-prefixed paths land on their /en page. */
const legacy: Record<string, string> = { "/interior-design-services": "/en/services", "/project-stories": "/en/projects", "/about-us": "/en/studio", "/contact-us": "/en/contact" };
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const target = legacy[pathname] ?? (pathname === "/" ? "/en" : `/en${pathname}`);
  return NextResponse.redirect(new URL(target, request.url), 307);
}
export const config = { matcher: ["/", "/projects", "/projects/:slug", "/services", "/studio", "/contact", "/admin", "/interior-design-services", "/project-stories", "/about-us", "/contact-us"] };
