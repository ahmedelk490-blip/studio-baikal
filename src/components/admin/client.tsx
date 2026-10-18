"use client";
import { useActionState, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { changePassword, login } from "@/app/[lang]/admin/actions";
import type { AdminDict } from "@/lib/admin-i18n";
import { inp, btn } from "./ui";

export function LoginForm({ lang, a }: { lang: string; a: AdminDict }) {
  const [st, act, pending] = useActionState(login, null);
  return (
    <form action={act} className="grid gap-4">
      <input type="hidden" name="lang" value={lang} />
      <label className="grid gap-1.5 text-sm">{a.email}<input name="email" type="email" required autoComplete="username" className={inp} /></label>
      <label className="grid gap-1.5 text-sm">{a.password}<input name="password" type="password" required autoComplete="current-password" className={inp} /></label>
      {st?.error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{a[st.error as keyof AdminDict] ?? a.error}</p>}
      <button disabled={pending} className={btn}>{pending ? "…" : a.signIn}</button>
    </form>
  );
}

export function PasswordForm({ a }: { a: AdminDict }) {
  const [st, act, pending] = useActionState(changePassword, null);
  return (
    <form action={act} className="grid max-w-md gap-4">
      <label className="grid gap-1.5 text-sm">{a.currentPassword}<input name="current" type="password" required autoComplete="current-password" className={inp} /></label>
      <label className="grid gap-1.5 text-sm">{a.newPassword}<input name="password" type="password" required minLength={10} autoComplete="new-password" className={inp} /><span className="text-xs text-[var(--muted)]">{a.pwRule}</span></label>
      {st?.error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{a[st.error as keyof AdminDict] ?? a.error}</p>}
      {st?.ok && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{a.saved}</p>}
      <button disabled={pending} className={btn}>{a.changePassword}</button>
    </form>
  );
}

/* Uploads go to a guarded route handler (multipart, size/type checked on the server); the page
   refreshes when every file has been answered, and failures are listed instead of hidden. */
export function Uploader({ a, project }: { a: AdminDict; project?: number }) {
  const ref = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string[]>([]);
  async function send() {
    const files = Array.from(ref.current?.files ?? []);
    if (!files.length) return;
    setBusy(true); setMsg([]);
    const out: string[] = [];
    for (const f of files) {
      const fd = new FormData(); fd.append("file", f); if (project) fd.append("project", String(project));
      const r = await fetch("/api/admin/media", { method: "POST", body: fd }).catch(() => null);
      if (!r || !r.ok) out.push(`${f.name}: ${r ? (await r.json().catch(() => ({ error: r.status }))).error : "network"}`);
    }
    setBusy(false); setMsg(out);
    if (ref.current) ref.current.value = "";
    router.refresh();
  }
  return (
    <div className="rounded-2xl border border-dashed border-[var(--ink)]/25 bg-white p-5">
      <p className="text-sm font-medium">{a.upload}</p>
      <p className="mt-1 text-xs text-[var(--muted)]">{a.uploadHint}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input ref={ref} type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf" className="text-sm" />
        <button type="button" onClick={send} disabled={busy} className={btn}>{busy ? "…" : a.upload}</button>
      </div>
      {msg.length > 0 && <ul role="alert" className="mt-3 grid gap-1 text-sm text-red-700">{msg.map((m) => <li key={m}>{m}</li>)}</ul>}
    </div>
  );
}

/* A submit button that asks first (destructive actions); the server still requires its own checks. */
export function ConfirmButton({ label, ask, className }: { label: string; ask: string; className?: string }) {
  return <button className={className} onClick={(e) => { if (!confirm(ask)) e.preventDefault(); }}>{label}</button>;
}

/* Sidebar / tab links that know which page is open (exact match for the root link, prefix otherwise). */
export function NavLinks({ links, root, className, activeClass, idleClass }: { links: [string, string][]; root: string; className: string; activeClass: string; idleClass: string }) {
  const path = usePathname() ?? "";
  return (
    <>
      {links.map(([l, h]) => {
        const on = h === root ? path === h : path === h || path.startsWith(h + "/");
        return <Link key={h} href={h} aria-current={on ? "page" : undefined} className={`${className} ${on ? activeClass : idleClass}`}>{l}</Link>;
      })}
    </>
  );
}
