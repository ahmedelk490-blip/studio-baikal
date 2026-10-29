import { appendFile } from "node:fs/promises";
import path from "node:path";
import { db, DATA_DIR } from "@/lib/db";

// Every form on the site posts here; the lead lands in the admin inbox (SQLite) and is also appended
// to .data/leads.jsonl as a plain-text safety copy. WhatsApp is only a second channel.
// Abuse limits: 10 KB body, 20 fields of max 2000 chars, honeypot "website" must be empty, 10 posts/min per IP.
const hits = new Map<string, number[]>();
const known = ["name", "whatsapp", "email", "size", "need", "message", "source"] as const;

// the static copy of the site on baikalstudio.com posts here from another origin
const ORIGINS = new Set(["https://baikalstudio.com", "https://www.baikalstudio.com"]);
const cors = (request: Request): Record<string, string> => { const o = request.headers.get("origin") ?? ""; return ORIGINS.has(o) ? { "access-control-allow-origin": o, "access-control-allow-headers": "content-type", "access-control-allow-methods": "POST, OPTIONS", vary: "origin" } : {}; };
export async function OPTIONS(request: Request) { return new Response(null, { status: 204, headers: cors(request) }); }

export async function POST(request: Request) {
  const r = await handle(request);
  for (const [k, v] of Object.entries(cors(request))) r.headers.set(k, v);
  return r;
}

async function handle(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > 10_000) return new Response("Payload too large", { status: 413 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  const now = Date.now(), recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  if (recent.length >= 10) return new Response("Too many requests", { status: 429 });
  hits.set(ip, [...recent, now]);
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || typeof body !== "object" || Array.isArray(body)) return Response.json({ ok: false, error: "bad json" }, { status: 400 });
  if (body.website) return Response.json({ ok: true, id: "ignored" }); // honeypot: bots fill it, humans never see it
  const fields = Object.fromEntries(Object.entries(body).slice(0, 20).map(([k, v]) => [k.slice(0, 40), String(v ?? "").slice(0, 2000)]));
  if (!fields.name?.trim() || !(fields.whatsapp?.trim() || fields.email?.trim())) return Response.json({ ok: false, error: "name and a contact are required" }, { status: 422 });
  const lead = { id: crypto.randomUUID(), at: new Date().toISOString(), ...fields };
  try {
    db().prepare("INSERT INTO inquiries (id,at,name,whatsapp,email,size,need,message,source,raw) VALUES (?,?,?,?,?,?,?,?,?,?)")
      .run(lead.id, lead.at, ...known.map((k) => (fields[k] ?? "").trim()), JSON.stringify(lead));
  } catch {
    return Response.json({ ok: false, error: "not saved" }, { status: 500 });
  }
  await appendFile(path.join(DATA_DIR, "leads.jsonl"), JSON.stringify(lead) + "\n").catch(() => {});
  return Response.json({ ok: true, id: lead.id });
}
