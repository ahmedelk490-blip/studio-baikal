"use client";
import Image from "next/image";
import { useState } from "react";
import { Contours } from "./Contours";
import { contact } from "@/data/projects";
import type { Dict } from "@/data/i18n";
import type { PagesDict } from "@/data/pages";

const needImgs = ["/projects/october-250/05.webp", "/projects/el-nakhil-villa/01.webp"];

/* Contact page: a three-step wizard (space -> need -> details) with a live progress rail. */
export function ContactWizard({ t, p }: { t: Dict; p: PagesDict["contact"] }) {
  const c = t.contact;
  const [step, setStep] = useState(0);
  const [size, setSize] = useState("");
  const [need, setNeed] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState("sending");
    const r = await fetch("/api/leads", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: f.get("name"), whatsapp: f.get("whatsapp"), size, need, source: "contact-page", website: f.get("website") }) }).catch(() => null);
    setState(r && r.ok ? "done" : "error");
  }
  const u = "text-xs uppercase tracking-[0.16em] rtl:tracking-normal";
  const tile = (on: boolean) => `rounded-2xl border p-5 text-start text-lg transition-colors ${on ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--surface)]" : "border-[var(--ink)]/15 hover:border-[var(--ink)]/40"}`;
  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[var(--deep)] text-[var(--surface)]">
      <Contours className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 opacity-40" />
      <div className="relative grid gap-12 px-5 pb-16 pt-28 md:px-10 md:pt-36 lg:grid-cols-12">
        <div className="hero-in lg:col-span-5">
          <p className={`${u} text-[var(--bronze)]`}>{p.eyebrow}</p>
          <h1 className="display mt-4 text-5xl md:text-7xl">{p.title}</h1>
          <p className="mt-5 max-w-md text-sm text-[var(--surface)]/75">{p.intro}</p>
          <ol className="mt-10 grid gap-4">
            {p.steps.map((s, k) => (
              <li key={s} className="flex items-center gap-4">
                <span className={`grid h-9 w-9 place-items-center rounded-full border text-xs transition-colors ${k <= step ? "border-[var(--bronze)] bg-[var(--bronze)] text-[var(--deep)]" : "border-[var(--surface)]/30"}`}>{k + 1}</span>
                <span className="relative h-px flex-1 bg-[var(--surface)]/15"><span className="absolute inset-y-0 start-0 bg-[var(--bronze)] transition-[width] duration-700" style={{ width: k < step || state === "done" ? "100%" : k === step ? "35%" : "0%" }} /></span>
                <span className={`${u} w-28 ${k <= step ? "text-[var(--surface)]" : "text-[var(--surface)]/45"}`}>{s}</span>
              </li>
            ))}
          </ol>
          <div className="mt-10 grid gap-1 text-sm text-[var(--surface)]/80">
            <a href={contact.phoneHref} dir="ltr" className="block w-fit py-2">{contact.phone}</a>
            <a href={`mailto:${contact.email}`} className="block w-fit py-2">{contact.email}</a>
          </div>
        </div>
        <div className="lg:col-span-7">
          <div className="rounded-3xl bg-[var(--surface)] p-6 text-[var(--ink)] md:p-10">
            {state === "done" ? (
              <div className="hero-in py-10"><p className="display text-5xl">{c.thanks}</p><p className="mt-3 text-[var(--muted)]">{c.thanksText}</p></div>
            ) : (
              <form onSubmit={submit}>
                <div key={step} className="hero-in">
                  {step === 0 && (<><p className={`${u} text-[var(--muted)]`}>{c.size}</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{c.sizes.map((s) => <button type="button" key={s} onClick={() => { setSize(s); setStep(1); }} aria-pressed={size === s} className={tile(size === s)}>{s}</button>)}</div></>)}
                  {step === 1 && (<><p className={`${u} text-[var(--muted)]`}>{c.need}</p><div className="mt-4 grid gap-4 sm:grid-cols-2">{c.needs.map((s, k) => (
                    <button type="button" key={s} onClick={() => { setNeed(s); setStep(2); }} aria-pressed={need === s} className={`${tile(need === s)} overflow-hidden p-0`}>
                      <span className="relative block aspect-[16/9]"><Image src={needImgs[k]} alt="" fill sizes="(min-width:640px) 30vw, 90vw" className="object-cover" /></span>
                      <span className="block p-5">{s}</span>
                    </button>))}</div></>)}
                  {step === 2 && (<>
                    <p className="flex flex-wrap gap-2 text-sm"><span className="rounded-full bg-[var(--mist)] px-3 py-1.5">{size}</span><span className="rounded-full bg-[var(--mist)] px-3 py-1.5">{need}</span></p>
                    <label className="mt-6 block border-b border-[var(--ink)]/15 pb-3"><span className={`${u} text-[var(--muted)]`}>{c.name}</span><input name="name" required autoComplete="name" className="mt-2 w-full bg-transparent text-xl font-medium outline-none" /></label>
                    <label className="mt-6 block border-b border-[var(--ink)]/15 pb-3"><span className={`${u} text-[var(--muted)]`}>{c.whatsapp}</span><input name="whatsapp" required inputMode="tel" autoComplete="tel" dir="ltr" className="mt-2 w-full bg-transparent text-xl font-medium outline-none rtl:text-right" /></label>
                    <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
                    <button disabled={state === "sending"} className="btn btn-primary mt-8 w-full justify-between disabled:opacity-60"><span className="btn-roll"><span>{state === "sending" ? c.sending : c.send}</span><span aria-hidden>{state === "sending" ? c.sending : c.send}</span></span><span className="btn-ico" aria-hidden /></button>
                    {state === "error" && <p className="mt-3 text-sm text-[#9a4a2a]">{c.error}</p>}
                  </>)}
                </div>
                {step > 0 && <button type="button" onClick={() => setStep(step - 1)} className={`${u} mt-6 inline-flex min-h-11 items-center text-[var(--muted)]`}>{p.back}</button>}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}