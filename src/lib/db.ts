import { DatabaseSync } from "node:sqlite";
import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { projects as seedProjects, localize } from "@/data/projects";

/* One SQLite file (.data/baikal.db, or DB_PATH) shared by the public site and /admin.
   Migrations are append-only and versioned in `meta.schema`; the first run seeds the current
   projects and the old leads.jsonl (backed up first) and never touches rows that already exist. */
export const DATA_DIR = path.join(process.cwd(), ".data");
const FILE = process.env.DB_PATH || path.join(DATA_DIR, "baikal.db");

const migrations: string[] = [
  `CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT NOT NULL UNIQUE COLLATE NOCASE, name TEXT NOT NULL, role TEXT NOT NULL CHECK (role IN ('super_admin','admin','editor','author','viewer')),
     pass TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, last_login TEXT);
   CREATE TABLE sessions (id TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at INTEGER NOT NULL, created_at TEXT NOT NULL, ip TEXT, ua TEXT);
   CREATE INDEX sessions_user ON sessions(user_id);
   CREATE TABLE attempts (key TEXT NOT NULL, at INTEGER NOT NULL);
   CREATE INDEX attempts_key ON attempts(key, at);
   CREATE TABLE projects (id INTEGER PRIMARY KEY, slug TEXT NOT NULL UNIQUE, status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')), featured INTEGER NOT NULL DEFAULT 0,
     sort INTEGER NOT NULL DEFAULT 0, category TEXT NOT NULL DEFAULT 'Apartment', area TEXT NOT NULL DEFAULT '', year TEXT NOT NULL DEFAULT '', cover TEXT NOT NULL DEFAULT '',
     en TEXT NOT NULL, ar TEXT NOT NULL, seo TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL, updated_at TEXT NOT NULL, updated_by INTEGER);
   CREATE INDEX projects_status ON projects(status, sort);
   CREATE TABLE project_images (id INTEGER PRIMARY KEY, project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE, src TEXT NOT NULL, room_en TEXT NOT NULL DEFAULT '',
     room_ar TEXT NOT NULL DEFAULT '', caption TEXT NOT NULL DEFAULT '', w INTEGER NOT NULL DEFAULT 0, h INTEGER NOT NULL DEFAULT 0, sort INTEGER NOT NULL DEFAULT 0);
   CREATE INDEX images_project ON project_images(project_id, sort);
   CREATE TABLE media (id INTEGER PRIMARY KEY, path TEXT NOT NULL UNIQUE, name TEXT NOT NULL, mime TEXT NOT NULL, size INTEGER NOT NULL, w INTEGER NOT NULL DEFAULT 0, h INTEGER NOT NULL DEFAULT 0,
     alt TEXT NOT NULL DEFAULT '', title TEXT NOT NULL DEFAULT '', caption TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL, uploaded_by INTEGER);
   CREATE TABLE inquiries (id TEXT PRIMARY KEY, at TEXT NOT NULL, name TEXT NOT NULL DEFAULT '', whatsapp TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '', size TEXT NOT NULL DEFAULT '',
     need TEXT NOT NULL DEFAULT '', message TEXT NOT NULL DEFAULT '', source TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','in_progress','won','lost','spam')),
     notes TEXT NOT NULL DEFAULT '', raw TEXT NOT NULL DEFAULT '{}', updated_at TEXT);
   CREATE INDEX inquiries_at ON inquiries(at DESC);
   CREATE TABLE audit (id INTEGER PRIMARY KEY, at TEXT NOT NULL, user_id INTEGER, action TEXT NOT NULL, target TEXT NOT NULL DEFAULT '', detail TEXT NOT NULL DEFAULT '');
   CREATE INDEX audit_at ON audit(at DESC);`,
  // v2 — site settings, per-page SEO, redirects, revision history
  `CREATE TABLE settings (k TEXT PRIMARY KEY, v TEXT NOT NULL, updated_at TEXT NOT NULL, updated_by INTEGER);
   CREATE TABLE page_seo (page TEXT NOT NULL, lang TEXT NOT NULL CHECK (lang IN ('en','ar')), title TEXT NOT NULL DEFAULT '', description TEXT NOT NULL DEFAULT '',
     image TEXT NOT NULL DEFAULT '', noindex INTEGER NOT NULL DEFAULT 0, updated_at TEXT, PRIMARY KEY (page, lang));
   CREATE TABLE redirects (id INTEGER PRIMARY KEY, src TEXT NOT NULL UNIQUE, dest TEXT NOT NULL, code INTEGER NOT NULL DEFAULT 301 CHECK (code IN (301,302,307,308)),
     hits INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, created_by INTEGER);
   CREATE TABLE revisions (id INTEGER PRIMARY KEY, entity TEXT NOT NULL, entity_id TEXT NOT NULL, data TEXT NOT NULL, at TEXT NOT NULL, user_id INTEGER, note TEXT NOT NULL DEFAULT '');
   CREATE INDEX revisions_entity ON revisions(entity, entity_id, id DESC);`,
];

/* Keeps the previous state of something before it is overwritten (projects, settings). */
export function snapshot(entity: string, id: string | number, data: unknown, userId: number | null, note = "") {
  db().prepare("INSERT INTO revisions (entity, entity_id, data, at, user_id, note) VALUES (?,?,?,?,?,?)").run(entity, String(id), JSON.stringify(data), new Date().toISOString(), userId, note.slice(0, 120));
}

export type ProjectText = { name: string; type: string; location: string; style: string; scope: string; blurb: string; story: string; materials: string[] };

function seed(db: DatabaseSync) {
  const now = new Date().toISOString();
  if ((db.prepare("SELECT COUNT(*) n FROM projects").get() as { n: number }).n === 0) {
    const ins = db.prepare("INSERT INTO projects (slug,status,featured,sort,category,area,year,cover,en,ar,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)");
    const img = db.prepare("INSERT INTO project_images (project_id,src,room_en,room_ar,w,h,sort) VALUES (?,?,?,?,?,?,?)");
    const pick = (p: ReturnType<typeof localize>): ProjectText => ({ name: p.name, type: p.type, location: p.location, style: p.style, scope: p.scope, blurb: p.blurb, story: p.story, materials: p.materials });
    seedProjects.forEach((p, k) => {
      const a = localize(p, "ar");
      const id = Number(ins.run(p.slug, "published", ["el-nakhil-villa", "october-250", "tagamo3-115"].includes(p.slug) ? 1 : 0, k, p.type, p.area, p.year, p.cover, JSON.stringify(pick(p)), JSON.stringify(pick(a)), now, now).lastInsertRowid);
      p.images.forEach((i, j) => img.run(id, i.src, i.room, a.images[j]?.room ?? i.room, i.w, i.h, j));
    });
  }
  const leads = path.join(DATA_DIR, "leads.jsonl");
  if (existsSync(leads) && (db.prepare("SELECT COUNT(*) n FROM inquiries").get() as { n: number }).n === 0) {
    copyFileSync(leads, `${leads}.backup-${Date.now()}`);
    const ins = db.prepare("INSERT OR IGNORE INTO inquiries (id,at,name,whatsapp,email,size,need,message,source,raw) VALUES (?,?,?,?,?,?,?,?,?,?)");
    for (const line of readFileSync(leads, "utf8").split("\n").filter(Boolean)) {
      try { const l = JSON.parse(line); ins.run(String(l.id), String(l.at), String(l.name ?? ""), String(l.whatsapp ?? l.phone ?? ""), String(l.email ?? ""), String(l.size ?? ""), String(l.need ?? ""), String(l.message ?? ""), String(l.source ?? ""), line); } catch {}
    }
  }
}

function open() {
  mkdirSync(path.dirname(FILE), { recursive: true });
  const db = new DatabaseSync(FILE);
  db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 4000; CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT NOT NULL)");
  const v = Number((db.prepare("SELECT v FROM meta WHERE k='schema'").get() as { v: string } | undefined)?.v ?? 0);
  for (let i = v; i < migrations.length; i++) tx(db, () => { db.exec(migrations[i]); db.prepare("INSERT OR REPLACE INTO meta (k,v) VALUES ('schema',?)").run(String(i + 1)); });
  tx(db, () => seed(db));
  return db;
}

/* Runs fn inside BEGIN/COMMIT, rolling back on any error. */
export function tx<T>(db: DatabaseSync, fn: () => T): T {
  db.exec("BEGIN IMMEDIATE");
  try { const r = fn(); db.exec("COMMIT"); return r; } catch (e) { db.exec("ROLLBACK"); throw e; }
}

const g = globalThis as unknown as { __bkdb?: DatabaseSync };
export function db() { return (g.__bkdb ??= open()); }

export function audit(userId: number | null, action: string, target = "", detail = "") {
  db().prepare("INSERT INTO audit (at,user_id,action,target,detail) VALUES (?,?,?,?,?)").run(new Date().toISOString(), userId, action, target, detail.slice(0, 500));
}
