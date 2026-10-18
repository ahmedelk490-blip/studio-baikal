import { db } from "./db";

/* Redirects edited in /admin/redirects, applied by the proxy before anything renders.
   Validation refuses system paths, the language homes, the admin, self-redirects and chains that
   would come back to where they started (loops), so a typo cannot take the site down. */
const RESERVED = /^\/(_next|api|uploads)(\/|$)|^\/(en|ar)?\/?$|^\/(en|ar)\/admin(\/|$)/;
export const norm = (p: string) => { const x = p.split(/[?#]/)[0].replace(/\/{2,}/g, "/"); return x.length > 1 ? x.replace(/\/$/, "") : x; };

export function findRedirect(path: string): { dest: string; code: number } | null {
  const r = db().prepare("SELECT id, dest, code FROM redirects WHERE src = ?").get(norm(path)) as { id: number; dest: string; code: number } | undefined;
  if (!r) return null;
  db().prepare("UPDATE redirects SET hits = hits + 1 WHERE id = ?").run(r.id);
  return r;
}

export function redirectProblem(src: string, dest: string, ignoreId = 0): string | null {
  if (!/^\/[^\s<>"'\\]*$/.test(src) || src.length > 300) return "badSource";
  if (RESERVED.test(src)) return "reserved";
  if (!/^(\/[^\s<>"'\\]*|https:\/\/[^\s<>"'\\]+)$/.test(dest) || dest.length > 500) return "badTarget";
  if (db().prepare("SELECT 1 FROM redirects WHERE src = ? AND id <> ?").get(norm(src), ignoreId)) return "duplicate";
  const seen = new Set([norm(src)]);
  let cur = dest;
  for (let i = 0; i < 20 && cur.startsWith("/"); i++) {
    const n = norm(cur);
    if (seen.has(n)) return "loop";
    seen.add(n);
    const next = db().prepare("SELECT dest FROM redirects WHERE src = ? AND id <> ?").get(n, ignoreId) as { dest: string } | undefined;
    if (!next) break;
    cur = next.dest;
  }
  return null;
}
