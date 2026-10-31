<?php
declare(strict_types=1);
/* All the site copy. DICT and PAGES are generated from the Next.js sources (src/data/i18n.ts, pages.ts) by
   the build, so both editions say exactly the same thing; CALM holds the words the calm look adds. */
$__i = json_decode((string) file_get_contents(__DIR__ . '/i18n.json'), true);
define('DICT', $__i['dict']);
define('PAGES', $__i['pages']);
define('CALM_NAV', $__i['calmNav']);
unset($__i);
define('CALM', [
  'en' => [
    'intro' => 'Studio Baikal', 'scroll' => 'Scroll', 'free' => 'First consultation free', 'about' => 'About the studio', 'book' => 'Book a free consultation',
    'spaces' => ['eyebrow' => 'What we design', 'title' => 'Residential and commercial', 'lead' => 'Homes of every size and spaces for work: pick one and see how we shaped it.', 'view' => 'View projects',
      'items' => [['Villa', 'Villas'], ['Apartment', 'Apartments'], ['Clinic', 'Commercial spaces']]],
    'cta' => ['t' => 'Have a space in mind?', 's' => 'Tell us about it. We reply within one working day, and the first consultation is free.', 'b' => 'Book a free consultation'],
    'type' => 'Project type', 'areaLabel' => 'Area', 'areas' => ['150 – 250 m²', '250 – 350 m²', '350+ m²'],
    'prev' => 'Previous project', 'next' => 'Next project', 'notFound' => 'This page does not exist', 'backHome' => 'Back to the home page',
  ],
  'ar' => [
    'intro' => 'استوديو بايكال', 'scroll' => 'مرّر', 'free' => 'الاستشارة الأولى مجانية', 'about' => 'عن الاستوديو', 'book' => 'احجز استشارة مجانية',
    'spaces' => ['eyebrow' => 'ما نصممه', 'title' => 'سكني وتجاري', 'lead' => 'بيوت بكل أحجامها ومساحات للعمل: اختر نوعًا وشاهد كيف صممناه.', 'view' => 'شاهد المشاريع',
      'items' => [['Villa', 'فيلات'], ['Apartment', 'شقق'], ['Clinic', 'مساحات تجارية']]],
    'cta' => ['t' => 'عندك مساحة في بالك؟', 's' => 'احكِ لنا عنها. نرد عليك خلال يوم عمل واحد، والاستشارة الأولى مجانية.', 'b' => 'احجز استشارة مجانية'],
    'type' => 'نوع المشروع', 'areaLabel' => 'المساحة', 'areas' => ['150 – 250 متر', '250 – 350 متر', 'أكثر من 350 متر'],
    'prev' => 'المشروع السابق', 'next' => 'المشروع التالي', 'notFound' => 'الصفحة دي مش موجودة', 'backHome' => 'العودة للصفحة الرئيسية',
  ],
]);
const COVERS = ['Villa' => '/projects/el-nakhil-villa/01.webp', 'Apartment' => '/projects/october-250/04.webp', 'Clinic' => '/projects/ca-dental-clinic/04.webp'];
const STUDIO_ROOMS = ['/projects/zayed-160/02.webp', '/projects/october-250/04.webp', '/projects/el-nakhil-villa/01.webp'];
