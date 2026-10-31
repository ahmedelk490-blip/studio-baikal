<?php
declare(strict_types=1);
/* Admin screens, in Arabic: sign in, inbox, projects, one project, settings. */
function admin_page(string $title, string $body, string $nav = '', bool $bare = false): void {
  $csrf = $_SESSION['csrf'] ?? '';
  echo '<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>' . e($title) . ' · لوحة التحكم</title><link rel="icon" href="/icon.png"><link rel="stylesheet" href="/_next/static/chunks/fonts.css"><link rel="stylesheet" href="/admin/admin.css"></head><body>';
  if (!$bare) {
    $links = [['/', 'الطلبات'], ['/projects', 'المشاريع'], ['/settings', 'الإعدادات']];
    echo '<aside class="side"><a class="brand" href="/admin"><img src="/brand/logo-light.png" alt="">استوديو بايكال</a><nav>';
    foreach ($links as [$h, $l]) echo '<a href="/admin' . $h . '"' . ($nav === $h ? ' class="on"' : '') . '>' . $l . '</a>';
    echo '<a href="/ar" target="_blank">فتح الموقع ↗</a></nav><div class="user">' . e($GLOBALS['user']['email'] ?? '') . '<br><a href="/admin/logout">تسجيل الخروج</a></div></aside>';
  }
  echo '<main' . ($bare ? ' class="login"' : '') . '>' . str_replace('{csrf}', e($csrf), $body) . '</main></body></html>';
}
function admin_login(string $err): void {
  admin_page('تسجيل الدخول', '<form method="post"><div class="brand"><img src="/brand/logo-light.png" width="44" height="44" alt=""><b>لوحة تحكم استوديو بايكال</b></div><div class="card">'
    . ($err ? '<p class="err">' . e($err) . '</p>' : '') . '<div class="row"><div><label>البريد الإلكتروني</label><input type="email" name="email" required autocomplete="username"></div><div><label>كلمة السر</label><input type="password" name="password" required autocomplete="current-password"></div></div>'
    . '<input type="hidden" name="csrf" value="{csrf}"><button class="btn" style="width:100%;justify-content:center">دخول</button></div></form>', '', true);
}
function flash_html(?string $m): string { return $m ? '<div class="flash">' . e($m) . '</div>' : ''; }
function admin_inquiries(array $rows, ?string $flash): void {
  $st = ['new' => 'جديد', 'contacted' => 'تم التواصل', 'in_progress' => 'قيد المتابعة', 'won' => 'تم التعاقد', 'lost' => 'لم يتم', 'spam' => 'سبام'];
  $b = '<div class="top"><h1>طلبات الحجز</h1><a class="btn ghost sm" href="/admin/?export=csv">تصدير CSV</a></div>' . flash_html($flash);
  if (!$rows) $b .= '<div class="card">لا توجد طلبات بعد. كل طلب من فورم "احجز استشارة" على الموقع يظهر هنا.</div>';
  else {
    $b .= '<div class="card"><table><tr><th>التاريخ</th><th>الاسم</th><th>واتساب</th><th>النوع · الخدمة · المساحة</th><th>الحالة والملاحظات</th><th></th></tr>';
    foreach ($rows as $r) {
      $opts = ''; foreach ($st as $k => $l) $opts .= '<option value="' . $k . '"' . ($r['status'] === $k ? ' selected' : '') . '>' . $l . '</option>';
      $wa = preg_replace('/\D/', '', $r['whatsapp']); if ($wa && str_starts_with($wa, '0')) $wa = '20' . substr($wa, 1);
      $b .= '<tr><td dir="ltr">' . e(substr($r['at'], 0, 16)) . '</td><td><b>' . e($r['name']) . '</b>' . ($r['email'] ? '<br><small>' . e($r['email']) . '</small>' : '') . '</td><td dir="ltr">' . e($r['whatsapp']) . ($wa ? ' <a href="https://wa.me/' . e($wa) . '" target="_blank">↗</a>' : '') . '</td><td>' . e(implode(' · ', array_filter([$r['size'], $r['need'], $r['message']]))) . '</td>'
        . '<td><form method="post" class="inline"><input type="hidden" name="csrf" value="{csrf}"><input type="hidden" name="_action" value="status"><input type="hidden" name="id" value="' . e($r['id']) . '"><select name="status">' . $opts . '</select><input type="text" name="notes" value="' . e($r['notes']) . '" placeholder="ملاحظة"><button class="btn sm">حفظ</button></form></td>'
        . '<td><form method="post" onsubmit="return confirm(\'حذف الطلب؟\')"><input type="hidden" name="csrf" value="{csrf}"><input type="hidden" name="_action" value="delete"><input type="hidden" name="id" value="' . e($r['id']) . '"><button class="btn danger sm">حذف</button></form></td></tr>';
    }
    $b .= '</table></div>';
  }
  admin_page('الطلبات', $b, '/');
}
function admin_projects(array $rows, ?string $flash): void {
  $cat = ['Villa' => 'فيلا', 'Apartment' => 'شقة', 'Clinic' => 'تجاري'];
  $b = '<div class="top"><h1>المشاريع</h1><a class="btn" href="/admin/projects/new">+ مشروع جديد</a></div>' . flash_html($flash) . '<div class="card"><table><tr><th>الغلاف</th><th>الاسم</th><th>النوع</th><th>الحالة</th><th>الترتيب</th><th></th></tr>';
  foreach ($rows as $r) { $ar = json_decode($r['ar'], true) ?: []; $en = json_decode($r['en'], true) ?: [];
    $b .= '<tr><td>' . ($r['cover'] ? '<img src="' . e(preg_replace('/\.webp$/', '.w480.webp', $r['cover'])) . '" onerror="this.src=\'' . e($r['cover']) . '\'" style="width:72px;aspect-ratio:4/3;object-fit:cover;border-radius:8px" alt="">' : '') . '</td><td><b>' . e($ar['name'] ?? '') . '</b><br><small>' . e($en['name'] ?? '') . ' · /' . e($r['slug']) . '</small></td><td>' . ($cat[$r['category']] ?? e($r['category'])) . '</td><td><span class="pill' . ($r['status'] === 'published' ? ' on' : '') . '">' . ($r['status'] === 'published' ? 'منشور' : 'مسودة') . '</span>' . ($r['featured'] ? ' <span class="pill on">مميز</span>' : '') . '</td><td>' . (int) $r['sort'] . '</td><td><a class="btn ghost sm" href="/admin/projects/' . (int) $r['id'] . '">تعديل</a> <a class="btn ghost sm" href="/ar/projects/' . e($r['slug']) . '" target="_blank">عرض</a></td></tr>'; }
  admin_page('المشاريع', $b . '</table></div>', '/projects');
}
function admin_project(?array $row, array $images, ?string $flash): void {
  $id = (int) ($row['id'] ?? 0); $t = ['en' => json_decode($row['en'] ?? '{}', true) ?: [], 'ar' => json_decode($row['ar'] ?? '{}', true) ?: []]; $seo = json_decode($row['seo'] ?? '{}', true) ?: [];
  $v = fn($k, $d = '') => e((string) ($row[$k] ?? $d));
  $tx = fn($l, $k) => e(is_array($t[$l][$k] ?? null) ? implode('، ', $t[$l][$k]) : (string) ($t[$l][$k] ?? ''));
  $b = '<div class="top"><h1>' . ($id ? 'تعديل مشروع' : 'مشروع جديد') . '</h1>' . ($id ? '<a class="btn ghost sm" href="/ar/projects/' . $v('slug') . '" target="_blank">عرض على الموقع ↗</a>' : '') . '</div>' . flash_html($flash);
  $b .= '<form method="post"><input type="hidden" name="csrf" value="{csrf}"><input type="hidden" name="_action" value="save"><div class="card"><h2 style="margin-top:0">البيانات الأساسية</h2><div class="row c4">'
    . '<div><label>الرابط (slug، حروف إنجليزية)</label><input type="text" name="slug" value="' . $v('slug') . '" required dir="ltr"></div>'
    . '<div><label>النوع</label><select name="category">' . implode('', array_map(fn($k, $l) => '<option value="' . $k . '"' . (($row['category'] ?? 'Apartment') === $k ? ' selected' : '') . '>' . $l . '</option>', ['Villa', 'Apartment', 'Clinic'], ['فيلا', 'شقة', 'تجاري / عيادة'])) . '</select></div>'
    . '<div><label>الحالة</label><select name="status"><option value="draft"' . (($row['status'] ?? 'draft') === 'draft' ? ' selected' : '') . '>مسودة (لا تظهر)</option><option value="published"' . (($row['status'] ?? '') === 'published' ? ' selected' : '') . '>منشور</option></select></div>'
    . '<div><label>الترتيب (الأصغر أولًا)</label><input type="number" name="sort" value="' . $v('sort', '0') . '"></div></div>'
    . '<div class="row c3"><div><label>المساحة (اختياري، لا تظهر على الموقع)</label><input type="text" name="area" value="' . $v('area') . '"></div><div><label>السنة</label><input type="text" name="year" value="' . $v('year') . '"></div><div><label><input type="checkbox" name="featured"' . (!empty($row['featured']) ? ' checked' : '') . '> مشروع مميز</label></div></div>'
    . '<input type="hidden" name="cover" value="' . $v('cover') . '"></div>';
  foreach (['ar' => 'النص العربي', 'en' => 'English text'] as $l => $h) {
    $dir = $l === 'en' ? ' dir="ltr"' : '';
    $b .= '<div class="card"' . $dir . '><h2 style="margin-top:0">' . $h . '</h2><div class="row c2"><div><label>' . ($l === 'ar' ? 'اسم المشروع' : 'Name') . '</label><input type="text" name="name_' . $l . '" value="' . $tx($l, 'name') . '" required></div><div><label>' . ($l === 'ar' ? 'النوع كما يظهر (فيلا، شقة...)' : 'Type as shown') . '</label><input type="text" name="type_' . $l . '" value="' . $tx($l, 'type') . '"></div></div>'
      . '<div class="row c3"><div><label>' . ($l === 'ar' ? 'المكان' : 'Location') . '</label><input type="text" name="location_' . $l . '" value="' . $tx($l, 'location') . '"></div><div><label>' . ($l === 'ar' ? 'الطراز' : 'Style') . '</label><input type="text" name="style_' . $l . '" value="' . $tx($l, 'style') . '"></div><div><label>' . ($l === 'ar' ? 'النطاق' : 'Scope') . '</label><input type="text" name="scope_' . $l . '" value="' . $tx($l, 'scope') . '"></div></div>'
      . '<div class="row"><div><label>' . ($l === 'ar' ? 'سطر تعريفي' : 'Blurb') . '</label><input type="text" name="blurb_' . $l . '" value="' . $tx($l, 'blurb') . '"></div><div><label>' . ($l === 'ar' ? 'الحكاية' : 'Story') . '</label><textarea name="story_' . $l . '">' . $tx($l, 'story') . '</textarea></div><div><label>' . ($l === 'ar' ? 'الخامات (افصل بفاصلة)' : 'Materials (comma separated)') . '</label><input type="text" name="materials_' . $l . '" value="' . $tx($l, 'materials') . '"></div></div>'
      . '<details><summary>SEO</summary><div class="row c2" style="margin-top:10px"><div><label>Title</label><input type="text" name="seo_title_' . $l . '" value="' . e($seo[$l]['title'] ?? '') . '"></div><div><label>Description</label><input type="text" name="seo_desc_' . $l . '" value="' . e($seo[$l]['description'] ?? '') . '"></div></div></details></div>';
  }
  $b .= '<div class="inline"><button class="btn">حفظ المشروع</button>' . ($id ? '<a class="btn ghost" href="/admin/projects">رجوع</a>' : '') . '</div></form>';
  if ($id) {
    $b .= '<h2>الصور</h2><div class="card"><form method="post" enctype="multipart/form-data" class="inline"><input type="hidden" name="csrf" value="{csrf}"><input type="hidden" name="_action" value="upload"><input type="file" name="photos[]" accept="image/*" multiple required><button class="btn sm">رفع الصور</button><span class="hint">JPG أو PNG أو WebP، تتصغّر تلقائيًا إلى 1600 بكسل</span></form></div>';
    if ($images) {
      $b .= '<form method="post"><input type="hidden" name="csrf" value="{csrf}"><input type="hidden" name="_action" value="images"><div class="imgs">';
      foreach ($images as $im) { $iid = (int) $im['id'];
        $b .= '<figure><img src="' . e(preg_replace('/\.webp$/', '.w480.webp', $im['src'])) . '" onerror="this.src=\'' . e($im['src']) . '\'" alt=""><div class="f"><div class="l"><label style="margin:0"><input type="radio" name="cover" value="' . e($im['src']) . '"' . (($row['cover'] ?? '') === $im['src'] ? ' checked' : '') . '> الغلاف</label><span>ترتيب <input type="number" name="sort[' . $iid . ']" value="' . (int) $im['sort'] . '" style="width:64px"></span></div>'
          . '<input type="text" name="room_ar[' . $iid . ']" value="' . e($im['room_ar']) . '" placeholder="اسم الغرفة بالعربي"><input type="text" name="room_en[' . $iid . ']" value="' . e($im['room_en']) . '" placeholder="Room name in English" dir="ltr">'
          . '<a class="btn danger sm" href="/admin/projects/' . $id . '?del=' . $iid . '" onclick="return confirm(\'حذف الصورة؟\')">حذف</a></div></figure>'; }
      $b .= '</div><div class="inline" style="margin-top:14px"><button class="btn">حفظ الصور والغلاف</button></div></form>';
    }
    $b .= '<h2>حذف</h2><form method="post" onsubmit="return confirm(\'حذف المشروع بكل صوره من الموقع؟\')"><input type="hidden" name="csrf" value="{csrf}"><input type="hidden" name="_action" value="delete"><button class="btn danger sm">حذف المشروع</button></form>';
  }
  admin_page($id ? 'تعديل مشروع' : 'مشروع جديد', $b, '/projects');
}
function admin_settings(array $s, array $seo, array $user, ?string $flash): void {
  $b = '<h1>الإعدادات</h1>' . flash_html($flash) . '<form method="post"><input type="hidden" name="csrf" value="{csrf}"><input type="hidden" name="_action" value="site"><div class="card"><h2 style="margin-top:0">بيانات التواصل</h2>'
    . '<div class="row c4"><div><label>الهاتف</label><input type="text" name="phone" value="' . e($s['phone']) . '" dir="ltr"></div><div><label>البريد</label><input type="email" name="email" value="' . e($s['email']) . '" dir="ltr"></div><div><label>رقم واتساب (بكود الدولة)</label><input type="text" name="whatsapp" value="' . e($s['whatsapp']) . '" dir="ltr"></div><div><label>رابط إنستجرام</label><input type="url" name="instagram" value="' . e($s['instagram']) . '" dir="ltr"></div></div>'
    . '<div class="row c2"><div><label>رسالة واتساب الجاهزة (عربي)</label><input type="text" name="wa_ar" value="' . e($s['waText']['ar']) . '"></div><div><label>WhatsApp greeting (English)</label><input type="text" name="wa_en" value="' . e($s['waText']['en']) . '" dir="ltr"></div></div>'
    . '<div class="row c2"><div><label>شعار الفوتر (عربي)</label><input type="text" name="tag_ar" value="' . e($s['footer']['ar']['tagline']) . '"><label style="margin-top:8px">سطر تحته (عربي)</label><input type="text" name="sub_ar" value="' . e($s['footer']['ar']['sub']) . '"></div><div><label>Footer tagline (English)</label><input type="text" name="tag_en" value="' . e($s['footer']['en']['tagline']) . '" dir="ltr"><label style="margin-top:8px">Footer line (English)</label><input type="text" name="sub_en" value="' . e($s['footer']['en']['sub']) . '" dir="ltr"></div></div>'
    . '<button class="btn">حفظ الإعدادات</button></div></form>';
  $b .= '<form method="post"><input type="hidden" name="csrf" value="{csrf}"><input type="hidden" name="_action" value="seo"><div class="card"><h2 style="margin-top:0">SEO الصفحات الثابتة</h2><p class="hint">اتركه فارغًا ليستخدم النص الأصلي.</p>';
  foreach (['home' => 'الرئيسية', 'projects' => 'المشاريع', 'services' => 'الخدمات', 'studio' => 'الاستوديو', 'contact' => 'تواصل'] as $pg => $l) {
    $b .= '<details style="margin-bottom:10px"><summary>' . $l . '</summary>';
    foreach (['ar' => 'عربي', 'en' => 'English'] as $lg => $ll) { $r = $seo[$pg][$lg] ?? []; $b .= '<div class="row c3" style="margin-top:10px"><div><label>Title (' . $ll . ')</label><input type="text" name="t_' . $pg . '_' . $lg . '" value="' . e($r['title'] ?? '') . '"></div><div><label>Description (' . $ll . ')</label><input type="text" name="d_' . $pg . '_' . $lg . '" value="' . e($r['description'] ?? '') . '"></div><div><label>صورة المشاركة (رابط)</label><input type="text" name="i_' . $pg . '_' . $lg . '" value="' . e($r['image'] ?? '') . '" dir="ltr"><label style="margin-top:6px"><input type="checkbox" name="n_' . $pg . '_' . $lg . '"' . (!empty($r['noindex']) ? ' checked' : '') . '> إخفاء من جوجل</label></div></div>'; }
    $b .= '</details>';
  }
  $b .= '<button class="btn">حفظ SEO</button></div></form>';
  $b .= '<form method="post"><input type="hidden" name="csrf" value="{csrf}"><input type="hidden" name="_action" value="password"><div class="card"><h2 style="margin-top:0">كلمة السر</h2><p class="hint">الحساب: ' . e($user['email']) . '</p><div class="row c2"><div><label>الحالية</label><input type="password" name="current" required autocomplete="current-password"></div><div><label>الجديدة (10 حروف على الأقل)</label><input type="password" name="new" required minlength="10" autocomplete="new-password"></div></div><button class="btn">تغيير كلمة السر</button></div></form>';
  admin_page('الإعدادات', $b, '/settings');
}
