import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { assertCan } from "@/lib/auth";
import { audit, db, DATA_DIR } from "@/lib/db";

/* Media upload (one file per request). Signed-in users with media.upload only; same-origin only;
   the type is decided from the file's own bytes, not its name; images are re-encoded to WebP
   (max 2400px, EXIF orientation applied, metadata dropped), PDFs are stored as they are. */
const MAX = 15 * 1024 * 1024;
const kind = (b: Buffer) =>
  b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff ? "image" :
  b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) ? "image" :
  b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP" ? "image" :
  b.toString("ascii", 0, 5) === "%PDF-" ? "pdf" : null;

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.headers.get("host")) return Response.json({ error: "origin" }, { status: 403 });
  let user;
  try { user = await assertCan("media.upload"); } catch { return Response.json({ error: "forbidden" }, { status: 403 }); }
  if (Number(req.headers.get("content-length") ?? 0) > MAX + 64 * 1024) return Response.json({ error: "too large (15 MB max)" }, { status: 413 });
  const f = (await req.formData().catch(() => null))?.get("file");
  if (!(f instanceof File)) return Response.json({ error: "no file" }, { status: 400 });
  if (f.size > MAX) return Response.json({ error: "too large (15 MB max)" }, { status: 413 });
  const raw = Buffer.from(await f.arrayBuffer());
  const k = kind(raw);
  if (!k) return Response.json({ error: "only JPG, PNG, WebP or PDF" }, { status: 415 });
  let out = raw, w = 0, h = 0, mime = "application/pdf", ext = "pdf";
  if (k === "image") {
    try {
      const r = await sharp(raw, { limitInputPixels: 80_000_000 }).rotate().resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
      out = r.data; w = r.info.width; h = r.info.height; mime = "image/webp"; ext = "webp";
    } catch { return Response.json({ error: "unreadable image" }, { status: 422 }); }
  }
  const now = new Date();
  const rel = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${randomUUID()}.${ext}`;
  const file = path.join(DATA_DIR, "uploads", rel);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, out);
  const name = f.name.replace(/[^\p{L}\p{N}._ -]/gu, "").slice(0, 120) || `file.${ext}`;
  const title = name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim().slice(0, 120);
  const id = Number(db().prepare("INSERT INTO media (path,name,mime,size,w,h,title,created_at,uploaded_by) VALUES (?,?,?,?,?,?,?,?,?)").run(`/uploads/${rel}`, name, mime, out.length, w, h, title, now.toISOString(), user.id).lastInsertRowid);
  audit(user.id, "media.upload", `/uploads/${rel}`, name);
  return Response.json({ ok: true, id, path: `/uploads/${rel}` });
}
