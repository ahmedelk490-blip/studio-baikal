// Builds the calm look as plain HTML/CSS/JS for a host without Node (the client's Hostinger Single plan):
//   node scripts/build-static.mjs            → dist-static/ (ready to upload to public_html)
// What a static host cannot run is left out of this build: /admin, /api, /uploads and the proxy. The booking
// form posts to the Node site instead (NEXT_PUBLIC_LEADS_URL), where /admin keeps working. Project photos get
// 480 and 960 px copies so phones never download the 1600 px originals (src/lib/static-image-loader.ts).
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "out"), dist = path.join(root, "dist-static");
const LEADS = process.env.NEXT_PUBLIC_LEADS_URL || "https://cyan-rhinoceros-347269.hostingersite.com/api/leads";

// server-only parts are set aside for the build and put back whatever happens
const aside = ["src/app/api", "src/app/[lang]/admin", "src/app/uploads", "src/proxy.ts", "src/components/admin", "src/app/robots.ts", "src/app/sitemap.ts"].map((p) => path.join(root, p));
const park = path.join(root, ".static-aside");
// parked under their index: two of them are both called "admin"
const spot = (i) => path.join(park, String(i));
// the pages' "instant = false" flag only exists under cache components, which export mode cannot use: the line is
// taken out for this build and the original files are put back afterwards
const pages = ["", "contact", "projects", "projects/[slug]", "services", "studio"].map((p) => path.join(root, "src/app/[lang]", p, "page.tsx"));
const originals = new Map();
const restore = () => {
  aside.forEach((p, i) => { if (existsSync(spot(i))) renameSync(spot(i), p); });
  for (const [p, text] of originals) writeFileSync(p, text);
  if (existsSync(park)) rmSync(park, { recursive: true, force: true });
};
process.on("exit", restore);
mkdirSync(park, { recursive: true });
aside.forEach((p, i) => { if (existsSync(p)) renameSync(p, spot(i)); });
for (const p of pages) { const text = readFileSync(p, "utf8"); originals.set(p, text); writeFileSync(p, text.replace(/^export const instant = false;\r?\n/m, "")); }

rmSync(out, { recursive: true, force: true });
execSync("node node_modules/next/dist/bin/next build", { cwd: root, stdio: "inherit", env: { ...process.env, NEXT_OUTPUT: "export", NEXT_DIST_DIR: ".next-static", NEXT_PUBLIC_HOME: "calm", NEXT_PUBLIC_LEADS_URL: LEADS } });
restore();

// smaller copies of every project photo, for the loader's srcset
const walk = (d) => readdirSync(d).flatMap((f) => { const p = path.join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
let made = 0;
for (const f of walk(path.join(out, "projects")).filter((f) => f.endsWith(".webp") && !/\.w\d+\.webp$/.test(f))) {
  const { width = 0 } = await sharp(f).metadata();
  for (const w of [480, 960]) {
    const t = f.replace(/\.webp$/, `.w${w}.webp`);
    if (width > w) { await sharp(f).resize({ width: w }).webp({ quality: 80 }).toFile(t); made++; }
    else cpSync(f, t);
  }
}

// Apache/LiteSpeed rules: English is the default language, old site URLs keep working, long caching for
// hashed files and photos, none for pages
writeFileSync(path.join(out, ".htaccess"), `Options -Indexes
RewriteEngine On
RewriteCond %{HTTPS} !=on
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]
RewriteCond %{HTTP_HOST} ^www\\. [NC]
RewriteRule ^ https://baikalstudio.com%{REQUEST_URI} [R=301,L]
RewriteRule ^$ /en/ [R=302,L]
RewriteRule ^interior-design-services/?$ /en/services/ [R=301,L]
RewriteRule ^project-stories/?$ /en/projects/ [R=301,L]
RewriteRule ^about-us/?$ /en/studio/ [R=301,L]
RewriteRule ^contact-us/?$ /en/contact/ [R=301,L]
RewriteRule ^(projects|services|studio|contact)(/.*)?$ /en/$1$2 [R=302,L]
ErrorDocument 404 /404.html
<IfModule mod_headers.c>
  SetEnvIf Request_URI "^/(_next/static|projects|brand|hero-frames|house-frames|video|models)/" BK_STATIC=1
  Header always set Cache-Control "no-cache" env=!BK_STATIC
  Header always set Cache-Control "public, max-age=31536000, immutable" env=BK_STATIC
  Header always set X-Content-Type-Options "nosniff"
  Header always set X-Frame-Options "SAMEORIGIN"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json image/svg+xml
</IfModule>
`);

// robots and sitemap by hand (the metadata routes cannot be exported under cache components)
const SITE = "https://baikalstudio.com";
const urls = walk(out).filter((f) => f.endsWith("index.html") && !f.includes("404")).map((f) => path.relative(out, path.dirname(f)).split(path.sep).join("/")).filter((p) => p && !p.includes("admin"));
writeFileSync(path.join(out, "robots.txt"), `User-agent: *
Allow: /
Sitemap: ${SITE}/sitemap.xml
`);
writeFileSync(path.join(out, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((p) => `  <url><loc>${SITE}/${p}/</loc></url>`).join("\n")}
</urlset>
`);

rmSync(dist, { recursive: true, force: true });
renameSync(out, dist);
console.log(`static site in ${dist} (${made} resized photos); leads go to ${LEADS}`);
