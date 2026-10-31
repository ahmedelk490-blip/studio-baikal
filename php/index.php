<?php
/* Studio Baikal, PHP edition: one front controller. Every URL that is not a real file lands here
   (.htaccess), so the same routes as the Next.js site keep working: /en, /ar, /en/projects,
   /en/projects/{slug}, /en/services, /en/studio, /en/contact, /api/leads, /admin, sitemap.xml, robots.txt. */
declare(strict_types=1);
require __DIR__ . '/app/config.php';
require __DIR__ . '/app/db.php';
require __DIR__ . '/app/helpers.php';
require __DIR__ . '/app/i18n.php';
require __DIR__ . '/app/content.php';

$path = rawurldecode(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/');
$path = preg_replace('#/+#', '/', $path);
if ($path !== '/' && str_ends_with($path, '/')) $path = rtrim($path, '/');

// admin and the lead endpoint
if ($path === '/admin' || str_starts_with($path, '/admin/')) { require __DIR__ . '/admin/index.php'; exit; }
if ($path === '/api/leads') { require __DIR__ . '/api/leads.php'; exit; }
if ($path === '/robots.txt') { header('Content-Type: text/plain'); echo "User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: " . SITE_URL . "/sitemap.xml\n"; exit; }
if ($path === '/sitemap.xml') { render_sitemap(); exit; }

// redirects managed in the admin, then the old site's URLs, then English as the default language
if ($r = find_redirect($path)) { header('Location: ' . $r['dest'], true, (int) $r['code']); exit; }
$legacy = ['/interior-design-services' => '/en/services', '/project-stories' => '/en/projects', '/about-us' => '/en/studio', '/contact-us' => '/en/contact'];
if (isset($legacy[$path])) { header('Location: ' . $legacy[$path], true, 301); exit; }
if ($path === '/' || preg_match('#^/(projects(/[^/]+)?|services|studio|contact)$#', $path)) { header('Location: /en' . ($path === '/' ? '' : $path), true, 302); exit; }

if (!preg_match('#^/(en|ar)(/.*)?$#', $path, $m)) { render_404(); exit; }
$L = $m[1];
$rest = $m[2] ?? '';
set_lang($L);

if ($rest === '') { render_page('home'); exit; }
if ($rest === '/projects') { render_page('projects'); exit; }
if (preg_match('#^/projects/([a-z0-9-]+)$#', $rest, $s)) { render_page('project', ['slug' => $s[1]]); exit; }
if (in_array($rest, ['/services', '/studio', '/contact'], true)) { render_page(substr($rest, 1)); exit; }
render_404();
