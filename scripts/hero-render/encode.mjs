// Turns the Blender renders (art/frames/<set>/NNNN.png) into the web frames the hero plays
// (public/hero-frames/<set>/NNNN.webp). Usage: node scripts/hero-render/encode.mjs [quality=74]
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const FF = process.env.FFMPEG || "D:/dev-cache/tools/ffmpeg/ffmpeg.exe";
const q = process.argv[2] || "74";
const manifest = {}; // frames ready per set, so the page only asks for what exists
for (const set of ["desk", "phone"]) {
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
console.log("manifest", JSON.stringify(manifest));
