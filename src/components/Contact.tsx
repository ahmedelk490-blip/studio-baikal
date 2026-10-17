"use client";
import { useState } from "react";
import { contact } from "@/data/projects";

const sizes = ["Under 150 m²", "150-200 m²", "200-400 m²", "400 m² +", "Not sure yet"];
const needs = ["3D Design Package", "Design & Execution"];

/* -1,642 m: the floor of the lake. A single bronze lamp breathes; the form is flat rows with hairlines. */
export function Contact() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [size, setSize] = useState(sizes[1]);
  const [need, setNeed] = useState(needs[1]);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState("sending");
    const r = await fetch("/api/leads", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: f.get("name"), whatsapp: f.get("whatsapp"), size, need, website: f.get("website") }) }).catch(() => null);
    setState(r && r.ok ? "done" : "error");
  }
  const chip = (on: boolean) => `border px-3.5 py-2 text-xs uppercase tracking-[0.12em] rtl:tracking-normal transition-colors ${on ? "border-[var(--bronze)] bg-[var(--bronze)] text-[var(--deep)]" : "border-[var(--surface)]/30 text-[var(--surface)]/80"}`;
  const row = "block border-b border-[var(--surface)]/20 py-4";
  const lab = "text-xs uppercase tracking-[0.16em] rtl:tracking-normal text-[var(--bronze)]";
  return (
    <section id="contact" data-depth="Contact" data-meters="1,642 m" data-deep="1" className="relative overflow-hidden bg-[var(--deeper)] text-[var(--surface)]">
      <div className="glow pointer-events-none absolute -top-40 left-1/2 h-[60vh] w-[60vh] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(196,154,92,.55),transparent_60%)]" aria-hidden />
      <div className="relative grid gap-12 px-5 py-24 md:grid-cols-12 md:px-10 md:py-36">
        <div className="md:col-span-6">
          <p className="text-xs uppercase tracking-[0.2em] rtl:tracking-normal text-[var(--bronze)]">The floor of the lake · free consultation</p>
          <h2 className="display mt-4 text-5xl md:text-7xl">Come up for air.<br /><span className="italic text-[var(--bronze)]">Let us talk.</span></h2>
          <p className="mt-6 max-w-md text-sm text-[var(--surface)]/70">Tell us a little about the project and we will call you back within one working day.</p>
          <div className="mt-10 grid gap-1 text-sm">
            <a href={contact.phoneHref} className="block py-2">{contact.phone}</a>
            <a href={`mailto:${contact.email}`} className="block py-2">{contact.email}</a>
            <a href={contact.whatsapp} target="_blank" rel="noopener" className="mt-2 inline-block w-fit border-b border-[var(--bronze)] py-2 text-xs uppercase tracking-[0.18em] rtl:tracking-normal">Chat on WhatsApp</a>
          </div>
        </div>
        {state === "done" ? (
          <div className="md:col-span-6 md:pt-6"><p className="display text-4xl">Thank you.</p><p className="mt-2 text-[var(--surface)]/70">We received your request and will be in touch shortly.</p></div>
        ) : (
          <form onSubmit={submit} className="md:col-span-6 md:pt-6">
            <label className={row}><span className={lab}>Name</span><input name="name" required autoComplete="name" className="mt-1 w-full bg-transparent text-lg outline-none" /></label>
            <label className={row}><span className={lab}>WhatsApp number</span><input name="whatsapp" required inputMode="tel" autoComplete="tel" className="mt-1 w-full bg-transparent text-lg outline-none" /></label>
            <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
            <fieldset className={row}><legend className={lab}>Approximate space size</legend>
              <div className="mt-3 flex flex-wrap gap-2">{sizes.map((s) => <button type="button" key={s} onClick={() => setSize(s)} aria-pressed={size === s} className={chip(size === s)}>{s}</button>)}</div>
            </fieldset>
            <fieldset className="py-4"><legend className={lab}>What do you need?</legend>
              <div className="mt-3 flex flex-wrap gap-2">{needs.map((s) => <button type="button" key={s} onClick={() => setNeed(s)} aria-pressed={need === s} className={chip(need === s)}>{s}</button>)}</div>
            </fieldset>
            <button disabled={state === "sending"} className="mt-4 w-full bg-[var(--surface)] py-4 text-xs font-semibold uppercase tracking-[0.2em] rtl:tracking-normal text-[var(--deep)] disabled:opacity-60">{state === "sending" ? "Sending..." : "Book a free consultation"}</button>
            {state === "error" && <p className="mt-3 text-sm text-[var(--bronze)]">Something went wrong. Please call or WhatsApp us.</p>}
          </form>
        )}
      </div>
    </section>
  );
}