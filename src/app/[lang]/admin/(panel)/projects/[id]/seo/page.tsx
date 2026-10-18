import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { can } from "@/lib/perm";
import { adminDict } from "@/lib/admin-i18n";
import { saveProjectSeo } from "../../../../actions";
import { Notice, btn, card, inp } from "@/components/admin/ui";

// Per-request admin page (session + live data): block on the server, no prerendered shell.
export const instant = false;

type Props = { params: Promise<{ lang: string; id: string }>; searchParams: Promise<{ msg?: string }> };

/* SEO tab: the Google title and description of this project's page, per language. */
export default async function ProjectSeo({ params, searchParams }: Props) {
  const { lang, id } = await params;
  const { msg } = await searchParams;
  const u = await requireUser(lang, "projects.view");
  const a = adminDict(lang);
  const p = db().prepare("SELECT id, seo, updated_at FROM projects WHERE id = ?").get(Number(id)) as { id: number; seo: string; updated_at: string } | undefined;
  if (!p) notFound();
  const seo = JSON.parse(p.seo || "{}") as Record<"en" | "ar", { title?: string; description?: string } | undefined>;
  const edit = can(u.role, "projects.edit");
  return (
    <>
      <Notice msg={msg} a={a} lang={lang} />
      <p className="mb-5 max-w-2xl text-sm text-[var(--muted)]">{a.seoHelp}</p>
      <form key={p.updated_at} action={saveProjectSeo} className="grid gap-6">
        <fieldset disabled={!edit} className="grid gap-6 lg:grid-cols-2">
          <input type="hidden" name="lang" value={lang} /><input type="hidden" name="project" value={p.id} />
          {(["en", "ar"] as const).map((l) => (
            <div key={l} dir={l === "ar" ? "rtl" : "ltr"} className={`${card} grid gap-4`}>
              <p className="text-sm font-semibold">{l === "en" ? a.english : a.arabic}</p>
              <label className="grid gap-1.5 text-sm">{a.seoTitle}<input name={`seo_${l}_title`} defaultValue={seo[l]?.title ?? ""} maxLength={70} className={inp} /></label>
              <label className="grid gap-1.5 text-sm">{a.seoDesc}<textarea name={`seo_${l}_desc`} defaultValue={seo[l]?.description ?? ""} maxLength={170} rows={3} className={inp} /></label>
            </div>
          ))}
        </fieldset>
        {edit && <div><button className={btn}>{a.save}</button></div>}
      </form>
    </>
  );
}
