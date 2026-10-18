import type { AdminDict } from "@/lib/admin-i18n";

/* Shared admin styles: calm ivory panels, ink text, bronze accents, 44px+ touch targets. */
export const inp = "w-full min-h-11 rounded-lg border border-[var(--ink)]/15 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--bronze)]";
export const btn = "inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--ink)] px-5 text-sm font-medium text-[var(--surface)] transition-opacity hover:opacity-90 disabled:opacity-50";
export const btnGhost = "inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--ink)]/20 px-4 text-sm transition-colors hover:border-[var(--ink)]/50";
export const btnDanger = "inline-flex min-h-11 items-center justify-center rounded-full bg-red-700 px-5 text-sm font-medium text-white hover:bg-red-800";
export const card = "rounded-2xl border border-[var(--ink)]/10 bg-white p-5";

const extra: Record<string, [string, string]> = {
  slugTaken: ["This URL slug is already used by another project.", "رابط الصفحة مستخدم في مشروع آخر."],
  emailTaken: ["A user with this email already exists.", "يوجد مستخدم بهذا البريد بالفعل."],
  confirm: ["Tick the confirmation box first.", "فعّل خانة التأكيد أولًا."],
  self: ["You cannot change your own role or disable yourself.", "لا يمكنك تغيير دورك أو تعطيل حسابك."],
  badSource: ["The 'from' path must start with / and contain no spaces.", "مسار «من» يجب أن يبدأ بـ / وبدون مسافات."],
  reserved: ["That path is protected (home pages, admin, system files).", "هذا المسار محمي (الصفحات الرئيسية أو لوحة التحكم أو ملفات النظام)."],
  badTarget: ["The target must be a path starting with / or an https:// link.", "الوجهة يجب أن تكون مسارًا يبدأ بـ / أو رابط https://."],
  duplicate: ["A redirect from this path already exists.", "يوجد تحويل من هذا المسار بالفعل."],
  loop: ["That would create a redirect loop.", "هذا سيصنع حلقة تحويل لا تنتهي."],
};
export function Notice({ msg, a, lang }: { msg?: string; a: AdminDict; lang: string }) {
  if (!msg) return null;
  const bad = ["error", "slugTaken", "emailTaken", "inUse", "confirm", "self", "denied", "badSource", "reserved", "badTarget", "duplicate", "loop"].includes(msg);
  const text = extra[msg]?.[lang === "ar" ? 1 : 0] ?? (a[msg as keyof AdminDict] as string | undefined) ?? a.saved;
  return <p role={bad ? "alert" : "status"} className={`mb-5 rounded-xl px-4 py-3 text-sm ${bad ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"}`}>{text}</p>;
}
export const fmtDate = (iso: string | null, lang: string) => (iso ? new Date(iso).toLocaleString(lang === "ar" ? "ar-EG" : "en-GB", { dateStyle: "medium", timeStyle: "short" }) : "—");
export const fmtSize = (b: number) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.round(b / 1e3)} KB`);

/* One header for every admin page: title, what the page is for, and its main actions. */
export function PageHead({ title, desc, children }: { title: string; desc?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--ink)]/10 pb-5">
      <div className="min-w-0">
        <h1 className="display text-3xl md:text-4xl">{title}</h1>
        {desc && <p className="mt-1.5 text-sm text-[var(--muted)]">{desc}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

/* Audit actions in plain words for the activity list. */
const acts: Record<string, [string, string]> = {
  "login": ["signed in", "سجّل الدخول"], "login.fail": ["failed sign-in", "محاولة دخول فاشلة"], "logout": ["signed out", "سجّل الخروج"], "logout.all": ["signed out everywhere", "خرج من كل الأجهزة"],
  "project.create": ["created a project", "أضاف مشروعًا"], "project.save": ["edited a project", "عدّل مشروعًا"], "project.delete": ["deleted a project", "حذف مشروعًا"], "project.cover": ["changed a main image", "غيّر الصورة الرئيسية"], "project.seo": ["edited project SEO", "عدّل SEO مشروع"],
  "gallery.add": ["added photos", "أضاف صورًا"], "gallery.upload": ["uploaded a photo to a project", "رفع صورة لمشروع"], "gallery.up": ["reordered photos", "رتّب الصور"], "gallery.down": ["reordered photos", "رتّب الصور"], "gallery.remove": ["removed a photo", "أزال صورة"], "gallery.save": ["renamed a photo", "عدّل اسم صورة"],
  "media.upload": ["uploaded a file", "رفع ملفًا"], "media.update": ["edited a file", "عدّل ملفًا"], "media.delete": ["deleted a file", "حذف ملفًا"],
  "inquiry.update": ["updated an inquiry", "حدّث استفسارًا"], "inquiries.export": ["exported inquiries", "صدّر الاستفسارات"],
  "user.create": ["added a user", "أضاف مستخدمًا"], "user.update": ["edited a user", "عدّل مستخدمًا"], "user.password": ["changed password", "غيّر كلمة المرور"], "user.bootstrap": ["created the first admin", "أنشأ أول مدير"],
  "settings.save": ["edited site settings", "عدّل إعدادات الموقع"], "seo.save": ["edited page SEO", "عدّل SEO صفحة"], "redirect.create": ["added a redirect", "أضاف تحويلًا"], "redirect.delete": ["removed a redirect", "حذف تحويلًا"], "revision.restore": ["restored a version", "استرجع نسخة"],
};
export const actLabel = (k: string, lang: string) => acts[k]?.[lang === "ar" ? 1 : 0] ?? k;
