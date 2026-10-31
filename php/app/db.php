<?php
declare(strict_types=1);
/* One SQLite file, the same schema the Next.js admin used (projects with EN/AR JSON, images, inquiries,
   users, settings, page_seo, redirects), opened through PDO. */
function db(): PDO {
  static $pdo = null;
  if ($pdo) return $pdo;
  if (!is_dir(DATA_DIR)) @mkdir(DATA_DIR, 0755, true);
  $fresh = !file_exists(DB_FILE);
  $pdo = new PDO('sqlite:' . DB_FILE, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
  $pdo->exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 4000;');
  $pdo->exec("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT NOT NULL UNIQUE COLLATE NOCASE, name TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'super_admin', pass TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, last_login TEXT);
    CREATE TABLE IF NOT EXISTS attempts (key TEXT NOT NULL, at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY, slug TEXT NOT NULL UNIQUE, status TEXT NOT NULL DEFAULT 'draft', featured INTEGER NOT NULL DEFAULT 0, sort INTEGER NOT NULL DEFAULT 0, category TEXT NOT NULL DEFAULT 'Apartment', area TEXT NOT NULL DEFAULT '', year TEXT NOT NULL DEFAULT '', cover TEXT NOT NULL DEFAULT '', en TEXT NOT NULL, ar TEXT NOT NULL, seo TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL, updated_at TEXT NOT NULL, updated_by INTEGER);
    CREATE TABLE IF NOT EXISTS project_images (id INTEGER PRIMARY KEY, project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE, src TEXT NOT NULL, room_en TEXT NOT NULL DEFAULT '', room_ar TEXT NOT NULL DEFAULT '', caption TEXT NOT NULL DEFAULT '', w INTEGER NOT NULL DEFAULT 0, h INTEGER NOT NULL DEFAULT 0, sort INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS inquiries (id TEXT PRIMARY KEY, at TEXT NOT NULL, name TEXT NOT NULL DEFAULT '', whatsapp TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '', size TEXT NOT NULL DEFAULT '', need TEXT NOT NULL DEFAULT '', message TEXT NOT NULL DEFAULT '', source TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'new', notes TEXT NOT NULL DEFAULT '', raw TEXT NOT NULL DEFAULT '{}', updated_at TEXT);
    CREATE TABLE IF NOT EXISTS settings (k TEXT PRIMARY KEY, v TEXT NOT NULL, updated_at TEXT NOT NULL, updated_by INTEGER);
    CREATE TABLE IF NOT EXISTS page_seo (page TEXT NOT NULL, lang TEXT NOT NULL, title TEXT NOT NULL DEFAULT '', description TEXT NOT NULL DEFAULT '', image TEXT NOT NULL DEFAULT '', noindex INTEGER NOT NULL DEFAULT 0, updated_at TEXT, PRIMARY KEY (page, lang));
    CREATE TABLE IF NOT EXISTS redirects (id INTEGER PRIMARY KEY, src TEXT NOT NULL UNIQUE, dest TEXT NOT NULL, code INTEGER NOT NULL DEFAULT 301, hits INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, created_by INTEGER);");
  if ($fresh) seed_from_file($pdo);
  return $pdo;
}
/* First run without a database: load data/seed.json (projects, images, settings, users) if it is there. */
function seed_from_file(PDO $pdo): void {
  $f = DATA_DIR . '/seed.json';
  if (!file_exists($f)) return;
  $s = json_decode((string) file_get_contents($f), true) ?: [];
  $now = gmdate('c');
  foreach ($s['projects'] ?? [] as $p) {
    $pdo->prepare('INSERT INTO projects (slug,status,featured,sort,category,area,year,cover,en,ar,seo,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)')
      ->execute([$p['slug'], $p['status'], $p['featured'], $p['sort'], $p['category'], $p['area'], $p['year'], $p['cover'], $p['en'], $p['ar'], $p['seo'] ?? '{}', $now, $now]);
    $id = (int) $pdo->lastInsertId();
    foreach ($p['images'] as $i => $im) $pdo->prepare('INSERT INTO project_images (project_id,src,room_en,room_ar,w,h,sort) VALUES (?,?,?,?,?,?,?)')->execute([$id, $im['src'], $im['room_en'], $im['room_ar'], $im['w'], $im['h'], $i]);
  }
  foreach ($s['settings'] ?? [] as $k => $v) $pdo->prepare('INSERT INTO settings (k,v,updated_at) VALUES (?,?,?)')->execute([$k, is_string($v) ? $v : json_encode($v, JSON_UNESCAPED_UNICODE), $now]);
  foreach ($s['users'] ?? [] as $u) $pdo->prepare('INSERT INTO users (email,name,role,pass,created_at) VALUES (?,?,?,?,?)')->execute([$u['email'], $u['name'], 'super_admin', $u['pass'], $now]);
}
function q(string $sql, array $args = []): PDOStatement { $st = db()->prepare($sql); $st->execute($args); return $st; }
function one(string $sql, array $args = []): ?array { $r = q($sql, $args)->fetch(); return $r === false ? null : $r; }
function all(string $sql, array $args = []): array { return q($sql, $args)->fetchAll(); }
