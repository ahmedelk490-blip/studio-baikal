<?php $C = calm(); $meta['title'] = '404 | Studio Baikal'; $meta['noindex'] = true; ?>
<section class="<?= BG ?> grid min-h-[70vh] place-items-center px-5 pb-20 pt-28 text-center md:px-10">
  <div><p class="<?= EB ?>">404</p><h1 class="display mt-5 text-4xl md:text-6xl"><?= e($C['notFound']) ?></h1><div class="mt-10 flex justify-center <?= U ?>"><?= btn(url(), $C['backHome'], 'ghost') ?></div></div>
</section>
