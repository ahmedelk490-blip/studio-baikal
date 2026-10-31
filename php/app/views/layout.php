<?php
declare(strict_types=1);
/* The document around every page: fonts and the compiled stylesheet of the Next.js build, the header,
   the page, the footer and the behaviour script. The view runs first so it can set $meta. */
require_once ROOT . '/app/views/partials.php';
$T = t(); $ar = is_ar();
$meta = ['title' => $ar ? 'استوديو بايكال | تصميم داخلي في مصر' : 'Studio Baikal | Interior Design Studio in Egypt',
  'description' => $ar ? 'استوديو بايكال يصمم مساحات داخلية وخارجية مستوحاة من الطبيعة ومبنية على الهيكل: مشاريع سكنية وتجارية، باقات ثري دي وتنفيذ كامل في مصر.' : 'Studio Baikal designs interior and exterior spaces inspired by nature, rooted in structure. Residential and commercial projects, 3D packages and full execution across Egypt.',
  'image' => '/projects/october-250/01.webp', 'noindex' => false];
$path = rawurldecode(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/');
$path = rtrim(preg_replace('#/+#', '/', $path), '/') ?: '/';
ob_start();
require ROOT . '/app/views/' . $view . '.php';
$content = ob_get_clean();
$canon = preg_replace('#^/(en|ar)#', '', $path);
?>
<!DOCTYPE html>
<html lang="<?= lang() ?>" dir="<?= $T['dir'] ?>" class="oxAA4W_variable bngKgG_variable DUIblG_variable CXNBKG_variable rn4dPq_variable calm">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= e($meta['title']) ?></title>
<meta name="description" content="<?= e($meta['description']) ?>">
<?php if (!empty($meta['noindex'])): ?><meta name="robots" content="noindex, follow"><?php endif; ?>
<link rel="canonical" href="<?= SITE_URL . e($path) ?>">
<link rel="alternate" hreflang="en" href="<?= SITE_URL ?>/en<?= e($canon) ?>">
<link rel="alternate" hreflang="ar" href="<?= SITE_URL ?>/ar<?= e($canon) ?>">
<link rel="alternate" hreflang="x-default" href="<?= SITE_URL ?>/en<?= e($canon) ?>">
<meta property="og:title" content="<?= e($meta['title']) ?>">
<meta property="og:description" content="<?= e($meta['description']) ?>">
<meta property="og:image" content="<?= SITE_URL . e($meta['image']) ?>">
<meta property="og:type" content="website">
<meta name="theme-color" content="#0B1013">
<link rel="icon" href="/icon.png" type="image/png">
<link rel="apple-touch-icon" href="/apple-icon.png">
<link rel="stylesheet" href="/_next/static/chunks/fonts.css">
<link rel="stylesheet" href="/_next/static/chunks/site.css">
<script type="application/ld+json"><?= json_encode(['@context' => 'https://schema.org', '@type' => 'InteriorDesigner', 'name' => $ar ? 'استوديو بايكال' : 'Studio Baikal', 'url' => SITE_URL . url(), 'logo' => SITE_URL . '/brand/logo.png', 'telephone' => contact_info()['phone'], 'email' => contact_info()['email'], 'areaServed' => 'Egypt'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?></script>
</head>
<body class="min-h-dvh antialiased">
<?php site_header($path); ?>
<main><?= $content ?></main>
<?php site_footer(); ?>
<script src="/assets/site.js" defer></script>
</body>
</html>
