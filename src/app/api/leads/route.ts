import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";

const FILE = path.join(process.cwd(), ".data", "leads.jsonl");

// Every form on the site posts here (saved + listed in /admin), WhatsApp is only a second channel.
// Abuse limits: 10 KB body, 20 fields of max 2000 chars, honeypot field "website" must be empty, 10 posts/min per IP.
const hits = new Map<string, number[]>();
export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > 10_000) return new Response("Payload too large", { status: 413 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  const now = Date.now(), recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  if (recent.length >= 10) return new Response("Too many requests", { status: 429 });
  hits.set(ip, [...recent, now]);
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || typeof body !== "object" || Array.isArray(body)) return Response.json({ ok: false, error: "bad json" }, { status: 400 });
  if (body.website) return Response.json({ ok: true, id: "ignored" }); // honeypot: bots fill it, humans never see it
  const fields = Object.entries(body).slice(0, 20).map(([k, v]) => [k.slice(0, 40), String(v ?? "").slice(0, 2000)]);
  const lead = { id: crypto.randomUUID(), at: new Date().toISOString(), ...Object.fromEntries(fields) };
  await mkdir(path.dirname(FILE), { recursive: true });
  await appendFile(FILE, JSON.stringify(lead) + "\n");
  return Response.json({ ok: true, id: lead.id });
}

export async function GET(request: Request) {
  if (request.headers.get("x-admin-token") !== process.env.ADMIN_TOKEN) return new Response("Unauthorized", { status: 401 });
  const raw = await readFile(FILE, "utf8").catch(() => "");
  return Response.json(raw.split("\n").filter(Boolean).map((l) => JSON.parse(l)).reverse());
}
