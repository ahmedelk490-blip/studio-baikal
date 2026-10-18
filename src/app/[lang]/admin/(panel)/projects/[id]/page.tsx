import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db, type ProjectText } from "@/lib/db";
import { can } from "@/lib/perm";
import { adminDict } from "@/lib/admin-i18n";
import { deleteProject, saveProject } from "../../../actions";
import { ConfirmButton } from "@/components/admin/client";
import { Notice, btn, btnDanger, card, inp } from "@/components/admin/ui";

// Per-request admin page (session + live data): block on the server, no prerendered shell.
export const instant = false;

type Props = { params: Promise<{ lang: string; id: string }>; searchParams: Promise<{ msg?: string }> };
type P = { id: number; slug: string; status: string; featured: number; sort: number; category: string; area: string; year: string; en: string; ar: string; updated_at: string };

/* Details tab: publishing, basics, and the text in both languages side by side. */
export default async function Details({ params, searchParams }: Props) {
  const { lang, id } = await params;
  const { msg } = await searchParams;
  const u = await requireUser(lang, "projects.view");
  const a = adminDict(lang);
  const p = db().prepare("SELECT id, slug, status, featured, sort, category, area, year, en, ar, updated_at FROM projects WHERE id = ?").get(Number(id)) as P | undefined;
  if (!p) notFound();
  const en = JSON.parse(p.en) as ProjectText, ar = JSON.parse(p.ar) as ProjectText;
  const edit = can(u.role, "projects.edit");
  const text = (pre: "en" | "ar", t: ProjectText) => (
    <fieldset dir={pre === "ar" ? "rtl" : "ltr"} className={`${card} grid gap-4`}>
      <legend className="px-1 text-sm font-semibold">{pre === "en" ? a.english : a.arabic}</legend>
      <label className="grid gap-1.5 text-sm">{a.name}<input name={`${pre}_name`} defaultValue={t.name} required={pre === "en"} maxLength={120} className={inp} /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm">{a.type}<input name={`${pre}_type`} defaultValue={t.type} maxLength={60} className={inp} /></label>
        <label className="grid gap-1.5 text-sm">{a.style}<input name={`${pre}_style`} defaultValue={t.style} maxLength={80} className={inp} /></label>
      </div>
      <label className="grid gap-1.5 text-sm">{a.location}<input name={`${pre}_location`} defaultValue={t.location} maxLength={200} className={inp} /></label>
      <label className="grid gap-1.5 text-sm">{a.scope}<input name={`${pre}_scope`} defaultValue={t.scope} maxLength={120} className={inp} /></label>
      <label className="grid gap-1.5 text-sm">{a.blurb}<textarea name={`${pre}_blurb`} defaultValue={t.blurb} maxLength={600} rows={3} className={inp} /></label>
      <label className="grid gap-1.5 text-sm">{a.story}<textarea name={`${pre}_story`} defaultValue={t.story} maxLength={4000} rows={6} className={inp} /></label>
      <label className="grid gap-1.5 text-sm">{a.materials}<textarea name={`${pre}_materials`} defaultValue={t.materials.join("\n")} rows={4} className={inp} /></label>
    </fieldset>
  );
  return (
    <>
      <Notice msg={msg} a={a} lang={lang} />
      <form key={p.updated_at} action={saveProject} className="grid gap-6">
        <fieldset disabled={!edit} className="grid gap-6">
          <input type="hidden" name="lang" value={lang} /><input type="hidden" name="id" value={p.id} />
          <div className={`${card} grid gap-4 sm:grid-cols-2 xl:grid-cols-4`}>
            <label className="grid gap-1.5 text-sm">{a.status}<select name="status" defaultValue={p.status} className={inp}><option value="draft">{a.draft}</option><option value="published">{a.published}</option></select></label>
            <label className="grid gap-1.5 text-sm">{a.category}<select name="category" defaultValue={p.category} className={inp}>{["Villa", "Apartment", "Clinic", "Office", "Retail", "Exterior"].map((c) => <option key={c}>{c}</option>)}</select></label>
            <label className="grid gap-1.5 text-sm">{a.area}<input name="area" defaultValue={p.area} maxLength={40} dir="ltr" className={inp} /></label>
            <label className="grid gap-1.5 text-sm">{a.year}<input name="year" defaultValue={p.year} maxLength={10} dir="ltr" className={inp} /></label>
            <label className="grid gap-1.5 text-sm sm:col-span-2">{a.slug}<input name="slug" defaultValue={p.slug} required pattern="[a-z0-9]+(-[a-z0-9]+)*" dir="ltr" className={inp} /></label>
            <label className="grid gap-1.5 text-sm">{a.order}<input name="sort" type="number" min={0} max={999} defaultValue={p.sort} dir="ltr" className={inp} /></label>
            <label className="flex min-h-11 items-center gap-2 self-end text-sm"><input type="checkbox" name="featured" defaultChecked={!!p.featured} className="h-5 w-5 accent-[var(--bronze)]" />{a.featured}</label>
          </div>
          <div className="grid gap-6 xl:grid-cols-2">{text("en", en)}{text("ar", ar)}</div>
          {edit && <div className="sticky bottom-3 z-10"><button className={`${btn} shadow-lg`}>{a.save}</button></div>}
        </fieldset>
      </form>

      {can(u.role, "projects.delete") && (
        <form action={deleteProject} className="mt-10 rounded-2xl border border-red-200 bg-red-50/50 p-5">
          <input type="hidden" name="lang" value={lang} /><input type="hidden" name="id" value={p.id} />
          <h2 className="font-semibold text-red-800">{a.deleteProject}</h2>
          <label className="mt-3 flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" name="confirm" value="yes" required className="h-5 w-5" />{a.confirmDelete}</label>
          <ConfirmButton label={a.delete} ask={`${a.deleteProject}?`} className={`${btnDanger} mt-3`} />
        </form>
      )}
    </>
  );
}
