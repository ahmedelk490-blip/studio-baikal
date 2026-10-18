# Studio Baikal CMS — phase 1

Admin: `/en/admin` (English) or `/ar/admin` (Arabic, RTL). Not indexed by search engines.

## What it manages (phase 1)
| Area | Where | Notes |
|---|---|---|
| Projects | Admin → Projects | EN + AR text, slug (unique, validated), category, area, year, order, featured, cover, SEO title/description per language, draft/published. Published changes appear on the public site on the next request (cache tag `projects`). |
| Gallery | Project → Gallery | Reorder (↑/↓), room name EN/AR, caption, remove, add from the media library. |
| Media library | Admin → Media library | Upload JPG/PNG/WebP/PDF ≤ 15 MB. Type is checked from the file bytes; images are re-encoded to WebP (max 2400 px, EXIF stripped). Alt/title/caption editable. Delete is refused while a project uses the file. |
| Inquiries | Admin → Inquiries | Every site form (`/api/leads`). Search, status filter (New / Contacted / In progress / Won / Lost / Spam), internal notes, WhatsApp / email buttons, CSV export (formula-injection safe). |
| Users | Admin → Users (super admin) | Add users, change role, disable, set a new password (signs that user out everywhere). |
| Account | Admin → My account | Change own password, sign out everywhere. |
| Activity | Dashboard | Audit log of logins, saves, deletes, exports. |

## Roles (enforced on the server in every action and API route)
| Role | Projects | Publish / delete | Media | Inquiries | Users |
|---|---|---|---|---|---|
| Super admin | edit | yes / yes | upload, delete | view, edit, export | manage |
| Administrator | edit | yes / yes | upload, delete | view, edit, export | — |
| Editor | edit | publish / — | upload, delete | — | — |
| Author | view | — | upload | — | — |
| Viewer | view | — | view | — | — |

## Security
- Passwords: scrypt (N=16384, r=8, p=1, 64-byte key, per-user salt). Policy: 10+ chars, letters and numbers.
- Sessions: random 32-byte token in an httpOnly, SameSite=Lax cookie (`Secure` in production), 7 days; only its SHA-256 is stored.
- Login throttling: 5 failures / 15 min per IP and per email. Failed and successful logins are audited.
- CSRF: Server Actions carry Next's Origin check; the upload and logout routes check Origin themselves.
- Uploads are served from `/uploads/...` with a whitelisted path, `nosniff`, and never from the build folder.
- Public forms: honeypot, 10 posts/min per IP, 10 KB body, name + contact required.

## Data
Everything lives in `.data/` (git-ignored, never inside the build):
- `baikal.db` — SQLite (WAL). Schema version in `meta.schema`; migrations in `src/lib/db.ts` are append-only.
- `uploads/YYYY/MM/*.webp|pdf` — media files.
- `leads.jsonl` — plain-text safety copy of every inquiry (the inbox reads the database).
- `ADMIN_LOGIN.txt` — credentials written by `admin:create` (delete after the password is changed).

First run seeds the 12 current projects from `src/data/projects.ts` and imports the old `leads.jsonl` (a timestamped `.backup-*` copy is made first). Seeding only happens into empty tables; existing rows are never overwritten.

## Commands
```bash
npm run admin:create -- owner@baikalstudio.com "Owner Name"   # create / reset a super admin (open the site once first)
```
`ADMIN_PASSWORD=... npm run admin:create -- ...` sets a chosen password instead of a generated one.

## Backup and restore
- Backup (site running is fine, WAL): `sqlite3 .data/baikal.db ".backup .data/baikal-$(date +%F).db"` and copy `.data/uploads/`.
- Without sqlite3: stop the app, copy `.data/` as a whole.
- Restore: stop the app, put `baikal.db` (+ `uploads/`) back into `.data/`, start the app.

## Deploying
- Node 22.5+ (uses the built-in `node:sqlite`; Node prints an "experimental" warning, which is expected).
- The server keeps its own `.data/` — never upload the local one over it. After the first deploy: open the site once, then run `admin:create` on the server.
- `DB_PATH` can point the database elsewhere (e.g. a persistent volume).
- `sharp` is a direct dependency (image re-encoding); `npm ci` on the server installs the right binary.

## Not in phase 1 (planned next)
Pages / section builder, blog, navigation and global settings editors, design presets, redirects manager, revision history with restore, email notifications for new inquiries, password-reset by email.
