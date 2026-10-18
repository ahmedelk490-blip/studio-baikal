import { requireUser } from "@/lib/auth";
import { readSettings } from "@/lib/site";
import { adminDict } from "@/lib/admin-i18n";
import { saveSettings } from "../../actions";
import { Revisions } from "@/components/admin/Revisions";
import { Notice, btn, card, inp } from "@/components/admin/ui";

// Per-request admin page (session + live data): block on the server, no prerendered shell.
export const instant = false;

type Props = { params: Promise<{ lang: string }>; searchParams: Promise<{ msg?: string }> };

/* Site settings: contact details used everywhere on the site (header CTA, contact section and page,
   footer, WhatsApp button, structured data) and the footer text in both languages. */
export default async function Settings({ params, searchParams }: Props) {
  const { lang } = await params;
  const { msg } = await searchParams;
  await requireUser(lang, "settings.edit");
  const a = adminDict(lang);
  const s = readSettings();
  const f = (label: string, name: string, value: string, extra: Record<string, string | number | boolean> = {}) => (
    <label className="grid gap-1.5 text-sm">{label}<input name={name} defaultValue={value} className={inp} {...extra} /></label>
  );
  return (
    <>
      <Notice msg={msg} a={a} lang={lang} />
      <h1 className="display text-4xl">{a.settings}</h1>
      <form key={JSON.stringify(s)} action={saveSettings} className="mt-6 grid gap-6">
        <input type="hidden" name="lang" value={lang} />
        <fieldset className={`${card} grid gap-4 sm:grid-cols-2`}>
          {f(a.phone, "phone", s.phone, { required: true, dir: "ltr", maxLength: 40 })}
          {f(a.email, "email", s.email, { required: true, type: "email", dir: "ltr", maxLength: 120 })}
          {f(a.waNumber, "whatsapp", s.whatsapp, { required: true, dir: "ltr", inputMode: "numeric", pattern: "[0-9]{10,15}" })}
          {f(a.instagram, "instagram", s.instagram, { required: true, dir: "ltr", type: "url" })}
        </fieldset>
        <div className="grid gap-6 lg:grid-cols-2">
          {(["en", "ar"] as const).map((l) => (
            <fieldset key={l} dir={l === "ar" ? "rtl" : "ltr"} className={`${card} grid gap-4`}>
              <legend className="px-1 text-sm font-semibold">{l === "en" ? a.english : a.arabic}</legend>
              {f(a.waText, `wa_${l}`, s.waText[l], { maxLength: 200 })}
              {f(a.footerTagline, `tag_${l}`, s.footer[l].tagline, { maxLength: 80 })}
              {f(a.footerSub, `sub_${l}`, s.footer[l].sub, { maxLength: 200 })}
            </fieldset>
          ))}
        </div>
        <div><button className={btn}>{a.save}</button></div>
      </form>
      <Revisions entity="settings" id="site" current={s} lang={lang} a={a} canRestore />
    </>
  );
}
