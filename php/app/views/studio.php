<?php
/* The studio: the name's meaning, three chapters beside three rooms, the values, one button. */
$T = t(); $s = pg()['studio']; $seo = page_seo('studio');
$meta['title'] = $seo['title'] ?: $s['eyebrow'] . ' | ' . (is_ar() ? 'استوديو بايكال' : 'Studio Baikal');
$meta['description'] = $seo['description'] ?: $s['intro']; if ($seo['image']) $meta['image'] = $seo['image']; $meta['noindex'] = (bool) $seo['noindex'];
?>
<section class="<?= BG ?> px-5 pb-20 pt-28 md:px-10 md:pb-28 md:pt-36">
  <div class="mx-auto max-w-6xl">
    <?php page_head($s['eyebrow'], $s['title'], $s['intro']); ?>
    <div class="mt-16 space-y-16 md:mt-24 md:space-y-28">
      <?php foreach ($s['chapters'] as $i => [$h, $text]): ?>
      <div data-fade class="grid items-center gap-8 md:grid-cols-2 md:gap-16">
        <div class="relative aspect-[4/5] overflow-hidden rounded-2xl<?= $i % 2 ? ' md:order-2' : '' ?>"><?= fill(STUDIO_ROOMS[$i % 3], '', '(min-width:768px) 45vw, 100vw') ?></div>
        <div class="<?= $i % 2 ? 'md:order-1' : '' ?>"><p class="<?= U ?> text-[var(--bronze)]"><?= e($h) ?></p><p class="display mt-4 text-2xl leading-[1.35] rtl:leading-[1.6] md:text-3xl"><?= e($text) ?></p></div>
      </div>
      <?php endforeach; ?>
    </div>
    <div data-fade class="mt-20 border-t border-[var(--surface)]/12 pt-14 md:mt-28">
      <h2 class="display text-center text-3xl md:text-4xl"><?= e($s['valuesTitle']) ?></h2>
      <ul class="mx-auto mt-10 grid max-w-4xl gap-8 md:grid-cols-3"><?php foreach ($T['studio']['values'] as [$k, $v]): ?><li class="text-center"><span class="display block text-xl"><?= e($k) ?></span><span class="mt-2 block text-sm text-[var(--surface)]/65"><?= e($v) ?></span></li><?php endforeach; ?></ul>
    </div>
    <?php cta_block(); ?>
  </div>
</section>
