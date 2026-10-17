import { readFile } from "node:fs/promises";
import { cookies } from "next/headers";
import path from "node:path";
import { Suspense } from "react";

// Next 16 (cacheComponents): runtime data (cookies, files) lives in an async component inside <Suspense>;
// route segment config like `dynamic = "force-dynamic"` is not allowed.
export default function Admin() {
  return (
    <Suspense fallback={<main className="p-8 opacity-60">…</main>}>
      <AdminInner />
    </Suspense>
  );
}

async function AdminInner() {
  const token = (await cookies()).get("admin")?.value;
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN)
    return (
      <main className="mx-auto max-w-sm p-8">
        <form method="post" action="/api/admin/login" className="grid gap-3">
          <label className="grid gap-1 text-sm">Admin token<input name="token" type="password" required className="rounded border px-3 py-2" /></label>
          <button className="rounded bg-[var(--brand)] px-4 py-2 text-white">Sign in</button>
        </form>
      </main>
    );
  const raw = await readFile(path.join(process.cwd(), ".data", "leads.jsonl"), "utf8").catch(() => "");
  const leads = raw.split("\n").filter(Boolean).map((l) => JSON.parse(l) as Record<string, string>).reverse();
  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Leads ({leads.length})</h1>
      <ul className="divide-y">
        {leads.map((l) => (
          <li key={l.id} className="grid gap-1 py-3 text-sm">
            <span className="opacity-60">{new Date(l.at).toLocaleString("en-GB")}</span>
            {Object.entries(l).filter(([k]) => !["id", "at"].includes(k)).map(([k, v]) => <span key={k}><b>{k}:</b> {String(v)}</span>)}
          </li>
        ))}
      </ul>
    </main>
  );
}
