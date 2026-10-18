import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { can } from "@/lib/perm";
import { adminDict } from "@/lib/admin-i18n";
import { addImages, galleryAction, setCover } from "../../../../actions";
import { ConfirmButton, Uploader } from "@/components/admin/client";
import { Notice, btn, btnGhost, card, inp } from "@/components/admin/ui";

// Per-request admin page (session + live data): block on the server, no prerendered shell.
export const instant = false;

type Props = { params: Promise<{ lang: string; id: string }>; searchParams: Promise<{ msg?: string }> };
type I = { id: number; src: string; room_en: string; room_ar: string; caption: string; w: number; h: number };

/* Images tab: upload straight into this project, then for every photo: set it as the main image,
   download it, move it earlier/later, rename the room in both languages, or remove it. Photos
   already in the media library can be added at the bottom. */
export default async function Images({ params, searchParams }: Props) {
  const { lang, id } = await params;
  const { msg } = await searchParams;
  const u = await requireUser(lang, "projects.view");
  const a = adminDict(lang);
  const d = db();
  const p = d.prepare("SELECT id, slug, cover FROM projects WHERE id = ?").get(Number(id)) as { id: number; slug: string; cover: string } | undefined;
  if (!p) notFound();
  const imgs = d.prepare("SELECT id, src, room_en, room_ar, caption, w, h FROM project_images WHERE project_id = ? ORDER BY sort, id").all(p.id) as I[];
  const lib = d.prepare("SELECT id, path, name, title FROM media WHERE mime LIKE 'image/%' AND path NOT IN (SELECT src FROM project_images WHERE project_id = ?) ORDER BY id DESC LIMIT 60").all(p.id) as { id: number; path: string; name: string; title: string }[];
  const edit = can(u.role, "projects.edit");
  const cover = p.cover || imgs[0]?.src;
  const hid = (i: I, op: string) => <><input type="hidden" name="lang" value={lang} /><input type="hidden" name="project" value={p.id} /><input type="hidden" name="image" value={i.id} /><input type="hidden" name="op" value={op} /></>;
  const file = (src: string) => `${p.slug}-${src.split("/").pop()}`;
  return (
    <>
      <Notice msg={msg} a={a} lang={lang} />
      {edit && (
        <div className="mb-8">
          <Uploader a={{ ...a, upload: a.uploadToProject, uploadHint: a.uploadProjectHint }} project={p.id} />
        </div>
      )}
      {imgs.length === 0 ? <p className="text-sm text-[var(--muted)]">{a.none}</p> : (
        <ol className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {imgs.map((i, k) => {
            const main = i.src === cover;
            return (
              <li key={i.id} className={`${card} flex flex-col gap-3 p-3 ${main ? "ring-2 ring-[var(--bronze)]" : ""}`}>
                <div className="relative overflow-hidden rounded-xl bg-[var(--mist)]">
                  <Image src={i.src} alt={i.room_en || p.slug} width={640} height={420} className="aspect-[3/2] w-full object-cover" />
                  {main && <span className="absolute start-2 top-2 rounded-full bg-[var(--bronze)] px-3 py-1 text-xs font-semibold text-[var(--deep)]">★ {a.mainImage}</span>}
                  <span className="absolute end-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-xs" dir="ltr">{k + 1}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {edit && !main && <form action={setCover}><input type="hidden" name="lang" value={lang} /><input type="hidden" name="project" value={p.id} /><input type="hidden" name="src" value={i.src} /><button className={btnGhost}>★ {a.setMain}</button></form>}
                  <a href={i.src} download={file(i.src)} className={btnGhost}>↓ {a.download}</a>
                  {edit && <>
                    <form action={galleryAction}>{hid(i, "up")}<button disabled={k === 0} aria-label={a.earlier} title={a.earlier} className={`${btnGhost} w-11 px-0 disabled:opacity-30`}><span className="rtl:-scale-x-100">←</span></button></form>
                    <form action={galleryAction}>{hid(i, "down")}<button disabled={k === imgs.length - 1} aria-label={a.later} title={a.later} className={`${btnGhost} w-11 px-0 disabled:opacity-30`}><span className="rtl:-scale-x-100">→</span></button></form>
                    {!main && <form action={galleryAction}>{hid(i, "remove")}<ConfirmButton label="✕" ask={`${a.remove}?`} className={`${btnGhost} w-11 px-0 text-red-700`} /></form>}
                  </>}
                </div>
                <form key={`${i.room_en}|${i.room_ar}|${i.caption}`} action={galleryAction} className="grid gap-2">
                  {hid(i, "save")}
                  <div className="grid grid-cols-2 gap-2">
                    <input name="room_en" defaultValue={i.room_en} placeholder={a.roomEn} aria-label={a.roomEn} disabled={!edit} dir="ltr" className={inp} />
                    <input name="room_ar" defaultValue={i.room_ar} placeholder={a.roomAr} aria-label={a.roomAr} disabled={!edit} dir="rtl" className={inp} />
                  </div>
                  <div className="flex gap-2"><input name="caption" defaultValue={i.caption} placeholder={a.caption} aria-label={a.caption} disabled={!edit} className={inp} />{edit && <button className={btnGhost}>{a.save2}</button>}</div>
                </form>
              </li>
            );
          })}
        </ol>
      )}
      {edit && (
        <details className={`${card} mt-8`}>
          <summary className="flex min-h-11 cursor-pointer items-center font-semibold">{a.addFromLibrary} <span className="ms-2 text-sm font-normal text-[var(--muted)]" dir="ltr">({lib.length})</span></summary>
          {lib.length === 0 ? <p className="mt-3 text-sm text-[var(--muted)]">{a.none} <Link href={`/${lang}/admin/media`} className="text-[var(--bronze)] underline">{a.media}</Link></p> : (
            <form action={addImages} className="mt-4">
              <input type="hidden" name="lang" value={lang} /><input type="hidden" name="project" value={p.id} />
              <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-8">
                {lib.map((m) => <li key={m.id}><label className="block cursor-pointer"><input type="checkbox" name="media" value={m.id} className="peer sr-only" /><Image src={m.path} alt={m.title || m.name} width={140} height={100} className="h-20 w-full rounded-lg object-cover ring-[var(--bronze)] peer-checked:ring-4" /><span className="mt-1 block truncate text-xs text-[var(--muted)]">{m.title || m.name}</span></label></li>)}
              </ul>
              <button className={`${btn} mt-4`}>{a.addSelected}</button>
            </form>
          )}
        </details>
      )}
    </>
  );
}
