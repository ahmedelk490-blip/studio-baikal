<?php
declare(strict_types=1);
/* Small view helpers shared by every page. */
function e(?string $s): string { return htmlspecialchars((string) $s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
function lang(): string { return $GLOBALS['LANG'] ?? 'en'; }
function set_lang(string $l): void { $GLOBALS['LANG'] = $l; $GLOBALS['T'] = DICT[$l]; $GLOBALS['P'] = PAGES[$l]; $GLOBALS['CALM'] = CALM[$l]; }
function t(): array { return $GLOBALS['T']; }
function pg(): array { return $GLOBALS['P']; }
function calm(): array { return $GLOBALS['CALM']; }
function is_ar(): bool { return lang() === 'ar'; }
function url(string $path = ''): string { return '/' . lang() . $path; }
function arrow(): string { return is_ar() ? '←' : '→'; }
const U = 'text-xs uppercase tracking-[0.24em] rtl:tracking-normal';
const U2 = 'text-xs uppercase tracking-[0.2em] rtl:tracking-normal';
const U16 = 'text-xs uppercase tracking-[0.16em] rtl:tracking-normal';
const EB = U . ' eyebrow text-[var(--bronze)]';
const SEC = 'bg-[#0B1013] px-5 py-24 text-[var(--surface)] md:px-10 md:py-36';
const BG = 'bg-[#0B1013] text-[var(--surface)]';

/* <img> with the smaller copies the build and the admin write beside every project photo (NN.w480.webp,
   NN.w960.webp), so phones never download the 1600 px original. */
function img(string $src, string $alt, string $class, string $sizes = '100vw', array $attrs = []): string {
  $srcset = '';
  if (preg_match('#^/projects/.+\.webp$#', $src) && !preg_match('/\.w\d+\.webp$/', $src)) {
    $set = [];
    foreach ([480, 960] as $w) { $v = preg_replace('/\.webp$/', ".w$w.webp", $src); if (file_exists(ROOT . $v)) $set[] = "$v {$w}w"; }
    if ($set) { $set[] = "$src 1600w"; $srcset = ' srcset="' . e(implode(', ', $set)) . '" sizes="' . e($sizes) . '"'; }
  }
  $a = '';
  foreach ($attrs as $k => $v) $a .= ' ' . $k . ($v === true ? '' : '="' . e((string) $v) . '"');
  if (!isset($attrs['loading'])) $a .= ' loading="lazy"';
  return '<img src="' . e($src) . '"' . $srcset . ' alt="' . e($alt) . '" class="' . e($class) . '" decoding="async"' . $a . '>';
}
/* A photo that fills its box (the Next "fill" image). */
function fill(string $src, string $alt, string $sizes = '100vw', string $extra = '', array $attrs = []): string {
  return img($src, $alt, 'absolute inset-0 h-full w-full object-cover ' . $extra, $sizes, $attrs);
}
function btn(string $href, string $label, string $variant = 'primary'): string {
  return '<a href="' . e($href) . '" class="btn btn-' . $variant . '"><span class="btn-roll"><span>' . e($label) . '</span><span aria-hidden="true">' . e($label) . '</span></span><span class="btn-ico" aria-hidden="true"></span></a>';
}
const WA_PATH = 'M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 1.8a8.2 8.2 0 1 1-4.2 15.3l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 0 1 12 3.8Zm-3.3 4.4c-.2 0-.5 0-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.2 5 4.4 2.5 1 3 .8 3.5.7.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.2-.6-.4l-2-1c-.3-.1-.5-.1-.7.1l-1 1.2c-.2.2-.3.2-.6.1a6.7 6.7 0 0 1-3.4-3c-.2-.4 0-.5.2-.7l.5-.6.3-.5v-.5l-.9-2.2c-.2-.5-.4-.5-.7-.5h-.6Z';
function wa_svg(int $s = 18): string { return '<svg width="' . $s . '" height="' . $s . '" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="' . WA_PATH . '"/></svg>'; }
/* The gold contour lines of the contact section (same maths as the React version). */
function contours(string $class): string {
  $W = 1200; $out = '';
  for ($i = 0; $i < 7; $i++) {
    $base = 40 + $i * 45; $amp = 14 + ($i % 3) * 8; $ph = $i * 0.9; $d = '';
    for ($x = 0; $x <= 2 * $W; $x += 20) { $y = $base + $amp * sin(2 * M_PI * $x / $W + $ph) + $amp * 0.35 * sin(4 * M_PI * $x / $W + $ph * 1.7); $d .= ($x ? 'L' : 'M') . $x . ' ' . number_format($y, 1, '.', '') . ' '; }
    $out .= '<path d="' . $d . '" pathLength="1" class="ct-line" style="animation-delay:' . ($i * 0.15) . 's"/>';
  }
  return '<svg aria-hidden="true" class="contours ' . e($class) . '" viewBox="0 0 1200 360" preserveAspectRatio="none"><g class="ct-flow">' . $out . '</g></svg>';
}
function render_page(string $view, array $vars = []): void {
  $vars['view'] = $view;
  extract($vars);
  require ROOT . '/app/views/layout.php';
}
function render_404(): void { http_response_code(404); if (!isset($GLOBALS['LANG'])) set_lang('en'); render_page('404'); }
function json_out(array $data, int $code = 200): void { http_response_code($code); header('Content-Type: application/json; charset=utf-8'); echo json_encode($data, JSON_UNESCAPED_UNICODE); }
