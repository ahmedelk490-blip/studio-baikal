import { NextResponse, type NextRequest } from "next/server";

/* English is the default: "/" -> "/en"; old un-prefixed paths -> "/en/...". */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const target = pathname === "/" ? "/en" : `/en${pathname}`;
  return NextResponse.redirect(new URL(target, request.url), 308);
}
export const config = { matcher: ["/", "/projects/:slug", "/admin"] };
