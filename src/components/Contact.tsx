"use client";
import { useState } from "react";
import type { Contact as ContactInfo } from "@/lib/site";
import type { Dict } from "@/data/i18n";
import { Contours } from "./Contours";
import { DepthField } from "./DepthField";
import { WA_PATH } from "./wa-path";

// the calm look asks for the area too, in three bands, before the name and number
const CALM = process.env.NEXT_PUBLIC_HOME === "calm";
const AREAS = { en: ["150 – 250 m²", "250 – 350 m²", "350+ m²"], ar: ["150 – 250 متر", "250 – 350 متر", "أكثر من 350 متر"] };

const ic = {
  phone: "M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z",
  mail: "M3 5h18v14H3z M3 5l9 7 9-7",
  chat: "M4 19l1.3-3.9A8 8 0 1 1 8 18.7z",
  insta: "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z M17.5 6.5h.01",
};

/* 1,642 m — the lake floor. Split: a lit photo with the promise and four contact rows
   (icon + label over bold value) / a light panel with the flat-row form and a rolling submit. */
export function Contact({ t, contact }: { t: Dict; contact: ContactInfo }) {
  const c = t.contact;
  const ar = t.dir === "rtl";
  const [state, setState] = useState<"idle" | "sending" | "sent" | "done" | "error">("idle");
  const [size, setSize] = useState(c.sizes[1]);
  const [need, setNeed] = useState(c.needs[1]);
  const [area, setArea] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState("sending");
    const r = await fetch("/api/leads", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: f.get("name"), whatsapp: f.get("whatsapp"), size, need, message: area ? `${ar ? "المساحة" : "Area"}: ${area}` : undefined, website: f.get("website") }) }).catch(() => null);
    // the button itself confirms (a check) for a moment before the thank-you replaces the form
    if (r && r.ok) { setState("sent"); setTimeout(() => setState("done"), 1400); } else setState("error");
  }
  const rows: [keyof typeof ic, string, string, string][] = [
    ["phone", ar ? "اتصل بنا" : "Call us", contact.phone, contact.phoneHref],
    ["chat", ar ? "واتساب" : "WhatsApp", c.chat, contact.whatsapp],
    ["mail", ar ? "البريد" : "Email", contact.email, `mailto:${contact.email}`],
    ["insta", ar ? "إنستجرام" : "Instagram", "@studio_baikal", contact.instagram],
  ];
  const lab = "text-xs uppercase tracking-[0.16em] rtl:tracking-normal";
  const chip = (on: boolean) => `min-h-11 rounded-full border px-4 text-sm transition-colors duration-300 ${on ? "border-[var(--bronze)] bg-[var(--bronze)] text-[var(--deep)]" : "border-[var(--surface)]/25 text-[var(--surface)]/80 [@media(hover:hover)]:hover:border-[var(--surface)]/60"}`;
  // one flat form row: small icon, label over the value, a hairline that turns bronze while typing
  const row = "mt-5 flex items-center gap-4 border-b border-[var(--surface)]/15 pb-2 transition-colors duration-300 focus-within:border-[var(--bronze)]";
  const dot = "grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--bronze)]/50 text-[var(--bronze)]";
  const field = "min-h-10 w-full bg-transparent text-lg font-medium text-[var(--surface)] outline-none placeholder:font-normal placeholder:text-[var(--surface)]/30";
  return (
    <section id="contact" data-depth={t.gauge.contact} data-meters="1,642 m" data-deep="1" className="relative overflow-hidden bg-[var(--deeper)] text-[var(--surface)]">
      <div className="grid lg:grid-cols-2">
        <div className="relative overflow-hidden">
          {/* gold dust drifting towards the viewer, the same dust as the opening */}
          <DepthField />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--deeper)] via-[var(--deeper)]/70 to-[var(--deeper)]/30" />
          <div className="glow pointer-events-none absolute -top-32 start-1/4 h-[50vh] w-[50vh] rounded-full bg-[radial-gradient(circle,rgba(196,154,92,.5),transparent_60%)]" aria-hidden />
          <Contours className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 opacity-20" />
          <div className="relative flex h-full flex-col justify-end gap-8 px-5 py-16 md:px-12 md:py-20">
            <div>
              <p className={`${lab} eyebrow text-[var(--bronze)]`}>{c.eyebrow}</p>
              <h2 className="display mt-4 text-balance text-4xl md:text-6xl rtl:leading-[1.35] md:rtl:text-5xl">{c.t1} <span className="italic text-[var(--bronze)] rtl:not-italic">{c.t2}</span></h2>
              <p className="mt-4 max-w-md text-sm text-[var(--surface)]/75">{c.intro}</p>
            </div>
            <ul className="grid gap-px overflow-hidden rounded-2xl border border-[var(--surface)]/15 bg-[var(--surface)]/15 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {rows.map(([k, label, value, href]) => (
                <li key={k} className="bg-[var(--deeper)]/85">
                  <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener" className="flex items-center gap-4 p-4 transition-colors hover:bg-[var(--deep)]">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--bronze)]/60 text-[var(--bronze)]">
                      {k === "chat" ? <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d={WA_PATH} /></svg> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={ic[k]} /></svg>}
                    </span>
                    <span className="min-w-0">
                      <span className={`${lab} block text-[var(--surface)]/60`}>{label}</span>
                      <span className="block truncate text-sm font-semibold" dir={k === "phone" ? "ltr" : undefined}>{value}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative flex flex-col justify-center overflow-hidden bg-[#0F1A1E] px-5 py-14 text-[var(--surface)] md:px-12 md:py-20 lg:px-16">
          <div className="pointer-events-none absolute -top-40 end-0 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(196,154,92,.22),transparent_65%)]" aria-hidden />
          {state === "done" ? (
            <div className="hero-in relative"><p className="display text-5xl">{c.thanks}</p><p className="mt-3 text-[var(--surface)]/70">{c.thanksText}</p></div>
          ) : (
            <form onSubmit={submit} className="relative">
              <p className="display text-3xl md:text-4xl">{t.nav.book}</p>
              {/* calm look: what the project is first (type, service, area), then who to answer */}
              {CALM ? <>
              <fieldset className="mt-7"><legend className={`${lab} text-[var(--surface)]/55`}>{CALM ? (ar ? "نوع المشروع" : "Project type") : c.size}</legend>
                <div className="mt-3 flex flex-wrap gap-2">{c.sizes.map((s) => <button type="button" key={s} onClick={() => setSize(s)} aria-pressed={size === s} className={chip(size === s)}>{s}</button>)}</div>
              </fieldset>
              <fieldset className="mt-6"><legend className={`${lab} text-[var(--surface)]/55`}>{c.need}</legend>
                <div className="mt-3 flex flex-wrap gap-2">{c.needs.map((s) => <button type="button" key={s} onClick={() => setNeed(s)} aria-pressed={need === s} className={chip(need === s)}>{s}</button>)}</div>
              </fieldset>
              <fieldset className="mt-6"><legend className={`${lab} text-[var(--surface)]/55`}>{ar ? "المساحة" : "Area"}</legend>
                <div className="mt-3 flex flex-wrap gap-2">{AREAS[ar ? "ar" : "en"].map((s) => <button type="button" key={s} onClick={() => setArea(s)} aria-pressed={area === s} className={chip(area === s)}><bdi>{s}</bdi></button>)}</div>
              </fieldset>
              <label className={`${row} mt-7`}>
                <span className={dot} aria-hidden><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21a8 8 0 0 1 16 0" /></svg></span>
                <span className="min-w-0 flex-1"><span className={`${lab} block text-[var(--surface)]/55`}>{c.name}</span><input name="name" required autoComplete="name" placeholder={ar ? "اكتب اسمك" : "Your name"} className={field} /></span>
              </label>
              <label className={row}>
                <span className={dot} aria-hidden><svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d={WA_PATH} /></svg></span>
                <span className="min-w-0 flex-1"><span className={`${lab} block text-[var(--surface)]/55`}>{c.whatsapp}</span><input name="whatsapp" required inputMode="tel" autoComplete="tel" dir="ltr" placeholder="01x xxxx xxxx" className={`${field} rtl:text-right`} /></span>
              </label>
              </> : <>
              <label className={row}>
                <span className={dot} aria-hidden><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21a8 8 0 0 1 16 0" /></svg></span>
                <span className="min-w-0 flex-1"><span className={`${lab} block text-[var(--surface)]/55`}>{c.name}</span><input name="name" required autoComplete="name" placeholder={ar ? "اكتب اسمك" : "Your name"} className={field} /></span>
              </label>
              <label className={row}>
                <span className={dot} aria-hidden><svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d={WA_PATH} /></svg></span>
                <span className="min-w-0 flex-1"><span className={`${lab} block text-[var(--surface)]/55`}>{c.whatsapp}</span><input name="whatsapp" required inputMode="tel" autoComplete="tel" dir="ltr" placeholder="01x xxxx xxxx" className={`${field} rtl:text-right`} /></span>
              </label>
              <fieldset className="mt-7"><legend className={`${lab} text-[var(--surface)]/55`}>{c.size}</legend>
                <div className="mt-3 flex flex-wrap gap-2">{c.sizes.map((s) => <button type="button" key={s} onClick={() => setSize(s)} aria-pressed={size === s} className={chip(size === s)}>{s}</button>)}</div>
              </fieldset>
              <fieldset className="mt-6"><legend className={`${lab} text-[var(--surface)]/55`}>{c.need}</legend>
                <div className="mt-3 flex flex-wrap gap-2">{c.needs.map((s) => <button type="button" key={s} onClick={() => setNeed(s)} aria-pressed={need === s} className={chip(need === s)}>{s}</button>)}</div>
              </fieldset>
              </>}
              <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
              {state === "sent" ? (
                <p role="status" className="btn btn-primary mt-8 w-full justify-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path className="check-draw" d="M5 12.5l4.5 4.5L19 7.5" pathLength={1} /></svg>{c.thanks}
                </p>
              ) : (
                <button disabled={state === "sending"} className="btn btn-primary mt-8 w-full justify-between disabled:opacity-60">
                  <span className="btn-roll"><span>{state === "sending" ? c.sending : c.send}</span><span aria-hidden>{state === "sending" ? c.sending : c.send}</span></span>
                  <span className="btn-ico" aria-hidden />
                </button>
              )}
              {state === "error" && <p className="mt-3 text-sm text-[#e0a383]">{c.error}</p>}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}