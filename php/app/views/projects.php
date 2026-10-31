<?php
/* The archive: type filters as plain words, then every project as an arched cover. */
$T = t(); $P = pg()['projects']; $list = projects(); $seo = page_seo('projects');
$meta['title'] = $seo['title'] ?: $P['eyebrow'] . ' | ' . (is_ar() ? 'استوديو بايكال' : 'Studio Baikal');
$meta['description'] = $seo['description'] ?: $P['intro']; if ($seo['image']) $meta['image'] = $seo['image']; $meta['noindex'] = (bool) $seo['noindex'];
$kinds = array_values(array_unique(array_map(fn($p) => $p['kind'], $list)));
$pre = $_GET['type'] ?? 'all'; if (!in_array($pre, $kinds, true)) $pre = 'all';
?>
<section class="<?= BG ?> px-5 pb-20 pt-28 md:px-10 md:pb-28 md:pt-36">
  <div class="mx-auto max-w-7xl">
    <?php page_head($P['eyebrow'], $P['title'], $P['intro']); ?>
    <div data-fade data-filters class="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3 md:mt-14" role="tablist">
      <?php foreach (array_merge(['all'], $kinds) as $k): $on = $k === $pre; ?>
      <button type="button" role="tab" data-kind="<?= e($k) ?>" aria-selected="<?= $on ? 'true' : 'false' ?>" class="<?= U ?> relative min-h-11 pb-1 transition-colors <?= $on ? 'text-[var(--surface)]' : 'text-[var(--surface)]/50 [@media(hover:hover)]:hover:text-[var(--surface)]/80' ?>"><?= e($k === 'all' ? $P['all'] : ($P['filters'][$k] ?? $k)) ?><span class="absolute inset-x-0 bottom-2 h-px bg-[var(--bronze)] transition-transform duration-500 <?= $on ? 'scale-x-100' : 'scale-x-0' ?>" aria-hidden="true"></span></button>
      <?php endforeach; ?>
    </div>
    <ul data-archive class="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:mt-10 md:grid-cols-3 md:gap-x-8 md:gap-y-14">
      <?php foreach ($list as $i => $r): ?>
      <li data-fade data-kind="<?= e($r['kind']) ?>" style="transition-delay:<?= ($i % 3) * 90 ?>ms"<?= $pre !== 'all' && $r['kind'] !== $pre ? ' hidden' : '' ?>>
        <a href="<?= url('/projects/' . $r['slug']) ?>" class="group block">
          <span class="relative block aspect-[3/4] overflow-hidden rounded-b-xl rounded-t-full ring-1 ring-[var(--bronze)]/35"><?= fill($r['cover'], $r['name'], '(min-width:768px) 30vw, 48vw', 'transition-transform duration-[1200ms] ease-out [@media(hover:hover)]:group-hover:scale-105') ?></span>
          <span class="mt-4 block text-center"><span class="display block text-lg leading-snug transition-colors md:text-2xl [@media(hover:hover)]:group-hover:text-[var(--bronze)]"><?= e($r['name']) ?></span><span class="<?= U ?> mt-1 block text-[var(--bronze)]"><?= e($r['type']) ?> · <?= e($r['location']) ?></span></span>
        </a>
      </li>
      <?php endforeach; ?>
    </ul>
    <?php cta_block(); ?>
  </div>
</section>
