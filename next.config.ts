import type { NextConfig } from "next";

// the static build (scripts/build-static.mjs) exports plain HTML for a host without Node
const STATIC = process.env.NEXT_OUTPUT === "export";

const nextConfig: NextConfig = {
  // a second dev server (the hero-B preview on :3902) builds into its own folder so both can run
  distDir: process.env.NEXT_DIST_DIR || ".next",
  output: STATIC ? "export" : "standalone",
  ...(STATIC ? { trailingSlash: true, images: { loader: "custom", loaderFile: "./src/lib/static-image-loader.ts" } } : {}),
  // cache components and partial prefetching cannot run in export mode; the static pages are prerendered anyway
  cacheComponents: !STATIC,
  partialPrefetching: !STATIC,
  // "use cache" in src/lib still needs a flag when cache components are off
  ...(STATIC ? { experimental: { useCache: true } } : {}),
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
