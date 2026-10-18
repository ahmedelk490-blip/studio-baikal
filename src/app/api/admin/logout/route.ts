import { audit } from "@/lib/db";
import { currentUser, endAllSessions, endSession } from "@/lib/auth";

/* Sign-out as a plain form POST answered with a 303, so the browser does a full page load and no
   admin content stays in the tab's memory afterwards. `all=1` ends every session of this user. */
export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.headers.get("host")) return new Response("Forbidden", { status: 403 });
  const fd = await req.formData().catch(() => null);
  const lang = fd?.get("lang") === "ar" ? "ar" : "en";
  const u = await currentUser();
  if (u && fd?.get("all") === "1") endAllSessions(u.id);
  await endSession();
  if (u) audit(u.id, fd?.get("all") === "1" ? "logout.all" : "logout");
  return new Response(null, { status: 303, headers: { location: `/${lang}/admin/login`, "cache-control": "no-store" } });
}
