<?php
/* The calm home: the film, a short word, the project hall, what we design, the studio, the contact form. */
$T = t(); $C = calm(); $list = projects(); $seo = page_seo('home');
if ($seo['title']) $meta['title'] = $seo['title']; if ($seo['description']) $meta['description'] = $seo['description']; if ($seo['image']) $meta['image'] = $seo['image']; $meta['noindex'] = (bool) $seo['noindex'];
$counts = []; foreach ($list as $p) $counts[$p['kind']] = ($counts[$p['kind']] ?? 0) + 1;
?>
<section class="relative grid h-[100svh] min-h-[600px] place-items-center overflow-hidden bg-[#0B1013] text-[var(--surface)]">
  <video class="absolute inset-0 h-full w-full object-cover" autoplay muted loop playsinline preload="auto" poster="<?= HERO_VIDEO['poster'] ?>" aria-hidden="true">
    <source src="<?= HERO_VIDEO['mobile'] ?>" type="video/mp4" media="(max-width: 767px)">
    <source src="<?= HERO_VIDEO['mp4'] ?>" type="video/mp4">
  </video>
  <div class="absolute inset-0 bg-gradient-to-b from-[#0B1013]/60 via-[#0B1013]/40 to-[#0B1013]/85" aria-hidden="true"></div>
  <div class="calm-hero relative flex flex-col items-center px-6 text-center">
    <span class="h-px w-24 bg-[var(--bronze)]" aria-hidden="true"></span>
    <h1 class="display mt-8 max-w-3xl text-4xl leading-[1.1] rtl:leading-[1.35] md:text-6xl"><?= e($T['hero']['t1']) ?> <span class="italic text-[var(--bronze)] rtl:not-italic"><?= e($T['hero']['t2']) ?></span></h1>
    <p class="mt-5 max-w-md text-sm leading-relaxed text-[var(--surface)]/80"><?= e($T['hero']['intro']) ?></p>
    <div class="mt-9 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 <?= U ?>"><?= btn(url('#contact'), $T['hero']['cta1']) ?><?= btn(url('#projects'), $T['hero']['cta2'], 'ghost') ?></div>
  </div>
  <div class="absolute inset-x-0 bottom-0 hidden items-end justify-between px-10 pb-7 text-[var(--surface)]/60 md:flex <?= U ?>"><span><?= e(implode(' · ', array_slice($T['footer']['cities'], 0, 3))) ?></span><span><?= e($C['free']) ?></span></div>
  <a href="#projects" class="absolute bottom-5 left-1/2 flex min-h-11 min-w-11 -translate-x-1/2 flex-col items-center gap-2 p-2 text-[var(--surface)]/60 <?= U ?>"><?= e($C['scroll']) ?><span class="calm-line block h-10 w-px bg-[var(--bronze)]" aria-hidden="true"></span></a>
</section>

<section id="intro" class="<?= SEC ?> max-md:hidden">
  <div class="mx-auto max-w-6xl text-center">
    <p data-fade class="<?= EB ?>"><?= e($C['intro']) ?></p>
    <p data-fade class="display mx-auto mt-6 max-w-4xl text-2xl leading-[1.35] rtl:leading-[1.6] md:text-4xl"><?= e($T['statement']['text']) ?></p>
    <div data-fade class="relative mx-auto mt-14 aspect-[16/9] w-full overflow-hidden rounded-2xl md:mt-20"><?= fill('/projects/nasr-city-108/02.webp', '', '(min-width:1024px) 1024px, 100vw', 'calm-zoom') ?></div>
  </div>
</section>

<?php mirror_hall($list); ?>

<section class="<?= SEC ?> border-t border-[var(--bronze)]/15">
  <div class="mx-auto max-w-6xl">
    <div data-fade class="grid gap-6 md:grid-cols-2 md:items-end">
      <div><p class="<?= EB ?>"><?= e($C['spaces']['eyebrow']) ?></p><h2 class="display mt-5 text-4xl md:text-6xl"><?= e($C['spaces']['title']) ?></h2></div>
      <p class="max-w-sm text-[var(--surface)]/70 md:justify-self-end"><?= e($C['spaces']['lead']) ?></p>
    </div>
    <div class="mt-12 grid gap-4 md:mt-16 md:grid-cols-3 md:gap-6">
      <?php foreach ($C['spaces']['items'] as [$kind, $label]): if (empty($counts[$kind])) continue; ?>
      <a data-fade href="<?= url('/projects?type=' . $kind) ?>" class="group relative block aspect-[4/3] overflow-hidden rounded-t-[999px] rounded-b-xl ring-1 ring-[var(--bronze)]/30 md:aspect-[3/4]">
        <?= fill(COVERS[$kind], $label, '(min-width:768px) 33vw, 100vw', 'transition-transform duration-[1200ms] ease-out [@media(hover:hover)]:group-hover:scale-105') ?>
        <span class="absolute inset-0 bg-gradient-to-t from-[#05080A]/85 via-[#05080A]/10 to-transparent" aria-hidden="true"></span>
        <span class="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 p-6 text-center md:p-8"><span class="display text-3xl"><?= e($label) ?></span><span class="<?= U ?> inline-flex items-center gap-2 text-[var(--surface)]/75 transition-colors [@media(hover:hover)]:group-hover:text-[var(--bronze)]"><?= e($C['spaces']['view']) ?> <span aria-hidden="true"><?= arrow() ?></span></span></span>
      </a>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<section id="studio" class="<?= SEC ?> overflow-hidden border-t border-[var(--bronze)]/15">
  <div class="mx-auto grid max-w-6xl items-center gap-16 md:grid-cols-2 md:gap-24">
    <div data-fade class="relative mx-auto w-[calc(100%-1.5rem)] max-w-md">
      <span class="absolute -inset-3 border border-[var(--bronze)]/60 md:-inset-6" aria-hidden="true"></span>
      <div class="relative aspect-[4/5] overflow-hidden"><?= fill('/projects/zayed-160/02.webp', '', '(min-width:768px) 40vw, 90vw') ?></div>
    </div>
    <div data-fade>
      <p class="<?= EB ?>"><?= e($T['studio']['eyebrow']) ?></p>
      <h2 class="display mt-5 text-4xl leading-[1.12] rtl:leading-[1.35] md:text-5xl"><?= e($T['studio']['title']) ?></h2>
      <p class="mt-6 leading-relaxed text-[var(--surface)]/75"><?= e($T['studio']['text']) ?></p>
      <ul class="mt-8 space-y-4 border-t border-[var(--surface)]/15 pt-8">
        <?php foreach ($T['studio']['values'] as [$k, $v]): ?><li class="flex gap-4"><span class="mt-2.5 h-px w-6 shrink-0 bg-[var(--bronze)]" aria-hidden="true"></span><span><span class="display text-lg"><?= e($k) ?></span><span class="block text-sm text-[var(--surface)]/65"><?= e($v) ?></span></span></li><?php endforeach; ?>
      </ul>
      <div class="mt-10 <?= U ?>"><?= btn(url('/studio'), $C['about'], 'ghost') ?></div>
    </div>
  </div>
</section>

<?php contact_section(); ?>
