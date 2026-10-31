<?php
/* One project: name and cover, the facts row, the rooms composed on one board, the story, the next project. */
$T = t(); $C = calm(); $hit = project($slug ?? '');
if (!$hit) { http_response_code(404); require ROOT . '/app/views/404.php'; return; }
$p = $hit['p']; $next = $hit['next']; $f = $T['project']['facts'];
$meta['title'] = ($p['seo']['title'] ?? '') ?: ($p['name'] . ', ' . $p['location'] . ' | ' . (is_ar() ? 'استوديو بايكال' : 'Studio Baikal'));
$meta['description'] = ($p['seo']['description'] ?? '') ?: ($p['blurb'] . ' ' . $p['type'] . ' · ' . $p['style'] . '.');
$meta['image'] = $p['cover'];
$cover = null; foreach ($p['images'] as $i) if ($i['src'] === $p['cover'] && $i['w'] >= $i['h']) { $cover = $i; break; }
if (!$cover) foreach ($p['images'] as $i) if ($i['w'] >= $i['h']) { $cover = $i; break; }
$cover ??= $p['images'][0] ?? ['src' => $p['cover'], 'room' => '', 'w' => 1600, 'h' => 900];
$video = PROJECT_VIDEO[$p['slug']] ?? null;
$board = $video ? $p['images'] : array_values(array_filter($p['images'], fn($i) => $i['src'] !== $cover['src']));
$facts = [[$f['type'], $p['type']], [$f['style'], $p['style']], [$f['scope'], $p['scope']]];
/* the board's rhythm: wide, half, half, tall, wide-beside-tall, half, half; and it never ends on a lone room */
$n = count($board);
$shape = fn(int $k, bool $wide) => (($k % 7) === 0 || (($k % 7) === 4 && !$wide)) ? [2, 1] : ((($k % 7) === 3) ? [1, 2] : [1, 1]);
$fixAt = function (bool $wide) use ($n, $shape) {
  $g = []; $end = [];
  $fits = function ($y, $x, $s) use (&$g) { for ($j = $y; $j < $y + $s[1]; $j++) for ($i = $x; $i < $x + $s[0]; $i++) if ($i > 1 || !empty($g[$j][$i])) return false; return true; };
  for ($k = 0; $k < $n; $k++) { $s = $shape($k, $wide); for ($y = 0; ; $y++) { $x = null; foreach ([0, 1] as $c) if ($fits($y, $c, $s)) { $x = $c; break; } if ($x === null) continue; for ($j = $y; $j < $y + $s[1]; $j++) for ($i = $x; $i < $x + $s[0]; $i++) $g[$j][$i] = true; $end[$k] = $y + $s[1] - 1; break; } }
  foreach ($g as $row) if (empty($row[0]) || empty($row[1])) return array_search(max($end ?: [0]), $end, true);
  return -1;
};
$fixPhone = $fixAt(false); $fixWide = $fixAt(true);
$ph = fn(int $k) => (($k % 7) === 0) ? 'col-span-2 aspect-[16/9]' : ((($k % 7) === 4) ? 'col-span-2 aspect-[16/10]' : ((($k % 7) === 3) ? 'row-span-2 aspect-[3/4]' : 'aspect-[4/3]'));
$md = fn(int $k) => (($k % 7) === 0) ? 'md:col-span-2 md:aspect-[16/9]' : ((($k % 7) === 3) ? 'md:col-span-1 md:row-span-2 md:aspect-auto' : 'md:col-span-1 md:aspect-[4/3]');
$span = fn(int $k) => ($k === $fixPhone ? 'col-span-2 row-span-1 aspect-[16/10]' : $ph($k)) . ' ' . ($k === $fixWide ? 'md:col-span-2 md:row-span-1 md:aspect-[16/9]' : $md($k));
$u = U2;
$coverAlt = $p['name'] . ', ' . $cover['room'];
?>
<section class="bg-[#0B1013] px-5 pb-6 pt-24 text-[var(--surface)] md:px-10 md:pb-10 md:pt-32">
  <div class="mx-auto max-w-6xl">
    <a href="<?= url('/projects') ?>" class="<?= $u ?> inline-flex min-h-11 items-center gap-2 whitespace-nowrap opacity-70 transition-opacity [@media(hover:hover)]:hover:opacity-100"><span aria-hidden="true"><?= is_ar() ? '→' : '←' ?></span><?= e($T['project']['all']) ?></a>
    <div class="mt-2 flex flex-wrap items-end justify-between gap-6">
      <div><p class="<?= $u ?> eyebrow text-[var(--bronze)]"><?= e($p['type']) ?> · <?= e($p['location']) ?></p><h1 class="display mt-4 text-4xl leading-[1.1] rtl:leading-[1.3] md:text-6xl"><?= e($p['name']) ?></h1></div>
      <p class="max-w-md text-sm leading-relaxed text-[var(--surface)]/70 md:text-base"><?= e($p['blurb']) ?></p>
    </div>
    <div class="mask relative mt-10 overflow-hidden rounded-2xl md:mt-14">
      <?php if ($video): ?>
      <video class="aspect-[16/10] w-full object-cover" autoplay muted loop playsinline poster="<?= e($cover['src']) ?>" aria-label="<?= e($coverAlt) ?>"><source src="<?= e($video) ?>" type="video/mp4"></video>
      <?php else: ?>
      <?= img($cover['src'], $coverAlt, 'h-auto w-full', '(min-width:1152px) 1152px, 100vw', ['width' => $cover['w'], 'height' => $cover['h'], 'loading' => 'eager', 'fetchpriority' => 'high']) ?>
      <?php endif; ?>
    </div>
  </div>
</section>
<section class="bg-[#0B1013] px-5 text-[var(--surface)] md:px-10">
  <dl class="mx-auto flex max-w-6xl flex-wrap gap-x-10 gap-y-3 border-y border-[var(--surface)]/12 py-5">
    <?php foreach ($facts as [$k, $v]): if ($v === '') continue; ?><div class="flex items-baseline gap-2 text-sm"><dt class="text-[var(--bronze)]"><?= e($k) ?></dt><dd><?= e($v) ?></dd></div><?php endforeach; ?>
    <?php if ($p['materials']): ?><div class="flex items-baseline gap-2 text-sm"><dt class="text-[var(--bronze)]"><?= e($T['project']['materials']) ?></dt><dd><?= e(implode(' · ', $p['materials'])) ?></dd></div><?php endif; ?>
  </dl>
</section>
<section class="bg-[#0B1013] text-[var(--surface)]">
  <div class="mx-auto max-w-6xl px-5 py-12 md:px-10 md:py-16" data-gallery>
    <div class="grid grid-cols-2 gap-3 md:gap-5" style="grid-auto-flow:dense">
      <?php foreach ($board as $k => $im): $alt = $p['name'] . ', ' . $im['room']; ?>
      <figure class="relative <?= $span($k) ?>">
        <button type="button" data-open="<?= $k ?>" class="group relative block h-full w-full overflow-hidden rounded-lg md:rounded-xl" aria-label="<?= e($alt) ?>">
          <?= fill($im['src'], $alt, '(min-width:1152px) 576px, 50vw', 'transition-transform duration-[1200ms] ease-out [@media(hover:hover)]:group-hover:scale-[1.04]') ?>
          <span class="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#05080A]/70 to-transparent" aria-hidden="true"></span>
          <figcaption class="absolute bottom-3 start-3 flex items-center gap-2 text-[var(--surface)] md:bottom-4 md:start-4"><span class="h-px w-5 bg-[var(--bronze)]" aria-hidden="true"></span><span class="display text-sm md:text-lg"><?= e($im['room']) ?></span></figcaption>
        </button>
      </figure>
      <?php endforeach; ?>
    </div>
    <?php if ($p['story']): ?><p class="display mx-auto mt-12 max-w-3xl text-center text-xl leading-[1.5] text-[var(--surface)]/80 rtl:leading-[1.7] md:mt-16 md:text-2xl"><?= e($p['story']) ?></p><?php endif; ?>
    <script type="application/json" data-images><?= json_encode(['name' => $p['name'], 'labels' => ['prev' => $T['project']['prev'], 'next' => $T['project']['nextImg'], 'close' => $T['project']['close'], 'gallery' => $T['project']['gallery']], 'images' => array_map(fn($i) => ['src' => $i['src'], 'room' => $i['room'], 'w' => $i['w'], 'h' => $i['h']], $board)], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG) ?></script>
  </div>
</section>
<section class="border-t border-[var(--bronze)]/15 bg-[var(--deep)] px-5 py-16 text-[var(--surface)] md:px-10 md:py-24">
  <div class="grid items-center gap-10 md:grid-cols-12 mx-auto max-w-6xl">
    <a href="<?= url('/projects/' . $next['slug']) ?>" class="group order-2 block md:order-1 md:col-span-7">
      <p class="<?= $u ?> eyebrow text-[var(--bronze)]"><?= e($T['project']['next']) ?></p>
      <p class="display mt-3 text-5xl transition-colors duration-500 group-hover:text-[var(--bronze)] md:text-7xl"><?= e($next['name']) ?></p>
      <p class="mt-3 text-sm text-[var(--surface)]/70"><?= e($next['location']) ?></p>
    </a>
    <a href="<?= url('/projects/' . $next['slug']) ?>" aria-label="<?= e($next['name']) ?>" class="group relative order-1 mx-auto block aspect-[4/5] w-full max-w-xs overflow-hidden rounded-b-2xl rounded-t-full ring-1 ring-[var(--bronze)]/35 md:order-2 md:col-span-5"><?= fill($next['cover'], $next['name'], '(min-width:768px) 30vw, 80vw', 'transition-transform duration-[1200ms] group-hover:scale-105') ?></a>
  </div>
  <div class="mt-12 border-t border-[var(--surface)]/10 pt-8 mx-auto max-w-6xl"><?= btn(url('/contact'), $T['project']['start']) ?></div>
</section>
