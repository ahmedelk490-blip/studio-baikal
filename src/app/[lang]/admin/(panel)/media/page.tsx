import Image from "next/image";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { can } from "@/lib/perm";
import { adminDict } from "@/lib/admin-i18n";
import { deleteMedia, updateMedia } from "../../actions";
import { ConfirmButton, Uploader } from "@/components/admin/client";
import { Notice, btn, btnGhost, card, inp, fmtDate, fmtSize, PageHead } from "@/components/admin/ui";

// Per-request admin page (session + live data): block on the server, no prerendered shell.
export const instant = false;

type Props = { params: Promise<{ lang: string }>; searchParams: Promise<{ msg?: string; q?: string }> };
type M = { id: number; path: string; name: string; mime: string; size: number; w: number; h: number; alt: string; title: string; caption: string; created_at: string; used: number };

/* Media library: upload, search, edit alt/title/caption, delete (refused while a project uses the file). */
export default async function Media({ params, searchParams }: Props) {
  const { lang } = await params;
  const sp = await searchParams;
  const u = await requireUser(lang, "media.view");
  const a = adminDict(lang);
  const q = (sp.q ?? "").slice(0, 80);
  const rows = db().prepare(`SELECT m.*, EXISTS (SELECT 1 FROM project_images WHERE src = m.path) OR EXISTS (SELECT 1 FROM projects WHERE cover = m.path) used
    FROM media m ${q ? "WHERE name LIKE ? OR title LIKE ? OR alt LIKE ?" : ""} ORDER BY id DESC LIMIT 200`).all(...(q ? Array(3).fill(`%${q}%`) : [])) as M[];
  const edit = can(u.role, "media.upload"), del = can(u.role, "media.delete");
  return (
    <>
      <Notice msg={sp.msg} a={a} lang={lang} />
      <PageHead title={a.media} desc={a.d_media} />
      {edit && <div><Uploader a={a} /></div>}
      <form className="mt-6 flex gap-3"><input name="q" defaultValue={q} placeholder={a.search} aria-label={a.search} className={`${inp} max-w-xs`} /><button className={btn}>{a.search}</button></form>
      {rows.length === 0 ? <p className="mt-8 text-sm text-[var(--muted)]">{a.none}</p> : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((m) => (
            <li key={m.id} className={`${card} p-3`}>
              {m.mime.startsWith("image/")
                ? <Image src={m.path} alt={m.alt || m.name} width={480} height={300} className="aspect-[16/10] w-full rounded-lg object-cover" />
                : <a href={m.path} target="_blank" rel="noopener" className="grid aspect-[16/10] w-full place-items-center rounded-lg bg-[var(--mist)] text-sm">PDF ↗</a>}
              <p className="mt-2 truncate text-sm font-medium" title={m.name}>{m.name}</p>
              <p className="text-xs text-[var(--muted)]" dir="ltr">{fmtSize(m.size)}{m.w ? ` · ${m.w}×${m.h}` : ""} · {fmtDate(m.created_at, lang)}</p>
              {edit && (
                <form key={`${m.title}|${m.alt}|${m.caption}`} action={updateMedia} className="mt-3 grid gap-2">
                  <input type="hidden" name="lang" value={lang} /><input type="hidden" name="id" value={m.id} /><input type="hidden" name="q" value={q} />
                  <input name="title" defaultValue={m.title} placeholder={a.title} aria-label={a.title} maxLength={120} className={inp} />
                  <input name="alt" defaultValue={m.alt} placeholder={a.alt} aria-label={a.alt} maxLength={200} className={inp} />
                  <input name="caption" defaultValue={m.caption} placeholder={a.caption} aria-label={a.caption} maxLength={300} className={inp} />
                  <button className={btnGhost}>{a.save}</button>
                </form>
              )}
              {del && (m.used
                ? <p className="mt-2 text-xs text-[var(--muted)]">{a.inUse}</p>
                : <form action={deleteMedia} className="mt-2"><input type="hidden" name="lang" value={lang} /><input type="hidden" name="id" value={m.id} /><ConfirmButton label={a.delete} ask={`${a.delete} ${m.name}?`} className="inline-flex min-h-11 items-center text-sm text-red-700 hover:underline" /></form>)}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
