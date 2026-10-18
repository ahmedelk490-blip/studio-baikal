import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db, type ProjectText } from "@/lib/db";
import { can } from "@/lib/perm";
import { adminDict } from "@/lib/admin-i18n";
import { addImages, deleteProject, galleryAction, saveProject } from "../../../actions";
import { ConfirmButton } from "@/components/admin/client";
import { Notice, btn, btnDanger, btnGhost, card, inp } from "@/components/admin/ui";

// Per-request admin page (session + live data): block on the server, no prerendered shell.
export const instant = false;

type Props = { params: Promise<{ lang: string; id: string }>; searchParams: Promise<{ msg?: string }> };
type P = { id: number; slug: string; status: string; featured: number; sort: number; category: string; area: string; year: string; cover: string; en: string; ar: string; seo: string };
type I = { id: number; src: string; room_en: string; room_ar: string; caption: string; w: number; h: number };

/* Project editor: both languages side by side, SEO, cover and publish state, then the gallery
   (order, room names, captions, remove) and images to add from the media library. */
export default async function EditProject({ params, searchParams }: Props) {
  const { lang, id } = await params;
  const { msg } = await searchParams;
  const u = await requireUser(lang, "projects.view");
  const a = adminDict(lang);
  const d = db();
  const p = d.prepare("SELECT * FROM projects WHERE id = ?").get(Number(id)) as P | undefined;
  if (!p) notFound();
  const en = JSON.parse(p.en) as ProjectText, ar = JSON.parse(p.ar) as ProjectText;
  const seo = JSON.parse(p.seo || "{}") as Record<"en" | "ar", { title?: string; description?: string } | undefined>;
  const imgs = d.prepare("SELECT id, src, room_en, room_ar, caption, w, h FROM project_images WHERE project_id = ? ORDER BY sort, id").all(p.id) as I[];
  const lib = d.prepare("SELECT id, path, name, title FROM media WHERE mime LIKE 'image/%' AND path NOT IN (SELECT src FROM project_images WHERE project_id = ?) ORDER BY id DESC LIMIT 60").all(p.id) as { id: number; path: string; name: string; title: string }[];
  const edit = can(u.role, "projects.edit");
  const hid = <><input type="hidden" name="lang" value={lang} /><input type="hidden" name="project" value={p.id} /></>;
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
      <label className="grid gap-1.5 text-sm">{a.seoTitle}<input name={`seo_${pre}_title`} defaultValue={seo[pre]?.title ?? ""} maxLength={70} className={inp} /></label>
      <label className="grid gap-1.5 text-sm">{a.seoDesc}<textarea name={`seo_${pre}_desc`} defaultValue={seo[pre]?.description ?? ""} maxLength={170} rows={2} className={inp} /></label>
    </fieldset>
  );
  return (
    <>
      <Notice msg={msg} a={a} lang={lang} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><Link href={`/${lang}/admin/projects`} className="text-sm text-[var(--muted)]">← {a.projects}</Link><h1 className="display mt-1 text-4xl">{lang === "ar" ? ar.name : en.name}</h1></div>
        {p.status === "published" && <a href={`/${lang}/projects/${p.slug}`} target="_blank" rel="noopener" className={btnGhost}>{a.open} ↗</a>}
      </div>

      <form action={saveProject} className="mt-6 grid gap-6">
        <fieldset disabled={!edit} className="grid gap-6">
          <input type="hidden" name="lang" value={lang} /><input type="hidden" name="id" value={p.id} />
          <div className={`${card} grid gap-4 sm:grid-cols-2 xl:grid-cols-4`}>
            <label className="grid gap-1.5 text-sm">{a.slug}<input name="slug" defaultValue={p.slug} required pattern="[a-z0-9]+(-[a-z0-9]+)*" dir="ltr" className={inp} /></label>
            <label className="grid gap-1.5 text-sm">{a.status}<select name="status" defaultValue={p.status} className={inp}><option value="draft">{a.draft}</option><option value="published">{a.published}</option></select></label>
            <label className="grid gap-1.5 text-sm">{a.category}<select name="category" defaultValue={p.category} className={inp}>{["Villa", "Apartment", "Clinic", "Office", "Retail", "Exterior"].map((c) => <option key={c}>{c}</option>)}</select></label>
            <label className="grid gap-1.5 text-sm">{a.order}<input name="sort" type="number" min={0} max={999} defaultValue={p.sort} dir="ltr" className={inp} /></label>
            <label className="grid gap-1.5 text-sm">{a.area}<input name="area" defaultValue={p.area} maxLength={40} dir="ltr" className={inp} /></label>
            <label className="grid gap-1.5 text-sm">{a.year}<input name="year" defaultValue={p.year} maxLength={10} dir="ltr" className={inp} /></label>
            <label className="grid gap-1.5 text-sm sm:col-span-2">{a.cover}<select name="cover" defaultValue={p.cover} className={inp}><option value="">—</option>{imgs.map((i) => <option key={i.id} value={i.src}>{(lang === "ar" ? i.room_ar : i.room_en) || i.src}</option>)}</select></label>
            <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" name="featured" defaultChecked={!!p.featured} className="h-5 w-5 accent-[var(--bronze)]" />{a.featured}</label>
          </div>
          <div className="grid gap-6 xl:grid-cols-2">{text("en", en)}{text("ar", ar)}</div>
          {edit && <div><button className={btn}>{a.save}</button></div>}
        </fieldset>
      </form>

      <section id="gallery" className="mt-10">
        <h2 className="display text-3xl">{a.gallery} <span className="text-base text-[var(--muted)]" dir="ltr">({imgs.length})</span></h2>
        {imgs.length === 0 ? <p className="mt-3 text-sm text-[var(--muted)]">{a.none}</p> : (
          <ol className="mt-4 grid gap-3">
            {imgs.map((i, k) => (
              <li key={i.id} className={`${card} grid items-center gap-4 p-3 md:grid-cols-[120px_1fr_auto]`}>
                <Image src={i.src} alt="" width={120} height={80} className="h-20 w-[120px] rounded-lg object-cover" />
                <form action={galleryAction} className="grid gap-2 sm:grid-cols-3">
                  {hid}<input type="hidden" name="image" value={i.id} /><input type="hidden" name="op" value="save" />
                  <input name="room_en" defaultValue={i.room_en} placeholder={a.roomEn} aria-label={a.roomEn} disabled={!edit} className={inp} />
                  <input name="room_ar" defaultValue={i.room_ar} placeholder={a.roomAr} aria-label={a.roomAr} dir="rtl" disabled={!edit} className={inp} />
                  <div className="flex gap-2"><input name="caption" defaultValue={i.caption} placeholder={a.caption} aria-label={a.caption} disabled={!edit} className={inp} />{edit && <button className={btnGhost}>✓</button>}</div>
                </form>
                {edit && (
                  <div className="flex gap-1">
                    {(["up", "down"] as const).map((op) => <form key={op} action={galleryAction}>{hid}<input type="hidden" name="image" value={i.id} /><input type="hidden" name="op" value={op} /><button disabled={(op === "up" && k === 0) || (op === "down" && k === imgs.length - 1)} aria-label={a[op]} className={`${btnGhost} disabled:opacity-30`}>{op === "up" ? "↑" : "↓"}</button></form>)}
                    <form action={galleryAction}>{hid}<input type="hidden" name="image" value={i.id} /><input type="hidden" name="op" value="remove" /><ConfirmButton label="✕" ask={`${a.remove}?`} className={btnGhost} /></form>
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
        {edit && (
          <form action={addImages} className={`${card} mt-6`}>
            {hid}
            <h3 className="font-semibold">{a.addFromLibrary}</h3>
            {lib.length === 0 ? <p className="mt-3 text-sm text-[var(--muted)]">{a.none} <Link href={`/${lang}/admin/media`} className="text-[var(--bronze)] underline">{a.upload}</Link></p> : (
              <>
                <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-8">
                  {lib.map((m) => <li key={m.id}><label className="block cursor-pointer"><input type="checkbox" name="media" value={m.id} className="peer sr-only" /><Image src={m.path} alt={m.title || m.name} width={140} height={100} className="h-20 w-full rounded-lg object-cover ring-[var(--bronze)] peer-checked:ring-4" /><span className="mt-1 block truncate text-xs text-[var(--muted)]">{m.title || m.name}</span></label></li>)}
                </ul>
                <button className={`${btn} mt-4`}>{a.addSelected}</button>
              </>
            )}
          </form>
        )}
      </section>

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
