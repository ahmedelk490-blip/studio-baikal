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
};
export function Notice({ msg, a, lang }: { msg?: string; a: AdminDict; lang: string }) {
  if (!msg) return null;
  const bad = ["error", "slugTaken", "emailTaken", "inUse", "confirm", "self", "denied"].includes(msg);
  const text = extra[msg]?.[lang === "ar" ? 1 : 0] ?? (a[msg as keyof AdminDict] as string | undefined) ?? a.saved;
  return <p role={bad ? "alert" : "status"} className={`mb-5 rounded-xl px-4 py-3 text-sm ${bad ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"}`}>{text}</p>;
}
export const fmtDate = (iso: string | null, lang: string) => (iso ? new Date(iso).toLocaleString(lang === "ar" ? "ar-EG" : "en-GB", { dateStyle: "medium", timeStyle: "short" }) : "—");
export const fmtSize = (b: number) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.round(b / 1e3)} KB`);
