import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // a second dev server (the hero-B preview on :3902) builds into its own folder so both can run
  distDir: process.env.NEXT_DIST_DIR || ".next",
  output: "standalone",
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
