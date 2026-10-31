<?php
/* Services: the two packages as two quiet columns, the questions under them, one button. */
$s = pg()['services']; $seo = page_seo('services');
$meta['title'] = $seo['title'] ?: $s['eyebrow'] . ' | ' . (is_ar() ? 'استوديو بايكال' : 'Studio Baikal');
$meta['description'] = $seo['description'] ?: (is_ar() ? 'باقة التصميم ثلاثي الأبعاد أو التصميم والتنفيذ الكامل: ما تحصل عليه ولمن تناسب كل باقة.' : 'The 3D design package or full design and execution: what you get and who each is for.');
if ($seo['image']) $meta['image'] = $seo['image']; $meta['noindex'] = (bool) $seo['noindex'];
?>
<section class="<?= BG ?> px-5 pb-20 pt-28 md:px-10 md:pb-28 md:pt-36">
  <div class="mx-auto max-w-6xl">
    <?php page_head($s['eyebrow'], $s['title']); ?>
    <div class="mt-14 grid gap-6 md:mt-20 md:grid-cols-2 md:gap-8">
      <?php foreach ($s['packages'] as $i => $pk): ?>
      <article data-fade style="transition-delay:<?= $i * 120 ?>ms" class="rounded-2xl border border-[var(--surface)]/12 p-7 md:p-10">
        <h2 class="display text-3xl md:text-4xl"><?= e($pk['name']) ?></h2>
        <p class="<?= U ?> mt-4 text-[var(--bronze)]"><?= e($s['forLabel']) ?></p><p class="mt-2 text-[var(--surface)]/75"><?= e($pk['for']) ?></p>
        <p class="<?= U ?> mt-8 text-[var(--bronze)]"><?= e($s['included']) ?></p>
        <ul class="mt-3 divide-y divide-[var(--surface)]/10"><?php foreach ($pk['items'] as $it): ?><li class="flex gap-3 py-3 text-sm md:text-base"><span class="mt-2.5 h-px w-4 shrink-0 bg-[var(--bronze)]" aria-hidden="true"></span><?= e($it) ?></li><?php endforeach; ?></ul>
      </article>
      <?php endforeach; ?>
    </div>
    <div data-fade class="mx-auto mt-20 max-w-3xl md:mt-28">
      <h2 class="display text-center text-3xl md:text-4xl"><?= e($s['faqTitle']) ?></h2>
      <div class="mt-8"><ol data-faq>
        <?php foreach ($s['faq'] as $k => [$q, $a]): ?>
        <li class="border-t border-[var(--surface)]/15 last:border-b">
          <button type="button" aria-expanded="<?= $k === 0 ? 'true' : 'false' ?>" class="flex w-full items-center justify-between gap-6 py-6 text-start"><span class="display text-2xl md:text-3xl"><?= e($q) ?></span><span class="faq-x<?= $k === 0 ? ' on' : '' ?>" aria-hidden="true"></span></button>
          <div class="grid transition-[grid-template-rows] duration-500 <?= $k === 0 ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]' ?>"><div class="overflow-hidden"><p class="max-w-2xl pb-6 text-sm text-[var(--surface)]/75"><?= e($a) ?></p></div></div>
        </li>
        <?php endforeach; ?>
      </ol></div>
    </div>
    <?php cta_block(); ?>
  </div>
</section>
