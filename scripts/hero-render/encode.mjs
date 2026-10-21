// Turns the Blender renders (art/frames/<set>/NNNN.png) into the web frames the hero plays
// (public/hero-frames/<set>/NNNN.webp). Usage: node scripts/hero-render/encode.mjs [quality=74]
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const FF = process.env.FFMPEG || "D:/dev-cache/tools/ffmpeg/ffmpeg.exe";
const q = process.argv[2] || "74";
const manifest = {}; // frames ready per set, so the page only asks for what exists
for (const set of ["desk", "tab", "phone"]) {
  const src = join("art/frames", set), out = join("public/hero-frames", set);
  if (!existsSync(src) || !readdirSync(src).some((f) => f.endsWith(".png"))) continue;
  mkdirSync(out, { recursive: true });
  execFileSync(FF, ["-v", "error", "-y", "-i", join(src, "%04d.png"), "-c:v", "libwebp", "-quality", q, "-compression_level", "6", join(out, "%04d.webp")]);
  const files = readdirSync(out), kb = files.reduce((n, f) => n + statSync(join(out, f)).size, 0) / 1024;
  manifest[set] = files.length;
  console.log(`${set}: ${files.length} frames, ${(kb / 1024).toFixed(1)} MB (${(kb / files.length).toFixed(0)} KB each)`);
}
mkdirSync("public/hero-frames", { recursive: true });
writeFileSync("public/hero-frames/manifest.json", JSON.stringify(manifest));
// the house turn keeps its transparent ground (WebP with alpha) and has its own folder
if (existsSync("art/frames/house") && readdirSync("art/frames/house").some((f) => f.endsWith(".png"))) {
  mkdirSync("public/house-frames", { recursive: true });
  execFileSync(FF, ["-v", "error", "-y", "-i", "art/frames/house/%04d.png", "-c:v", "libwebp", "-pix_fmt", "yuva420p", "-quality", q, "-compression_level", "6", "public/house-frames/%04d.webp"]);
  const n = readdirSync("public/house-frames").filter((f) => f.endsWith(".webp")).length;
  writeFileSync("public/house-frames/manifest.json", JSON.stringify({ house: n }));
  console.log("house:", n, "frames");
}
console.log("manifest", JSON.stringify(manifest));
