<?php
/* Booking: the same dark form as the home, on its own page. */
$T = t(); $seo = page_seo('contact');
$meta['title'] = $seo['title'] ?: pg()['contact']['eyebrow'] . ' | ' . (is_ar() ? 'استوديو بايكال' : 'Studio Baikal');
$meta['description'] = $seo['description'] ?: (is_ar() ? 'احجز استشارة تصميم داخلي مجانية مع استوديو بايكال. ثلاثة أسئلة ثم نتصل بك خلال يوم عمل.' : 'Book a free interior design consultation with Studio Baikal. Three questions, then we call you within one working day.');
if ($seo['image']) $meta['image'] = $seo['image']; $meta['noindex'] = (bool) $seo['noindex'];
?>
<div class="bg-[#0B1013] pt-16 md:pt-20"><?php contact_section(); ?></div>
