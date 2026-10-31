// Packages the PHP edition for a plain PHP host (the client's Hostinger Single plan):
//   node scripts/build-php.mjs            → dist-php/ and baikalstudio-php.zip (upload to public_html)
// It copies php/ (the app), the photos with 480/960 px copies, brand, video, icons, the compiled
// stylesheet and fonts of the Next.js build (from the static export), and writes data/seed.json from the
// last server database with a fresh admin password (saved to .data/ADMIN_LOGIN-php.txt, never printed).
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { DatabaseSync } from "node:sqlite";
import { randomBytes } from "node:crypto";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const dist = path.join(root, "dist-php");
const STATIC = process.env.STATIC_DIR || "D:/555Wooork/_claude-tmp/baikal-static";
const DB = process.env.SEED_DB || path.join(root, ".data/server-backup-20261029/baikal.db");
const PHP = process.env.PHP_BIN || "D:/dev-cache/php/php.exe";
const walk = (d) => readdirSync(d).flatMap((f) => { const p = path.join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });

rmSync(dist, { recursive: true, force: true });
cpSync(path.join(root, "php"), dist, { recursive: true, filter: (s) => !s.endsWith("baikal.db") && !/baikal\.db-(wal|shm)$/.test(s) });
for (const d of ["projects", "brand", "video"]) cpSync(path.join(root, "public", d), path.join(dist, d), { recursive: true });
cpSync(path.join(root, "src/app/icon.png"), path.join(dist, "icon.png"));
cpSync(path.join(root, "src/app/apple-icon.png"), path.join(dist, "apple-icon.png"));

// the stylesheet and fonts: the two css chunks of the export become fonts.css (the one with @font-face) and site.css
const chunks = path.join(STATIC, "_next/static/chunks");
const css = readdirSync(chunks).filter((f) => f.endsWith(".css")).map((f) => ({ f, text: readFileSync(path.join(chunks, f), "utf8") }));
const fonts = css.find((c) => c.text.includes("@font-face")), site = css.find((c) => c !== fonts);
mkdirSync(path.join(dist, "_next/static/chunks"), { recursive: true });
writeFileSync(path.join(dist, "_next/static/chunks/fonts.css"), fonts.text);
writeFileSync(path.join(dist, "_next/static/chunks/site.css"), site.text);
cpSync(path.join(STATIC, "_next/static/media"), path.join(dist, "_next/static/media"), { recursive: true });

// 480 and 960 px copies of every project photo
let made = 0;
for (const f of walk(path.join(dist, "projects")).filter((f) => f.endsWith(".webp") && !/\.w\d+\.webp$/.test(f))) {
  const { width = 0 } = await sharp(f).metadata();
  for (const w of [480, 960]) { const t = f.replace(/\.webp$/, `.w${w}.webp`); if (width > w) { await sharp(f).resize({ width: w }).webp({ quality: 80 }).toFile(t); made++; } else cpSync(f, t); }
}

// the seed: projects, their photos and the settings from the last server database, one admin
const db = new DatabaseSync(DB, { readOnly: true });
const projects = db.prepare("SELECT * FROM projects ORDER BY sort, id").all().map((p) => ({
  slug: p.slug, status: p.status, featured: p.featured, sort: p.sort, category: p.category, area: p.area, year: p.year, cover: p.cover, en: p.en, ar: p.ar, seo: p.seo,
  images: db.prepare("SELECT src, room_en, room_ar, w, h FROM project_images WHERE project_id = ? ORDER BY sort, id").all(p.id).map((i) => ({ ...i })),
}));
const settings = Object.fromEntries(db.prepare("SELECT k, v FROM settings").all().map((r) => [r.k, r.v]));
const email = "design@baikalstudio.com";
const password = randomBytes(9).toString("base64url");
const hash = execFileSync(PHP, ["-r", "echo password_hash($argv[1], PASSWORD_BCRYPT);", password]).toString().trim();
mkdirSync(path.join(dist, "data"), { recursive: true });
writeFileSync(path.join(dist, "data/seed.json"), JSON.stringify({ projects, settings, users: [{ email, name: "Studio Baikal", pass: hash }] }, null, 0));
writeFileSync(path.join(dist, "data/.htaccess"), "Require all denied\n");
mkdirSync(path.join(root, ".data"), { recursive: true });
writeFileSync(path.join(root, ".data/ADMIN_LOGIN-php.txt"), `لوحة التحكم: https://baikalstudio.com/admin\nالبريد: ${email}\nكلمة السر: ${password}\n(غيّرها من الإعدادات بعد أول دخول)\n`);

const zip = path.join(root, "..", "_claude-tmp", "baikalstudio-php.zip");
rmSync(zip, { force: true });
execFileSync("powershell", ["-NoProfile", "-Command", `Compress-Archive -Path '${dist.replace(/\//g, "\\")}\\*' -DestinationPath '${zip.replace(/\//g, "\\")}' -CompressionLevel Optimal`]);
console.log(`dist-php ready: ${projects.length} projects, ${made} resized photos, zip at ${zip}`);
