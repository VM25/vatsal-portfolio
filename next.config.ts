import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root — a stray lockfile in $HOME otherwise confuses
  // Next's root inference and emits a build warning.
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
