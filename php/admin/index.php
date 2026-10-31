<?php
declare(strict_types=1);
/* The admin: sign in, the inbox of booking requests, the projects (text in both languages, photos with
   their room names, cover, order), the site settings, the SEO of the fixed pages, the password.
   Plain PHP sessions, bcrypt passwords, a CSRF token on every form, 8 sign-in tries per 10 minutes. */
require_once ROOT . '/admin/views.php';
session_name('bk_admin');
session_set_cookie_params(['lifetime' => 0, 'path' => '/admin', 'secure' => !empty($_SERVER['HTTPS']), 'httponly' => true, 'samesite' => 'Lax']);
session_start();
$_SESSION['csrf'] ??= bin2hex(random_bytes(16));
$sub = substr($path, strlen('/admin')) ?: '/';
$post = $_SERVER['REQUEST_METHOD'] === 'POST';
$now = gmdate('c');
$ip = trim(explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'] ?? ($_SERVER['REMOTE_ADDR'] ?? 'local'))[0]);
$flash = $_SESSION['flash'] ?? null; unset($_SESSION['flash']);
$go = function (string $to, ?string $msg = null) { if ($msg !== null) $_SESSION['flash'] = $msg; header('Location: /admin' . $to, true, 303); exit; };
$csrf_ok = fn() => hash_equals($_SESSION['csrf'], (string) ($_POST['csrf'] ?? ''));

/* sign in / out */
if ($sub === '/logout') { session_destroy(); $go('/login'); }
if ($sub === '/login') {
  if (!empty($_SESSION['uid'])) $go('/');
  $err = '';
  if ($post && $csrf_ok()) {
    q('DELETE FROM attempts WHERE at < ?', [time() - 600]);
    $tries = (int) one('SELECT COUNT(*) c FROM attempts WHERE key = ?', ['login:' . $ip])['c'];
    $u = one('SELECT * FROM users WHERE email = ? AND active = 1', [trim((string) ($_POST['email'] ?? ''))]);
    if ($tries >= 8) $err = 'محاولات كثيرة. انتظر عشر دقائق.';
    elseif ($u && password_verify((string) ($_POST['password'] ?? ''), $u['pass'])) {
      session_regenerate_id(true); $_SESSION['uid'] = (int) $u['id'];
      q('UPDATE users SET last_login = ? WHERE id = ?', [$now, $u['id']]); q('DELETE FROM attempts WHERE key = ?', ['login:' . $ip]);
      $go('/');
    } else { q('INSERT INTO attempts (key, at) VALUES (?, ?)', ['login:' . $ip, time()]); $err = 'البريد أو كلمة السر غير صحيحة'; }
  }
  admin_login($err); exit;
}
$user = empty($_SESSION['uid']) ? null : one('SELECT id, email, name FROM users WHERE id = ? AND active = 1', [$_SESSION['uid']]);
if (!$user) $go('/login');
if ($post && !$csrf_ok()) { http_response_code(400); admin_page('خطأ', '<p class="err">انتهت الجلسة، حدّث الصفحة وحاول مرة أخرى.</p>'); exit; }
$f = fn(string $k, int $max = 4000) => mb_substr(trim((string) ($_POST[$k] ?? '')), 0, $max);

/* the inbox */
if ($sub === '/' || $sub === '/inquiries') {
  if ($post && ($_POST['_action'] ?? '') === 'status') { q('UPDATE inquiries SET status = ?, notes = ?, updated_at = ? WHERE id = ?', [in_array($f('status'), ['new', 'contacted', 'in_progress', 'won', 'lost', 'spam'], true) ? $f('status') : 'new', $f('notes'), $now, $f('id')]); $go('/', 'تم الحفظ'); }
  if ($post && ($_POST['_action'] ?? '') === 'delete') { q('DELETE FROM inquiries WHERE id = ?', [$f('id')]); $go('/', 'تم الحذف'); }
  if (($_GET['export'] ?? '') === 'csv') {
    header('Content-Type: text/csv; charset=utf-8'); header('Content-Disposition: attachment; filename="baikal-leads.csv"'); echo "\xEF\xBB\xBF";
    $out = fopen('php://output', 'w'); fputcsv($out, ['at', 'name', 'whatsapp', 'email', 'size', 'need', 'message', 'source', 'status', 'notes']);
    foreach (all('SELECT at,name,whatsapp,email,size,need,message,source,status,notes FROM inquiries ORDER BY at DESC') as $r) fputcsv($out, $r);
    exit;
  }
  admin_inquiries(all('SELECT * FROM inquiries ORDER BY at DESC LIMIT 500'), $flash); exit;
}

/* projects */
if ($sub === '/projects') { admin_projects(all('SELECT id, slug, status, featured, sort, category, en, ar, cover, updated_at FROM projects ORDER BY sort, id'), $flash); exit; }
if (preg_match('#^/projects/(new|\d+)$#', $sub, $m)) {
  $id = $m[1] === 'new' ? 0 : (int) $m[1];
  $row = $id ? one('SELECT * FROM projects WHERE id = ?', [$id]) : null;
  if ($id && !$row) $go('/projects', 'المشروع غير موجود');
  $action = $post ? ($_POST['_action'] ?? 'save') : '';
  if ($action === 'save') {
    $slug = strtolower(trim(preg_replace('/[^a-z0-9-]+/i', '-', $f('slug', 80)), '-')) ?: ('project-' . time());
    if (one('SELECT id FROM projects WHERE slug = ? AND id != ?', [$slug, $id])) $go($id ? "/projects/$id" : '/projects/new', 'الرابط (slug) مستخدم في مشروع آخر');
    $text = [];
    foreach (LANGS as $l) $text[$l] = json_encode(['name' => $f("name_$l"), 'type' => $f("type_$l"), 'location' => $f("location_$l"), 'style' => $f("style_$l"), 'scope' => $f("scope_$l"), 'blurb' => $f("blurb_$l"), 'story' => $f("story_$l"),
      'materials' => array_values(array_filter(array_map('trim', preg_split('/[,،\n]+/u', $f("materials_$l")))))], JSON_UNESCAPED_UNICODE);
    $seo = json_encode(['en' => ['title' => $f('seo_title_en'), 'description' => $f('seo_desc_en')], 'ar' => ['title' => $f('seo_title_ar'), 'description' => $f('seo_desc_ar')]], JSON_UNESCAPED_UNICODE);
    $vals = [$slug, $f('status') === 'published' ? 'published' : 'draft', isset($_POST['featured']) ? 1 : 0, (int) $f('sort'), in_array($f('category'), ['Villa', 'Apartment', 'Clinic'], true) ? $f('category') : 'Apartment', $f('area'), $f('year'), $f('cover'), $text['en'], $text['ar'], $seo, $now, $user['id']];
    if ($id) { q('UPDATE projects SET slug=?,status=?,featured=?,sort=?,category=?,area=?,year=?,cover=?,en=?,ar=?,seo=?,updated_at=?,updated_by=? WHERE id = ?', [...$vals, $id]); }
    else { q('INSERT INTO projects (slug,status,featured,sort,category,area,year,cover,en,ar,seo,updated_at,updated_by,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [...$vals, $now]); $id = (int) db()->lastInsertId(); }
    if ($row && $slug !== $row['slug']) rename_project_folder($row['slug'], $slug, $id);
    $go("/projects/$id", 'تم حفظ المشروع');
  }
  if ($action === 'delete' && $id) { q('DELETE FROM projects WHERE id = ?', [$id]); $go('/projects', 'تم حذف المشروع'); }
  if ($action === 'upload' && $id) { $n = upload_images($id, $row['slug']); $go("/projects/$id", $n ? "تمت إضافة $n صورة" : 'لم تُرفع أي صورة. المسموح: JPG أو PNG أو WebP حتى 20 ميجا'); }
  if ($action === 'images' && $id) {
    foreach ($_POST['room_en'] ?? [] as $iid => $en) q('UPDATE project_images SET room_en = ?, room_ar = ?, sort = ? WHERE id = ? AND project_id = ?', [mb_substr(trim((string) $en), 0, 80), mb_substr(trim((string) ($_POST['room_ar'][$iid] ?? '')), 0, 80), (int) ($_POST['sort'][$iid] ?? 0), (int) $iid, $id]);
    if (!empty($_POST['cover'])) q('UPDATE projects SET cover = ?, updated_at = ? WHERE id = ?', [$f('cover'), $now, $id]);
    $go("/projects/$id", 'تم حفظ الصور');
  }
  if ($id && ($action === 'delimg' || isset($_GET['del']))) { if (isset($_GET['del'])) $_POST['img'] = $_GET['del'];
    $im = one('SELECT src FROM project_images WHERE id = ? AND project_id = ?', [(int) $f('img'), $id]);
    if ($im) {
      q('DELETE FROM project_images WHERE id = ?', [(int) $f('img')]);
      foreach ([$im['src'], preg_replace('/\.webp$/', '.w480.webp', $im['src']), preg_replace('/\.webp$/', '.w960.webp', $im['src'])] as $file) if (str_starts_with($file, '/projects/') && file_exists(ROOT . $file)) @unlink(ROOT . $file);
      if ($row['cover'] === $im['src']) q("UPDATE projects SET cover = COALESCE((SELECT src FROM project_images WHERE project_id = ? ORDER BY sort, id LIMIT 1), '') WHERE id = ?", [$id, $id]);
    }
    $go("/projects/$id", 'تم حذف الصورة');
  }
  admin_project($row, $id ? all('SELECT * FROM project_images WHERE project_id = ? ORDER BY sort, id', [$id]) : [], $flash); exit;
}

/* settings: contact, footer, SEO of the fixed pages, password */
if ($sub === '/settings') {
  if ($post && ($_POST['_action'] ?? '') === 'site') {
    $v = ['phone' => $f('phone', 40), 'email' => $f('email', 120), 'whatsapp' => preg_replace('/\D/', '', $f('whatsapp', 30)), 'instagram' => $f('instagram', 200),
      'waText' => ['en' => $f('wa_en', 300), 'ar' => $f('wa_ar', 300)], 'footer' => ['en' => ['tagline' => $f('tag_en', 200), 'sub' => $f('sub_en', 300)], 'ar' => ['tagline' => $f('tag_ar', 200), 'sub' => $f('sub_ar', 300)]]];
    q('INSERT INTO settings (k, v, updated_at, updated_by) VALUES (?, ?, ?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v, updated_at = excluded.updated_at, updated_by = excluded.updated_by', ['site', json_encode($v, JSON_UNESCAPED_UNICODE), $now, $user['id']]);
    $go('/settings', 'تم حفظ الإعدادات');
  }
  if ($post && ($_POST['_action'] ?? '') === 'seo') {
    foreach (['home', 'projects', 'services', 'studio', 'contact'] as $pg) foreach (LANGS as $l) q('INSERT INTO page_seo (page, lang, title, description, image, noindex, updated_at) VALUES (?,?,?,?,?,?,?) ON CONFLICT(page, lang) DO UPDATE SET title = excluded.title, description = excluded.description, image = excluded.image, noindex = excluded.noindex, updated_at = excluded.updated_at',
      [$pg, $l, $f("t_{$pg}_$l", 200), $f("d_{$pg}_$l", 400), $f("i_{$pg}_$l", 300), isset($_POST["n_{$pg}_$l"]) ? 1 : 0, $now]);
    $go('/settings', 'تم حفظ بيانات SEO');
  }
  if ($post && ($_POST['_action'] ?? '') === 'password') {
    $u = one('SELECT pass FROM users WHERE id = ?', [$user['id']]);
    if (!password_verify((string) ($_POST['current'] ?? ''), $u['pass'])) $go('/settings', 'كلمة السر الحالية غير صحيحة');
    if (strlen((string) ($_POST['new'] ?? '')) < 10) $go('/settings', 'كلمة السر الجديدة لازم تكون 10 حروف على الأقل');
    q('UPDATE users SET pass = ? WHERE id = ?', [password_hash((string) $_POST['new'], PASSWORD_BCRYPT), $user['id']]);
    $go('/settings', 'تم تغيير كلمة السر');
  }
  $seo = []; foreach (all('SELECT * FROM page_seo') as $r) $seo[$r['page']][$r['lang']] = $r;
  admin_settings(settings(), $seo, $user, $flash); exit;
}
$go('/');

/* photos: JPG, PNG or WebP in; a 1600 px WebP plus 480 and 960 px copies out, numbered after the last one */
function upload_images(int $id, string $slug): int {
  $dir = ROOT . "/projects/$slug"; if (!is_dir($dir)) @mkdir($dir, 0755, true);
  $files = $_FILES['photos'] ?? null; if (!$files) return 0;
  $last = 0; foreach (glob("$dir/*.webp") ?: [] as $g) if (preg_match('#/(\d+)\.webp$#', $g, $m)) $last = max($last, (int) $m[1]);
  $sort = (int) (one('SELECT COALESCE(MAX(sort), -1) m FROM project_images WHERE project_id = ?', [$id])['m']);
  $done = 0;
  foreach ($files['tmp_name'] as $i => $tmp) {
    if (!is_uploaded_file($tmp) || $files['size'][$i] > 20 * 1024 * 1024) continue;
    $src = @imagecreatefromstring((string) file_get_contents($tmp)); if (!$src) continue;
    $w = imagesx($src); $h = imagesy($src);
    $name = sprintf('%02d', ++$last);
    $made = [];
    foreach ([1600 => '', 960 => '.w960', 480 => '.w480'] as $max => $suffix) {
      $tw = min($max, $w); $th = (int) round($h * $tw / $w);
      $im = imagecreatetruecolor($tw, $th); imagecopyresampled($im, $src, 0, 0, 0, 0, $tw, $th, $w, $h);
      $ok = function_exists('imagewebp') ? imagewebp($im, "$dir/$name$suffix.webp", 82) : imagejpeg($im, "$dir/$name$suffix.webp", 85);
      imagedestroy($im); if ($ok) $made[] = $suffix;
    }
    imagedestroy($src);
    if (!in_array('', $made, true)) continue;
    q('INSERT INTO project_images (project_id, src, room_en, room_ar, w, h, sort) VALUES (?,?,?,?,?,?,?)', [$id, "/projects/$slug/$name.webp", '', '', min(1600, $w), (int) round($h * min(1600, $w) / $w), ++$sort]);
    $done++;
  }
  if ($done && !one('SELECT cover FROM projects WHERE id = ?', [$id])['cover']) q("UPDATE projects SET cover = (SELECT src FROM project_images WHERE project_id = ? ORDER BY sort, id LIMIT 1) WHERE id = ?", [$id, $id]);
  return $done;
}
function rename_project_folder(string $old, string $new, int $id): void {
  if ($old === $new || !is_dir(ROOT . "/projects/$old") || is_dir(ROOT . "/projects/$new")) return;
  if (!@rename(ROOT . "/projects/$old", ROOT . "/projects/$new")) return;
  q("UPDATE project_images SET src = REPLACE(src, ?, ?) WHERE project_id = ?", ["/projects/$old/", "/projects/$new/", $id]);
  q("UPDATE projects SET cover = REPLACE(cover, ?, ?) WHERE id = ?", ["/projects/$old/", "/projects/$new/", $id]);
}
