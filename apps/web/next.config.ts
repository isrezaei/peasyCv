import type { NextConfig } from "next";
import { join } from "node:path";

// Dependencies (incl. `next`) are hoisted to the repo-root node_modules in this
// npm-workspaces monorepo, so Turbopack's root must be the repo root (two levels
// up from apps/web) for them to resolve and compile — mirrors the editor app's
// frontend/next.config.ts.
const monorepoRoot = join(__dirname, "..", "..");

const nextConfig: NextConfig = {
  turbopack: {
    root: monorepoRoot,
  },
  // Marketing site is static-first; keep the default trailing-slash policy (no
  // trailing slash) consistent across every route.
  trailingSlash: false,
};

export default nextConfig;
