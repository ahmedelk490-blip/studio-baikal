import { NextResponse, type NextRequest } from "next/server";

/* "/" -> "/en" (or "/ar" when the browser prefers Arabic). Everything else passes through. */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname !== "/") return NextResponse.redirect(new URL(`/en${pathname}`, request.url), 308);
  const al = request.headers.get("accept-language") ?? "";
  const lang = /^ar\b|,\s*ar\b/i.test(al) ? "ar" : "en";
  return NextResponse.redirect(new URL(`/${lang}`, request.url));
}
export const config = { matcher: ["/", "/projects/:path*", "/admin"] };