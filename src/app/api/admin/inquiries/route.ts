import { assertCan } from "@/lib/auth";
import { audit, db } from "@/lib/db";

/* CSV export of inquiries (same search / status filter as the inbox). Authorised roles only.
   Cells that start with = + - @ are prefixed so spreadsheets never run them as formulas. */
const STATUSES = ["new", "contacted", "in_progress", "won", "lost", "spam"];
const cell = (v: unknown) => { let s = String(v ?? ""); if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; return `"${s.replace(/"/g, '""')}"`; };

export async function GET(req: Request) {
  let u;
  try { u = await assertCan("inquiries.export"); } catch { return new Response("Forbidden", { status: 403 }); }
  const sp = new URL(req.url).searchParams;
  const q = (sp.get("q") ?? "").slice(0, 80), st = STATUSES.includes(sp.get("st") ?? "") ? sp.get("st")! : "";
  const where: string[] = [], args: string[] = [];
  if (q) { where.push("(name LIKE ? OR whatsapp LIKE ? OR email LIKE ? OR need LIKE ? OR notes LIKE ?)"); args.push(...Array(5).fill(`%${q}%`)); }
  if (st) { where.push("status = ?"); args.push(st); }
  const rows = db().prepare(`SELECT at, name, whatsapp, email, size, need, message, source, status, notes FROM inquiries ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY at DESC`).all(...args) as Record<string, unknown>[];
  const head = ["at", "name", "whatsapp", "email", "size", "need", "message", "source", "status", "notes"];
  const csv = "﻿" + [head.join(","), ...rows.map((r) => head.map((h) => cell(r[h])).join(","))].join("\r\n");
  audit(u.id, "inquiries.export", `${rows.length} rows`);
  return new Response(csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="baikal-inquiries-${new Date().toISOString().slice(0, 10)}.csv"`, "cache-control": "no-store" } });
}
