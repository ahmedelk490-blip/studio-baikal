import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { db } from "./db";
import { can, type Perm, type Role } from "./perm";

/* Sessions: a random 32-byte token lives only in an httpOnly cookie; the database keeps its sha256,
   so a leaked database cannot be replayed as a login. Passwords are scrypt-hashed with a per-user salt. */
const COOKIE = "bk_session";
const TTL = 7 * 24 * 3600 * 1000;
export type User = { id: number; email: string; name: string; role: Role };

const N = 16384, R = 8, P = 1;
export function hashPassword(pw: string) {
  const salt = randomBytes(16);
  return `scrypt$${N}$${R}$${P}$${salt.toString("base64")}$${scryptSync(pw, salt, 64, { N, r: R, p: P }).toString("base64")}`;
}
export function verifyPassword(pw: string, stored: string) {
  const [alg, n, r, p, salt, key] = stored.split("$");
  if (alg !== "scrypt" || !key) return false;
  const want = Buffer.from(key, "base64");
  const got = scryptSync(pw, Buffer.from(salt, "base64"), want.length, { N: Number(n), r: Number(r), p: Number(p) });
  return timingSafeEqual(want, got);
}
export const passwordProblem = (pw: string) => (pw.length < 10 ? "min10" : !/[a-zA-Z]/.test(pw) || !/\d/.test(pw) ? "mix" : null);

const sha = (s: string) => createHash("sha256").update(s).digest("hex");

export async function currentUser(): Promise<User | null> {
  const tok = (await cookies()).get(COOKIE)?.value;
  if (!tok) return null;
  await connection(); // the expiry check below reads the clock: request-time only, never prerendered
  const row = db().prepare("SELECT u.id, u.email, u.name, u.role FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ? AND s.expires_at > ? AND u.active = 1").get(sha(tok), Date.now()) as User | undefined;
  return row ?? null;
}

/* For pages: no session -> login; missing permission -> dashboard with a notice. */
export async function requireUser(lang: string, perm?: Perm): Promise<User> {
  const u = await currentUser();
  if (!u) redirect(`/${lang}/admin/login`);
  if (perm && !can(u.role, perm)) redirect(`/${lang}/admin?denied=1`);
  return u;
}
/* For actions / route handlers: throws instead of redirecting. */
export async function assertCan(perm: Perm): Promise<User> {
  const u = await currentUser();
  if (!u || !can(u.role, perm)) throw new Error("forbidden");
  return u;
}

export async function startSession(userId: number) {
  const tok = randomBytes(32).toString("base64url");
  const h = await headers();
  const d = db();
  d.prepare("DELETE FROM sessions WHERE expires_at < ?").run(Date.now());
  d.prepare("INSERT INTO sessions (id,user_id,expires_at,created_at,ip,ua) VALUES (?,?,?,?,?,?)").run(sha(tok), userId, Date.now() + TTL, new Date().toISOString(), clientIp(h), (h.get("user-agent") ?? "").slice(0, 200));
  d.prepare("UPDATE users SET last_login = ? WHERE id = ?").run(new Date().toISOString(), userId);
  (await cookies()).set(COOKIE, tok, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: TTL / 1000 });
}
export async function endSession() {
  const c = await cookies();
  const tok = c.get(COOKIE)?.value;
  if (tok) db().prepare("DELETE FROM sessions WHERE id = ?").run(sha(tok));
  c.delete(COOKIE);
}
export const endAllSessions = (userId: number) => db().prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);

export const clientIp = (h: Headers) => h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "local";

/* Login throttling: 5 failures per 15 minutes per IP and per email. */
const WINDOW = 15 * 60 * 1000, MAX = 5;
export function locked(...keys: string[]) {
  const d = db(), since = Date.now() - WINDOW;
  return keys.some((k) => (d.prepare("SELECT COUNT(*) n FROM attempts WHERE key = ? AND at > ?").get(k, since) as { n: number }).n >= MAX);
}
export function recordFail(...keys: string[]) {
  const d = db();
  d.prepare("DELETE FROM attempts WHERE at < ?").run(Date.now() - WINDOW);
  keys.forEach((k) => d.prepare("INSERT INTO attempts (key, at) VALUES (?, ?)").run(k, Date.now()));
}
export const clearFails = (...keys: string[]) => keys.forEach((k) => db().prepare("DELETE FROM attempts WHERE key = ?").run(k));
