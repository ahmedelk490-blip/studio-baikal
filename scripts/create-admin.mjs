// Creates (or resets) a super admin in .data/baikal.db.
//   npm run admin:create -- owner@baikalstudio.com "Owner Name"
// The password comes from ADMIN_PASSWORD, or a strong random one is generated. It is written to
// .data/ADMIN_LOGIN.txt (git-ignored) and never printed. Open the site once first so the database exists.
import { DatabaseSync } from "node:sqlite";
import { randomBytes, scryptSync } from "node:crypto";
import { existsSync, writeFileSync } from "node:fs";
import path from "node:path";

const [email, name = "Owner"] = process.argv.slice(2);
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { console.error("usage: npm run admin:create -- <email> [name]"); process.exit(1); }
const file = process.env.DB_PATH || path.join(process.cwd(), ".data", "baikal.db");
if (!existsSync(file)) { console.error(`No database at ${file}. Start the site and open any page once, then run this again.`); process.exit(1); }
const db = new DatabaseSync(file);
if (!db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get()) { console.error("Database has no users table yet. Open the site once, then retry."); process.exit(1); }

const pw = process.env.ADMIN_PASSWORD || randomBytes(12).toString("base64url") + "7a";
if (pw.length < 10 || !/[a-zA-Z]/.test(pw) || !/\d/.test(pw)) { console.error("ADMIN_PASSWORD needs 10+ characters with letters and numbers."); process.exit(1); }
const salt = randomBytes(16);
const hash = `scrypt$16384$8$1$${salt.toString("base64")}$${scryptSync(pw, salt, 64, { N: 16384, r: 8, p: 1 }).toString("base64")}`;
const now = new Date().toISOString();
const lower = email.toLowerCase();
if (db.prepare("SELECT id FROM users WHERE email = ?").get(lower)) {
  db.prepare("UPDATE users SET pass = ?, role = 'super_admin', active = 1 WHERE email = ?").run(hash, lower);
  db.prepare("DELETE FROM sessions WHERE user_id = (SELECT id FROM users WHERE email = ?)").run(lower);
} else {
  db.prepare("INSERT INTO users (email,name,role,pass,created_at) VALUES (?,?,?,?,?)").run(lower, name, "super_admin", hash, now);
}
db.prepare("INSERT INTO audit (at,user_id,action,target) VALUES (?,?,?,?)").run(now, null, "user.bootstrap", lower);
const out = path.join(path.dirname(file), "ADMIN_LOGIN.txt");
writeFileSync(out, `Studio Baikal admin\nURL: /en/admin (or /ar/admin)\nEmail: ${lower}\nPassword: ${pw}\nCreated: ${now}\nChange it after the first sign-in (My account).\n`, { mode: 0o600 });
console.log(`Super admin ready for ${lower}. Credentials saved to ${out}`);
