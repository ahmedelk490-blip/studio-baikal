import { readFile } from "node:fs/promises";
import path from "node:path";
import { DATA_DIR } from "@/lib/db";

/* Serves files uploaded through /admin (they live in .data/uploads, outside the build, so they
   survive redeploys). Paths are whitelisted and resolved inside the uploads folder only. */
const ROOT = path.join(DATA_DIR, "uploads");
const TYPES: Record<string, string> = { ".webp": "image/webp", ".pdf": "application/pdf" };

export async function GET(_: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const rel = (await params).path.join("/");
  const type = TYPES[path.extname(rel).toLowerCase()];
  const file = path.join(ROOT, rel);
  if (!type || !/^[\w\-/]+\.\w+$/.test(rel) || !file.startsWith(ROOT + path.sep)) return new Response("Not found", { status: 404 });
  const body = await readFile(file).catch(() => null);
  if (!body) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(body), { headers: { "content-type": type, "cache-control": "public, max-age=31536000, immutable", "x-content-type-options": "nosniff", ...(type === "application/pdf" ? { "content-disposition": "inline" } : {}) } });
}
