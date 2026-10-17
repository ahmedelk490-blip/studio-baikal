# Deploying Studio Baikal

Next.js 16 app (App Router, API route `/api/leads` writes `.data/leads.jsonl`, `/admin` reads it).
It needs a **Node.js host** (not static). Target domain: baikalstudio.com (currently on Hostinger).

## Build
```bash
npm ci && npm run build
```
`next.config.ts` has `output: "standalone"`, so the deployable bundle is `.next/standalone` + `.next/static` + `public`.

## Run (any Node 20+ host, e.g. Hostinger Node.js app / VPS / PM2)
```bash
ADMIN_TOKEN=<long-random> PORT=3000 node .next/standalone/server.js
```
Copy `public/` and `.next/static/` next to the standalone server (standalone does not include them).
Keep `.data/` writable and persistent (leads live there). Back it up before every deploy.

## Hostinger
- Node.js app hosting: upload the standalone bundle, set `ADMIN_TOKEN`, start command `node server.js`, point baikalstudio.com to the app.
- The Hostinger MCP in Claude needs to be authorised once (claude.ai connector settings) to deploy from here.

## Checks before every deploy
```bash
node D:/dev-cache/tools/design-guard/design-guard.mjs .
node D:/dev-cache/tools/ui-audit/ui-audit.mjs .
node D:/dev-cache/tools/site-qa/site-qa.mjs --smoke
```
