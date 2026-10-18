import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { seoPages } from "@/lib/site";
import { adminDict } from "@/lib/admin-i18n";
import { savePageSeo } from "../../actions";
import { Notice, btn, card, inp } from "@/components/admin/ui";

// Per-request admin page (session + live data): block on the server, no prerendered shell.
export const instant = false;

type Props = { params: Promise<{ lang: string }>; searchParams: Promise<{ msg?: string }> };
type Row = { page: string; lang: "en" | "ar"; title: string; description: string; image: string; noindex: number };

/* Page SEO for the fixed pages (projects carry their own SEO fields in the project editor).
   Hiding a page from search needs an explicit second tick. */
export default async function Seo({ params, searchParams }: Props) {
  const { lang } = await params;
  const { msg } = await searchParams;
  await requireUser(lang, "seo.edit");
  const a = adminDict(lang);
  const rows = db().prepare("SELECT * FROM page_seo").all() as Row[];
  const get = (page: string, l: "en" | "ar") => rows.find((r) => r.page === page && r.lang === l);
  return (
    <>
      <Notice msg={msg} a={a} lang={lang} />
      <h1 className="display text-4xl">{a.seo}</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">{a.keepEmpty}</p>
      <div className="mt-6 grid gap-6">
        {seoPages.map((page) => (
          <form key={page + rows.filter((r) => r.page === page).map((r) => r.title + r.description + r.image + r.noindex).join("|")} id={page} action={savePageSeo} className={`${card} grid gap-4`}>
            <input type="hidden" name="lang" value={lang} /><input type="hidden" name="page" value={page} />
            <h2 className="font-semibold">{a[`pg_${page}`]} <span className="text-xs font-normal text-[var(--muted)]" dir="ltr">/{lang}{page === "home" ? "" : `/${page}`}</span></h2>
            <div className="grid gap-6 lg:grid-cols-2">
              {(["en", "ar"] as const).map((l) => {
                const r = get(page, l);
                return (
                  <fieldset key={l} dir={l === "ar" ? "rtl" : "ltr"} className="grid gap-3">
                    <legend className="text-sm text-[var(--muted)]">{l === "en" ? a.english : a.arabic}</legend>
                    <label className="grid gap-1.5 text-sm">{a.seoTitle}<input name={`${l}_title`} defaultValue={r?.title ?? ""} maxLength={70} className={inp} /></label>
                    <label className="grid gap-1.5 text-sm">{a.seoDesc}<textarea name={`${l}_desc`} defaultValue={r?.description ?? ""} maxLength={170} rows={2} className={inp} /></label>
                    <label className="grid gap-1.5 text-sm">{a.image}<input name={`${l}_image`} defaultValue={r?.image ?? ""} dir="ltr" pattern="/[\w\-/.]+" className={inp} /></label>
                    <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" name={`${l}_noindex`} defaultChecked={!!r?.noindex} className="h-5 w-5" />{a.noindex}</label>
                    <label className="flex min-h-11 items-center gap-2 text-xs text-red-700"><input type="checkbox" name={`${l}_noindex_ok`} defaultChecked={!!r?.noindex} className="h-5 w-5" />{a.noindexOk}</label>
                  </fieldset>
                );
              })}
            </div>
            <div><button className={btn}>{a.save}</button></div>
          </form>
        ))}
      </div>
    </>
  );
}
