<?php
declare(strict_types=1);
/* The pieces every page shares: header, footer, the WhatsApp button, the contact section, the project
   hall and the closing call to action. Markup and classes follow the calm React components one to one,
   so the compiled stylesheet styles them unchanged. */

function nav_items(): array {
  $n = array_merge(pg()['nav'], CALM_NAV[lang()]);
  return [[$n['home'], url()], [$n['projects'], url('/projects')], [$n['services'], url('/services')], [$n['studio'], url('/studio')], [$n['contact'], url('/contact')]];
}
function globe(): string { return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.8 3 2.8 15 0 18M12 3c-2.8 3-2.8 15 0 18"/></svg>'; }

function site_header(string $path): void {
  $T = t(); $other = '/' . $T['other'] . preg_replace('#^/(en|ar)#', '', $path);
  $on = fn($h) => $h === url() ? $path === $h : str_starts_with($path, $h);
  $items = nav_items(); ?>
<header id="top" data-header class="absolute inset-x-0 top-0 z-50 bg-gradient-to-b from-[var(--deep)]/70 to-transparent text-[var(--surface)]">
  <div class="flex h-16 items-center justify-between px-5 md:h-20 md:px-10">
    <a href="<?= url() ?>" aria-label="<?= e($T['nav']['home']) ?>" class="flex items-center gap-3">
      <img src="/brand/logo-light.png" alt="Studio Baikal" width="40" height="40" class="h-10 w-10">
      <span class="text-xs font-semibold uppercase tracking-[0.28em] rtl:tracking-normal"><?= is_ar() ? 'استوديو بايكال' : 'Studio Baikal' ?></span>
    </a>
    <nav class="hidden items-center gap-7 lg:flex" aria-label="Main">
      <?php foreach (array_slice($items, 0, 4) as [$l, $h]): ?>
      <a href="<?= e($h) ?>"<?= $on($h) ? ' aria-current="page"' : '' ?> class="<?= U2 ?> relative py-2 font-medium transition-opacity <?= $on($h) ? 'opacity-100' : 'opacity-80 hover:opacity-100' ?>"><?= e($l) ?><?= $on($h) ? '<span class="absolute inset-x-0 -bottom-0.5 h-px bg-[var(--bronze)]"></span>' : '' ?></a>
      <?php endforeach; ?>
      <a href="<?= e($other) ?>" hreflang="<?= $T['other'] ?>" aria-label="<?= e($T['otherLabel']) ?>" title="<?= e($T['otherLabel']) ?>" class="grid h-9 w-9 place-items-center rounded-full border border-current/30 transition-colors hover:border-current"><?= globe() ?><span class="sr-only"><?= e($T['otherLabel']) ?></span></a>
      <a href="<?= url('/contact') ?>" class="<?= U2 ?> rounded-full border border-current px-5 py-2.5"><?= e($T['nav']['book']) ?></a>
    </nav>
    <div class="flex items-center gap-3 lg:hidden">
      <a href="<?= e($other) ?>" hreflang="<?= $T['other'] ?>" aria-label="<?= e($T['otherLabel']) ?>" class="grid h-9 w-9 place-items-center rounded-full border border-current/30"><?= globe() ?></a>
      <button type="button" data-menu aria-expanded="false" aria-controls="mnav" aria-label="<?= e($T['nav']['menu']) ?>" class="grid h-11 w-11 place-items-center">
        <span class="relative block h-3 w-6">
          <span data-bar="1" class="absolute left-0 top-0 h-px w-6 bg-current transition"></span>
          <span data-bar="2" class="absolute left-0 top-[6px] h-px w-6 bg-current transition"></span>
          <span data-bar="3" class="absolute left-0 top-[12px] h-px w-6 bg-current transition"></span>
        </span>
      </button>
    </div>
  </div>
  <nav id="mnav" class="mnav absolute inset-x-0 top-16 bg-[#0B1013] text-[var(--surface)] shadow-[0_30px_60px_-20px_rgba(0,0,0,.6)] flex flex-col px-5 pb-8 pt-2 md:top-20 lg:hidden" aria-label="Mobile" inert>
    <?php foreach ($items as $k => [$l, $h]): ?>
    <a href="<?= e($h) ?>" style="transition-delay:<?= 120 + $k * 60 ?>ms" class="mnav-link display flex min-h-16 items-center justify-between border-b border-[var(--surface)]/12 text-2xl<?= $on($h) ? ' text-[var(--bronze)]' : '' ?>"><span><?= e($l) ?></span></a>
    <?php endforeach; ?>
    <div class="mnav-link mt-6 flex flex-wrap items-center justify-between gap-4 pt-8" style="transition-delay:460ms">
      <a href="<?= url('/contact') ?>" class="<?= U2 ?> inline-flex min-h-11 items-center rounded-full px-6 bg-[var(--bronze)] text-[var(--deep)]"><?= e($T['nav']['book']) ?></a>
      <a href="<?= e($other) ?>" hreflang="<?= $T['other'] ?>" class="<?= U2 ?> inline-flex min-h-11 items-center gap-2 text-[var(--surface)]/70"><?= globe() ?><?= e($T['otherLabel']) ?></a>
    </div>
  </nav>
</header>
<?php }

function site_footer(): void {
  $T = t(); $c = contact_info(); $site = settings(); $col = 'text-sm text-[var(--surface)]/70 transition-colors hover:text-[var(--bronze)]';
  $built = is_ar() ? ['تنفيذ ', 'تصميم وبرمجة شركة '] : ['Built by ', 'Designed &amp; built by ']; ?>
<footer class="ft relative isolate overflow-hidden bg-[var(--deeper)] text-[var(--surface)]" data-footer>
  <div class="ft-floor pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[34vh]" aria-hidden="true"><?= fill('/projects/el-nakhil-villa/01.webp', '', '100vw') ?></div>
  <div class="relative px-5 pt-16 md:px-10 md:pt-20">
    <span class="ft-line block h-px origin-left bg-[var(--bronze)] rtl:origin-right" aria-hidden="true"></span>
    <div class="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:gap-8">
      <div class="col-span-2 lg:col-span-1">
        <a href="<?= url() ?>" aria-label="<?= e($T['nav']['home']) ?>" class="inline-flex items-center gap-3">
          <img src="/brand/logo-light.png" alt="" width="44" height="44" class="h-11 w-11" loading="lazy">
          <span class="text-xs font-semibold uppercase tracking-[0.28em] rtl:tracking-normal"><?= is_ar() ? 'استوديو بايكال' : 'Studio Baikal' ?></span>
        </a>
        <p class="display mt-6 text-3xl italic leading-[1.3] md:text-4xl"><?= e($site['footer'][lang()]['tagline']) ?></p>
        <p class="mt-3 max-w-xs text-sm text-[var(--surface)]/60"><?= e($site['footer'][lang()]['sub']) ?></p>
      </div>
      <nav aria-label="Footer">
        <p class="<?= U16 ?> text-[var(--bronze)]"><?= e($T['footer']['explore']) ?></p>
        <ul class="mt-3"><?php foreach (nav_items() as [$l, $h]): ?><li><a href="<?= e($h) ?>" class="<?= $col ?> inline-flex min-h-10 items-center"><?= e($l) ?></a></li><?php endforeach; ?></ul>
      </nav>
      <div>
        <p class="<?= U16 ?> text-[var(--bronze)]"><?= e($T['footer']['where']) ?></p>
        <ul class="mt-3"><?php foreach ($T['footer']['cities'] as $city): ?><li class="flex min-h-10 items-center text-sm text-[var(--surface)]/70"><?= e($city) ?></li><?php endforeach; ?></ul>
      </div>
      <div class="col-span-2 sm:col-span-1">
        <p class="<?= U16 ?> text-[var(--bronze)]"><?= e($T['footer']['reach']) ?></p>
        <ul class="mt-3">
          <li><a href="<?= e($c['phoneHref']) ?>" dir="ltr" class="<?= $col ?> inline-flex min-h-10 items-center"><?= e($c['phone']) ?></a></li>
          <li><a href="mailto:<?= e($c['email']) ?>" class="<?= $col ?> inline-flex min-h-10 items-center"><?= e($c['email']) ?></a></li>
          <li><a href="<?= e($c['instagram']) ?>" target="_blank" rel="noopener" class="<?= $col ?> inline-flex min-h-10 items-center">Instagram @studio_baikal</a></li>
        </ul>
      </div>
    </div>
    <div class="mt-8 flex flex-wrap items-center justify-between gap-x-4 border-t border-[var(--surface)]/10 py-3 text-xs text-[var(--surface)]/60 md:pe-20">
      <span class="inline-flex min-h-11 items-center whitespace-nowrap">© <?= date('Y') ?> <?= e($T['footer']['rights']) ?></span>
      <a href="https://qmarketingeg.com/" target="_blank" rel="noopener" class="group inline-flex min-h-11 items-center gap-2 whitespace-nowrap text-[var(--surface)]/75 transition-colors hover:text-[var(--surface)]">
        <span class="relative hidden h-5 w-5 sm:inline-block" aria-hidden="true"><span class="absolute inset-0 rounded-full border border-[var(--bronze)]/70"></span><span class="absolute -left-0.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[var(--bronze)] transition-transform duration-700 group-hover:rotate-180" style="transform-origin:12px 0"></span></span>
        <span><span class="sm:hidden"><?= $built[0] ?></span><span class="hidden sm:inline"><?= $built[1] ?></span><b class="font-semibold">Q Marketing</b></span>
      </a>
    </div>
  </div>
  <div data-wordmark aria-hidden="true" dir="ltr" style="font-family:var(--font-display),Georgia,serif" class="wordmark display pointer-events-none relative -mb-[0.2em] h-[0.92em] select-none whitespace-nowrap px-5 text-center text-[14vw] leading-none md:px-10 md:text-[11vw]">
    <?php foreach (['wm-base', 'wm-lit'] as $cls): ?><span class="absolute inset-x-0 bottom-0 <?= $cls ?>"><?php foreach (str_split('BAIKAL') as $k => $ch): ?><span class="inline-block overflow-hidden align-bottom"><span class="wm-l inline-block" style="transition-delay:<?= $k * 80 ?>ms"><?= $ch ?></span></span><?php endforeach; ?></span><?php endforeach; ?>
  </div>
</footer>
<a href="<?= e($c['whatsapp']) ?>" target="_blank" rel="noopener" aria-label="<?= e($T['contact']['fab']) ?>" class="wa-fab group fixed bottom-3 end-3 z-40 flex h-11 items-center rounded-full bg-[var(--bronze)] text-[var(--deep)] shadow-[0_6px_18px_rgba(0,0,0,.3)] lg:bottom-5 lg:end-5">
  <span class="wa-ring" aria-hidden="true"></span>
  <span class="wa-label max-w-0 overflow-hidden whitespace-nowrap text-xs font-semibold uppercase tracking-[0.16em] rtl:tracking-normal">WhatsApp</span>
  <span class="grid h-11 w-11 place-items-center"><?= wa_svg(20) ?></span>
</a>
<?php }

/* The contact section: the promise and four ways to reach us beside the booking form. */
function contact_section(): void {
  $T = t(); $c = $T['contact']; $ci = contact_info(); $C = calm(); $ar = is_ar();
  $ic = ['phone' => 'M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z', 'mail' => 'M3 5h18v14H3z M3 5l9 7 9-7', 'insta' => 'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z M17.5 6.5h.01'];
  $rows = [['phone', $ar ? 'اتصل بنا' : 'Call us', $ci['phone'], $ci['phoneHref']], ['chat', $ar ? 'واتساب' : 'WhatsApp', $c['chat'], $ci['whatsapp']], ['mail', $ar ? 'البريد' : 'Email', $ci['email'], 'mailto:' . $ci['email']], ['insta', $ar ? 'إنستجرام' : 'Instagram', '@studio_baikal', $ci['instagram']]];
  $lab = U16; $chipOff = 'min-h-11 rounded-full border px-4 text-sm transition-colors duration-300 border-[var(--surface)]/25 text-[var(--surface)]/80 [@media(hover:hover)]:hover:border-[var(--surface)]/60';
  $row = 'mt-5 flex items-center gap-4 border-b border-[var(--surface)]/15 pb-2 transition-colors duration-300 focus-within:border-[var(--bronze)]';
  $dot = 'grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--bronze)]/50 text-[var(--bronze)]';
  $field = 'min-h-10 w-full bg-transparent text-lg font-medium text-[var(--surface)] outline-none placeholder:font-normal placeholder:text-[var(--surface)]/30';
  $chips = function (string $group, array $opts, string $sel) use ($chipOff) { foreach ($opts as $o) echo '<button type="button" data-chip="' . e($group) . '" data-value="' . e($o) . '" aria-pressed="' . ($o === $sel ? 'true' : 'false') . '" class="' . $chipOff . '"><bdi>' . e($o) . '</bdi></button>'; }; ?>
<section id="contact" class="relative overflow-hidden bg-[var(--deeper)] text-[var(--surface)]">
  <div class="grid lg:grid-cols-2">
    <div class="relative overflow-hidden">
      <canvas data-depth-field class="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true"></canvas>
      <div class="absolute inset-0 bg-gradient-to-t from-[var(--deeper)] via-[var(--deeper)]/70 to-[var(--deeper)]/30"></div>
      <div class="glow pointer-events-none absolute -top-32 start-1/4 h-[50vh] w-[50vh] rounded-full bg-[radial-gradient(circle,rgba(196,154,92,.5),transparent_60%)]" aria-hidden="true"></div>
      <?= contours('pointer-events-none absolute inset-x-0 bottom-0 h-1/3 opacity-20') ?>
      <div class="relative flex h-full flex-col justify-end gap-8 px-5 py-16 md:px-12 md:py-20">
        <div>
          <p class="<?= $lab ?> eyebrow text-[var(--bronze)]"><?= e($c['eyebrow']) ?></p>
          <h2 class="display mt-4 text-balance text-4xl md:text-6xl rtl:leading-[1.35] md:rtl:text-5xl"><?= e($c['t1']) ?> <span class="italic text-[var(--bronze)] rtl:not-italic"><?= e($c['t2']) ?></span></h2>
          <p class="mt-4 max-w-md text-sm text-[var(--surface)]/75"><?= e($c['intro']) ?></p>
        </div>
        <ul class="grid gap-px overflow-hidden rounded-2xl border border-[var(--surface)]/15 bg-[var(--surface)]/15 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <?php foreach ($rows as [$k, $label, $value, $href]): ?>
          <li class="bg-[var(--deeper)]/85">
            <a href="<?= e($href) ?>"<?= str_starts_with($href, 'http') ? ' target="_blank"' : '' ?> rel="noopener" class="flex items-center gap-4 p-4 transition-colors hover:bg-[var(--deep)]">
              <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--bronze)]/60 text-[var(--bronze)]"><?= $k === 'chat' ? wa_svg(18) : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' . $ic[$k] . '"/></svg>' ?></span>
              <span class="min-w-0"><span class="<?= $lab ?> block text-[var(--surface)]/60"><?= e($label) ?></span><span class="block truncate text-sm font-semibold"<?= $k === 'phone' ? ' dir="ltr"' : '' ?>><?= e($value) ?></span></span>
            </a>
          </li>
          <?php endforeach; ?>
        </ul>
      </div>
    </div>
    <div class="relative flex flex-col justify-center overflow-hidden bg-[#0F1A1E] px-5 py-14 text-[var(--surface)] md:px-12 md:py-20 lg:px-16">
      <div class="pointer-events-none absolute -top-40 end-0 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(196,154,92,.22),transparent_65%)]" aria-hidden="true"></div>
      <div data-thanks class="hero-in relative" hidden><p class="display text-5xl"><?= e($c['thanks']) ?></p><p class="mt-3 text-[var(--surface)]/70"><?= e($c['thanksText']) ?></p></div>
      <form data-lead-form class="relative" method="post" action="/api/leads" data-sending="<?= e($c['sending']) ?>" data-error="<?= e($c['error']) ?>" data-thanks="<?= e($c['thanks']) ?>">
        <p class="display text-3xl md:text-4xl"><?= e($T['nav']['book']) ?></p>
        <fieldset class="mt-7"><legend class="<?= $lab ?> text-[var(--surface)]/55"><?= e($C['type']) ?></legend><div class="mt-3 flex flex-wrap gap-2"><?php $chips('size', $c['sizes'], $c['sizes'][1]); ?></div></fieldset>
        <fieldset class="mt-6"><legend class="<?= $lab ?> text-[var(--surface)]/55"><?= e($c['need']) ?></legend><div class="mt-3 flex flex-wrap gap-2"><?php $chips('need', $c['needs'], $c['needs'][1]); ?></div></fieldset>
        <fieldset class="mt-6"><legend class="<?= $lab ?> text-[var(--surface)]/55"><?= e($C['areaLabel']) ?></legend><div class="mt-3 flex flex-wrap gap-2"><?php $chips('area', $C['areas'], ''); ?></div></fieldset>
        <label class="<?= $row ?> mt-7">
          <span class="<?= $dot ?>" aria-hidden="true"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21a8 8 0 0 1 16 0"/></svg></span>
          <span class="min-w-0 flex-1"><span class="<?= $lab ?> block text-[var(--surface)]/55"><?= e($c['name']) ?></span><input name="name" required autocomplete="name" placeholder="<?= $ar ? 'اكتب اسمك' : 'Your name' ?>" class="<?= $field ?>"></span>
        </label>
        <label class="<?= $row ?>">
          <span class="<?= $dot ?>" aria-hidden="true"><?= wa_svg(17) ?></span>
          <span class="min-w-0 flex-1"><span class="<?= $lab ?> block text-[var(--surface)]/55"><?= e($c['whatsapp']) ?></span><input name="whatsapp" required inputmode="tel" autocomplete="tel" dir="ltr" placeholder="01x xxxx xxxx" class="<?= $field ?> rtl:text-right"></span>
        </label>
        <input name="website" tabindex="-1" autocomplete="off" class="hidden" aria-hidden="true">
        <input type="hidden" name="area_label" value="<?= e($C['areaLabel']) ?>">
        <button class="btn btn-primary mt-8 w-full justify-between disabled:opacity-60"><span class="btn-roll"><span data-send-label><?= e($c['send']) ?></span><span aria-hidden="true"><?= e($c['send']) ?></span></span><span class="btn-ico" aria-hidden="true"></span></button>
        <p data-form-error class="mt-3 text-sm text-[#e0a383]" hidden><?= e($c['error']) ?></p>
      </form>
    </div>
  </div>
</section>
<?php }

/* The project hall: every home in an arch along a curve over the still floor; it turns by itself. */
function mirror_hall(array $projects): void {
  $T = t(); $C = calm(); if (!$projects) return;
  $pick = function (array $p) { foreach ($p['images'] as $i) if ($i['h'] > $i['w'] && $i['w'] >= 1000) return $i; foreach ($p['images'] as $i) if ($i['src'] === $p['cover']) return $i; return $p['images'][0] ?? ['src' => $p['cover'], 'room' => '']; };
  $cur = $projects[0]; ?>
<section id="projects" data-hall class="relative overflow-hidden bg-[radial-gradient(ellipse_at_50%_30%,#17252c,#05080A_72%)] px-5 py-16 text-[var(--surface)] md:px-10 md:py-24">
  <div class="flex flex-wrap items-end justify-between gap-6">
    <div>
      <p class="<?= U2 ?> eyebrow text-[var(--bronze)]"><?= e($T['gauge']['projects']) ?></p>
      <h2 class="display mt-4 text-4xl md:text-6xl"><?= e($T['strata']['title']) ?></h2>
      <p class="mt-4 max-w-md text-sm text-[var(--surface)]/65"><?= e($T['strata']['intro']) ?></p>
    </div>
    <a href="<?= url('/projects') ?>" class="inline-flex min-h-11 items-center gap-2 text-sm text-[var(--surface)]/75 transition-colors [@media(hover:hover)]:hover:text-[var(--surface)]"><?= e($T['project']['all']) ?> <span aria-hidden="true"><?= arrow() ?></span></a>
  </div>
  <div data-stage class="relative mx-auto mt-10 h-[clamp(300px,calc(72vw+24px),530px)] max-w-[1600px] touch-pan-y select-none [--step:31vw] md:[--step:min(19vw,300px)] md:mt-12 md:h-[clamp(300px,calc(32vw+24px),530px)]" style="perspective:1500px" dir="ltr">
    <?php foreach ([-1, 1] as $dir): ?>
    <button type="button" data-dir="<?= $dir ?>" aria-label="<?= e($dir < 0 ? $C['prev'] : $C['next']) ?>" class="absolute top-[36%] z-40 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-[var(--bronze)]/60 bg-[#05080A]/60 text-[var(--surface)] transition-colors [@media(hover:hover)]:hover:border-[var(--bronze)] [@media(hover:hover)]:hover:bg-[#05080A]/85 md:h-14 md:w-14 <?= $dir < 0 ? 'left-0 md:left-2' : 'right-0 md:right-2' ?>"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="<?= $dir < 0 ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7' ?>"/></svg></button>
    <?php endforeach; ?>
    <div class="absolute inset-x-0 bottom-0 h-[28%] border-t border-[var(--bronze)]/20 bg-gradient-to-b from-[#0b151a]/40 to-[#05080A]" aria-hidden="true"><div class="ripples absolute inset-0 opacity-30"></div></div>
    <div data-hall-label class="hero-in pointer-events-none absolute inset-x-0 bottom-[28%] z-30 flex translate-y-full justify-center pt-3 text-center">
      <span class="w-max max-w-[88vw] [text-shadow:0_2px_14px_rgba(5,8,10,.9)]"><span data-hall-name class="display block text-xl md:text-2xl"><?= e($cur['name']) ?></span><span data-hall-sub class="<?= U2 ?> mt-1 block text-[var(--bronze)]"><?= e($cur['type'] . ' · ' . $cur['location']) ?></span></span>
    </div>
    <?php foreach ($projects as $k => $p): $im = $pick($p); ?>
    <a href="<?= url('/projects/' . $p['slug']) ?>" data-arch="<?= $k ?>" data-name="<?= e($p['name']) ?>" data-sub="<?= e($p['type'] . ' · ' . $p['location']) ?>" aria-label="<?= e($p['name']) ?>" class="absolute bottom-[28%] left-1/2 block w-[36vw] max-w-[250px] transition-[transform,opacity,filter] duration-[1000ms] ease-[cubic-bezier(.65,0,.25,1)] md:w-[16vw]" style="visibility:hidden">
      <span class="mirror-arch relative block aspect-[3/4.3] overflow-hidden rounded-b-lg rounded-t-full ring-1 ring-[var(--bronze)]/35"><?= fill($im['src'], $p['name'] . ', ' . $im['room'], '(min-width:768px) 18vw, 50vw') ?><span data-ring class="absolute inset-0 rounded-b-lg rounded-t-full transition-shadow duration-700"></span></span>
    </a>
    <?php endforeach; ?>
  </div>
</section>
<?php }

function cta_block(): void { $c = calm()['cta']; ?>
<div class="mx-auto mt-24 max-w-6xl border-t border-[var(--bronze)]/20 pt-16 md:mt-32 md:pt-24">
  <div data-fade class="mx-auto max-w-2xl text-center">
    <h2 class="display text-4xl md:text-5xl"><?= e($c['t']) ?></h2>
    <p class="mx-auto mt-5 max-w-md text-[var(--surface)]/70"><?= e($c['s']) ?></p>
    <div class="mt-10 flex justify-center <?= U ?>"><?= btn(url('/contact'), $c['b']) ?></div>
  </div>
</div>
<?php }

function page_head(string $eyebrow, string $title, string $intro = ''): void { ?>
<div data-fade class="mx-auto max-w-3xl text-center">
  <p class="<?= EB ?>"><?= e($eyebrow) ?></p>
  <h1 class="display mt-5 text-4xl leading-[1.1] rtl:leading-[1.3] md:text-6xl"><?= e($title) ?></h1>
  <?php if ($intro): ?><p class="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-[var(--surface)]/70 md:text-base"><?= e($intro) ?></p><?php endif; ?>
</div>
<?php }
