import type { NextConfig } from "next";

// the static build (scripts/build-static.mjs) exports plain HTML for a host without Node
const STATIC = process.env.NEXT_OUTPUT === "export";

const nextConfig: NextConfig = {
  // a second dev server (the hero-B preview on :3902) builds into its own folder so both can run
  distDir: process.env.NEXT_DIST_DIR || ".next",
  output: STATIC ? "export" : "standalone",
  ...(STATIC ? { trailingSlash: true, images: { loader: "custom", loaderFile: "./src/lib/static-image-loader.ts" } } : {}),
  cacheComponents: true,
  partialPrefetching: true,
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
