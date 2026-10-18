"use server";
import { rm } from "node:fs/promises";
import path from "node:path";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { refresh, updateTag } from "next/cache";
import { audit, db, DATA_DIR, tx, type ProjectText } from "@/lib/db";
import { assertCan, clearFails, clientIp, currentUser, endAllSessions, hashPassword, locked, passwordProblem, recordFail, startSession, verifyPassword } from "@/lib/auth";
import { roles, type Role } from "@/lib/perm";

/* Every admin mutation. Each one checks the caller's permission on the server before touching data,
   validates its input, writes inside a transaction where several rows change, logs to `audit`, and
   expires the public "projects" cache when the website content changed. Server Actions also carry
   Next's built-in Origin check, which is the CSRF protection here. */
const L = (fd: FormData) => (fd.get("lang") === "ar" ? "ar" : "en");
const s = (fd: FormData, k: string, max = 300) => String(fd.get(k) ?? "").trim().slice(0, max);
const go = (lang: string, to: string, msg: string): never => {
  const [p, hash] = to.split("#");
  return redirect(`/${lang}/admin${p}${p.includes("?") ? "&" : "?"}msg=${msg}${hash ? `#${hash}` : ""}`);
};
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CATS = ["Villa", "Apartment", "Clinic", "Office", "Retail", "Exterior"];

/* ---------- session ---------- */
export async function login(_: { error?: string } | null, fd: FormData): Promise<{ error?: string }> {
  const lang = L(fd), email = s(fd, "email", 200).toLowerCase(), pw = String(fd.get("password") ?? "").slice(0, 200);
  const ip = clientIp(await headers());
  if (locked(`ip:${ip}`, `em:${email}`)) return { error: "lockedOut" };
  const u = db().prepare("SELECT id, pass FROM users WHERE email = ? AND active = 1").get(email) as { id: number; pass: string } | undefined;
  const ok = u ? verifyPassword(pw, u.pass) : (verifyPassword(pw, "scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA==$" + "A".repeat(86)), false);
  if (!u || !ok) { recordFail(`ip:${ip}`, `em:${email}`); audit(null, "login.fail", email); return { error: "badLogin" }; }
  clearFails(`ip:${ip}`, `em:${email}`);
  await startSession(u.id);
  audit(u.id, "login", email);
  redirect(`/${lang}/admin`);
}

/* ---------- projects ---------- */
export async function createProject(fd: FormData) {
  const lang = L(fd), u = await assertCan("projects.edit");
  const slug = s(fd, "slug", 80).toLowerCase(), name = s(fd, "name", 120);
  if (!SLUG.test(slug) || !name) go(lang, "/projects", "error");
  if (db().prepare("SELECT 1 FROM projects WHERE slug = ?").get(slug)) go(lang, "/projects", "slugTaken");
  const now = new Date().toISOString();
  const text: ProjectText = { name, type: "", location: "", style: "", scope: "", blurb: "", story: "", materials: [] };
  const max = (db().prepare("SELECT COALESCE(MAX(sort), -1) m FROM projects").get() as { m: number }).m;
  const id = Number(db().prepare("INSERT INTO projects (slug,status,sort,en,ar,created_at,updated_at,updated_by) VALUES (?,?,?,?,?,?,?,?)").run(slug, "draft", max + 1, JSON.stringify(text), JSON.stringify(text), now, now, u.id).lastInsertRowid);
  audit(u.id, "project.create", slug);
  go(lang, `/projects/${id}`, "created");
}

export async function saveProject(fd: FormData) {
  const lang = L(fd), u = await assertCan("projects.edit");
  const id = Number(fd.get("id")), slug = s(fd, "slug", 80).toLowerCase();
  const cur = db().prepare("SELECT status FROM projects WHERE id = ?").get(id) as { status: string } | undefined;
  if (!cur || !SLUG.test(slug)) go(lang, `/projects/${id}`, "error");
  if (db().prepare("SELECT 1 FROM projects WHERE slug = ? AND id <> ?").get(slug, id)) go(lang, `/projects/${id}`, "slugTaken");
  let status = s(fd, "status", 10) === "published" ? "published" : "draft";
  if (status !== cur!.status) { try { await assertCan("projects.publish"); } catch { status = cur!.status; } }
  const text = (p: "en" | "ar"): ProjectText => ({
    name: s(fd, `${p}_name`, 120), type: s(fd, `${p}_type`, 60), location: s(fd, `${p}_location`, 200), style: s(fd, `${p}_style`, 80), scope: s(fd, `${p}_scope`, 120),
    blurb: s(fd, `${p}_blurb`, 600), story: s(fd, `${p}_story`, 4000), materials: s(fd, `${p}_materials`, 1500).split("\n").map((m) => m.trim()).filter(Boolean).slice(0, 20),
  });
  const en = text("en"), ar = text("ar");
  if (!en.name) go(lang, `/projects/${id}`, "error");
  if (!ar.name) ar.name = en.name;
  const seo = { en: { title: s(fd, "seo_en_title", 70), description: s(fd, "seo_en_desc", 170) }, ar: { title: s(fd, "seo_ar_title", 70), description: s(fd, "seo_ar_desc", 170) } };
  const category = CATS.includes(s(fd, "category")) ? s(fd, "category") : "Apartment";
  const cover = s(fd, "cover", 300);
  const okCover = !cover || !!db().prepare("SELECT 1 FROM project_images WHERE project_id = ? AND src = ?").get(id, cover);
  db().prepare("UPDATE projects SET slug=?, status=?, featured=?, sort=?, category=?, area=?, year=?, cover=?, en=?, ar=?, seo=?, updated_at=?, updated_by=? WHERE id=?")
    .run(slug, status, fd.get("featured") ? 1 : 0, Math.max(0, Math.min(999, Number(fd.get("sort")) || 0)), category, s(fd, "area", 40), s(fd, "year", 10), okCover ? cover : "", JSON.stringify(en), JSON.stringify(ar), JSON.stringify(seo), new Date().toISOString(), u.id, id);
  audit(u.id, "project.save", slug, status);
  updateTag("projects");
  go(lang, `/projects/${id}`, "saved");
}

export async function deleteProject(fd: FormData) {
  const lang = L(fd), u = await assertCan("projects.delete");
  const id = Number(fd.get("id"));
  if (fd.get("confirm") !== "yes") go(lang, `/projects/${id}`, "confirm");
  const row = db().prepare("SELECT slug FROM projects WHERE id = ?").get(id) as { slug: string } | undefined;
  if (!row) go(lang, "/projects", "error");
  db().prepare("DELETE FROM projects WHERE id = ?").run(id);
  audit(u.id, "project.delete", row!.slug);
  updateTag("projects");
  go(lang, "/projects", "deleted");
}

export async function galleryAction(fd: FormData) {
  const lang = L(fd), u = await assertCan("projects.edit");
  const pid = Number(fd.get("project")), iid = Number(fd.get("image")), op = s(fd, "op", 10);
  const d = db();
  const list = d.prepare("SELECT id FROM project_images WHERE project_id = ? ORDER BY sort, id").all(pid) as { id: number }[];
  const k = list.findIndex((r) => r.id === iid);
  if (k < 0) go(lang, `/projects/${pid}`, "error");
  tx(d, () => {
    if (op === "up" || op === "down") {
      const j = op === "up" ? k - 1 : k + 1;
      if (j >= 0 && j < list.length) [list[k], list[j]] = [list[j], list[k]];
      list.forEach((r, n) => d.prepare("UPDATE project_images SET sort = ? WHERE id = ?").run(n, r.id));
    } else if (op === "remove") {
      d.prepare("DELETE FROM project_images WHERE id = ? AND project_id = ?").run(iid, pid);
    } else {
      d.prepare("UPDATE project_images SET room_en = ?, room_ar = ?, caption = ? WHERE id = ? AND project_id = ?").run(s(fd, "room_en", 80), s(fd, "room_ar", 80), s(fd, "caption", 300), iid, pid);
    }
    d.prepare("UPDATE projects SET updated_at = ?, updated_by = ? WHERE id = ?").run(new Date().toISOString(), u.id, pid);
  });
  audit(u.id, `gallery.${op || "save"}`, String(pid), String(iid));
  updateTag("projects");
  go(lang, `/projects/${pid}#gallery`, "saved");
}

export async function addImages(fd: FormData) {
  const lang = L(fd), u = await assertCan("projects.edit");
  const pid = Number(fd.get("project"));
  const ids = fd.getAll("media").map(Number).filter(Boolean).slice(0, 60);
  const d = db();
  if (!d.prepare("SELECT 1 FROM projects WHERE id = ?").get(pid)) go(lang, "/projects", "error");
  tx(d, () => {
    let n = (d.prepare("SELECT COALESCE(MAX(sort), -1) m FROM project_images WHERE project_id = ?").get(pid) as { m: number }).m;
    for (const id of ids) {
      const m = d.prepare("SELECT path, w, h, title FROM media WHERE id = ? AND mime LIKE 'image/%'").get(id) as { path: string; w: number; h: number; title: string } | undefined;
      if (m) d.prepare("INSERT INTO project_images (project_id, src, room_en, w, h, sort) VALUES (?,?,?,?,?,?)").run(pid, m.path, m.title, m.w, m.h, ++n);
    }
  });
  audit(u.id, "gallery.add", String(pid), `${ids.length} images`);
  updateTag("projects");
  go(lang, `/projects/${pid}#gallery`, "saved");
}

/* ---------- inquiries ---------- */
const STATUSES = ["new", "contacted", "in_progress", "won", "lost", "spam"];
export async function updateInquiry(fd: FormData) {
  const lang = L(fd), u = await assertCan("inquiries.edit");
  const id = s(fd, "id", 60), status = s(fd, "status", 20);
  if (!STATUSES.includes(status)) go(lang, "/inquiries", "error");
  db().prepare("UPDATE inquiries SET status = ?, notes = ?, updated_at = ? WHERE id = ?").run(status, s(fd, "notes", 4000), new Date().toISOString(), id);
  audit(u.id, "inquiry.update", id, status);
  refresh();
  go(lang, `/inquiries?${new URLSearchParams({ q: s(fd, "q", 80), st: s(fd, "st", 20), page: s(fd, "page", 5) })}`, "saved");
}

/* ---------- media ---------- */
export async function updateMedia(fd: FormData) {
  const lang = L(fd), u = await assertCan("media.upload");
  const id = Number(fd.get("id"));
  db().prepare("UPDATE media SET alt = ?, title = ?, caption = ? WHERE id = ?").run(s(fd, "alt", 200), s(fd, "title", 120), s(fd, "caption", 300), id);
  audit(u.id, "media.update", String(id));
  go(lang, `/media?q=${encodeURIComponent(s(fd, "q", 80))}`, "saved");
}
export async function deleteMedia(fd: FormData) {
  const lang = L(fd), u = await assertCan("media.delete");
  const id = Number(fd.get("id"));
  const m = db().prepare("SELECT path FROM media WHERE id = ?").get(id) as { path: string } | undefined;
  if (!m) go(lang, "/media", "error");
  const used = db().prepare("SELECT 1 FROM project_images WHERE src = ? UNION SELECT 1 FROM projects WHERE cover = ?").get(m!.path, m!.path);
  if (used) go(lang, "/media", "inUse");
  db().prepare("DELETE FROM media WHERE id = ?").run(id);
  const file = path.join(DATA_DIR, "uploads", m!.path.replace(/^\/uploads\//, ""));
  if (file.startsWith(path.join(DATA_DIR, "uploads"))) await rm(file, { force: true });
  audit(u.id, "media.delete", m!.path);
  go(lang, "/media", "deleted");
}

/* ---------- users ---------- */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export async function createUser(fd: FormData) {
  const lang = L(fd), u = await assertCan("users.manage");
  const email = s(fd, "email", 200).toLowerCase(), name = s(fd, "name", 80), role = s(fd, "role", 20) as Role, pw = String(fd.get("password") ?? "");
  if (!EMAIL.test(email) || !name || !roles.includes(role) || passwordProblem(pw)) go(lang, "/users", "error");
  if (db().prepare("SELECT 1 FROM users WHERE email = ?").get(email)) go(lang, "/users", "emailTaken");
  db().prepare("INSERT INTO users (email,name,role,pass,created_at) VALUES (?,?,?,?,?)").run(email, name, role, hashPassword(pw), new Date().toISOString());
  audit(u.id, "user.create", email, role);
  go(lang, "/users", "created");
}
export async function updateUser(fd: FormData) {
  const lang = L(fd), u = await assertCan("users.manage");
  const id = Number(fd.get("id")), role = s(fd, "role", 20) as Role, active = fd.get("active") ? 1 : 0, pw = String(fd.get("password") ?? "");
  if (!roles.includes(role)) go(lang, "/users", "error");
  if (id === u.id && (role !== u.role || !active)) go(lang, "/users", "self");
  if (pw && passwordProblem(pw)) go(lang, "/users", "error");
  db().prepare("UPDATE users SET role = ?, active = ? WHERE id = ?").run(role, active, id);
  if (pw) { db().prepare("UPDATE users SET pass = ? WHERE id = ?").run(hashPassword(pw), id); endAllSessions(id); }
  if (!active) endAllSessions(id);
  audit(u.id, "user.update", String(id), `${role}${active ? "" : " (disabled)"}${pw ? " +password" : ""}`);
  go(lang, "/users", "saved");
}
export async function changePassword(_: { error?: string; ok?: boolean } | null, fd: FormData): Promise<{ error?: string; ok?: boolean }> {
  const u = await currentUser();
  if (!u) return { error: "error" };
  const row = db().prepare("SELECT pass FROM users WHERE id = ?").get(u.id) as { pass: string };
  if (!verifyPassword(String(fd.get("current") ?? ""), row.pass)) return { error: "badLogin" };
  const pw = String(fd.get("password") ?? "");
  if (passwordProblem(pw)) return { error: "pwRule" };
  db().prepare("UPDATE users SET pass = ? WHERE id = ?").run(hashPassword(pw), u.id);
  endAllSessions(u.id);
  await startSession(u.id);
  audit(u.id, "user.password");
  return { ok: true };
}
