import { cookies } from "next/headers";

// Token travels in the POST body once, then lives in an httpOnly cookie — never in a URL.
export async function POST(request: Request) {
  const form = await request.formData();
  if (!process.env.ADMIN_TOKEN || form.get("token") !== process.env.ADMIN_TOKEN) return new Response("Unauthorized", { status: 401 });
  (await cookies()).set("admin", process.env.ADMIN_TOKEN, { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 12 });
  return Response.redirect(new URL("/admin", request.url), 303);
}
