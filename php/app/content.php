<?php
declare(strict_types=1);
/* Public reads: published projects (text in the page's language), site settings, SEO rows, redirects. */
function settings(): array {
  static $s = null;
  if ($s !== null) return $s;
  $row = one("SELECT v FROM settings WHERE k = 'site'");
  $v = $row ? (json_decode($row['v'], true) ?: []) : [];
  $d = ['phone' => '+20 111 0004623', 'email' => 'design@baikalstudio.com', 'whatsapp' => '201110004623', 'instagram' => 'https://www.instagram.com/studio_baikal/',
    'waText' => ['en' => "Hi Studio Baikal, I'd like a free consultation", 'ar' => 'مرحبًا استوديو بايكال، أرغب في استشارة مجانية'],
    'footer' => ['en' => ['tagline' => DICT['en']['footer']['tagline'], 'sub' => DICT['en']['footer']['sub']], 'ar' => ['tagline' => DICT['ar']['footer']['tagline'], 'sub' => DICT['ar']['footer']['sub']]]];
  foreach (['phone', 'email', 'whatsapp', 'instagram'] as $k) $d[$k] = trim((string) ($v[$k] ?? '')) ?: $d[$k];
  foreach (LANGS as $l) { $d['waText'][$l] = trim((string) ($v['waText'][$l] ?? '')) ?: $d['waText'][$l]; foreach (['tagline', 'sub'] as $k) $d['footer'][$l][$k] = trim((string) ($v['footer'][$l][$k] ?? '')) ?: $d['footer'][$l][$k]; }
  return $s = $d;
}
function contact_info(): array {
  $s = settings(); $digits = fn($x) => preg_replace('/\D/', '', $x);
  return ['phone' => $s['phone'], 'phoneHref' => 'tel:+' . $digits($s['phone']), 'email' => $s['email'], 'instagram' => $s['instagram'],
    'whatsapp' => 'https://wa.me/' . $digits($s['whatsapp']) . '?text=' . rawurlencode($s['waText'][lang()])];
}
function shape_project(array $r): array {
  $t = json_decode(is_ar() ? $r['ar'] : $r['en'], true) ?: [];
  $imgs = all('SELECT src, room_en, room_ar, w, h FROM project_images WHERE project_id = ? ORDER BY sort, id', [$r['id']]);
  $images = array_map(fn($i) => ['src' => $i['src'], 'room' => (is_ar() ? $i['room_ar'] : $i['room_en']) ?: $i['room_en'], 'w' => (int) $i['w'], 'h' => (int) $i['h']], $imgs);
  $seo = json_decode($r['seo'] ?: '{}', true) ?: [];
  return ['id' => (int) $r['id'], 'slug' => $r['slug'], 'name' => $t['name'] ?? $r['slug'], 'type' => $t['type'] ?? '', 'location' => $t['location'] ?? '', 'style' => $t['style'] ?? '', 'scope' => $t['scope'] ?? '',
    'blurb' => $t['blurb'] ?? '', 'story' => $t['story'] ?? '', 'materials' => $t['materials'] ?? [], 'area' => $r['area'], 'year' => $r['year'],
    'cover' => $r['cover'] ?: ($images[0]['src'] ?? ''), 'images' => $images, 'kind' => $r['category'], 'seo' => $seo[lang()] ?? []];
}
function projects(): array {
  static $cache = [];
  return $cache[lang()] ??= array_map('shape_project', all("SELECT * FROM projects WHERE status = 'published' ORDER BY sort, id"));
}
function project(string $slug): ?array {
  $list = projects();
  foreach ($list as $i => $p) if ($p['slug'] === $slug) return ['p' => $p, 'next' => $list[($i + 1) % count($list)]];
  return null;
}
function page_seo(string $page): array {
  return one('SELECT title, description, image, noindex FROM page_seo WHERE page = ? AND lang = ?', [$page, lang()]) ?: ['title' => '', 'description' => '', 'image' => '', 'noindex' => 0];
}
function find_redirect(string $path): ?array {
  try { $r = one('SELECT dest, code FROM redirects WHERE src = ?', [$path]); if ($r) q('UPDATE redirects SET hits = hits + 1 WHERE src = ?', [$path]); return $r; } catch (Throwable) { return null; }
}
function render_sitemap(): void {
  header('Content-Type: application/xml; charset=utf-8');
  $urls = [];
  foreach (LANGS as $l) { set_lang($l); foreach (['', '/projects', '/services', '/studio', '/contact'] as $p) $urls[] = "/$l$p"; foreach (projects() as $pr) $urls[] = "/$l/projects/{$pr['slug']}"; }
  echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n" . '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
  foreach (array_unique($urls) as $u) echo '  <url><loc>' . SITE_URL . e($u) . '</loc></url>' . "\n";
  echo "</urlset>\n";
}
